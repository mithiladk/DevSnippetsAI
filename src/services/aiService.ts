// src/services/aiService.ts

import * as SecureStore from 'expo-secure-store';
import { AIExplanation } from '@/types';

const API_KEY_STORAGE_KEY = 'devsnippets_api_key';
const API_PROVIDER_KEY    = 'devsnippets_api_provider';

export type AIProvider = 'anthropic' | 'openai' | 'gemini';

export async function saveAPIKey(
  apiKey: string,
  provider: AIProvider
): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
  await SecureStore.setItemAsync(API_PROVIDER_KEY, provider);
}

export async function getAPIKey(): Promise<{
  key: string | null;
  provider: AIProvider | null;
}> {
  const key      = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  const provider = await SecureStore.getItemAsync(API_PROVIDER_KEY) as AIProvider | null;
  return { key, provider };
}

export async function deleteAPIKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
  await SecureStore.deleteItemAsync(API_PROVIDER_KEY);
}

export async function explainCode(
  code: string,
  language: string
): Promise<AIExplanation> {
  const { key, provider } = await getAPIKey();

  if (!key || !provider) {
    throw new Error('No API key found. Please add your AI API key in Settings.');
  }

  const prompt = buildPrompt(code, language);

  switch (provider) {
    case 'anthropic': return await callAnthropic(key, prompt);
    case 'openai':    return await callOpenAI(key, prompt);
    case 'gemini':    return await callGemini(key, prompt);
    default:          throw new Error(`Unknown AI provider: ${provider}`);
  }
}

function buildPrompt(code: string, language: string): string {
  return `You are an expert ${language} developer and teacher.
Analyze this code snippet and respond with ONLY a JSON object.
No markdown, no backticks, no extra text — raw JSON only.

Required format:
{
  "explanation": "Detailed explanation of what this code does",
  "summary": "One paragraph a junior developer can understand",
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;
}

function parseAIResponse(raw: string): AIExplanation {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned) as AIExplanation;
  } catch {
    throw new Error('AI returned an unexpected format. Please try again.');
  }
}

async function callAnthropic(apiKey: string, prompt: string): Promise<AIExplanation> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic error: ${response.status}`);
  const data = await response.json();
  return parseAIResponse(data.content[0].text);
}

async function callOpenAI(apiKey: string, prompt: string): Promise<AIExplanation> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
  const data = await response.json();
  return parseAIResponse(data.choices[0].message.content);
}

async function callGemini(apiKey: string, prompt: string): Promise<AIExplanation> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
  const data = await response.json();
  return parseAIResponse(data.candidates[0].content.parts[0].text);
}