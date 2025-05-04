import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { personalities } from "@/lib/personalities";

export const dynamic = 'force-dynamic';

// Setup OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in Vercel env vars
});

export async function POST(req) {
  const body = await req.json();
  const userMessage = body.message;
  const personalityKey = body.personality || 'dimitri';
  const personality = personalities[personalityKey] || personalities['dimitri'];

  if (!userMessage) {
    return NextResponse.json({ reply: "No message provided." });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: personality.prompt || "You are a helpful assistant." },
        { role: "user", content: userMessage }
      ],
      temperature: 0.9,
    });

    const aiReply = response.choices[0]?.message?.content || "Hmm... I'm not sure what to say.";

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json({ reply: "Sorry, something went wrong." });
  }
}
