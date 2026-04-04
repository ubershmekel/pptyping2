import type { CutsceneStory, Team } from '../types';

// ─── Cutscene stories ────────────────────────────────────────────────────────
// 6 cutscenes per team (indices 0–5)

export const CUTSCENE_STORIES: Record<Team, CutsceneStory[]> = {
  pokemon: [
    // Cutscene 0 — opening, before Level 1
    {
      title: 'A HERO ANSWERS THE CALL',
      artClass: 'art-pokemon-0',
      paragraphs: [
        'Deep in the heart of Pallet Town, the keyboard began to malfunction. Letters glitched, words scrambled, and typing became impossible. A mysterious energy — rainbow-bright and glittery — had infected every single key.',
        'Rowlet was delivering a very important message when the keyboard struck. The little owl was whisked through a swirling portal of corrupted letters and vanished into the unknown.',
        "Pikachu's eyes flashed with quiet determination. 'Pika.' If Rowlet was going to be saved, the keyboard would need to be cleansed — one key at a time.",
      ],
    },
    // Cutscene 1 — after Level 4, before Arc 2
    {
      title: 'THE KEYS BEGIN TO WAKE',
      artClass: 'art-pokemon-1',
      paragraphs: [
        'A spark of golden lightning crackled across the first row of restored keys. Pikachu\'s typing had begun to undo the rainbow corruption, letter by letter.',
        "'Pika pika!' The little electric mouse cheered as the f and j keys glowed with healthy yellow light. Somewhere beyond the portal, a faint hoot echoed.",
        "Rowlet was still out there. And so were many more corrupted keys. The adventure had only just begun.",
      ],
    },
    // Cutscene 2 — after Level 8
    {
      title: 'DEEPER INTO THE KEYBOARD',
      artClass: 'art-pokemon-2',
      paragraphs: [
        'Eight keys cleansed. Pikachu could feel the keyboard\'s power returning — each restored letter hummed with warm electric energy.',
        "The corruption wasn't just from outside. Something in the middle rows had gone wrong too. Weird pony-shaped static drifted across the screen.",
        "'We\'re getting closer,' Pikachu said, which nobody understood because it was just 'Pika pika' — but the intent was clear.",
      ],
    },
    // Cutscene 3 — after Level 12
    {
      title: 'HALFWAY HOME',
      artClass: 'art-pokemon-3',
      paragraphs: [
        'Twelve levels behind. Pikachu was typing faster now, each keystroke sending a ripple of golden light through the crystal cavern.',
        "Through a gap in the corrupted keys, Pikachu glimpsed something: a round green shape, quietly hooting. Rowlet — just on the other side.",
        "'Almost there,' Pikachu whispered. 'Just a few more rows.'",
      ],
    },
    // Cutscene 4 — after Level 16
    {
      title: 'THE HOME STRETCH',
      artClass: 'art-pokemon-4',
      paragraphs: [
        'The keyboard shimmered and crackled. Sixteen levels down. Only four levels of corrupted keys remained — the rarest, the strangest, the ones nobody ever used.',
        "Pikachu stood at the edge of the Apex Summit. The wind howled. V, X, Q, and Z waited in the distance, wrapped in dense rainbow fog.",
        "'This is it,' Pikachu said. 'Pika. Pika pika pika.' Which meant: 'I trained for this. I was born for this. Let\'s GO.'",
      ],
    },
    // Cutscene 5 — finale, after Level 20
    {
      title: 'THE KEYBOARD IS SAVED!',
      artClass: 'art-pokemon-5',
      paragraphs: [
        'The final key shone gold. The corruption evaporated in a cascade of lightning and light. Every letter on the keyboard glowed clean and warm.',
        'Rowlet tumbled through the clearing portal, spinning joyfully, and crash-landed on Pikachu\'s head. They sat there for a moment, just existing.',
        "Somewhere in Equestria, a pink pony sneezed glitter. The keyboard was saved. The story — and the real adventure of touch typing — had only just begun.",
      ],
    },
  ],

  mlp: [
    // Cutscene 0 — opening, before Level 1
    {
      title: 'THE KEYBOARD NEEDS FRIENDSHIP!',
      artClass: 'art-mlp-0',
      paragraphs: [
        'Pinkie Pie was planning the most spectacular party Equestria had ever seen — and it was going to be typed. Invitations, banners, confetti cannon timings, all written up and ready.',
        'Then the keyboard went haywire! A strange energy — yellow, electric, and smelling faintly of ketchup — zapped across every key, scrambling all the letters into nonsense.',
        "'Ooh, this keyboard just needs some serious friendship!' Pinkie announced, bouncing in place. 'And I am the absolute EXPERT at that!'",
      ],
    },
    // Cutscene 1 — after Level 4, before Arc 2
    {
      title: 'FRIENDSHIP BEGINS WITH F AND J',
      artClass: 'art-mlp-1',
      paragraphs: [
        'The f key burst into pink sparkles. The j key answered with a cheerful rainbow shimmer. Pinkie jumped three feet in the air and landed perfectly.',
        "'Yesyesyesyes! It\'s working!' she squealed, already planning which keys to befriend next. The corrupted energy retreated slightly, confused by sheer enthusiasm.",
        "But the keyboard was large, and many keys still glowed with that strange yellow electric energy. Pinkie cracked her hooves. Time to make more friends.",
      ],
    },
    // Cutscene 2 — after Level 8
    {
      title: 'THE MIDDLE ROW OPENS UP',
      artClass: 'art-mlp-2',
      paragraphs: [
        'Eight keys befriended. Pinkie could see the keyboard lighting up like a Hearth\'s Warming display — each restored letter sparkled with genuine warmth.',
        "The corruption was stubborn in the middle rows, though. It seemed the strange yellow electricity had dug in deep. Pinkie narrowed her eyes. This called for extra friendship.",
        "'Hey keys!' she called. 'I brought CAKE.' Nobody knows if that helped. It definitely didn\'t hurt.",
      ],
    },
    // Cutscene 3 — after Level 12
    {
      title: 'MORE THAN HALFWAY THERE',
      artClass: 'art-mlp-3',
      paragraphs: [
        'Twelve keys restored. Pinkie had made a personal friend out of every single one, and she had names for all of them. The f key was named Franklin.',
        'Through the crystal cavern walls, she could hear strange sounds from the other side — something that sounded like an electric mouse humming the same theme song on loop.',
        "'They\'re not so different from us,' Pinkie decided. 'They just need the right introduction. And a party. Everyone needs a party.'",
      ],
    },
    // Cutscene 4 — after Level 16
    {
      title: 'THE FINAL KEYS AWAIT',
      artClass: 'art-mlp-4',
      paragraphs: [
        'The Apex Summit rose before Pinkie Pie — the keyboard\'s highest peak, where the rarest letters lived. V, X, Q, and Z waited in the mist, cold and forgotten.',
        "'Nobody ever types us,' X admitted quietly. 'We feel a bit left out, honestly.'",
        "Pinkie's eyes filled with tears. Of joy. 'That ends TODAY,' she declared, pulling a party cannon from absolutely nowhere.",
      ],
    },
    // Cutscene 5 — finale, after Level 20
    {
      title: 'EVERY KEY HAS A FRIEND!',
      artClass: 'art-mlp-5',
      paragraphs: [
        'The last key shimmered with rainbow light. The electric corruption dissolved into warm glitter and drifted gently away. Every letter on the keyboard glowed soft and content.',
        'Pinkie had befriended them all. Even Q. Especially Q. Q got a very long hug and its own personal banner.',
        "Far away, a small yellow mouse sneezed, glanced at its keyboard, and typed a single perfectly clean letter. The two worlds had learned something important: every key matters. Every keystroke counts.",
      ],
    },
  ],
};

// ─── Per-level story blurbs ───────────────────────────────────────────────────
// Short narrative text shown at the top of each level screen.

export const LEVEL_STORIES: Record<Team, Record<number, string>> = {
  pokemon: {
    1:  "The corruption has begun. Pikachu must first measure the extent of the damage with a full keyboard scan. Type quickly — every second counts!",
    2:  "The f and j keys — the anchors of all typing — pulse with corrupted energy. Pikachu plants both paws firmly. These are the keys that guide every typist home. Restore them first!",
    3:  "The e and t keys flicker weakly. Common letters, caught in the crossfire. Pikachu moves in carefully, ready to zap them clean.",
    4:  "The Digital Grove shudders. Pikachu has restored f, j, e, and t. Now comes the test: all four keys together, under full pressure. The ancient trees lean in to watch.",
    5:  "O and A glow with a strange pastel shimmer. There is definitely pony magic at work here. Pikachu is unimpressed and also slightly allergic to glitter.",
    6:  "I and N — two of the most-used letters in the whole language — have been completely corrupted. Without them, nothing makes sense. Pikachu surges forward.",
    7:  "H and S flicker at the edge of the Thunder Shrine. The storm around them crackles with misdirected energy. Time to ground them both.",
    8:  "The Thunder Shrine falls silent. Pikachu has cleansed o, a, i, n, h, and s. Now comes the real test: all unlocked keys together, under pressure. The crystal cavern echoes with anticipation.",
    9:  "R and L — the keys of movement and direction — have been tangled together by the corruption. Pikachu must type through the confusion.",
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
    1:  "First, Pinkie needs to see just how fast she can type before the corruption spreads further. She stretches her hooves and gets ready for a full-speed friendship sprint!",
    2:  "The f and j keys are shivering with corrupted energy! These are the home keys — where every good typist starts their journey. Pinkie gives them an encouraging smile. 'Don't worry, little keys.'",
    3:  "E and T are two of Equestria's most beloved letters. They show up in nearly every word, and right now they need a friend. Pinkie is on the case.",
    4:  "The Digital Grove is waking up! Pinkie has befriended f, j, e, and t. Now she must type them all together in one grand test before the adventure continues. She grins. This is the fun part.",
    5:  "O and A are hiding under some very suspicious yellow static. Pinkie suspects Pokemon energy. She does not hold this against them personally.",
    6:  "I and N — without these, you can't spell 'friend,' 'invite,' or 'pinkie' itself. This is a crisis. Pinkie handles it with a smile and excellent typing form.",
    7:  "H and S wait in the Thunder Shrine, trembling slightly. Pinkie pats them reassuringly. 'You're doing great. You're both such good letters.'",
    8:  "The Thunder Shrine sparkles! Pinkie has befriended o, a, i, n, h, and s. Now she must type them all together in one grand review. She stretches her hooves and grins. She was born ready.",
    9:  "R and L — the letters of rolling laughter and leaping rainbows — have been tangled by the corruption. Pinkie untangles things by typing very fast and very happily.",
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
