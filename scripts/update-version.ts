import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read package.json
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

// Create version.ts content
const versionFileContent = `// This file is auto-generated. Do not edit it manually.
export const VERSION = '${packageJson.version}';
`;

// Write to src/version.ts
writeFileSync(join('src', 'version.ts'), versionFileContent);
console.log(`Updated version.ts with version ${packageJson.version}`);
