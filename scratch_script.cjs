const fs = require('fs');
const path = require('path');
const dir = 'c:/code/final1/final/src/pages/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let changed = false;

  // 1. Change '← Back to ...' to '← Back'
  const backTextRegex = /<button className=\"back-dashboard-btn\"[^>]*>\s*← Back.*?<\/button>/g;
  if (backTextRegex.test(content)) {
    content = content.replace(backTextRegex, (match) => {
      return match.replace(/← Back[^<]*/, '← Back');
    });
    changed = true;
  }

  // 2. Reduce size of .back-dashboard-btn in CSS
  if (content.includes('.back-dashboard-btn {')) {
    content = content.replace(/(\.back-dashboard-btn\s*\{[^}]*?)padding:\s*10px\s*20px;/g, '$1padding: 6px 12px;');
    content = content.replace(/(\.back-dashboard-btn\s*\{[^}]*?)font-size:\s*0\.95rem;/g, '$1font-size: 0.85rem;');
    changed = true;
  }

  // 3. Fix background of .field-input
  if (content.includes('.field-input {')) {
    if (!content.includes('background-color: white;')) {
      content = content.replace(/\.field-input\s*\{/, '.field-input { background-color: white; color: #111827;');
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log('Updated ' + file);
  }
}
