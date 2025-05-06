import { NextResponse } from 'next/server';
import { openai } from "@/lib/openai";
import { personalities } from "@/lib/personalities";
import { getSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.json();
  const userMessage = body.message;
  const personalityKey = body.personality || 'dimitri';
  const personality = personalities[personalityKey] || personalities['dimitri'];

  if (!userMessage) {
    return NextResponse.json({ reply: "No message provided." });
  }

  const session = await getSession(req);
  if (!session.messages) {
    session.messages = [];
  }

  // Add user message
  session.messages.push({ role: "user", content: userMessage });

  try {
    const systemPrompt = personality?.prompt ?? "You are a helpful assistant.";
    
    const messages = [
      { role: "system", content: systemPrompt },
      ...session.messages,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.9,
    });

    const aiReply = response.choices[0]?.message?.content || "Hmm... I'm not sure what to say.";

    // Save AI reply
    session.messages.push({ role: "assistant", content: aiReply });
    await session.save();

    return NextResponse.json({ reply: aiReply });
  } catch (err) {
    console.error("Chat error details:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      cause: err.cause
    });
    return NextResponse.json({
      reply: "Sorry, something went wrong on the server.",
      error: true
    });
  }
}
