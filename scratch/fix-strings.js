const fs = require('fs');

const fixPage = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  // Fix wholesalerName
  content = content.replace(/bid\.wholesalerName\.charAt\(0\)\.toUpperCase\(\)/g, '(bid.wholesalerName || "W").charAt(0).toUpperCase()');
  // Fix bid.status
  content = content.replace(/bid\.status\.charAt\(0\)\.toUpperCase\(\) \+ bid\.status\.slice\(1\)/g, '(bid.status || "pending").charAt(0).toUpperCase() + (bid.status || "pending").slice(1)');
  fs.writeFileSync(file, content);
};

const fixBidCard = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bid\.wholesalerName\.charAt\(0\)/g, '(bid.wholesalerName || "W").charAt(0)');
  content = content.replace(/{bid\.wholesalerName}/g, '{bid.wholesalerName || "Wholesaler"}');
  fs.writeFileSync(file, content);
};

const fixHealth = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/ethyleneLevel\.toUpperCase\(\)/g, '(ethyleneLevel || "normal").toUpperCase()');
  fs.writeFileSync(file, content);
};

const fixCargoCard = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/cargo\.type\.charAt\(0\)\.toUpperCase\(\) \+ cargo\.type\.slice\(1\)/g, '(cargo.type || "cargo").charAt(0).toUpperCase() + (cargo.type || "cargo").slice(1)');
  fs.writeFileSync(file, content);
};

fixPage('src/app/fleet/page.tsx');
fixBidCard('src/components/BidCard.tsx');
fixHealth('src/components/CargoHealthMonitor.tsx');
fixCargoCard('src/components/CargoOfferCard.tsx');
console.log('Fixed all unguarded string accesses');
