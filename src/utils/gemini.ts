export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function getGeminiApiKey(): string {
  // Try localStorage first
  const localKey = localStorage.getItem('gemini_api_key');
  if (localKey) return localKey;
  
  // Fallback to environment variable
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
}

export function setGeminiApiKey(key: string) {
  localStorage.setItem('gemini_api_key', key);
}

export function formatChatHistory(
  history: { sender: 'user' | 'mentor' | 'ai'; text: string }[]
): GeminiChatMessage[] {
  return history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
}

function getBaseUrl(): string {
  // If running in Vite development server, use local proxy to avoid CORS blocks
  return import.meta.env.DEV ? '/api-gemini' : 'https://generativelanguage.googleapis.com';
}

// Single-prompt text queries or chat histories with optional system instruction
export async function askGemini(
  contents: GeminiChatMessage[], 
  apiKey: string, 
  systemInstruction?: string
): Promise<string> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const payload: any = { contents };
  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Structured JSON queries (e.g. for dynamic grading reports)
export async function askGeminiJson(prompt: string, apiKey: string): Promise<any> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(text);
}

// Dynamically generate the next interview question using Gemini API
export async function generateInterviewQuestion(
  history: { sender: 'ai' | 'user'; text: string }[],
  mode: string,
  difficulty: string,
  apiKey: string
): Promise<string> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const historyText = history.length > 0 
    ? history.map(msg => `[${msg.sender.toUpperCase()}]: ${msg.text}`).join('\n\n')
    : "No history yet. This is the start of the interview.";

  const prompt = `You are a professional technical interviewer conducting a mock interview.
  Interview Details:
  - Role/Domain: ${mode}
  - Difficulty/Tier: ${difficulty}
  
  Conversation History:
  ${historyText}
  
  Your Task:
  Generate the next interview question. 
  - If the conversation history is empty, ask an introductory question suitable for the role and difficulty.
  - If the candidate has answered previous questions, analyze their answers, provide a very brief feedback comment (e.g., "Good explanation.", "That makes sense.") or a follow-up query, and then ask the next question.
  - Keep your response conversational, concise, and focused. Limit your response to 1-3 sentences total. Do not output any meta-text, markdown headings, or JSON. Just output the text that you would say directly to the candidate.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to generate question: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Could you elaborate on your experience?';
}
