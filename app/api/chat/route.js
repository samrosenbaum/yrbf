import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { personalities } from "@/lib/personalities";

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const body = await req.json();
  const messages = body.messages || [];
  const personalityKey = body.personality || 'dimitri';
  const personality = personalities[personalityKey] || personalities['dimitri'];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: personality.prompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.85,
    });

    const aiReply = response.choices[0]?.message?.content || "Hmm... I'm not sure what to say.";
    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json({ reply: "Sorry babe can't talk rn" });
  }
}
