import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { interactiveMode } from '../../src/commands/interactive';
import { addLabelsAction } from '../../src/commands/add-labels';
import { getLabelsAction } from '../../src/commands/get-labels';
import { helpAction } from '../../src/commands/help';
import inquirer from 'inquirer';
import { mockExit } from '../setup';

// Mock dependencies
vi.mock('../../src/commands/add-labels', () => ({
  addLabelsAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/commands/get-labels', () => ({
  getLabelsAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/commands/help', () => ({
  helpAction: vi.fn(),
}));

vi.mock('../../src/utils/logger', () => ({
  logger: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Interactive Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear environment variables before each test
    delete process.env.GITHUB_TOKEN;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should call addLabelsAction when add-labels command is selected', async () => {
    // First mock the command selection
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      action: 'add-labels',
    });

    // Then mock the token prompt
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      token: 'mock-token',
    });

    await interactiveMode();

    expect(addLabelsAction).toHaveBeenCalledTimes(1);
    expect(addLabelsAction).toHaveBeenCalledWith('mock-token');
    expect(getLabelsAction).not.toHaveBeenCalled();
    expect(helpAction).not.toHaveBeenCalled();
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should call getLabelsAction when get-labels command is selected', async () => {
    // First mock the command selection
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      action: 'get-labels',
    });

    // Then mock the token prompt
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      token: 'mock-token',
    });

    await interactiveMode();

    expect(getLabelsAction).toHaveBeenCalledTimes(1);
    expect(getLabelsAction).toHaveBeenCalledWith('mock-token');
    expect(addLabelsAction).not.toHaveBeenCalled();
    expect(helpAction).not.toHaveBeenCalled();
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should call helpAction when help command is selected', async () => {
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      action: 'help',
    });

    await interactiveMode();

    expect(helpAction).toHaveBeenCalledTimes(1);
    expect(addLabelsAction).not.toHaveBeenCalled();
    expect(getLabelsAction).not.toHaveBeenCalled();
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should call process.exit when exit command is selected', async () => {
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      action: 'exit',
    });

    await expect(interactiveMode()).rejects.toThrow('process.exit unexpectedly called with "0"');

    expect(mockExit).toHaveBeenCalledWith(0);
    expect(addLabelsAction).not.toHaveBeenCalled();
    expect(getLabelsAction).not.toHaveBeenCalled();
    expect(helpAction).not.toHaveBeenCalled();
  });
});
