const fs = require('fs');

const instruments = JSON.parse(fs.readFileSync('prisma/data/en.json', 'utf8'));

const pcl5Options = [
  { label: "Not at all", value: 0 },
  { label: "A little bit", value: 1 },
  { label: "Moderately", value: 2 },
  { label: "Quite a bit", value: 3 },
  { label: "Extremely", value: 4 },
];

instruments.push({
  slug: "pcl5",
  name: "PCL-5 (Short)",
  description: "PTSD Checklist for DSM-5 (sample short form)",
  minAgeYears: 18,
  audience: "PATIENT",
  items: [
    { order: 1, prompt: "Repeated, disturbing, and unwanted memories of the stressful experience?", options: pcl5Options },
    { order: 2, prompt: "Repeated, disturbing dreams of the stressful experience?", options: pcl5Options },
    { order: 3, prompt: "Suddenly feeling or acting as if the stressful experience were actually happening again?", options: pcl5Options },
    { order: 4, prompt: "Feeling very upset when something reminded you of the stressful experience?", options: pcl5Options },
  ]
});

const vanderbiltOptions = [
  { label: "Never", value: 0 },
  { label: "Occasionally", value: 1 },
  { label: "Often", value: 2 },
  { label: "Very Often", value: 3 },
];

instruments.push({
  slug: "vanderbilt",
  name: "Vanderbilt ADHD (Short)",
  description: "NICHQ Vanderbilt Assessment Scale (sample short form)",
  minAgeYears: 6,
  maxAgeYears: 12,
  audience: "PARENT",
  items: [
    { order: 1, prompt: "Does not pay attention to details or makes careless mistakes", options: vanderbiltOptions },
    { order: 2, prompt: "Has difficulty keeping attention to what needs to be done", options: vanderbiltOptions },
    { order: 3, prompt: "Does not seem to listen when spoken to directly", options: vanderbiltOptions },
    { order: 4, prompt: "Does not follow through when given directions and fails to finish activities", options: vanderbiltOptions },
  ]
});

const scaredOptions = [
  { label: "Not true or hardly ever true", value: 0 },
  { label: "Somewhat true or sometimes true", value: 1 },
  { label: "Very true or often true", value: 2 },
];

instruments.push({
  slug: "scared",
  name: "SCARED (Short)",
  description: "Screen for Child Anxiety Related Disorders (sample short form)",
  minAgeYears: 8,
  maxAgeYears: 18,
  audience: "PATIENT",
  items: [
    { order: 1, prompt: "When I feel frightened, it is hard to breathe.", options: scaredOptions },
    { order: 2, prompt: "I get headaches when I am at school.", options: scaredOptions },
    { order: 3, prompt: "I don't like to be with people I don't know.", options: scaredOptions },
    { order: 4, prompt: "I get scared if I sleep away from home.", options: scaredOptions },
  ]
});

fs.writeFileSync('prisma/data/en.json', JSON.stringify(instruments, null, 2));
console.log('Updated en.json with new instruments');
