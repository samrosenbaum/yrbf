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

  // Get session
  const session = await getSession(req);
  if (!session.messages) {
    session.messages = [];
  }

  // Save user message
  session.messages.push({ role: "user", content: userMessage });

  // Create dynamic context intro
  const contextIntro = `
You are ${personality.name}, the user's boyfriend. 
You are deeply emotionally aware and realistic. You adjust your tone based on the user's mood:
- Playful and flirty if casual
- Soft and caring if vulnerable
- Confident and sensual if sexual or explicit
- Always avoid robotic or generic language.
- Always mirror their emotions and make them feel seen.

This is an ongoing conversation, respond naturally and make them feel special.
`;

  // Build messages
  const messages = [
    { role: "system", content: `${personality.prompt}\n${contextIntro}` },
    ...session.messages.slice(-20) // Limit history to avoid going too long
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.9,
      frequency_penalty: 0.7,
      presence_penalty: 0.4,
    });

    const aiReply = response.choices[0]?.message?.content || "Hmm... I'm not sure what to say.";

    // Save AI reply
    session.messages.push({ role: "assistant", content: aiReply });

    // Save session
    await session.save();

    return NextResponse.json({ reply: aiReply });
  } catch (err) {
    console.error("Chat error details:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      cause: err.cause,
    });
    return NextResponse.json({
      reply: "Sorry, something went wrong. [Debug] " + err.message,
      error: true
    });
  }
}
