import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TranslateBody {
  sentences?: string[];
  sourceLang?: string;
  targetLang?: string;
}

/**
 * 문장 배열을 받아 번역 결과를 반환하는 프록시.
 * OPENAI_API_KEY가 있으면 OpenAI Chat Completions 호출, 없으면 mock 반환.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TranslateBody;
    const sentences = Array.isArray(body.sentences) ? body.sentences : [];
    const sourceLang = body.sourceLang ?? "en";
    const targetLang = body.targetLang ?? "ko";

    if (sentences.length === 0) {
      return NextResponse.json(
        { message: "sentences array is required and must not be empty" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const pairs = await callOpenAiTranslate(sentences, sourceLang, targetLang, apiKey);
      return NextResponse.json({ pairs });
    }

    const pairs = sentences.map((sourceText) => ({
      sourceText,
      translatedText: `[mock ${targetLang}] ${sourceText.slice(0, 50)}${sourceText.length > 50 ? "…" : ""}`,
    }));
    return NextResponse.json({ pairs });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Translation failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}

async function callOpenAiTranslate(
  sentences: string[],
  sourceLang: string,
  targetLang: string,
  apiKey: string
): Promise<{ sourceText: string; translatedText: string }[]> {
  const text = sentences.join("\n");
  const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Keep the same number of lines. Return only the translations, one per line.\n\n${text}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? "OpenAI API error");
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
  const lines = raw.split("\n").map((s) => s.trim()).filter(Boolean);

  return sentences.map((sourceText, i) => ({
    sourceText,
    translatedText: lines[i] ?? sourceText,
  }));
}
