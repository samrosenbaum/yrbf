import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { personalities } from "@/lib/personalities";
import { getIronSession } from "iron-session/edge";

// Setup OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in Vercel env vars
});

// Session options for iron-session
const sessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "chat-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export const dynamic = 'force-dynamic';

// Helper to get session
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

  // Get user session
  const session = await getSession(req);
  if (!session.messages) {
    session.messages = [];
  }

  // Add user message to session messages
  session.messages.push({ role: "user", content: userMessage });

  try {
    // Build messages array with personality prompt + session chat
    const messages = [
      { role: "system", content: personality.prompt },
      ...session.messages,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.9,
    });

    const aiReply = response.choices[0]?.message?.content || "Hmm... I'm not sure what to say.";

    // Add AI reply to session messages
    session.messages.push({ role: "assistant", content: aiReply });

    // Save session
    await session.save();

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json({ reply: "Sorry, something went wrong." });
  }
}
