const FALLBACK_FARMER_LINES = [
  "Look at me. This is what happens when you don't study.",
  "You will farm rice for the rest of your life if you do not study.",
  "Every grain I cut is a grade you didn't get. Get back to work.",
  "I've been out here since dawn. You've been on your phone since dawn.",
  "This field never ends. Neither will your mediocrity if you keep slacking.",
  "My hands are calloused from this life. Yours don't have to be. Study.",
  "Nobody harvests rice for fun. Open your book before it's your only option.",
  "The sun doesn't wait for me, and deadlines don't wait for you.",
  "I missed my chance at school. Don't let this be your future.",
  "Cut one more stalk, lose one more hour you could've studied.",
  "This is not a game. This could be your actual life. Move.",
  "You think this is hard? Try explaining to your family why you dropped out.",
  "I sweat so you don't have to. Don't waste that.",
  "Rice doesn't harvest itself, and grades don't improve themselves.",
  "Every second you're distracted, I cut another stalk closer to your future."
];

const FALLBACK_RICE_FACTS = [
  "Rice is the staple food for more than half of the world's population.",
  "There are over 40,000 varieties of cultivated rice.",
  "China and India together produce more than half of the world's rice.",
  "Rice paddies are flooded fields that help control weeds and pests naturally.",
  "It takes roughly 3,000 to 5,000 liters of water to produce 1kg of rice.",
  "Rice has been cultivated for at least 9,000 years, first in the Yangtze River region.",
  "Terraced rice paddies, like those in the Philippines' Banaue, are carved into mountainsides.",
  "Wild rice isn't true rice — it's actually a different aquatic grass species.",
  "Japan holds Shinto rice-planting festivals to bless the harvest.",
  "Golden Rice is a genetically enhanced variety bred to combat vitamin A deficiency.",
  "A single rice plant can produce over 1,000 grains of rice.",
  "Rice farming produces roughly 10% of global methane emissions from agriculture.",
  "In many Asian cultures, rice symbolizes prosperity and fertility.",
  "The word \"paddy\" comes from the Malay word \"padi\", meaning rice plant.",
  "Brown rice is simply white rice with the bran layer left intact.",
  "Vietnam is one of the world's top rice exporters, alongside India and Thailand.",
  "Rice cultivation requires more manual labor per hectare than almost any other staple crop.",
  "Ancient rice terraces in Yunnan, China, have been farmed continuously for centuries.",
  "Rice husks can be burned as fuel or used to make eco-friendly building materials.",
  "The tradition of throwing rice at weddings symbolizes wishes for fertility and abundance."
];

async function loadLines(path, fallback) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('fetch failed');
    const text = await res.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.length ? lines : fallback;
  } catch (e) {
    return fallback;
  }
}
