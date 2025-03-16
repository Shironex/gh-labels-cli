import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { interactiveMode } from '../../src/commands/interactive';
import { mockExit } from '../setup';

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

// Mock commands
vi.mock('../../src/commands', () => ({
  addLabelsAction: vi.fn(),
  getLabelsAction: vi.fn(),
  deleteLabelsAction: vi.fn(),
  helpAction: vi.fn(),
}));

// Mock process.env
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.GITHUB_TOKEN = 'mock-token';
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Interactive Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call addLabelsAction when add option is selected', async () => {
    const inquirer = await import('inquirer');
    (inquirer.default.prompt as any).mockResolvedValueOnce({ action: 'add-labels' });

    const { addLabelsAction } = await import('../../src/commands');

    await interactiveMode();

    expect(addLabelsAction).toHaveBeenCalledWith('mock-token');
  });

  it('should call getLabelsAction when get option is selected', async () => {
    const inquirer = await import('inquirer');
    (inquirer.default.prompt as any).mockResolvedValueOnce({ action: 'get-labels' });

    const { getLabelsAction } = await import('../../src/commands');

    await interactiveMode();

    expect(getLabelsAction).toHaveBeenCalledWith('mock-token');
  });

  it('should call deleteLabelsAction when delete option is selected', async () => {
    const inquirer = await import('inquirer');
    (inquirer.default.prompt as any).mockResolvedValueOnce({ action: 'delete-labels' });

    const { deleteLabelsAction } = await import('../../src/commands');

    await interactiveMode();

    expect(deleteLabelsAction).toHaveBeenCalledWith('mock-token');
  });

  it('should call helpAction when help option is selected', async () => {
    const inquirer = await import('inquirer');
    (inquirer.default.prompt as any).mockResolvedValueOnce({ action: 'help' });

    const { helpAction } = await import('../../src/commands');

    await interactiveMode();

    expect(helpAction).toHaveBeenCalled();
  });

  it('should exit when exit option is selected', async () => {
    const inquirer = await import('inquirer');
    (inquirer.default.prompt as any).mockResolvedValueOnce({ action: 'exit' });

    await expect(interactiveMode()).rejects.toThrow('Process.exit called with code: 1');
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('should throw error for invalid action', async () => {
    const inquirer = await import('inquirer');
    (inquirer.default.prompt as any).mockResolvedValueOnce({ action: 'invalid' });

    await expect(interactiveMode()).rejects.toThrow('Process.exit called with code: 1');
  });
});
