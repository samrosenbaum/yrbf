'use client';

import { useState, useEffect, Suspense } from 'react';
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
  const [error, setError] = useState('');

  // Add starter message on load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: `Hey, I'm ${personality.name}. What’s on your mind?` }]);
    }
  }, [messages.length, personality.name]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setError('');

    try {
      const res = await fetch('https://yrbf-lxh6.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personality: personalityKey,
          message: input
        }),
      });

      const data = await res.json();

      if (data.error) {
        console.error("Backend returned error:", data.reply);
        setError(data.reply);
      }

      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error("Frontend fetch error:", err);
      setMessages([...newMessages, { role: 'assistant', content: 'An unexpected error occurred while sending message.' }]);
      setError("Fetch error: " + err.message);
    }
  };

  return (
    <div className={`min-h-screen ${personality.bg} ${personality.textColor} p-8`}>
      <h1 className="text-3xl font-bold mb-6 text-center">Chat with {personality.name} 💬</h1>

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
      </Card>

      {error && (
        <div className="text-center text-red-500 mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="flex items-center space-x-4 max-w-2xl mx-auto">
        <Input
          placeholder={`Say something to ${personality.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
