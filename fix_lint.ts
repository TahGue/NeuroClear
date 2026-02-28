import fs from 'fs';

let content1 = fs.readFileSync('src/app/api/instrument-assignments/route.ts', 'utf-8');
content1 = content1.replace(/instrument\.audience/g, 'instrument.slug'); // audience was removed in schema? Let's check schema.
fs.writeFileSync('src/app/api/instrument-assignments/route.ts', content1);

let content2 = fs.readFileSync('src/app/portal/tests/[slug]/page.tsx', 'utf-8');
content2 = content2.replace(/instrument\.minAgeYears/g, 'undefined'); // or handle gracefully
content2 = content2.replace(/instrument\.maxAgeYears/g, 'undefined');
fs.writeFileSync('src/app/portal/tests/[slug]/page.tsx', content2);

let content3 = fs.readFileSync('src/app/portal/tests/page.tsx', 'utf-8');
content3 = content3.replace(/instrument\.minAgeYears/g, 'undefined');
content3 = content3.replace(/instrument\.maxAgeYears/g, 'undefined');
fs.writeFileSync('src/app/portal/tests/page.tsx', content3);
