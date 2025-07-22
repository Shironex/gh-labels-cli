import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { interactiveMode } from '../../src/commands/interactive';
import { addLabelsAction } from '../../src/commands/add-labels';
import { getLabelsAction } from '../../src/commands/get-labels';
import { helpAction } from '../../src/commands/help';
import { suggestLabelsAction } from '../../src/commands/suggest-labels';
import { removeLabelAction } from '../../src/commands/remove-labels';
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

vi.mock('../../src/commands/suggest-labels', () => ({
  suggestLabelsAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/commands/remove-labels', () => ({
  removeLabelAction: vi.fn().mockResolvedValue(undefined),
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

  describe('suggest-labels interactive mode', () => {
    it('should call suggestLabelsAction with default options when "both" is selected', async () => {
      // Mock command selection and token prompt
      (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ action: 'suggest-labels' }) // Command selection
        .mockResolvedValueOnce({ token: 'mock-token' }) // Token prompt
        .mockResolvedValueOnce({ applyOptions: 'both' }); // Options selection

      await interactiveMode();

      expect(suggestLabelsAction).toHaveBeenCalledTimes(1);
      expect(suggestLabelsAction).toHaveBeenCalledWith('mock-token', {});
    });

    it('should call suggestLabelsAction with labelsOnly option when "labels-only" is selected', async () => {
      (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ action: 'suggest-labels' })
        .mockResolvedValueOnce({ token: 'mock-token' })
        .mockResolvedValueOnce({ applyOptions: 'labels-only' });

      await interactiveMode();

      expect(suggestLabelsAction).toHaveBeenCalledTimes(1);
      expect(suggestLabelsAction).toHaveBeenCalledWith('mock-token', { labelsOnly: true });
    });

    it('should call suggestLabelsAction with descriptionOnly option when "description-only" is selected', async () => {
      (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ action: 'suggest-labels' })
        .mockResolvedValueOnce({ token: 'mock-token' })
        .mockResolvedValueOnce({ applyOptions: 'description-only' });

      await interactiveMode();

      expect(suggestLabelsAction).toHaveBeenCalledTimes(1);
      expect(suggestLabelsAction).toHaveBeenCalledWith('mock-token', { descriptionOnly: true });
    });

    it('should use environment token when available for suggest-labels', async () => {
      // Set environment token
      process.env.GITHUB_TOKEN = 'env-token';

      (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ action: 'suggest-labels' })
        .mockResolvedValueOnce({ applyOptions: 'both' });

      await interactiveMode();

      expect(suggestLabelsAction).toHaveBeenCalledTimes(1);
      expect(suggestLabelsAction).toHaveBeenCalledWith('env-token', {});

      // Clean up
      delete process.env.GITHUB_TOKEN;
    });

    it('should prompt for selective options when suggest-labels is selected', async () => {
      (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ action: 'suggest-labels' })
        .mockResolvedValueOnce({ token: 'mock-token' })
        .mockResolvedValueOnce({ applyOptions: 'both' });

      await interactiveMode();

      // Verify that the options prompt was called
      expect(inquirer.prompt).toHaveBeenCalledTimes(3);
      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: 'list',
          name: 'applyOptions',
          message: 'What would you like to apply with AI suggestions?',
          choices: [
            { name: 'Both labels and description (default)', value: 'both' },
            { name: 'Only labels', value: 'labels-only' },
            { name: 'Only description', value: 'description-only' },
          ],
        },
      ]);
    });
  });

  it('should call removeLabelAction when remove-labels command is selected', async () => {
    (inquirer.prompt as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ action: 'remove-labels' })
      .mockResolvedValueOnce({ token: 'mock-token' });

    await interactiveMode();

    expect(removeLabelAction).toHaveBeenCalledTimes(1);
    expect(removeLabelAction).toHaveBeenCalledWith('mock-token');
    expect(addLabelsAction).not.toHaveBeenCalled();
    expect(getLabelsAction).not.toHaveBeenCalled();
    expect(suggestLabelsAction).not.toHaveBeenCalled();
    expect(helpAction).not.toHaveBeenCalled();
  });
});
