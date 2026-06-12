import { getGeminiApiKey } from '../utils/gemini';

function getApiUrl(): string {
  const apiKey = getGeminiApiKey();
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
}

export async function askGemini(prompt: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("API key is not configured.");
  }

  try {
    const response = await fetch(getApiUrl(), {
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
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error("Invalid response format from Gemini API.");
    }

    return resultText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

// 1. Generate live interview questions based on candidate history
export async function generateLiveQuestion(
  mode: string,
  difficulty: string,
  questionIndex: number,
  history: { sender: 'ai' | 'user'; text: string }[]
): Promise<string> {
  const historyText = history
    .map((h) => `${h.sender === "ai" ? "Interviewer" : "Candidate"}: ${h.text}`)
    .join("\n");

  const prompt = `You are a professional tech recruiter and AI Interviewer conducting a ${difficulty} level ${mode} interview. 
The candidate is named Anand. We are at question index ${questionIndex + 1} of 4.
Based on the interview conversation so far:
---
${historyText}
---
Generate the next question to ask the candidate. 
If the candidate's last answer was brief, feel free to ask a follow-up or challenge question based on their response, or introduce a new relevant topic if appropriate.
Return ONLY the direct verbal question to ask the candidate. Do not include any prefix like "Interviewer:", do not include any introductions, notes, or brackets. Just return the raw text question.`;

  return askGemini(prompt);
}

// 2. Assess full interview dialogue and return structural scoring report
export async function generateSessionReport(
  mode: string,
  difficulty: string,
  history: { sender: 'ai' | 'user'; text: string }[]
): Promise<any> {
  const historyText = history
    .map((h) => `${h.sender === "ai" ? "Interviewer" : "Candidate"}: ${h.text}`)
    .join("\n");

  const prompt = `Analyze the following interview dialogue between the Interviewer (AI Buddy) and the Candidate (Anand). 
Interview Mode: ${mode}
Tier: ${difficulty}

Dialogue Transcript:
---
${historyText}
---

Provide a comprehensive candidate feedback assessment. 
You must output a single valid JSON block containing precisely these properties:
- scores: an object mapping communication, technical, confidence, problemSolving, and leadership to numbers between 0 and 100.
- readiness: a number between 0 and 100 indicating overall job readiness.
- strengths: an array of 3 strings outlining concrete candidate strengths.
- weaknesses: an array of 2 strings outlining candidate development areas.
- roadmap: an array of 3 objects representing customized learning steps, each object having a 'title' string and a 'desc' string.

Your output must be parseable by JSON.parse(). Do not wrap the JSON block in markdown backticks (\`\`\`json ... \`\`\`), do not write extra text. Output only the raw JSON.`;

  const rawResult = await askGemini(prompt);
  
  // Clean up markdown block if the model returned it despite instructions
  let cleanJson = rawResult.trim();
  if (cleanJson.startsWith("```")) {
    cleanJson = cleanJson.replace(/^```(json)?/, "").replace(/```$/, "").trim();
  }
  
  return JSON.parse(cleanJson);
}

// 3. Generate Mentor Responses
export async function generateMentorResponse(
  userMsg: string,
  chatHistory: { sender: 'mentor' | 'user'; text: string }[]
): Promise<string> {
  const historyText = chatHistory
    .slice(-5) // Send last 5 turns to conserve context tokens
    .map((h) => `${h.sender === "mentor" ? "Mentor" : "Candidate"}: ${h.text}`)
    .join("\n");

  const prompt = `You are a helpful and expert AI Career Coach and tech mentor. The candidate's name is Anand. 
Here is the preceding chat history:
---
${historyText}
---
The candidate asks: "${userMsg}"
Provide a clear, detailed, and professional answer. Write in clean markdown. 
If they ask for code, write high-quality, optimal code blocks with comments. If they ask system design, outline clear database structures and layers. Keep the tone encouraging and direct.`;

  return askGemini(prompt);
}
