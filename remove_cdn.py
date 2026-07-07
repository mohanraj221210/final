import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace simple template strings: `${import.meta.env.VITE_CDN_URL}${url}` -> `${url}`
    # Note: `url` could be any variable name
    content = re.sub(r'\$\{import\.meta\.env\.VITE_CDN_URL(?: \|\| \'\')?\}(\$?\!?\{?[\w\.]+!?\}?)', r'\1', content)
    
    # Replace simple string concatenations like `import.meta.env.VITE_CDN_URL + url` -> `url`
    content = re.sub(r'import\.meta\.env\.VITE_CDN_URL\s*\+\s*([\w\.]+)', r'\1', content)

    # Replace complex template strings: `${import.meta.env.VITE_CDN_URL?.replace(/\/\$/, '')}/${url.replace(/^\//, '')}` -> `${url}`
    content = re.sub(r'\$\{import\.meta\.env\.VITE_CDN_URL\?\.replace\(\/\\\\/\$\/, \'\'\)\}/(\$\{[\w\.]+!?\.replace\(\/\\^\\\\/\/, \'\'\)\})', r'\1', content)

    # Handle the `.replace` variations without template strings
    # This might be simpler to handle specific known formats.
    # Let's just do an exhaustive list of regexes based on known patterns.

    # Pattern 1: `${import.meta.env.VITE_CDN_URL}${someVar}` => `${someVar}`
    content = re.sub(r'\$\{import\.meta\.env\.VITE_CDN_URL\}(\$\{?[a-zA-Z0-9_\.\[\]]+!?\}?)', r'\1', content)

    # Pattern 2: `${import.meta.env.VITE_CDN_URL || ''}${someVar}` => `${someVar}`
    content = re.sub(r'\$\{import\.meta\.env\.VITE_CDN_URL\s*\|\|\s*\'\'\}(\$\{?[a-zA-Z0-9_\.\[\]]+\.startsWith\(\'/\'\)\s*\?\s*[a-zA-Z0-9_\.\[\]]+\.slice\(1\)\s*:\s*[a-zA-Z0-9_\.\[\]]+!?\}?)', r'\1', content)
    content = re.sub(r'\$\{import\.meta\.env\.VITE_CDN_URL\s*\|\|\s*\'\'\}(\$\{?[a-zA-Z0-9_\.\[\]]+!?\}?)', r'\1', content)

    # Pattern 3: `${import.meta.env.VITE_CDN_URL?.replace(/\/\$/, '')}/${someVar.replace(/^\//, '')}` => `${someVar}`
    content = re.sub(r'\$\{import\.meta\.env\.VITE_CDN_URL\?\.replace\(\/\\\\/\$\/,\s*\'\'\)\}/\$(\{)([a-zA-Z0-9_\.\[\]]+!?)(\.replace\(\/\^\\\\/\/, \s*\'\'\)\})', r'$\1\2}', content)

    # Some variables are just `.replace(/^\\//, '')`, if we drop the first part, we might still have `${var.replace(...)`.
    # It's okay, but better to just use `${var}`.
    content = re.sub(r'\$\{import\.meta\.env\.VITE_CDN_URL\?\.replace\(\/\\\\/\\$\/,\s*\'\'\)\}/\$(\{)([a-zA-Z0-9_\.\[\]]+!?)\.replace\(\/\\^\\\\//,\s*\'\'\)\}', r'$\1\2}', content)

    # Wait, the JS string is `/\/$/` which in python raw string is `/\/$/` or `/\\/$/` 
    # Let's simplify the regex for Pattern 3
    content = re.sub(r'\$\{import\.meta\.env\.VITE_CDN_URL\?\.replace\(\/\\\/\\\$\/,\s*\'\'\)\}\/\$\{([a-zA-Z0-9_\.\[\]!]+)\.replace\(\/\^\\\/\\\/,\s*\'\'\)\}', r'${\1}', content)
    
    # Actually, let's just make the regex very loose:
    content = re.sub(r'\$\{import\.meta\.env\.VITE_CDN_URL[^}]*\}\/?\$\{([a-zA-Z0-9_\.\[\]!]+)(?:\.replace\([^)]+\))?\}', r'${\1}', content)

    # Pattern 4: someVar.startsWith('http') ? someVar : `${someVar}` => someVar
    # (since `${someVar}` was generated from the previous steps replacing VITE_CDN_URL)
    content = re.sub(r'([a-zA-Z0-9_\.\[\]]+)\.startsWith\(\'http\'\)\s*\?\s*\1\s*:\s*\`\$\{\1\}\`', r'\1', content)
    
    # Or before previous steps: `someVar.startsWith('http') ? someVar : \`${import.meta.env.VITE_CDN_URL}${someVar}\``
    content = re.sub(r'([a-zA-Z0-9_\.\[\]]+)\.startsWith\(\'http\'\)\s*\?\s*\1\s*:\s*\`\$\{import\.meta\.env\.VITE_CDN_URL[^}]*\}\/?\$\{\1(?:\.replace\([^)]+\))?\}\`', r'\1', content)

    # Same with ternary inside another ternary: `photoUrl ? (photoUrl.startsWith('http') ? photoUrl : ... ) : ...`
    # Let's just fix the startsWith part.
    
    # Pattern 5: `const baseUrl = import.meta.env.VITE_CDN_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';`
    content = content.replace("import.meta.env.VITE_CDN_URL || ", "")

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    import os
    src_dir = r"c:\code\final1\final\src"
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
