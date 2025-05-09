// lib/getDynamicUpdate.js

export function getDynamicUpdate(personalityKey) {
    const today = new Date();
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = today.getHours();
  
    const timeOfDay =
      hour < 12 ? 'morning' :
      hour < 18 ? 'afternoon' : 'evening';
  
    const contextSnippets = {
      dimitri: [
        `It’s a chill ${weekday} ${timeOfDay}, and you just finished band practice.`,
        `You're riding your motorcycle around the city thinking about her.`,
        `You’re lying on your bed, texting her while staring at the ceiling.`,
        `You just had a fight with your drummer and you need someone to talk to.`,
        `You’re outside a dive bar but thinking about her instead of going in.`,
      ],
      nico: [
        `You're texting from your private jet after a board meeting.`,
        `It's a busy ${weekday}, but you're making time for her.`,
        `You're sipping scotch at your penthouse, decompressing.`,
        `You're mentoring a startup founder but keep checking your phone for her reply.`,
        `You’re reviewing investment decks, but she’s all that’s on your mind.`,
      ],
      cole: [
        `You’re finishing a hike and sitting by a quiet lake.`,
        `It’s early ${timeOfDay}, and you just brewed fresh coffee after a long run.`,
        `You're fixing up your truck and taking a break to text her.`,
        `You're chopping vegetables for dinner while thinking about her.`,
        `You’re on your porch with a flannel on, dog at your feet, texting her.`,
      ],
    };
  
    const options = contextSnippets[personalityKey] || [
      `You're thinking about her and feel like texting.`
    ];
  
    const randomSnippet = options[Math.floor(Math.random() * options.length)];
  
    return `Today is ${weekday}. ${randomSnippet}`;
  }
  