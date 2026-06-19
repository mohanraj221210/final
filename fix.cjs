const fs = require('fs');
const files = fs.readdirSync('src/pages/student').filter(f => f.endsWith('.tsx'));
files.forEach(f => {
  const content = fs.readFileSync('src/pages/student/' + f, 'utf8');
  let newContent = content.replace(/<StudentHeader \/>/g, '<StudentHeader />\n            <main className=\"student-content\">');
  newContent = newContent.replace(/<StudentBottomNav \/>/g, '</main>\n            <StudentBottomNav />');
  newContent = newContent.replace(/<StudentBottomNav activeTab=\"([^\"]+)\" \/>/g, '</main>\n            <StudentBottomNav activeTab=\"\" />');
  if (content !== newContent) {
    fs.writeFileSync('src/pages/student/' + f, newContent);
    console.log('Modified ' + f);
  }
});
