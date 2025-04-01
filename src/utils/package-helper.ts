import * as fs from 'fs';
import * as path from 'path';

/**
 * Get the version from the package.json file
 * @returns The version string or '0.0.0' if not found
 */
export function getPackageJsonVersion(): string {
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version || '0.0.0';
  } catch (error) {
    console.error('Error reading package.json:', error);
    return '0.0.0';
  }
}
