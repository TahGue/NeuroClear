const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('prisma/seed.ts', 'utf-8');
const lines = content.split('\n');

const startLine = lines.findIndex(line => line.includes('const likert = ['));
const endLine = lines.findIndex(line => line.includes('await prisma.instrumentAssignment.createMany({'));

if (startLine !== -1 && endLine !== -1) {
  const seedLogic = `
  const instrumentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/en.json'), 'utf-8'));
  
  for (const instrumentData of instrumentsData) {
    await prisma.instrument.create({
      data: {
        slug: instrumentData.slug,
        name: instrumentData.name,
        description: instrumentData.description,
        minAgeYears: instrumentData.minAgeYears,
        maxAgeYears: instrumentData.maxAgeYears,
        audience: instrumentData.audience,
        items: {
          create: instrumentData.items
        }
      }
    });
  }
`;

  const newLines = [
    ...lines.slice(0, startLine),
    seedLogic,
    ...lines.slice(endLine)
  ];

  let newContent = newLines.join('\n');
  
  if (!newContent.includes('import * as fs')) {
    newContent = newContent.replace(
      'import * as bcrypt from "bcryptjs"',
      'import * as bcrypt from "bcryptjs"\nimport * as fs from "fs"\nimport * as path from "path"'
    );
  }

  fs.writeFileSync('prisma/seed.ts', newContent);
  console.log('Successfully updated prisma/seed.ts');
} else {
  console.log('Could not find start or end lines.');
}
