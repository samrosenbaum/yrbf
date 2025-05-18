'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { personalities } from "@/lib/personalities";

export const dynamic = 'force-dynamic';

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
}

function ChatPage() {
  const searchParams = useSearchParams();
  const personalityKey = searchParams.get('personality') || 'dimitri';
  const personality = personalities[personalityKey] || personalities['dimitri'];

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setIsPaidUser(true);
      setLimitReached(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (messages.length === 0) {
      const starters = personality.starters || [`Hey, I'm ${personality.name}. What’s on your mind?`];
      const starter = starters[Math.floor(Math.random() * starters.length)];
      setMessages([{ role: 'assistant', content: starter }]);
    }
  }, [messages.length, personality]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    if (!isPaidUser && newMessages.filter(msg => msg.role === 'user').length >= 30) {
      setLimitReached(true);
      setIsTyping(false);
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personality: personalityKey,
          message: input,
        }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply || "Sorry, something went wrong." }]);
    } catch (err) {
      console.error("Chat error details:", err);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong (client).' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`min-h-screen ${personality.bg} ${personality.textColor} p-8`}>
      <h1 className="text-3xl font-bold text-center mb-1">Chat with {personality.name} 💬</h1>
      <p className="text-center text-sm mb-6 italic text-gray-300">{personality.tagline}</p>

      <div className="text-center mb-4">
        <label htmlFor="personaSelect" className="mr-2">Choose your boyfriend:</label>
        <select
          id="personaSelect"
          value={personalityKey}
          onChange={(e) => {
            const newPersona = e.target.value;
            window.location.href = `/chat?personality=${newPersona}`;
          }}
          className="border border-gray-300 rounded px-2 py-1 text-black"
        >
          {Object.entries(personalities).map(([key, p]) => (
            <option key={key} value={key}>{p.name}</option>
          ))}
        </select>
      </div>

      <Card className="p-6 mb-6 max-w-2xl mx-auto space-y-4 border-neutral-800">
        {messages.map((msg, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src={msg.role === 'user' ? undefined : personality.avatar} />
              <AvatarFallback>{msg.role === 'user' ? 'You' : personality.name}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{msg.role === 'user' ? 'You' : personality.name}</p>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start space-x-4 animate-pulse">
            <Avatar>
              <AvatarImage src={personality.avatar} />
              <AvatarFallback>{personality.name}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{personality.name}</p>
              <p className="typing">...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </Card>

      {limitReached ? (
        <div className="text-center space-y-4">
          <p>You’ve reached your free message limit.</p>
          <Button
            onClick={async () => {
              const res = await fetch('/api/checkout', { method: 'POST' });
              const data = await res.json();
              window.location = data.url;
            }}
          >
            Unlock Unlimited Chat for $3/week
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-4 max-w-2xl mx-auto">
          <Input
            placeholder={`Say something to ${personality.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      )}
    </div>
  );
}
