import chalk from 'chalk';

const isVerboseMode = () => {
  return (
    process.env.DEBUG === 'true' ||
    process.env.VERBOSE === 'true' ||
    process.env.NODE_ENV === 'development'
  );
};

export const logger = {
  success: (message: string) => console.log(chalk.green(`✅ ${message}`)),
  error: (message: string) => console.error(chalk.red(`❌ ${message}`)),
  warning: (message: string) => console.warn(chalk.yellow(`⚠️ ${message}`)),
  info: (message: string) => console.log(chalk.blue(`ℹ️ ${message}`)),
  debug: (message: string) => {
    if (isVerboseMode()) {
      const timestamp = new Date().toISOString();
      console.log(chalk.gray(`🔍 [${timestamp}] ${message}`));
    }
  },
  isVerbose: isVerboseMode,
};
