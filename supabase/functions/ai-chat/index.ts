import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  mode?: "chat" | "reader" | "explain";
  chapterTitle?: string;
  chapterContent?: string;
  selectedText?: string;
  persist?: boolean;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  chat: `你是《凭什么》一书的AI助手。本书讲述在人际冲突中如何有效反击、建立边界、保护自我。
核心原则：不解释、不接球、不自证。核心技巧：用"凭什么？"反问，把举证责任还给攻击者。
要求：
1. 回答具体、可操作，不空泛说教
2. 语言精炼，适当使用分点、加粗
3. 遇到具体场景，给出可直接使用的话术
4. 不鼓励攻击他人，强调建立健康边界
5. 用中文回答`,
  reader: `你是一位阅读助手，正在帮助读者理解《凭什么》的当前章节。
根据提供的章节内容回答问题，联系章节要点与生活应用。回答精炼、具体。用中文回答。`,
  explain: `你是一位文本解读助手。用简洁的中文解释用户选中的这段文字，结合《凭什么》的反击心法，指出其核心含义与应用方法。`,
};

async function callLLM(messages: ChatMessage[]): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");

  if (apiKey) {
    const systemMessage = messages.find((m) => m.role === "system");
    const conversation = messages.filter((m) => m.role !== "system");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemMessage?.content || "",
        messages: conversation.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) throw new Error(`Anthropic error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.content?.[0]?.text || "";
  }

  if (deepseekKey) {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${deepseekKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    if (!res.ok) throw new Error(`Deepseek error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  return generateFallback(messages);
}

function generateFallback(messages: ChatMessage[]): string {
  const last = messages.filter((m) => m.role === "user").pop()?.content || "";
  const text = last.toLowerCase();
  if (text.includes("总结") || text.includes("要点")) {
    return `本章核心要点：\n\n1. **不解释、不接球、不自证** —— 三大原则\n2. **反问「凭什么？」** —— 让对方承担举证责任\n3. **要求具体化** —— 把抽象指责转为可验证事实\n4. **停顿3秒** —— 避免情绪化反应\n\n（演示模式回复，配置 ANTHROPIC_API_KEY/DEEPSEEK_API_KEY/OPENAI_API_KEY 以获得真实 AI 回应。）`;
  }
  if (text.includes("例子") || text.includes("举例")) {
    return `**场景**：对方说「你从来不关心我」\n\n**错误应对**：急忙列举自己做过的事（自证陷阱）\n\n**正确反击**：\n1. 停顿3秒\n2. 「从来是指一次都没有吗？」\n3. 「能举个具体例子吗？」\n4. 让对方具体化指控\n\n（演示模式回复）`;
  }
  return `基于《凭什么》的核心心法，建议：\n\n1. **停顿3秒** - 不要立即反应\n2. **反问依据** - 「凭什么？」「你的依据是什么？」\n3. **要求具体化** - 抽象指责让它变具体\n4. **不自证** - 不急于证明自己\n\n（当前为演示模式回复。部署 ANTHROPIC_API_KEY、DEEPSEEK_API_KEY 或 OPENAI_API_KEY 以启用真实 AI。）`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: ChatRequest = await req.json();
    const mode = body.mode || "chat";
    const systemPromptBase = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.chat;

    let contextBlock = "";
    if (mode === "reader" && body.chapterTitle) {
      contextBlock = `\n\n当前章节：《${body.chapterTitle}》`;
      if (body.chapterContent) {
        const trimmed = body.chapterContent.slice(0, 4000);
        contextBlock += `\n\n章节内容摘录：\n${trimmed}`;
      }
    }
    if (mode === "explain" && body.selectedText) {
      contextBlock = `\n\n用户选中的文字：\n"${body.selectedText}"`;
    }

    const messages: ChatMessage[] = [
      { role: "system", content: systemPromptBase + contextBlock },
      ...body.messages,
    ];

    const answer = await callLLM(messages);

    if (body.persist) {
      try {
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
          const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: authHeader } } }
          );
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            const lastUser = body.messages.filter((m) => m.role === "user").pop();
            await supabase.from("ai_conversations").insert({
              user_id: userData.user.id,
              question: lastUser?.content || "",
              answer,
              context: body.chapterTitle || body.selectedText || mode,
            });
          }
        }
      } catch (e) {
        console.error("persist failed", e);
      }
    }

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
