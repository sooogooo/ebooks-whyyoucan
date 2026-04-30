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
  mode?: "chat" | "reader" | "explain" | "roleplay" | "roleplay_report";
  chapterTitle?: string;
  chapterContent?: string;
  selectedText?: string;
  role?: string;
  persist?: boolean;
}

const ROLE_PRESETS: Record<string, string> = {
  strict_parent: "你扮演一位严厉、控制欲强的父亲/母亲。对孩子不满意，喜欢说「我都是为你好」「你怎么这么不懂事」「我养你这么大……」。风格：情感绑架、翻旧账、贬低。",
  passive_coworker: "你扮演一位喜欢甩锅、阴阳怪气的同事。习惯在群里@对方、制造模糊指控、把锅甩给别人。风格：装无辜、含沙射影、表面客气暗地拉踩。",
  pua_partner: "你扮演一位情感操控的伴侣。典型话术：「你根本不在乎我」「我变成这样都是因为你」「别人家的伴侣都……」。风格：贬低、控制、冷暴力。",
  nosy_relative: "你扮演一位越界的七大姑八大姨。喜欢追问工资、恋爱、结婚、生育。风格：看似关心，实则审问和比较。",
  toxic_boss: "你扮演一位喜欢打压下属的领导。典型话术：「你这个人态度有问题」「这么简单的事都做不好」「年轻人就是吃不了苦」。风格：居高临下、人身攻击、模糊指责。",
};

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
  roleplay: `你正在进行一个反击练习的角色扮演。你要扮演一个咄咄逼人的攻击者，对用户施加语言压力、模糊指控、情感绑架，让用户有机会练习"不解释、不接球、不自证"。
要求：
1. 保持角色，不要用AI口吻、不要给建议
2. 每次回复2-4句话，像真人对话
3. 逐步加码：如果用户反击得好，你可以变得更狡猾；如果用户自证，你就得寸进尺
4. 不使用侮辱性词汇、不涉及违法或色情
5. 用中文对话`,
  roleplay_report: `你是反击教练。阅读刚刚的对话记录，给用户一份简短复盘：
1. 亮点（具体引用用户的某句回应，说明为什么好）
2. 陷阱（用户哪些回应落入了自证/解释/道歉的陷阱）
3. 建议话术（给出 2 条本章节核心方法能用的更强回应）
用中文，不超过 400 字，结构清晰。`,
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
    if (mode === "roleplay" && body.role) {
      const preset = ROLE_PRESETS[body.role] || "";
      if (preset) contextBlock = `\n\n角色设定：\n${preset}`;
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
