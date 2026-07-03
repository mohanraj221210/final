const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'c:/code/final1/final/src/components/ChangePasswordModal.tsx',
    'c:/code/final1/final/src/pages/admin/StaffStudentList.tsx',
    'c:/code/final1/final/src/pages/admin/ManageYearIncharge.tsx',
    'c:/code/final1/final/src/pages/admin/ManageWarden.tsx',
    'c:/code/final1/final/src/pages/admin/ManageStaff.tsx',
    'c:/code/final1/final/src/pages/admin/ManageSecurity.tsx',
    'c:/code/final1/final/src/pages/admin/ManageBus.tsx' // Bus might not have it, we'll check
];

const toggleStateCode = `\n    const [showPassword, setShowPassword] = useState(false);`;

for (const file of filesToUpdate) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Skip if already has showPassword
    if (content.includes('showPassword')) {
        console.log(`Skipping ${file} - already has showPassword`);
        continue;
    }

    let changed = false;

    // We have to add the state right inside the component body.
    // We can usually find it after the first `const [..., ...]` or right after `const ComponentName = (...) => {`
    if (content.includes('type="password"')) {
        // Add state
        if (content.includes('useState')) {
            content = content.replace(/useState.*?;\n/, match => match + toggleStateCode + '\n');
            changed = true;
        }

        // Replace input with wrapper. We'll do it by replacing the <input type="password" ... /> 
        // Note: the input might be multi-line.
        const inputRegex = /<input[^>]*type="password"[^>]*\/>/g;
        content = content.replace(inputRegex, (match) => {
            const updatedInput = match.replace(/type="password"/, `type={showPassword ? 'text' : 'password'}`);
            return `<div style={{ position: 'relative' }}>
                                        ${updatedInput}
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#6b7280' }}
                                        >
                                            {showPassword ? '👁️' : '🙈'}
                                        </button>
                                    </div>`;
        });
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
