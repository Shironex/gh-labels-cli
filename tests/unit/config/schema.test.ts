import { describe, it, expect, vi, beforeEach } from 'vitest';
import { migrateConfig, repositorySchema, configProfileSchema } from '../../../src/config/schema';
import * as version from '../../../src/utils/version';

vi.mock('../../../src/utils/version');

describe('Schema Validation', () => {
  const mockVersion = '1.2.1';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(version.getPackageVersion).mockReturnValue(mockVersion);
  });

  describe('repositorySchema', () => {
    it('should validate correct repository', () => {
      const validRepo = {
        owner: 'octocat',
        name: 'Hello-World',
        fullName: 'octocat/Hello-World',
        lastAccessed: new Date().toISOString(),
      };

      expect(() => repositorySchema.parse(validRepo)).not.toThrow();
    });

    it('should reject invalid date format', () => {
      const invalidRepo = {
        owner: 'octocat',
        name: 'Hello-World',
        fullName: 'octocat/Hello-World',
        lastAccessed: 'not-a-date',
      };

      expect(() => repositorySchema.parse(invalidRepo)).toThrow();
    });
  });

  describe('configProfileSchema', () => {
    it('should validate correct profile', () => {
      const validProfile = {
        name: 'default',
        favoriteRepositories: [],
        recentRepositories: [],
      };

      expect(() => configProfileSchema.parse(validProfile)).not.toThrow();
    });

    it('should validate profile with repositories', () => {
      const validProfile = {
        name: 'default',
        favoriteRepositories: [
          {
            owner: 'octocat',
            name: 'Hello-World',
            fullName: 'octocat/Hello-World',
            lastAccessed: new Date().toISOString(),
          },
        ],
        recentRepositories: [],
      };

      expect(() => configProfileSchema.parse(validProfile)).not.toThrow();
    });
  });

  describe('migrateConfig', () => {
    it('should return config unchanged for current version', () => {
      const config = {
        version: mockVersion,
        activeProfile: 'default',
        profiles: {
          default: {
            name: 'default',
            favoriteRepositories: [],
            recentRepositories: [],
          },
        },
      };

      const migratedConfig = migrateConfig(config);
      expect(migratedConfig).toEqual(config);
    });

    it('should handle config without version', () => {
      const config = {
        activeProfile: 'default',
        profiles: {
          default: {
            name: 'default',
            favoriteRepositories: [],
            recentRepositories: [],
          },
        },
      };

      const migratedConfig = migrateConfig(config);
      expect(migratedConfig).toEqual(config);
    });
  });
});
