const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));

if (!data.portal.home.support) {
  data.portal.home.support = {
    title: "Need Help?",
    description: "If you have questions about your tests or need technical support, please contact your clinician.",
    contact: "Contact Support",
    privacy: "Your data is stored securely and is only accessible to your clinical team."
  };
}

fs.writeFileSync('src/messages/en.json', JSON.stringify(data, null, 2) + '\n');
console.log('en.json updated');
