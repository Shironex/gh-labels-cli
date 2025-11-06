import chalk from 'chalk';

export const logger = {
  success: (message: string) => console.log(chalk.green(`✅ ${message}`)),
  error: (message: string) => console.error(chalk.red(`❌ ${message}`)),
  warning: (message: string) => console.warn(chalk.yellow(`⚠️ ${message}`)),
  info: (message: string) => console.log(chalk.blue(`ℹ️ ${message}`)),
  debug: (message: string) => {
    if (process.env.DEBUG === 'true') {
      console.log(chalk.gray(`🐛 ${message}`));
    }
  },
};
