const fs = require('fs');
const path = require('path');

const categoryMap = {
  // Depression & Anxiety
  'phq9': 'DEPRESSION_ANXIETY',
  'phqa': 'DEPRESSION_ANXIETY',
  'gad7': 'DEPRESSION_ANXIETY',
  'gds15': 'DEPRESSION_ANXIETY',
  'pcl5': 'DEPRESSION_ANXIETY',
  'scared': 'DEPRESSION_ANXIETY',
  
  // ADHD & Attention
  'asrs': 'ADHD_ATTENTION',
  'vanderbilt': 'ADHD_ATTENTION',
  
  // Behavioral
  'sdq': 'BEHAVIORAL',
  'ysr': 'BEHAVIORAL',
  
  // Substance Use
  'audit': 'SUBSTANCE_USE',
  'crafft': 'SUBSTANCE_USE',
  
  // Cognitive
  'child-pattern-weaving': 'COGNITIVE',
  'child-story-seeds': 'COGNITIVE',
  'teen-uncertainty-compass': 'COGNITIVE',
  'teen-rhythm-meter': 'COGNITIVE',
  'adult-debate-evidence': 'COGNITIVE',
  'adult-cognitive-marketplace': 'COGNITIVE',
  'senior-processing-kind': 'COGNITIVE',
  'senior-gentle-attention': 'COGNITIVE',
  'cog-screen': 'COGNITIVE',
  'stroop-test': 'COGNITIVE',
  'digit-span': 'COGNITIVE',
  'go-no-go': 'COGNITIVE',
  'schulte-table': 'COGNITIVE',
  'reaction-time': 'COGNITIVE',
  'dual-n-back': 'COGNITIVE',
  
  // IQ & Intelligence
  'matrix-reasoning-child': 'IQ_INTELLIGENCE',
  'matrix-reasoning-adult': 'IQ_INTELLIGENCE',
  'comprehensive-iq': 'IQ_INTELLIGENCE',
  
  // Emotional & Social
  'child-emotion-masks': 'EMOTIONAL_SOCIAL',
  'child-breath-bell': 'EMOTIONAL_SOCIAL',
  'teen-social-harmony': 'EMOTIONAL_SOCIAL',
  'teen-ethics-motion': 'EMOTIONAL_SOCIAL',
  'adult-temperament-balance': 'EMOTIONAL_SOCIAL',
  'adult-values-compass': 'EMOTIONAL_SOCIAL',
  'senior-wisdom-ambiguity': 'EMOTIONAL_SOCIAL',
  'senior-life-chapters': 'EMOTIONAL_SOCIAL',
  
  // Developmental
  // 'scared' moved to DEPRESSION_ANXIETY
};

const locales = ['en', 'fr', 'ar', 'sv'];

locales.forEach(locale => {
  const filePath = path.join(__dirname, '..', 'prisma', 'data', `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${locale} - file not found`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  data.forEach(inst => {
    inst.category = categoryMap[inst.slug] || 'COGNITIVE';
  });
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${locale}.json`);
});

console.log('Done!');
