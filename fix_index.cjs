const fs = require('fs');
const path = 'src/index.css';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /\.student-content \{\s*padding-top: 11px;\s*min-height: 10vh;\s*\}/g,
    ".student-content {\n  padding-top: 110px;\n  min-height: 100vh;\n}"
);

if (!content.includes("@media (max-width: 850px)")) {
    content += "\n@media (max-width: 850px) {\n  .student-content,\n  .main-student-content {\n    padding-top: 16px !important;\n  }\n}\n";
}

fs.writeFileSync(path, content);
console.log('Fixed index.css');
