const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('signatureName')) {
  schema = schema.replace(
    /model Report \{[\s\S]*?@@map\("reports"\)\n\}/m,
    (match) => {
      return match.replace(
        '  evaluation            Evaluation @relation(fields: [evaluationId], references: [id])',
        `  evaluation            Evaluation @relation(fields: [evaluationId], references: [id])\n  \n  signatureName         String?\n  signatureTitle        String?\n  signedAt              DateTime?`
      );
    }
  );
  fs.writeFileSync(schemaPath, schema);
  console.log('Schema updated.');
} else {
  console.log('Schema already updated.');
}
