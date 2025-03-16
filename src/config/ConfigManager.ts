import { homedir } from 'os';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { Config, ConfigProfile, Repository } from '../types/config';
import { validateConfig, migrateConfig } from './schema';
import { ZodError } from 'zod';
import { getPackageVersion } from '../utils/version';
import { logger } from '../utils/logger';

export class ConfigManager {
  private static instance: ConfigManager;
  private configDir: string;
  private configPath: string;
  private config: Config;

  private constructor() {
    this.configDir = join(homedir(), '.gh-labels-cli');
    this.configPath = join(this.configDir, 'config.json');
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Ensures that configuration exists and is valid
   * Creates default configuration if it doesn't exist
   * @returns true if configuration is valid
   * @throws Error if configuration is invalid
   */
  public static ensureConfig(): boolean {
    try {
      const instance = ConfigManager.getInstance();
      const config = instance.getConfig();
      validateConfig(config);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Configuration error: ${error.message}`);
        if (error.message.includes('Failed to load configuration')) {
          logger.info('Creating default configuration...');
          try {
            ConfigManager.getInstance();
            logger.success('Default configuration created successfully');
            return true;
          } catch (e) {
            logger.error(
              `Failed to create default configuration: ${e instanceof Error ? e.message : String(e)}`
            );
            throw e;
          }
        }
      }
      throw error;
    }
  }

  private loadConfig(): Config {
    try {
      if (!existsSync(this.configDir)) {
        mkdirSync(this.configDir, { recursive: true });
      }

      if (!existsSync(this.configPath)) {
        const defaultConfig: Config = {
          version: getPackageVersion(),
          activeProfile: 'default',
          profiles: {
            default: {
              name: 'default',
              favoriteRepositories: [],
              recentRepositories: [],
            },
          },
        };
        this.saveConfig(defaultConfig);
        return defaultConfig;
      }

      const configData = readFileSync(this.configPath, 'utf8');
      let parsedConfig: unknown;

      try {
        parsedConfig = JSON.parse(configData);
      } catch (error) {
        throw new Error('Failed to parse configuration file: Invalid JSON');
      }

      // Migrate config if needed
      const migratedConfig = migrateConfig(parsedConfig);

      // Update version to match package version after migration
      if (typeof migratedConfig === 'object' && migratedConfig !== null) {
        (migratedConfig as { version: string }).version = getPackageVersion();
      }

      // Validate config against schema
      try {
        return validateConfig(migratedConfig);
      } catch (error) {
        if (error instanceof ZodError) {
          const issues = error.issues
            .map(issue => `  - ${issue.path.join('.')}: ${issue.message}`)
            .join('\n');
          throw new Error(`Invalid configuration:\n${issues}`);
        }
        throw error;
      }
    } catch (error: unknown) {
      throw new Error(
        `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private saveConfig(config: Config): void {
    try {
      // Validate config before saving
      validateConfig(config);

      writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      this.config = config;
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const issues = error.issues
          .map(issue => `  - ${issue.path.join('.')}: ${issue.message}`)
          .join('\n');
        throw new Error(`Invalid configuration:\n${issues}`);
      }
      throw new Error(
        `Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public getConfig(): Config {
    return this.config;
  }

  public getActiveProfile(): ConfigProfile {
    return this.config.profiles[this.config.activeProfile];
  }

  public setActiveProfile(profileName: string): void {
    if (!this.config.profiles[profileName]) {
      throw new Error(`Profile '${profileName}' does not exist`);
    }
    this.config.activeProfile = profileName;
    this.saveConfig(this.config);
  }

  public addProfile(name: string): void {
    if (this.config.profiles[name]) {
      throw new Error(`Profile '${name}' already exists`);
    }

    this.config.profiles[name] = {
      name,
      favoriteRepositories: [],
      recentRepositories: [],
    };

    this.saveConfig(this.config);
  }

  public addFavoriteRepository(repository: Repository): void {
    const profile = this.getActiveProfile();
    if (!profile.favoriteRepositories.some(r => r.fullName === repository.fullName)) {
      profile.favoriteRepositories.push(repository);
      this.saveConfig(this.config);
    }
  }

  public addRecentRepository(repository: Repository): void {
    const profile = this.getActiveProfile();
    const recentRepos = profile.recentRepositories;

    // Remove if already exists
    const index = recentRepos.findIndex(r => r.fullName === repository.fullName);
    if (index !== -1) {
      recentRepos.splice(index, 1);
    }

    // Add to the beginning and limit to 10 recent repositories
    recentRepos.unshift(repository);
    if (recentRepos.length > 10) {
      recentRepos.pop();
    }

    this.saveConfig(this.config);
  }
}
