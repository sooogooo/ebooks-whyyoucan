import{c as p,s as d}from"./index-nBkpmDtL.js";/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=p("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]]),u="https://pnemiimmzhxrrhcarcvs.supabase.co/functions/v1/ai-chat";async function y({messages:e,mode:s="chat",chapterTitle:c,chapterContent:n,selectedText:i,role:o,persist:r=!0}){const{data:{session:t}}=await d.auth.getSession(),I=(t==null?void 0:t.access_token)||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZW1paW1temh4cnJoY2FyY3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzc3MDgsImV4cCI6MjA4Nzg1MzcwOH0.GZIPiHUv6c-tHEeIk_4f1tnQgtfDMRJOji6ec5hUEvg",a=await fetch(u,{method:"POST",headers:{Authorization:`Bearer ${I}`,"Content-Type":"application/json"},body:JSON.stringify({messages:e,mode:s,chapterTitle:c,chapterContent:n,selectedText:i,role:o,persist:r&&!!t})});if(!a.ok){const h=await a.text().catch(()=>"");throw new Error(`AI request failed: ${a.status} ${h}`)}return(await a.json()).answer||""}export{f as S,y as a};
