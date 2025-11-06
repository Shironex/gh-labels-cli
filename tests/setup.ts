import { vi } from 'vitest';
import nock from 'nock';
import path from 'path';
import { fileURLToPath } from 'url';

//? Mock for path module (preserve actual implementation)
vi.mock('path', async () => {
  const actual = await vi.importActual<typeof path>('path');
  return {
    default: actual,
    ...actual,
  };
});

//? Mock for url module (preserve actual implementation)
vi.mock('url', async () => {
  const actual = await vi.importActual<typeof import('url')>('url');
  return {
    ...actual,
    fileURLToPath: actual.fileURLToPath,
  };
});

//? Mock for inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

//? Mock for ora
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
  })),
}));

//? Mock for process.exit
export const mockExit = vi.spyOn(process, 'exit').mockImplementation(code => {
  throw new Error(`Process.exit called with code: ${code}`);
});

//? Function to configure nock before tests
export function setupNock() {
  nock.disableNetConnect();
}

//? Function to clean up nock after tests
export function cleanupNock() {
  nock.cleanAll();
  nock.enableNetConnect();
}

//? Function to set up GitHub token
export function setupGitHubToken() {
  process.env.GITHUB_TOKEN = 'mock-token';
}

//? Function to mock console.log, console.error and console.warn
export function mockConsole() {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
}

//? Function to restore original console functions
export function restoreConsole() {
  vi.restoreAllMocks();
}
