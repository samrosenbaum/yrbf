import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { personalities } from "@/lib/personalities";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.json();
  const userMessage = body.message;
  const personalityKey = body.personality || 'dimitri';
  const personality = personalities[personalityKey] || personalities['dimitri'];

  if (!userMessage) {
    return NextResponse.json({ reply: "No message provided." });
  }

  try {
    const messages = [
      { role: "system", content: personality.prompt },
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.9,
    });

    const aiReply = response.choices[0]?.message?.content || "Hmm... I'm not sure what to say.";

    return NextResponse.json({ reply: aiReply });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ reply: "Sorry, something went wrong." });
  }
}
