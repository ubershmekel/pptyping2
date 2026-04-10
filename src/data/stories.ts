import type { CutsceneStory, Team } from "../types";

// ─── Cutscene stories ────────────────────────────────────────────────────────
// 6 cutscenes per team (indices 0–5)

export const CUTSCENE_STORIES: Record<Team, CutsceneStory[]> = {
  pokemon: [
    // Cutscene 0 — opening, before Level 1
    {
      title: "A HERO ANSWERS THE CALL",
      artClass: "art-pokemon-0",
      paragraphs: [
        "Rowlet was halfway through his delivery route when something reached through the trees and lifted him out of the grove. Pikachu found the message bag on the ground, a few scattered letters beside it, and a single pink feather drifting down to meet them. His cheeks sparked once.",
      ],
    },
    // Cutscene 1 — after Level 4, before Arc 2
    {
      title: "THE KEYS BEGIN TO WAKE",
      artClass: "art-pokemon-1",
      paragraphs: [
        "Four keys restored. The petal trail led deeper into the grove and then, through the trees, to a warm glow: a yellow cottage. Rowlet's silhouette sat in the window. \"Pika.\" _I see you. I'm coming._",
      ],
    },
    // Cutscene 2 — after Level 8
    {
      title: "DEEPER INTO THE KEYBOARD",
      artClass: "art-pokemon-2",
      paragraphs: [
        "Through the electric haze came a vision: a warm cottage, flower petals, Rowlet in a little nest, watching the door. She was being very, very kind. That almost made it worse. Pikachu's cheeks sparked. _Faster._",
      ],
    },
    // Cutscene 3 — after Level 12
    {
      title: "HALFWAY HOME",
      artClass: "art-pokemon-3",
      paragraphs: [
        "Through the crystal came a low, searching hoot. Then a soft voice: \"You don't need to go anywhere.\" Pikachu pressed his paw flat against the wall and typed harder.",
      ],
    },
    // Cutscene 4 — after Level 16
    {
      title: "THE HOME STRETCH",
      artClass: "art-pokemon-4",
      paragraphs: [
        "Sixteen keys. The summit ahead. Pikachu's cheeks glowed steady, not flickering. He had been saving that charge for one thing only. _Four more keys._",
      ],
    },
    // Cutscene 5 — finale, after Level 20
    {
      title: "THE KEYBOARD IS SAVED!",
      artClass: "art-pokemon-5",
      paragraphs: [
        "The last key. Pikachu planted his feet and let everything go. _THUNDERBOLT._ The barrier shattered. Rowlet came spiraling home. A soft voice in the dust: \"Oh. He had someone. I'm so sorry.\" Rowlet glanced back once, then tucked in.",
      ],
    },
  ],

  mlp: [
    // Cutscene 0 — opening, before Level 1
    {
      title: "THE KEYBOARD NEEDS FRIENDSHIP!",
      artClass: "art-mlp-0",
      paragraphs: [
        "Pinkie's invitations were perfect until something small, blue, and very wet crashed through the window and blasted them into soggy confetti. She looked at the little turtle. He grinned back. \"Oh, honey,\" she said. \"We need to talk.\"",
      ],
    },
    // Cutscene 1 — after Level 4, before Arc 2
    {
      title: "FRIENDSHIP BEGINS WITH F AND J",
      artClass: "art-mlp-1",
      paragraphs: [
        "\"Rule one,\" Pinkie said. \"Everyone laughs, _especially_ the pony it happened to.\" She demonstrated. It worked. The little turtle stared at his hands. \"It's different when they laugh too.\" \"It's everything,\" said Pinkie.",
      ],
    },
    // Cutscene 2 — after Level 8
    {
      title: "THE MIDDLE ROW OPENS UP",
      artClass: "art-mlp-2",
      paragraphs: [
        "He tried. The timing was off. A bird choir scattered and nobody laughed. Pinkie put a hoof on his shoulder. \"If you can't picture them smiling, don't.\" Something in his expression changed.",
      ],
    },
    // Cutscene 3 — after Level 12
    {
      title: "MORE THAN HALFWAY THERE",
      artClass: "art-mlp-3",
      paragraphs: [
        "A whoopee cushion. Perfect timing. The pony laughed, and so did the little turtle. \"They laughed _because of me_,\" he said quietly. \"That's never happened before.\" Pinkie smiled and, unusually, said nothing.",
      ],
    },
    // Cutscene 4 — after Level 16
    {
      title: "THE FINAL KEYS AWAIT",
      artClass: "art-mlp-4",
      paragraphs: [
        "\"Is this what friendship is? Pranks?\" Pinkie thought for two whole seconds. \"Pranks are the fun part. The real part? You pick someone and you show up.\" He turned his notebook over. \"I've never done that.\" \"I know,\" she said. \"You're going to be great at it.\"",
      ],
    },
    // Cutscene 5 — finale, after Level 20
    {
      title: "EVERY KEY HAS A FRIEND!",
      artClass: "art-mlp-5",
      paragraphs: [
        "The party happened. He helped with the decorations — no pranks, and they never even crossed his mind. Halfway through, Pinkie spotted him surrounded by new friends, just laughing. _That's the one,_ she thought. _That's the whole lesson._",
      ],
    },
  ],
};

// ─── Per-level story blurbs ───────────────────────────────────────────────────
// Short narrative text shown at the top of each level screen.

export const LEVEL_STORIES: Record<Team, Record<number, string>> = {
  pokemon: {
    1: "The corruption has begun. Pikachu must first measure the extent of the damage with a full keyboard scan. Type quickly — every second counts!",
    2: "The f and j keys — the anchors of all typing — pulse with corrupted energy. Pikachu plants both paws firmly. These are the keys that guide every typist home. Restore them first!",
    3: "The e and t keys flicker weakly. Common letters, caught in the crossfire. Pikachu moves in carefully, ready to zap them clean.",
    4: "The Digital Grove shudders. Pikachu has restored f, j, e, and t. Now comes the test: all four keys together, under full pressure. The ancient trees lean in to watch.",
    5: "O and A glow with a strange pastel shimmer. There is definitely pony magic at work here. Pikachu is unimpressed and also slightly allergic to glitter.",
    6: "I and N — two of the most-used letters in the whole language — have been completely corrupted. Without them, nothing makes sense. Pikachu surges forward.",
    7: "H and S flicker at the edge of the Thunder Shrine. The storm around them crackles with misdirected energy. Time to ground them both.",
    8: "The Thunder Shrine falls silent. Pikachu has cleansed o, a, i, n, h, and s. Now comes the real test: all unlocked keys together, under pressure. The crystal cavern echoes with anticipation.",
    9: "R and L — the keys of movement and direction — have been tangled together by the corruption. Pikachu must type through the confusion.",
    10: "U and D. Deep in the cavern. The glow of corrupted letters reflects off the crystal walls. Pikachu's paws move steadily across the keys.",
    11: "Y and W wait at the coast. The waves carry the sound of corrupted static. Pikachu can see Rowlet's outline on the horizon. Almost there.",
    12: "The Crystal Cavern glitters. Pikachu has restored r, l, u, d, y, and w. A full review of every key unlocked so far awaits. Pikachu breathes steadily. Every keystroke counts.",
    13: "M and G — two letters of motion and growth — are still locked. Pikachu types with purpose, each correct keystroke a step closer to Rowlet.",
    14: "C and P shimmer in the mountain air. Pikachu can feel the end approaching. Only the rarest letters remain.",
    15: "K and B. One of them makes a satisfying sound. Both are corrupted. Both need Pikachu right now.",
    16: "The Stardrift Coast glimmers. Pikachu has unlocked m, g, c, p, k, and b. A cumulative review awaits — every key from this arc, tested together. Pikachu is ready.",
    17: "V and X — rare, angular, full of potential — wait in the cold. Pikachu types carefully. Precision counts more than speed at this altitude.",
    18: "The final push. Q and Z — the rarest letters in the language — stand between Pikachu and Rowlet. Every keystroke. Every key. Pika.",
    19: "Every rare key has been restored: v, x, q, z. Now Pikachu must type with the full alphabet — all twenty-six keys, clean and charged. Rowlet is almost free.",
    20: "The final review. Every single key, restored and ready. Pikachu stands at the keyboard with quiet purpose. This is what all the training was for. One last run. Pika.",
  },

  mlp: {
    1: "First, Pinkie needs to see just how fast she can type before the corruption spreads further. She stretches her hooves and gets ready for a full-speed friendship sprint!",
    2: "The f and j keys are shivering with corrupted energy! These are the home keys — where every good typist starts their journey. Pinkie gives them an encouraging smile. 'Don't worry, little keys.'",
    3: "E and T are two of Equestria's most beloved letters. They show up in nearly every word, and right now they need a friend. Pinkie is on the case.",
    4: "The Digital Grove is waking up! Pinkie has befriended f, j, e, and t. Now she must type them all together in one grand test before the adventure continues. She grins. This is the fun part.",
    5: "O and A are hiding under some very suspicious yellow static. Pinkie suspects Pokemon energy. She does not hold this against them personally.",
    6: "I and N — without these, you can't spell 'friend,' 'invite,' or 'pinkie' itself. This is a crisis. Pinkie handles it with a smile and excellent typing form.",
    7: "H and S wait in the Thunder Shrine, trembling slightly. Pinkie pats them reassuringly. 'You're doing great. You're both such good letters.'",
    8: "The Thunder Shrine sparkles! Pinkie has befriended o, a, i, n, h, and s. Now she must type them all together in one grand review. She stretches her hooves and grins. She was born ready.",
    9: "R and L — the letters of rolling laughter and leaping rainbows — have been tangled by the corruption. Pinkie untangles things by typing very fast and very happily.",
    10: "U and D glow in the crystal cavern. They look a little lonely. Pinkie already has names for them: Ulysses and Daffodil. It helps.",
    11: "Y and W sparkle at the Stardrift Coast. The sea air is nice. Pinkie has brought snacks. The keys are delighted.",
    12: "The Crystal Cavern is sparkling with restored letters! Pinkie has befriended r, l, u, d, y, and w. Now she must type them all together. She grins. This is what she was made for.",
    13: "M and G — for 'more' and 'good' — are still locked. Pinkie types them in order, whispering encouraging words with each keystroke.",
    14: "C and P! 'C is for Cutie Mark,' Pinkie explains to no one in particular, 'and P is for Pinkie!' She types them with extra enthusiasm.",
    15: "K and B look tough but Pinkie knows better. Every key has a soft center. She types them both with warmth.",
    16: "The Stardrift Coast is glittering! Pinkie has befriended m, g, c, p, k, and b. Now she must type them all together. She has prepared for this her whole life.",
    17: "V and X are rare visitors but Pinkie welcomes everyone. 'The rarer the letter, the more special the friendship!' she announces proudly.",
    18: "Q and Z! The rarest, most mysterious letters on the whole keyboard. Pinkie has saved the very best for last. She types their names and feels something wonderful click into place.",
    19: "The Apex Summit blazes with rainbow light! Pinkie has befriended v, x, q, and z — every rare and unusual letter. Now she must type them all together. She has prepared for this her whole life.",
    20: "The grand finale! Every key on the keyboard is Pinkie's friend now. She takes a deep breath, smiles the biggest smile, and prepares to type the entire alphabet with love and speed.",
  },
};
