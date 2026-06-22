const fs = require('fs');
const files = [
    'src/pages/student/BusRoutes.tsx',
    'src/pages/student/NewOutpass.tsx',
    'src/pages/student/OutpassDetails.tsx',
    'src/pages/student/Profile.tsx',
    'src/pages/student/Staffs.tsx',
    'src/pages/student/StudentViewStaffProfile.tsx',
    'src/pages/student/SubjectDetails.tsx',
    'src/pages/student/Subjects.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes("import StudentHeader")) {
        content = content.replace(
            "import LoadingSpinner from '../../components/LoadingSpinner';",
            "import StudentHeader from '../../components/StudentHeader';\nimport LoadingSpinner from '../../components/LoadingSpinner';"
        );
        fs.writeFileSync(file, content);
        console.log('Fixed imports in ' + file);
    }
});
