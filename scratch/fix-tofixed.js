const fs = require('fs');

const fixPage = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/cargo\.telemetry\.temperature\.toFixed/g, '(cargo.telemetry?.temperature || 0).toFixed');
  fs.writeFileSync(file, content);
};

const fixHealth = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/temperature\.toFixed/g, '(temperature || 0).toFixed');
  fs.writeFileSync(file, content);
};

const fixOfferCard = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/cargo\.telemetry\.temperature\.toFixed/g, '(cargo.telemetry?.temperature || 0).toFixed');
  fs.writeFileSync(file, content);
};

fixPage('src/app/fleet/page.tsx');
fixHealth('src/components/CargoHealthMonitor.tsx');
fixOfferCard('src/components/CargoOfferCard.tsx');
console.log('Fixed toFixed calls');
