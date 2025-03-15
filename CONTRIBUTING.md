# Contributing to GitHub Labels CLI

Thank you for your interest in contributing to GitHub Labels CLI! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please report unacceptable behavior to project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed and what you expected to see
- Include any relevant error messages or logs
- Specify your environment (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the proposed functionality
- Explain why this enhancement would be useful
- List any alternative solutions you've considered

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the tests (`pnpm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup

1. Clone your fork of the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a branch for your changes:
   ```bash
   git checkout -b your-feature-branch
   ```

### Coding Guidelines

- Write clear, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation for any changed functionality
- Write tests for new features
- Ensure all tests pass before submitting

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification. This leads to more readable messages that are easy to follow when looking through the project history.

Each commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries
- `ci`: Changes to CI configuration files and scripts
- `revert`: Reverts a previous commit

#### Examples

```
feat(labels): add color validation for label creation
fix(auth): handle expired GitHub tokens
docs(readme): update installation instructions
test(api): add tests for label synchronization
```

## Project Structure

```
gh-labels-cli/
├── src/           # Source code
├── tests/         # Test files
├── docs/          # Documentation
└── scripts/       # Build and maintenance scripts
```

## Getting Help

If you need help with your contribution:

- Open a discussion on GitHub
- Comment on the relevant issue
- Reach out to the maintainers

## License

By contributing to GitHub Labels CLI, you agree that your contributions will be licensed under its MIT license.
