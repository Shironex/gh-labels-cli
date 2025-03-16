import { Command } from 'commander';
import { ConfigManager } from '../config/ConfigManager';
import { Config, ConfigProfile } from '../types/config';
import { logger } from '../utils/logger';
import chalk from 'chalk';
import inquirer from 'inquirer';

/**
 * Handle interactive profile management
 */
async function handleProfileManagementInteractive(): Promise<void> {
  const config = ConfigManager.getInstance().getConfig();
  const { profileAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'profileAction',
      message: 'Profile Management',
      choices: [
        { name: 'List Profiles', value: 'list' },
        { name: 'Create New Profile', value: 'create' },
        { name: 'Switch Profile', value: 'switch' },
        { name: 'Back', value: 'back' },
      ],
    },
  ]);

  if (profileAction === 'back') {
    return;
  }

  switch (profileAction) {
    case 'list': {
      listProfiles();
      break;
    }
    case 'create': {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter profile name:',
          validate: input => {
            if (!input) return 'Profile name is required';
            if (config.profiles[input]) return 'Profile already exists';
            return true;
          },
        },
      ]);
      try {
        ConfigManager.getInstance().addProfile(name);
        logger.success(`Created profile: ${name}`);
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error));
      }
      break;
    }
    case 'switch': {
      const profiles = Object.keys(config.profiles);
      const { profile } = await inquirer.prompt([
        {
          type: 'list',
          name: 'profile',
          message: 'Select profile:',
          choices: profiles,
        },
      ]);
      try {
        ConfigManager.getInstance().setActiveProfile(profile);
        logger.success(`Switched to profile: ${profile}`);
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error));
      }
      break;
    }
  }
}

/**
 * Handle interactive favorite repository management
 */
async function handleFavoriteManagementInteractive(): Promise<void> {
  const { favoriteAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'favoriteAction',
      message: 'Favorite Repository Management',
      choices: [
        { name: 'List Favorites', value: 'list' },
        { name: 'Clear All Favorites', value: 'clear' },
        { name: 'Back', value: 'back' },
      ],
    },
  ]);

  if (favoriteAction === 'back') {
    return;
  }

  switch (favoriteAction) {
    case 'list': {
      listFavorites();
      break;
    }
    case 'clear': {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to clear all favorites?',
          default: false,
        },
      ]);

      if (confirm) {
        clearFavorites();
      }
      break;
    }
  }
}

/**
 * Handle interactive configuration management
 */
export async function handleConfigInteractive(): Promise<void> {
  const { configAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'configAction',
      message: 'Configuration Management',
      choices: [
        { name: 'Manage Profiles', value: 'profiles' },
        { name: 'Manage Favorite Repositories', value: 'favorites' },
        { name: 'Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  if (configAction === 'back') {
    return;
  }

  switch (configAction) {
    case 'profiles':
      await handleProfileManagementInteractive();
      break;
    case 'favorites':
      await handleFavoriteManagementInteractive();
      break;
  }

  // Return to config management menu
  await handleConfigInteractive();
}

// Helper functions for CLI commands
function listProfiles(): void {
  const config = ConfigManager.getInstance().getConfig();
  const activeProfile = config.activeProfile;

  logger.info('\nAvailable profiles:');
  Object.keys(config.profiles).forEach(profileName => {
    const marker = profileName === activeProfile ? chalk.green('*') : ' ';
    logger.info(`${marker} ${profileName}`);
  });
  logger.info('\nNote: * indicates active profile');
}

function listFavorites(): void {
  const profile = ConfigManager.getInstance().getActiveProfile();

  if (profile.favoriteRepositories.length === 0) {
    logger.warning('\nNo favorite repositories.');
    return;
  }

  logger.info('\nFavorite repositories:');
  profile.favoriteRepositories.forEach(repo => {
    logger.info(`- ${chalk.blue(repo.fullName)}`);
  });
}

function clearFavorites(): void {
  const manager = ConfigManager.getInstance();
  const profile = manager.getActiveProfile();
  profile.favoriteRepositories = [];
  manager.setActiveProfile(profile.name); // Trigger save
  logger.success('Cleared all favorite repositories');
}

export const configCommand = new Command('config')
  .description('Manage configuration settings')
  .addCommand(
    new Command('get')
      .description('Get configuration value')
      .argument('[key]', 'Configuration key to get')
      .action((key?: string) => {
        const config = ConfigManager.getInstance().getConfig();
        if (!key) {
          logger.info(JSON.stringify(config, null, 2));
          return;
        }

        const profile = ConfigManager.getInstance().getActiveProfile();
        if (key in config) {
          logger.info(JSON.stringify(config[key as keyof Config], null, 2));
        } else if (key in profile) {
          logger.info(JSON.stringify(profile[key as keyof ConfigProfile], null, 2));
        } else {
          logger.error(`Unknown configuration key: ${key}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('profile')
      .description('Manage configuration profiles')
      .addCommand(
        new Command('list').description('List all profiles').action(() => {
          listProfiles();
        })
      )
      .addCommand(
        new Command('create')
          .description('Create a new profile')
          .argument('<name>', 'Profile name')
          .action((name: string) => {
            try {
              ConfigManager.getInstance().addProfile(name);
              logger.success(`Created profile: ${name}`);
            } catch (error) {
              logger.error(error instanceof Error ? error.message : String(error));
              process.exit(1);
            }
          })
      )
      .addCommand(
        new Command('activate')
          .description('Switch to a different profile')
          .argument('<name>', 'Profile name')
          .action((name: string) => {
            try {
              ConfigManager.getInstance().setActiveProfile(name);
              logger.success(`Switched to profile: ${name}`);
            } catch (error) {
              logger.error(error instanceof Error ? error.message : String(error));
              process.exit(1);
            }
          })
      )
  )
  .addCommand(
    new Command('favorites')
      .description('Manage favorite repositories')
      .addCommand(
        new Command('list').description('List favorite repositories').action(() => {
          listFavorites();
        })
      )
      .addCommand(
        new Command('clear').description('Clear all favorite repositories').action(() => {
          clearFavorites();
        })
      )
  );
