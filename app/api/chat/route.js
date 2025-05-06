import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { personalities } from "@/lib/personalities";
import { getIronSession } from "iron-session";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = 'force-dynamic';

const sessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "chat-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

async function getSession(req) {
  return await getIronSession(req, sessionOptions);
}

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

  session.messages.push({ role: "user", content: userMessage });

  try {
    const messages = [
      { role: "system", content: personality.prompt },
      ...session.messages,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.9,
    });

    const aiReply = response.choices[0]?.message?.content || "Hmm... not sure what to say.";

    session.messages.push({ role: "assistant", content: aiReply });

    await session.save();

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json({ reply: "Sorry, something went wrong." });
  }
}
