/**
 * Puts a handful of notes by the fire so the board has something to show.
 * Run with `npm run db:seed`. Safe to run twice: it skips if notes exist.
 */
import { db } from "../src/lib/db";
import { parsePaymentUrl } from "../src/lib/payment-links";

const HOUR = 60 * 60 * 1000;

const SAMPLE_NOTES = [
  {
    title: "a second-hand espresso machine for the corner café",
    body: "we open at six and the old one gives up by nine. a used machine would let us keep the morning crowd fed. we'd name a drink after you.",
    authorName: "lucía",
    paymentUrl: "https://mpago.la/cafedelaesquina",
    hoursAgo: 2,
  },
  {
    title: "two more months of rent while the shop finds its feet",
    body: "opened a tiny bookshop in march. people come, they stay, they don't always buy. i think it works by autumn. i just need to get there.",
    authorName: "tomás",
    paymentUrl: "https://paypal.me/tomasbooks",
    hoursAgo: 7,
  },
  {
    title: "a laptop that doesn't freeze when i compile",
    body: "learning to code at night after work. the laptop is nine years old and takes a coffee break on every build. anything from this decade would do.",
    authorName: null,
    paymentUrl: "https://ko-fi.com/nightbuilds",
    hoursAgo: 15,
  },
  {
    title: "seeds and fencing for the community garden",
    body: "forty families, one empty lot, a lot of goodwill. the deer have more. a fence and this season's seeds and we're growing by may.",
    authorName: "the lot on 9th",
    paymentUrl: "https://buymeacoffee.com/loton9th",
    hoursAgo: 30,
  },
  {
    title: "flight home for my mother's 80th",
    body: "haven't been back in four years. she doesn't say it but she counts. a ticket would mean a lot more than a ticket.",
    authorName: "nadia",
    paymentUrl: "https://cash.app/$nadiak",
    hoursAgo: 52,
  },
  {
    title: "a trailer so i can take the food truck to the coast",
    body: "the tacos are good. ask anyone. the truck only goes where the truck can go. with a trailer the summer markets open up and so does the business.",
    authorName: "rafa",
    paymentUrl: "https://venmo.com/rafatacos",
    hoursAgo: 80,
  },
  {
    title: "studio time to finish the record",
    body: "nine songs done, three to go, and the studio costs more than the songs make. for now. you'd get the first pressing and a thank-you on the sleeve.",
    authorName: "ines & the quiet",
    paymentUrl: "https://patreon.com/inesandthequiet",
    hoursAgo: 120,
  },
  {
    title: "a proper oven for the bread",
    body: "i bake for the whole street out of a home oven. it's dying. a deck oven means more loaves, a stall at the market, and maybe one day a door with my name on it.",
    authorName: "ahmed",
    paymentUrl: "https://paypal.me/ahmedbakes",
    hoursAgo: 200,
  },
];

async function main() {
  const existing = await db.note.count();
  if (existing > 0) {
    console.log(`hearth already has ${existing} notes; nothing to seed.`);
    return;
  }

  const now = Date.now();
  for (const sample of SAMPLE_NOTES) {
    const parsed = parsePaymentUrl(sample.paymentUrl);
    if (!parsed.ok) throw new Error(`bad seed link: ${sample.paymentUrl}`);
    await db.note.create({
      data: {
        title: sample.title,
        body: sample.body,
        authorName: sample.authorName,
        paymentUrl: parsed.url,
        provider: parsed.provider,
        ipHash: "seed",
        createdAt: new Date(now - sample.hoursAgo * HOUR),
      },
    });
  }
  console.log(`pinned ${SAMPLE_NOTES.length} notes to the hearth.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
