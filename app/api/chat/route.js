import { NextResponse } from 'next/server';
import { openai } from "@/lib/openai";
import { personalities } from "@/lib/personalities";
import { getSession } from "@/lib/session";
import { kv } from "@/lib/kv";
import { getDynamicUpdate } from "@/lib/getDynamicUpdate"; // ✅ Add this

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.json();
  const userMessage = body.message;
  const personalityKey = body.personality || 'dimitri';
  const personality = personalities[personalityKey] || personalities['dimitri'];

  if (!userMessage) {
    return NextResponse.json({ reply: "No message provided." });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const session = await getSession(req);
  if (!session.messages) {
    session.messages = [];
  }

  // Add user message
  session.messages.push({ role: "user", content: userMessage });

  try {
    // ✅ Insert dynamic content into the system message
    const update = await getDynamicUpdate(personalityKey);
    const systemMessage = `${personality.prompt}\n\n${update || ''}`;

    const messages = [
      { role: "system", content: systemMessage },
      ...session.messages,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.9,
    });

    const aiReply = response.choices[0]?.message?.content || "Hmm... I'm not sure what to say.";

    // Add assistant reply
    session.messages.push({ role: "assistant", content: aiReply });
    await session.save();

    // Save chat to Upstash
    const chatKey = `chat-history:${ip}:${personalityKey}`;
    await kv.set(chatKey, {
      personality: personality.name,
      messages: session.messages,
      lastUpdated: Date.now(),
    });

    console.log("[Chat Saved]", chatKey);

    return NextResponse.json({ reply: aiReply });
  } catch (err) {
    console.error("Chat error details:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      cause: err.cause
    });

    return NextResponse.json({
      reply: "Sorry, something went wrong (server).",
      error: true
    });
  }
}
