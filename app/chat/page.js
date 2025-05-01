'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const personality = searchParams.get('personality') || 'your AI boyfriend';
  const displayName = personality.charAt(0).toUpperCase() + personality.slice(1);

  const [isPaidUser, setIsPaidUser] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setIsPaidUser(true);
      setLimitReached(false);
    }
  }, [searchParams]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    if (!isPaidUser && newMessages.filter(msg => msg.role === 'user').length >= 5) {
      setLimitReached(true);
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      if (!data.reply) {
        throw new Error('No reply from AI.');
      }

      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong!' }]);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">Chat with {displayName} 💬</h1>

      <div className="space-y-4">
        {messages.map((msg, i) => (
          <Card key={i} className="p-4 flex items-start space-x-4">
            <Avatar>
              <AvatarFallback>
                {msg.role === 'user' ? 'You' : displayName[0]}
              </AvatarFallback>
            </Avatar>
            <p>{msg.content}</p>
          </Card>
        ))}
      </div>

      {limitReached ? (
        <div className="space-y-2">
          <p>You've reached your free message limit.</p>
          <Button onClick={async () => {
            const res = await fetch('/api/checkout', { method: 'POST' });
            const data = await res.json();
            window.location = data.url;
          }}>
            Unlock Unlimited Chat with {displayName} – $3/week
          </Button>
        </div>
      ) : (
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Say something to ${displayName}...`}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      )}
    </div>
  );
}
