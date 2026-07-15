const fs = require('fs');

const file = 'c:/code/final1/final/src/services/adminService.ts';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
    {
        find: /updateIncharge:\s*async\s*\([^)]*\)\s*=>\s*\{[^}]*\},/g,
        replace: match => match + `\n    resetInchargePassword: async (id: string, newPassword: string) => {\n        const response = await api.put(\`/admin/incharge/forgotpassword/\${id}\`, { newPassword });\n        return response.data;\n    },`
    },
    {
        find: /updateWarden:\s*async\s*\([^)]*\)\s*=>\s*\{[^}]*\},/g,
        replace: match => match + `\n    resetWardenPassword: async (id: string, newPassword: string) => {\n        const response = await api.put(\`/admin/warden/forgotpassword/\${id}\`, { newPassword });\n        return response.data;\n    },`
    },
    {
        find: /updateWatchman:\s*async\s*\([^)]*\)\s*=>\s*\{[^}]*\},/g,
        replace: match => match + `\n    resetSecurityPassword: async (id: string, newPassword: string) => {\n        const response = await api.put(\`/admin/security/forgotpassword/\${id}\`, { newPassword });\n        return response.data;\n    },`
    },
    {
        find: /updateBus:\s*async\s*\([^)]*\)\s*=>\s*\{[^}]*\},/g,
        replace: match => match + `\n    resetBusPassword: async (id: string, newPassword: string) => {\n        const response = await api.put(\`/admin/bus/forgotpassword/\${id}\`, { newPassword });\n        return response.data;\n    },`
    }
];

let changed = false;
for (const r of replacements) {
    if (r.find.test(content) && !content.includes(r.replace(''))) {
        content = content.replace(r.find, r.replace);
        changed = true;
    }
}

if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated adminService.ts');
} else {
    console.log('No changes made to adminService.ts');
}
