const fs = require('fs');

const filesToClean = [
    'src/pages/student/NewOutpass.tsx',
    'src/pages/student/Profile.tsx',
    'src/pages/student/SubjectDetails.tsx',
    'src/pages/student/Subjects.tsx'
];

filesToClean.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace("import LoadingSpinner from '../../components/LoadingSpinner';\n", "");
    content = content.replace("import LoadingSpinner from '../../components/LoadingSpinner';", "");
    fs.writeFileSync(file, content);
    console.log('Cleaned ' + file);
});
