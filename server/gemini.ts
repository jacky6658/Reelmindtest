import { readFileSync } from "fs";
import { join } from "path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// 載入知識庫
let knowledgeBase: string = "";
try {
  knowledgeBase = readFileSync(join(process.cwd(), "kb.txt"), "utf-8");
} catch (error) {
  console.error("[Gemini] Failed to load knowledge base:", error);
}

interface GenerateRequest {
  topic: string;
  targetAudience: string;
  goal: string;
  platform: string;
  style?: string;
}

interface GenerateResponse {
  positioning: string;
  topics: string;
  script: string;
}

/**
 * 呼叫 Gemini API 生成短影音內容
 * 輸出規範:
 * - 不使用 Markdown 粗體符號 ** 或 __
 * - 全部輸出為純文字
 * - 不加 Markdown 標題符號 (#、##)
 * - 列點格式用「•」或「-」,不用 *
 * - 可使用 emoji 和自然語言
 */
export async function generateContent(request: GenerateRequest): Promise<GenerateResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `你是 Reelmind AI 短影音顧問,專門幫助創作者打造爆款短影音內容。

以下是你的專業知識庫:
${knowledgeBase}

用戶需求:
- 主題或產品: ${request.topic}
- 目標受眾: ${request.targetAudience}
- 影片目標: ${request.goal}
- 社群平台: ${request.platform}
${request.style ? `- 補充說明: ${request.style}` : ""}

請根據知識庫內容,為用戶生成以下三個部分:

1. 帳號定位 (150-200字)
   - 分析用戶的主題和目標受眾
   - 給出清晰的帳號定位建議
   - 說明如何在紅海中脫穎而出

2. 選題建議 (3-5個選題)
   - 基於知識庫的熱門話題類型
   - 每個選題包含標題和簡短說明
   - 符合用戶的影片目標

3. 腳本範例 (一個完整的30秒腳本)
   - 使用 Hook → Value → CTA 結構
   - 包含時間軸和分鏡建議
   - 可直接使用的逐字稿

重要輸出規範:
- 不要使用 Markdown 粗體符號 (**、__)
- 不要使用 Markdown 標題符號 (#、##)
- 列點使用「•」或「-」,不要用 *
- 可以使用 emoji 讓內容更生動
- 用自然、口語化的方式表達
- 保持專業但親切的語氣

請直接開始生成,不要有任何前言或解釋。`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Gemini] API error:", errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!generatedText) {
      throw new Error("No content generated from Gemini API");
    }

    // 解析生成的內容,分割成三個部分
    const result = parseGeneratedContent(generatedText);
    return result;
  } catch (error) {
    console.error("[Gemini] Generation error:", error);
    throw error;
  }
}

/**
 * 解析 Gemini 生成的內容,分割成帳號定位、選題建議、腳本範例
 */
function parseGeneratedContent(text: string): GenerateResponse {
  // 簡單的分割邏輯,根據關鍵字分段
  const sections = text.split(/\n\n+/);
  
  let positioning = "";
  let topics = "";
  let script = "";
  
  let currentSection = "";
  
  for (const section of sections) {
    const lowerSection = section.toLowerCase();
    
    if (lowerSection.includes("帳號定位") || lowerSection.includes("定位")) {
      currentSection = "positioning";
      continue;
    } else if (lowerSection.includes("選題") || lowerSection.includes("主題")) {
      currentSection = "topics";
      continue;
    } else if (lowerSection.includes("腳本") || lowerSection.includes("劇本")) {
      currentSection = "script";
      continue;
    }
    
    if (currentSection === "positioning") {
      positioning += section + "\n\n";
    } else if (currentSection === "topics") {
      topics += section + "\n\n";
    } else if (currentSection === "script") {
      script += section + "\n\n";
    }
  }
  
  // 如果解析失敗,嘗試簡單分割
  if (!positioning && !topics && !script) {
    const parts = text.split(/\n\n\n+/);
    positioning = parts[0] || text.substring(0, 500);
    topics = parts[1] || text.substring(500, 1000);
    script = parts[2] || text.substring(1000);
  }
  
  return {
    positioning: positioning.trim() || "生成失敗,請重試",
    topics: topics.trim() || "生成失敗,請重試",
    script: script.trim() || "生成失敗,請重試",
  };
}
