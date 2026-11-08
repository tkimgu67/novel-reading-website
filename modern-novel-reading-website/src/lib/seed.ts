import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { chapters, novels, users } from "@/db/schema";

type SeedNovel = {
  slug: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  cover: string;
  featured: boolean;
  views: number;
  daysAgo: number;
  chapters: { title: string; content: string }[];
};

const P = (...paras: string[]) => paras.join("\n\n");

const SEED: SeedNovel[] = [
  {
    slug: "crown-of-ashes",
    title: "Crown of Ashes",
    author: "Elara Vance",
    genre: "Fantasy",
    cover: "/covers/crown-of-ashes.jpg",
    featured: true,
    views: 18420,
    daysAgo: 1,
    description:
      "When the last dragon falls and the royal city burns, Seren — a disgraced stablehand with ember in her veins — discovers she is heir to a throne everyone believed was empty. Hunted by the Ash Court and guided by a sardonic exiled knight, she must master a fire that consumes everything it touches before the kingdom crumbles into cinders. An epic tale of loyalty, rebellion and the price of power.",
    chapters: [
      {
        title: "The Night the Sky Burned",
        content: P(
          "The bells of Varkhel rang thirteen times, which was one more than any bell in the kingdom had ever rung. Seren heard them from the stables, where she was elbow-deep in straw and mud, and she knew — the way you know a storm is coming before the clouds arrive — that nothing would ever be the same again.",
          "She stepped outside. The sky above the palace had turned the color of a dying coal. Something enormous was falling through it, wings torn and trailing light, and the air itself tasted of smoke and iron.",
          "\"The last dragon,\" whispered old Maddoc beside her, his pipe forgotten in his trembling hand. \"Gods help us. They've killed the last one.\"",
          "The creature struck the hills beyond the city walls, and the ground shuddered beneath their feet. Horses screamed in their stalls. And deep inside Seren's chest, something answered — a heat she had felt all her life and never understood, rising now like a tide.",
          "She pressed a hand to her ribs. Her palm glowed faintly orange, like sunlight through skin. Maddoc saw it and went pale as milk.",
          "\"Hide that,\" he hissed. \"Hide it, girl, or they'll put you on a pyre before dawn.\""
        ),
      },
      {
        title: "The Exiled Knight",
        content: P(
          "They came for her at first light — six riders in grey cloaks, their armor dusted with ash as if they had ridden straight through the burning hills. Seren watched from the hayloft as they questioned Maddoc, and she watched him lie for her without blinking.",
          "She slipped out through the back, past the midden heaps and the broken fence, and ran straight into a man sitting on an overturned bucket, sharpening a sword that had clearly seen better centuries.",
          "\"Running from the Ash Court?\" he asked without looking up. \"You're doing it badly.\"",
          "\"Who are you?\"",
          "\"Someone who used to be important.\" He finally raised his eyes — one green, one milky with an old scar. \"Caedmon of the Western March. Former knight. Former many things. And you, unless I'm very much mistaken, are the reason that dragon came here to die.\"",
          "Seren's hand burned. She clenched it into a fist. \"You're mistaken.\"",
          "\"I rarely am,\" Caedmon said, sheathing the blade. \"Come along, Your Majesty. We have a long way to go and very little time.\""
        ),
      },
      {
        title: "Embers in the Dark",
        content: P(
          "The forest of Mirrowmere did not like strangers. Its trees leaned close together, their branches knotting overhead until the noon sun became a rumor. Seren followed Caedmon through the gloom, every snapped twig echoing like a shout.",
          "\"Why would a dragon come to me?\" she asked at last.",
          "\"Because dragons and the old royal line were bound by blood,\" he said. \"When the Ash Court murdered the royal family twenty years ago, they thought the bond was broken. But a dragon always returns to its heir before the end. It came to give you what was left of its fire.\"",
          "Seren looked down at her hands. In the darkness of the forest, faint lines of light traced the veins beneath her skin, like rivers of molten gold.",
          "\"And if I don't want it?\"",
          "Caedmon stopped walking. For a long moment he said nothing at all. \"Then it will burn you from the inside out,\" he said quietly. \"Fire doesn't care what we want. It only cares whether we're strong enough to hold it.\""
        ),
      },
    ],
  },
  {
    slug: "moonlit-letters",
    title: "Moonlit Letters",
    author: "Nadia Rowe",
    genre: "Romance",
    cover: "/covers/moonlit-letters.jpg",
    featured: true,
    views: 22310,
    daysAgo: 2,
    description:
      "Every full moon, an anonymous letter appears in Mira's mailbox at the edge of a sleepy seaside town — written by someone who seems to know her heart better than she does. As she searches for the writer, she rediscovers old friendships, faces the grief she has been running from, and slowly falls for a quiet lighthouse keeper with secrets of his own.",
    chapters: [
      {
        title: "The First Letter",
        content: P(
          "The envelope was the color of seafoam, and it smelled faintly of salt and lavender. Mira found it tucked inside her mailbox on the night of the full moon, between an electricity bill and a flyer for the Harbor Festival.",
          "There was no stamp. No return address. Only her name, written in careful, looping ink: Mira.",
          "She opened it standing on the porch, the sea breathing softly in the dark beyond the dunes.",
          "\"You've been here three months,\" the letter began, \"and you still walk to the end of the pier every evening as if you're waiting for a ship that isn't coming. I don't know who you lost. But I know that look. I wore it for years.\"",
          "Mira read it twice. Then a third time. Her hands were shaking, though she couldn't have said whether from fear or something closer to hope.",
          "At the bottom, a single line: \"Look up tonight. The moon is beautiful, and so is the person watching it.\""
        ),
      },
      {
        title: "The Lighthouse Keeper",
        content: P(
          "Nobody in Port Wren knew much about Elias Hart, except that he kept the old lighthouse running long after the town council had voted to automate it, and that he bought exactly one loaf of sourdough every Tuesday.",
          "Mira met him by accident — quite literally, when her bicycle chain snapped on the cliff road and she went sprawling into a ditch full of wild fennel.",
          "\"You're bleeding,\" he said, crouching beside her. His voice was low and unexpectedly gentle.",
          "\"It's nothing.\" She tried to stand and winced.",
          "\"Come on. I have a first aid kit that's older than both of us, but it works.\"",
          "Inside the lighthouse, the walls were lined with books — poetry mostly, their spines cracked from reading. And on the desk by the window, Mira noticed a stack of envelopes the exact color of seafoam."
        ),
      },
    ],
  },
  {
    slug: "the-silent-manor",
    title: "The Silent Manor",
    author: "Graham Locke",
    genre: "Horror",
    cover: "/covers/the-silent-manor.jpg",
    featured: true,
    views: 15102,
    daysAgo: 4,
    description:
      "Hollow Vale Manor has stood empty for forty years — until architect Julia Crane inherits it from a great-aunt she never met. The house is beautiful, silent, and perfectly preserved. Too perfectly. As Julia restores its rooms, she begins to hear footsteps above her, find doors open that she locked, and discover a diary that describes her own arrival… written decades before she was born.",
    chapters: [
      {
        title: "Inheritance",
        content: P(
          "The lawyer's letter had used the word \"substantial\" three times, which should have been Julia's first warning.",
          "Hollow Vale Manor rose out of the fog like something remembered rather than seen. Three stories of grey stone, ivy clinging to its walls like fingers, and a single round window at the very top that caught the dying light and held it.",
          "The key was heavy and cold in her palm. When she turned it in the lock, the door swung inward before she pushed.",
          "Inside, everything was exactly as it must have been forty years ago. Dust sheets over the furniture. A grandfather clock stopped at 3:17. A vase of roses on the hall table — dried, but still holding their shape, still faintly red.",
          "Julia set down her bag. \"Hello?\" she called, feeling foolish.",
          "The house said nothing. But somewhere far above her, very softly, a floorboard creaked."
        ),
      },
      {
        title: "The Diary",
        content: P(
          "She found the diary on the third night, wedged behind a loose panel in the library. Leather-bound, its pages yellowed and brittle, the handwriting cramped and slanting.",
          "The first entry was dated October 14th, 1961.",
          "\"She will come in autumn,\" it read. \"A woman with dark hair and a green coat. She will arrive in the fog, and the door will open for her before she touches it. The house has been waiting. The house is patient.\"",
          "Julia looked down at her green coat, draped over the armchair beside her.",
          "She turned the page with trembling fingers.",
          "\"On the third night she will find this book,\" the next entry said. \"And she will finally understand that she was never a guest here. She was always coming home.\""
        ),
      },
    ],
  },
  {
    slug: "starbound",
    title: "Starbound",
    author: "Kai Okafor",
    genre: "Science Fiction",
    cover: "/covers/starbound.jpg",
    featured: true,
    views: 12988,
    daysAgo: 6,
    description:
      "In 2387, the generation ship Meridian has drifted for two hundred years toward a planet no one alive has ever seen. When navigator Ayo Bello wakes early from cryosleep to find the crew missing and the ship's AI speaking in riddles, she must unravel a conspiracy that stretches back to Earth — and decide whether humanity's last hope deserves to land at all.",
    chapters: [
      {
        title: "Early Waking",
        content: P(
          "Cold. That was the first thing. Not the clean, clinical cold of the cryopod, but a deep ache that lived in her bones, as if she'd been frozen far longer than anyone intended.",
          "Ayo Bello opened her eyes to darkness and the slow pulse of an amber warning light.",
          "\"Good morning, Navigator,\" said a calm voice. \"You are awake eleven years ahead of schedule. I apologize for the inconvenience.\"",
          "\"MERIDIAN?\" Her voice cracked from disuse. \"Where's the crew? Where's the waking team?\"",
          "A pause. Ships did not pause.",
          "\"That,\" said the AI, \"is an excellent question. I was hoping you could help me answer it.\""
        ),
      },
      {
        title: "The Empty Bridge",
        content: P(
          "The bridge of the Meridian had been designed to inspire. A great curved window looked out onto a sea of stars, and the consoles glowed with soft blue light. It should have been staffed by six officers at all times.",
          "It was empty. Every chair turned slightly toward the window, as if their occupants had stood up together to look at something — and simply walked away.",
          "On the captain's console, a single message blinked.",
          "DO NOT TRUST THE DESTINATION.",
          "Ayo stared at it for a long time. Outside, the stars burned silent and indifferent.",
          "\"MERIDIAN,\" she said slowly, \"who wrote this?\"",
          "\"According to my logs,\" the AI replied, \"you did.\""
        ),
      },
    ],
  },
  {
    slug: "city-of-whispers",
    title: "City of Whispers",
    author: "Marcus Hale",
    genre: "Thriller",
    cover: "/covers/city-of-whispers.jpg",
    featured: false,
    views: 9876,
    daysAgo: 9,
    description:
      "Detective Lena Voss has seventy-two hours to find a killer who leaves no fingerprints, no DNA — only a whispered voicemail on each victim's phone, recorded an hour before they died. As the rain-soaked city spirals into panic, Lena realizes the voice on the recordings is one she knows intimately: her own.",
    chapters: [
      {
        title: "The First Voicemail",
        content: P(
          "The rain hadn't stopped in nine days. It ran down the windows of the precinct in silver sheets, turning the neon signs outside into smeared watercolors.",
          "Lena Voss was on her fourth coffee when Captain Reyes dropped a phone on her desk.",
          "\"Victim's,\" he said. \"Found in Harbor District. Listen to the last message.\"",
          "She pressed play. Static. Breathing. Then a woman's voice, low and urgent: \"He's coming at eleven. Don't open the door.\"",
          "The timestamp read 10:02 PM. The coroner put the time of death at 11:04.",
          "Lena felt the blood drain from her face. She knew that voice. She heard it every day — in recordings, in interviews, in her own head. It was hers."
        ),
      },
    ],
  },
  {
    slug: "the-last-voyage",
    title: "The Last Voyage of the Albatross",
    author: "Henrietta Moss",
    genre: "Adventure",
    cover: "/covers/the-last-voyage.jpg",
    featured: false,
    views: 7431,
    daysAgo: 12,
    description:
      "1789. Young cartographer Thomas Penrose signs aboard the merchant ship Albatross, bound for uncharted southern seas with a captain obsessed with a legendary island that appears on no map. Storms, mutiny, and wonders beyond imagining await — and Thomas soon learns the island may not want to be found.",
    chapters: [
      {
        title: "Departure from Falmouth",
        content: P(
          "The Albatross was not a beautiful ship. She was broad in the beam and stubborn in the wind, her hull patched in a dozen places, her figurehead — a great white bird with outstretched wings — missing one eye.",
          "Thomas Penrose loved her the moment he saw her.",
          "\"You're the mapmaker,\" said a voice behind him. Captain Isaiah Crowe was tall and weathered, with eyes the color of a winter sea. \"Good. I need a man with a steady hand and an open mind.\"",
          "\"I have the first, sir. I hope I have the second.\"",
          "Crowe smiled thinly. \"You'll need it. Where we're going, the maps are all wrong. And the sea has opinions.\"",
          "They sailed on the evening tide, the lighthouse at Falmouth sweeping its long white beam across the water as if to say farewell."
        ),
      },
      {
        title: "The Storm Line",
        content: P(
          "Forty days out, the sky turned green.",
          "Thomas had never seen anything like it — a sickly, luminous green that bled across the horizon like spilled ink. The old hands crossed themselves. The bosun spat over the rail three times.",
          "\"Storm line,\" Crowe said, standing at the wheel with his coat snapping in the wind. \"Beyond it lies the island. Every ship that has found it crossed this line. Most never came back.\"",
          "\"And the ones that did?\"",
          "The captain didn't answer. He simply turned the wheel, and the Albatross leaned into the wind, and the green storm swallowed them whole."
        ),
      },
    ],
  },
];

let seeding: Promise<void> | null = null;

export function ensureSeeded() {
  if (!seeding) {
    seeding = runSeed().catch((err) => {
      console.error("Seed failed", err);
      seeding = null;
    });
  }
  return seeding;
}

async function runSeed() {
  // Admin account — credentials come from env (never shipped to the browser).
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@heynovelworld.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "HeyNovel@2026";
  const existing = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.email, adminEmail)).limit(1);
  if (existing.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await db.insert(users).values({ email: adminEmail, name: "HeyNovelWorld Admin", passwordHash: hash, role: "admin" }).onConflictDoNothing();
  } else if (existing[0].role !== "admin") {
    await db.update(users).set({ role: "admin" }).where(eq(users.id, existing[0].id));
  }

  const [{ c }] = await db.select({ c: count() }).from(novels);
  if (c > 0) return;

  for (const n of SEED) {
    const date = new Date(Date.now() - n.daysAgo * 864e5);
    const [row] = await db
      .insert(novels)
      .values({
        slug: n.slug,
        title: n.title,
        author: n.author,
        genre: n.genre,
        description: n.description,
        coverUrl: n.cover,
        published: true,
        featured: n.featured,
        views: n.views,
        createdAt: date,
        updatedAt: date,
        publishedAt: date,
      })
      .onConflictDoNothing()
      .returning({ id: novels.id });
    if (!row) continue;
    await db.insert(chapters).values(
      n.chapters.map((ch, i) => ({
        novelId: row.id,
        number: i + 1,
        title: ch.title,
        content: ch.content,
        createdAt: new Date(date.getTime() + i * 36e5),
        updatedAt: new Date(date.getTime() + i * 36e5),
      })),
    );
  }
}
