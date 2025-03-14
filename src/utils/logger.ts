import chalk from 'chalk';

export const logError = (message: string) => {
  console.error(chalk.red(`Error: ${message}`));
};

export const logSuccess = (message: string) => {
  console.log(chalk.green(`Success: ${message}`));
};

export const logInfo = (message: string) => {
  console.log(chalk.blue(`Info: ${message}`));
}; 