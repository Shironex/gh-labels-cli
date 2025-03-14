import { vi } from 'vitest';
import nock from 'nock';

// Mock dla inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

// Mock dla ora
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
  })),
}));

// Mock dla process.exit
export const mockExit = vi.spyOn(process, 'exit').mockImplementation(code => {
  throw new Error(`Process.exit called with code: ${code}`);
});

// Funkcja do konfiguracji nock przed testami
export function setupNock() {
  nock.disableNetConnect();
}

// Funkcja do czyszczenia nock po testach
export function cleanupNock() {
  nock.cleanAll();
  nock.enableNetConnect();
}

// Funkcja do ustawienia tokenu GitHub
export function setupGitHubToken() {
  process.env.GITHUB_TOKEN = 'mock-token';
}

// Funkcja do mockowania console.log, console.error i console.warn
export function mockConsole() {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
}

// Funkcja do przywracania oryginalnych funkcji console
export function restoreConsole() {
  vi.restoreAllMocks();
}
