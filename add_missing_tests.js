const fs = require('fs');

const instruments = JSON.parse(fs.readFileSync('prisma/data/en.json', 'utf8'));

const crafftOptions = [
  { label: "No", value: 0 },
  { label: "Yes", value: 1 }
];

instruments.push({
  slug: "crafft",
  name: "CRAFFT",
  description: "Substance Abuse Screening Tool for Adolescents",
  minAgeYears: 12,
  maxAgeYears: 21,
  audience: "PATIENT",
  items: [
    { order: 1, prompt: "Have you ever ridden in a CAR driven by someone (including yourself) who was 'high' or had been using alcohol or drugs?", options: crafftOptions },
    { order: 2, prompt: "Do you ever use alcohol or drugs to RELAX, feel better about yourself, or fit in?", options: crafftOptions },
    { order: 3, prompt: "Do you ever use alcohol or drugs while you are by yourself, or ALONE?", options: crafftOptions },
    { order: 4, prompt: "Do you ever FORGET things you did while using alcohol or drugs?", options: crafftOptions },
    { order: 5, prompt: "Do your FAMILY or FRIENDS ever tell you that you should cut down on your drinking or drug use?", options: crafftOptions },
    { order: 6, prompt: "Have you ever gotten into TROUBLE while you were using alcohol or drugs?", options: crafftOptions }
  ]
});

const ysrOptions = [
  { label: "Not True", value: 0 },
  { label: "Somewhat or Sometimes True", value: 1 },
  { label: "Very True or Often True", value: 2 }
];

instruments.push({
  slug: "ysr",
  name: "Youth Self-Report (Short)",
  description: "CBCL/YSR sample behavioral screener",
  minAgeYears: 11,
  maxAgeYears: 18,
  audience: "PATIENT",
  items: [
    { order: 1, prompt: "I argue a lot.", options: ysrOptions },
    { order: 2, prompt: "I have trouble concentrating or paying attention.", options: ysrOptions },
    { order: 3, prompt: "I am nervous or tense.", options: ysrOptions },
    { order: 4, prompt: "I feel worthless or inferior.", options: ysrOptions }
  ]
});

const cogScreenOptions = [
  { label: "Incorrect", value: 0 },
  { label: "Correct", value: 1 }
];

instruments.push({
  slug: "cog-screen",
  name: "Cognitive Screening (Short)",
  description: "Brief cognitive functioning screener for older adults",
  minAgeYears: 65,
  audience: "PATIENT",
  items: [
    { order: 1, prompt: "Can remember 3 words after a short delay", options: cogScreenOptions },
    { order: 2, prompt: "Can draw a clock face showing a specific time", options: cogScreenOptions },
    { order: 3, prompt: "Knows the current year, month, and day", options: cogScreenOptions }
  ]
});

// Avoid duplicates
const uniqueInstruments = [];
const seen = new Set();
for (const inst of instruments) {
  if (!seen.has(inst.slug)) {
    uniqueInstruments.push(inst);
    seen.add(inst.slug);
  }
}

fs.writeFileSync('prisma/data/en.json', JSON.stringify(uniqueInstruments, null, 2));
console.log('Added CRAFFT, YSR, and Cognitive Screen to en.json');
