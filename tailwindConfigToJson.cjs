const fs = require('fs');
const tailwindConfig = require('./tailwind.config.cjs');

fs.writeFileSync('tailwind.config.json', JSON.stringify(tailwindConfig));
