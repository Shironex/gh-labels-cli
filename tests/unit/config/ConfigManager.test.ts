import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ConfigManager } from '../../../src/config/ConfigManager';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as version from '../../../src/utils/version';

vi.mock('fs');
vi.mock('path');
vi.mock('os');
vi.mock('../../../src/utils/version');
vi.mock('../../../src/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ConfigManager', () => {
  const mockConfigDir = '/mock/home/.gh-labels-cli';
  const mockConfigPath = '/mock/home/.gh-labels-cli/config.json';
  const mockHomeDir = '/mock/home';
  const mockVersion = '1.2.1';

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Mock homedir
    vi.mocked(os.homedir).mockReturnValue(mockHomeDir);

    // Mock version
    vi.mocked(version.getPackageVersion).mockReturnValue(mockVersion);

    // Mock path.join to return our mock paths
    vi.mocked(path.join).mockImplementation((...args: string[]) => {
      if (args.includes('.gh-labels-cli')) {
        return mockConfigDir;
      }
      if (args.includes('config.json')) {
        return mockConfigPath;
      }
      return args.join('/');
    });

    // Reset the singleton instance
    // @ts-expect-error: Accessing private static member for testing
    ConfigManager.instance = undefined;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('ensureConfig', () => {
    it('should return true when configuration exists and is valid', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          version: mockVersion,
          activeProfile: 'default',
          profiles: {
            default: {
              name: 'default',
              favoriteRepositories: [],
              recentRepositories: [],
            },
          },
        })
      );

      expect(ConfigManager.ensureConfig()).toBe(true);
    });

    it('should create default configuration when it does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const writeFileSyncMock = vi.mocked(fs.writeFileSync);

      expect(ConfigManager.ensureConfig()).toBe(true);
      expect(writeFileSyncMock).toHaveBeenCalledWith(mockConfigPath, expect.any(String));

      const writtenConfig = JSON.parse(writeFileSyncMock.mock.calls[0][1] as string);
      expect(writtenConfig.version).toBe(mockVersion);
      expect(writtenConfig.activeProfile).toBe('default');
    });

    it('should throw error when configuration is invalid', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          version: mockVersion,
          // Missing required fields
        })
      );

      expect(() => ConfigManager.ensureConfig()).toThrow();
    });

    it('should throw error when configuration file is corrupted', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

      expect(() => ConfigManager.ensureConfig()).toThrow();
    });
  });

  describe('getInstance', () => {
    it('should create a new instance if none exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          version: mockVersion,
          activeProfile: 'default',
          profiles: {
            default: {
              name: 'default',
              favoriteRepositories: [],
              recentRepositories: [],
            },
          },
        })
      );

      const instance1 = ConfigManager.getInstance();
      const instance2 = ConfigManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('loadConfig', () => {
    it('should create default config if file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const writeFileSyncMock = vi.mocked(fs.writeFileSync);

      ConfigManager.getInstance();

      expect(writeFileSyncMock).toHaveBeenCalledWith(mockConfigPath, expect.any(String));
      const writtenConfig = JSON.parse(writeFileSyncMock.mock.calls[0][1] as string);
      expect(writtenConfig.version).toBe(mockVersion);
    });

    it('should load existing config and update version', () => {
      const mockConfig = {
        version: '1.0.0', // Old version
        activeProfile: 'default',
        profiles: {
          default: {
            name: 'default',
            favoriteRepositories: [],
            recentRepositories: [],
          },
        },
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      const instance = ConfigManager.getInstance();
      expect(instance.getConfig().version).toBe(mockVersion); // Should be updated to current version
    });

    it('should throw error on invalid JSON', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

      expect(() => ConfigManager.getInstance()).toThrow('Failed to parse configuration file');
    });
  });

  describe('profile management', () => {
    let manager: ConfigManager;

    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          version: mockVersion,
          activeProfile: 'default',
          profiles: {
            default: {
              name: 'default',
              favoriteRepositories: [],
              recentRepositories: [],
            },
          },
        })
      );

      manager = ConfigManager.getInstance();
    });

    it('should add new profile', () => {
      manager.addProfile('test');
      expect(manager.getConfig().profiles.test).toBeDefined();
    });

    it('should throw error when adding existing profile', () => {
      expect(() => manager.addProfile('default')).toThrow("Profile 'default' already exists");
    });

    it('should set active profile', () => {
      manager.addProfile('test');
      manager.setActiveProfile('test');
      expect(manager.getConfig().activeProfile).toBe('test');
    });

    it('should throw error when setting non-existent profile', () => {
      expect(() => manager.setActiveProfile('nonexistent')).toThrow(
        "Profile 'nonexistent' does not exist"
      );
    });
  });

  describe('repository management', () => {
    let manager: ConfigManager;
    const mockRepo = {
      owner: 'octocat',
      name: 'Hello-World',
      fullName: 'octocat/Hello-World',
      lastAccessed: new Date().toISOString(),
    };

    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          version: mockVersion,
          activeProfile: 'default',
          profiles: {
            default: {
              name: 'default',
              favoriteRepositories: [],
              recentRepositories: [],
            },
          },
        })
      );

      manager = ConfigManager.getInstance();
    });

    it('should add favorite repository', () => {
      manager.addFavoriteRepository(mockRepo);
      expect(manager.getActiveProfile().favoriteRepositories).toContainEqual(mockRepo);
    });

    it('should not add duplicate favorite repository', () => {
      manager.addFavoriteRepository(mockRepo);
      manager.addFavoriteRepository(mockRepo);
      expect(manager.getActiveProfile().favoriteRepositories).toHaveLength(1);
    });

    it('should add recent repository', () => {
      manager.addRecentRepository(mockRepo);
      expect(manager.getActiveProfile().recentRepositories[0]).toEqual(mockRepo);
    });

    it('should limit recent repositories to 10', () => {
      for (let i = 0; i < 15; i++) {
        manager.addRecentRepository({
          ...mockRepo,
          name: `repo-${i}`,
          fullName: `octocat/repo-${i}`,
        });
      }
      expect(manager.getActiveProfile().recentRepositories).toHaveLength(10);
    });
  });
});
