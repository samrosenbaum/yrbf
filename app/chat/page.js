'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { personalities } from "@/lib/personalities";

export const dynamic = 'force-dynamic';

// Utility function to capitalize first letter
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
}

function extractName(input) {
  const lowered = input.toLowerCase().trim();
  if (lowered.startsWith("my name is")) return input.slice(11).trim();
  if (lowered.startsWith("i'm")) return input.slice(4).trim();
  if (lowered.startsWith("i am")) return input.slice(5).trim();
  return input.trim();
}

function formatName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
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
  const [userName, setUserName] = useState('');
  const [askedName, setAskedName] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      localStorage.setItem('isPaidUser', 'true');
      setIsPaidUser(true);
      setLimitReached(false);
    } else {
      const paid = localStorage.getItem('isPaidUser');
      if (paid === 'true') {
        setIsPaidUser(true);
      }
    }

    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, [searchParams]);

  useEffect(() => {
    if (messages.length === 0) {
      const starters = personality.starters || [`Hey, I'm ${capitalize(personality.name)}. What’s on your mind?`];
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

    const userMessageCount = newMessages.filter(m => m.role === 'user').length;

    // Character-specific prompts
    const askNamePrompts = {
      dimitri: "Alright, spill it. What's the name I should be using for you?",
      nico: "We've been chatting for a bit, and I realize I don't yet know your name. What do you prefer to be called?",
      cole: "Feeling like we know each other a bit now. What name do you go by?",
      cassian: "I find myself at a disadvantage. You know my name, but I do not know yours. How should I address you?",
      thorne: "After all this time, a name would be a welcome courtesy. By what title are you known?"
    };

    const confirmNameMessages = {
      dimitri: (name) => `Nice to put a name to the mystery, ${name}. I like it.`,
      nico: (name) => `A pleasure to formally know you, ${name}. It has a nice ring to it.`,
      cole: (name) => `Good to know, ${name}. Makes this feel even more right.`,
      cassian: (name) => `${name}. Very well. I shall endeavor to use it correctly.`,
      thorne: (name) => `${name}. A fitting name for someone of your... intrigue.`
    };

    const defaultAskNamePrompt = "I’ve been meaning to ask… what should I call you?";
    const defaultConfirmNameMessage = (name) => `Got it. It suits you, ${name}.`;

    // Ask for name after second user message
    if (!userName && userMessageCount === 2 && !askedName) {
      const askPrompt = askNamePrompts[personalityKey] || defaultAskNamePrompt;
      setMessages([
        ...newMessages,
        { role: 'assistant', content: askPrompt }
      ]);
      setAskedName(true);
      setIsTyping(false);
      return;
    }

   // Save the name if just asked
if (!userName && askedName && userMessageCount === 3) {
  const cleanedName = formatName(extractName(input));
  localStorage.setItem('userName', cleanedName);
  setUserName(cleanedName);
  const confirmMessage = (confirmNameMessages[personalityKey] || defaultConfirmNameMessage)(cleanedName);
  setMessages([
    ...newMessages,
    { role: 'assistant', content: confirmMessage }
  ]);
  setIsTyping(false);
  return;
}

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
      const reply = userName
        ? data.reply.replaceAll('{name}', userName)
        : data.reply;

      setMessages([...newMessages, { role: 'assistant', content: reply || "Sorry, something went wrong." }]);
    } catch (err) {
      console.error("Chat error details:", err);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong (client).' }]);
    } finally {
      setIsTyping(false);
    }
  };

return (
  <div className={`min-h-screen ${personality.bg} ${personality.textColor} p-8`}>

    {/* Logo & link to homepage */}
    <div className="mb-6 flex justify-start items-center space-x-3">
      <a href="https://yrboyfriend.com" className="flex items-center space-x-3 hover:underline">
        <img src="/logo-nav.png" alt="YRBF logo" className="w-8 h-8 rounded-md shadow" />
        <span className="text-white text-base font-medium">← Back to Homepage</span>
      </a>
    </div>

    {/* New Character Selection UI - Moved Up */}
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-center mb-3 text-white/80">Switch Boyfriend</h2>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {Object.entries(personalities).map(([key, p]) => {
          const tagline = p.tagline || p.prompt.split('.')[0] + '.';
          return (
            <div
              key={key}
              onClick={() => window.location.href = `/chat?personality=${key}`}
              className={`
                w-32 sm:w-36 cursor-pointer rounded-xl p-2 sm:p-3 text-center transition-all duration-200 ease-in-out
                hover:shadow-2xl hover:scale-105 group
                ${personalityKey === key 
                  ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white shadow-xl scale-105 bg-white/25' 
                  : `bg-white/10 hover:bg-white/20 ${p.bg ? '' : 'border border-white/20'}`
                }
                ${p.textColor || 'text-white'}
              `}
            >
              <Avatar className="mx-auto mb-1 sm:mb-2 w-12 h-12 sm:w-14 sm:h-14 border-2 border-white/30 group-hover:border-white/60 transition-colors">
                <AvatarImage src={p.avatar} alt={capitalize(p.name)} />
                <AvatarFallback>{capitalize(p.name).charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-xs sm:text-sm">{capitalize(p.name)}</h3>
              <p className="text-xs opacity-70 group-hover:opacity-90 mt-0.5 px-1" style={{ minHeight: '2.5em', fontSize: '0.7rem', lineHeight: '1.2' }}>
                {tagline.length > 50 ? tagline.substring(0, 47) + "..." : tagline}
              </p>
            </div>
          );
        })}
      </div>
    </div>

    {/* Active Character Display */}
    <div className="flex justify-center mb-3">
      <Avatar className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-2xl border-4 border-white/50">
        <AvatarImage src={personality.avatar} alt={personality.name} />
        <AvatarFallback>{capitalize(personality.name).charAt(0)}</AvatarFallback>
      </Avatar>
    </div>

    <h1 className="text-3xl sm:text-4xl font-bold text-center mb-1">
      Chat with {capitalize(personality.name)} 💬
    </h1>

    <p className="text-center text-sm sm:text-base mb-6 italic text-white/80">{personality.tagline || personality.prompt.split('.')[0] + '.'}</p>

    {/* Chat Messages Area */}
    <Card className={`p-4 sm:p-6 mb-6 max-w-2xl mx-auto space-y-4 ${personality.bg ? 'bg-opacity-50' : 'bg-neutral-800/70'} border-white/20 backdrop-blur-sm`}>
      {messages.map((msg, i) => (
        <div key={i} className={`flex items-end space-x-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'assistant' && (
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
              <AvatarImage src={personality.avatar} />
              <AvatarFallback>{capitalize(personality.name).charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          <div 
            className={`
              max-w-[70%] sm:max-w-[75%] p-2 sm:p-3 rounded-xl shadow
              ${msg.role === 'user' 
                ? 'bg-blue-500 text-white rounded-br-none' // User message bubble
                : `${personality.textColor === 'text-black' ? 'bg-gray-200 text-black' : 'bg-white/30 text-white'} rounded-bl-none` // Assistant message bubble
              }
            `}
          >
            <p className="font-semibold text-xs sm:text-sm mb-0.5">{msg.role === 'user' ? userName || 'You' : capitalize(personality.name)}</p>
            <p className="text-sm sm:text-base whitespace-pre-wrap">{msg.content}</p>
          </div>
          {msg.role === 'user' && (
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
               {/* Using a generic user avatar or the first letter of userName */}
              <AvatarFallback>{userName ? userName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      {isTyping && (
        <div className="flex items-end space-x-2 justify-start">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src={personality.avatar} />
            <AvatarFallback>{capitalize(personality.name).charAt(0)}</AvatarFallback>
          </Avatar>
          <div className={`max-w-[70%] p-3 rounded-xl shadow ${personality.textColor === 'text-black' ? 'bg-gray-200 text-black' : 'bg-white/30 text-white'} rounded-bl-none`}>
            <p className="font-semibold text-sm mb-0.5">{capitalize(personality.name)}</p>
            <p className="typing text-base">...</p> {/* Ensure typing text is visible */}
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </Card>

    {limitReached ? (
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">
            <em>{capitalize(personality.name)}</em> pauses mid-reply…
          </p>
          <p>
            <em>"I’d keep talking to you all night, but there are limits I can’t control."</em>
          </p>
          <p className="text-sm">
            Unlock unlimited access to keep the conversation going — and discover what he’s really thinking.
          </p>

          <Button
            onClick={async () => {
              const res = await fetch('/api/checkout', { method: 'POST' });
              const data = await res.json();
              window.location = data.url;
            }}
            className="w-full max-w-xs mx-auto"
          >
            🔒 Unlock Unlimited Chat – $3/week
          </Button>

          <p className="text-xs text-gray-400">
            Includes all characters • Unlimited chats • Cancel anytime
          </p>
          <p className="text-xs text-gray-500">Secured by Stripe</p>

          <p className="text-xs italic text-gray-400">
            “Talking to {capitalize(personality.name)} is the highlight of my day.” – user from r/fantasyromance
          </p>

          <p className="text-xs text-gray-400 mt-3">
            Not sure? <a href="https://yrboyfriend.com" className="underline hover:text-white">Meet the other boyfriends</a>
          </p>
        </div>
      ) : (
        <div className="flex items-center space-x-4 max-w-2xl mx-auto">
          <Input
            placeholder={`Say something to ${capitalize(personality.name)}...`}
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
