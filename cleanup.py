import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Clean up `(someVar.startsWith('data:') || someVar)` -> `someVar`
    content = re.sub(r'\([a-zA-Z0-9_\.\[\]]+\.startsWith\([^)]+\)\s*\|\|\s*([a-zA-Z0-9_\.\[\]]+)\)', r'\1', content)
    
    # Clean up `(someVar)` -> `someVar` if it's alone after a ternary operator `? (someVar) :`
    content = re.sub(r'\?\s*\(([a-zA-Z0-9_\.\[\]]+)\)\s*:', r'? \1 :', content)
    
    # Clean up `someVar ? (someVar) :` -> `someVar ? someVar :`
    content = re.sub(r'\?\s*\(\s*([a-zA-Z0-9_\.\[\]]+)\s*\)\s*:', r'? \1 :', content)

    # Some might be like `previewImage.startsWith('data:') || previewImage` without parens?
    content = re.sub(r'[a-zA-Z0-9_\.\[\]]+\.startsWith\([^)]+\)\s*\|\|\s*([a-zA-Z0-9_\.\[\]]+)', r'\1', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned up {filepath}")

def main():
    import os
    src_dir = r"c:\code\final1\final\src"
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
