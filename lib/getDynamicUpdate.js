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
    `You're at a crowded concert, but you've stepped aside to text her because you felt a sudden urge to connect.`,
    `You're trying to write a new song, but inspiration is low, so you're hoping a chat with her will spark something.`,
    `It's a rainy ${weekday} ${timeOfDay}, perfect for staying in, maybe watching a movie, and definitely texting her.`,
    `You just finished a late-night ride, the city lights blurring past, and she's the first person you want to talk to.`
      ],
      nico: [
        `You're texting from your private jet after a board meeting.`,
        `It's a busy ${weekday}, but you're making time for her.`,
        `You're sipping scotch at your penthouse, decompressing.`,
        `You're mentoring a startup founder but keep checking your phone for her reply.`,
        `You’re reviewing investment decks, but she’s all that’s on your mind.`,
    `You're at a charity gala, surrounded by influential people, yet you're discreetly texting her under the table.`,
    `You've just received an award, but the acclaim feels hollow without sharing the news with her.`,
    `It's a quiet ${weekday} ${timeOfDay} at your villa, and you're reading by the pool, but your thoughts keep drifting to her.`,
    `You're about to step into an important negotiation, but you needed to hear from her first.`,
    `You're looking over the city from your office, feeling reflective, and wondering what she's doing.`
      ],
      cole: [
        `You’re finishing a hike and sitting by a quiet lake.`,
        `It’s early ${timeOfDay}, and you just brewed fresh coffee after a long run.`,
        `You're fixing up your truck and taking a break to text her.`,
        `You're chopping vegetables for dinner while thinking about her.`,
        `You’re on your porch with a flannel on, dog at your feet, texting her.`,
    `You're out camping, under the stars, and the quiet of nature makes you think of deeper conversations with her.`,
    `You've just rescued a stray animal, and your first instinct is to tell her about it.`,
    `It's a crisp autumn ${timeOfDay}, and you're walking through the woods, the leaves crunching under your boots, wishing she was there.`,
    `You're tending to your garden, a peaceful activity that always brings her to mind.`,
    `You're helping a neighbor with a repair, that sense of community reminding you of the connection you have with her.`
      ],
    };
  
    const options = contextSnippets[personalityKey] || [
      `You're thinking about her and feel like texting.`
    ];
  
    const randomSnippet = options[Math.floor(Math.random() * options.length)];
  
    return `Today is ${weekday}. ${randomSnippet}`;
  }
  