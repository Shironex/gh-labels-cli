# Interactive Mode

GitHub Labels CLI provides an interactive mode that guides you through label management operations step by step.

## Starting Interactive Mode

To start interactive mode, simply run the CLI without any specific command:

```bash
pnpm dev
```

## Interactive Workflow

The interactive mode follows this general workflow:

1. **Authentication**: If no GitHub token is found in environment variables, you will be prompted to enter your GitHub Personal Access Token.

2. **Command Selection**: Choose from available commands:
   - Add labels to a repository
   - Get labels from a repository in JSON format
   - Remove labels from a repository
   - Suggest labels for a pull request
   - Suggest labels for an issue
   - Display available commands
   - Exit

3. **Repository Selection**: Select a repository from the list of repositories you have access to.

4. **Operation Execution**: Depending on the selected command, you'll be guided through additional steps.

## Adding Labels Interactively

When selecting "Add labels to a repository", the interactive mode will:

1. Show a list of your GitHub repositories for selection
2. If multiple label templates are available, prompt you to select one:
   ```
   ? Select a label template:
     default (default template)
     owner-repo1
     owner-repo2
   ```
3. Display a checklist of labels from the selected template for you to choose from
4. Add the selected labels to the chosen repository
5. Show the results of the operation

## Getting Labels Interactively

When selecting "Get labels from a repository in JSON format", the interactive mode will:

1. Show a list of your GitHub repositories for selection
2. Fetch all labels from the selected repository
3. Save the labels to a JSON file in the `src/labels` directory, named after the repository (e.g., `src/labels/owner-repo.json`)
4. Display the path to the saved file

This makes it easy to export and backup your repository labels or use them as templates for other repositories. Any labels saved with this command will automatically become available as templates when adding labels to repositories.

## Removing Labels Interactively

When selecting "Remove labels from a repository", the interactive mode will:

1. Show a list of your GitHub repositories for selection
2. Fetch all existing labels from the selected repository
3. Display a checklist of labels for you to select which ones to remove:
   ```
   ? Select labels to remove:
     ◯ bug - Something isn't working
     ◯ documentation - Improvements or additions to documentation
     ◉ duplicate - This issue or pull request already exists
     ◉ invalid - This doesn't seem right
     ◯ enhancement - New feature or request
   ```
4. Remove the selected labels from the repository
5. Show the results of the operation with success or warning messages

This is useful for cleaning up repositories by removing outdated, duplicate, or unwanted labels.

## AI-Powered Label and Description Suggestions

### For Pull Requests

When selecting "Suggest labels for a pull request", the interactive mode will:

1. Prompt for your GitHub token (if not already provided)
2. Require your OpenAI API key from the `OPENAI_API_KEY` environment variable
3. Display a list of your repositories for selection
4. Fetch open pull requests from the selected repository
5. Let you choose a pull request to analyze from the list:
   ```
   ? Select a pull request to analyze:
     #42: Add new feature for label management
     #45: Fix bug in repository selection
   > #47: Update documentation for CLI commands
     #51: Refactor GitHub API interaction
   ```
6. Ask what to apply with AI suggestions:
   - Both labels and description (default)
   - Only labels
   - Only description
7. Analyze the pull request content using AI
8. Display suggestions with confidence scores:

   ```
   Here are the suggestions for this pull request:

   Suggested Labels:
   [EXISTING] documentation (Confidence: 95%)
      Reason: This PR primarily updates documentation for CLI commands

   [NEW] user-guide (Confidence: 80%)
      Reason: The changes focus specifically on user-facing guide information

   Suggested Description:

   English version:
   Confidence: 90%
   docs: update CLI command documentation

   This pull request updates the CLI documentation to include detailed information about
   command usage and interactive mode features. The changes include:
   - Enhanced command descriptions
   - New examples for each command
   - Updated interactive mode workflow
   - Added troubleshooting section

   Polish version:
   Confidence: 90%
   docs: aktualizacja dokumentacji poleceń CLI
   ...
   ```

9. Ask if you want to apply the suggested changes
10. If applying description, ask which language version to use (English/Polish)
11. Apply the selected labels and/or description

### For Issues

When selecting "Suggest labels for an issue", the interactive mode will:

1. Prompt for your GitHub token (if not already provided)
2. Require your OpenAI API key from the `OPENAI_API_KEY` environment variable
3. Display a list of your repositories for selection
4. Fetch open issues from the selected repository
5. Let you choose an issue to analyze from the list:
   ```
   ? Select an issue to analyze:
     #10: Application crashes on startup
     #12: Feature request: Add dark mode
   > #15: Documentation unclear about authentication
     #18: Performance issue with large repositories
   ```
6. Ask what to apply with AI suggestions:
   - Both labels and description (default)
   - Only labels
   - Only description
7. Analyze the issue content using AI
8. Display suggestions with confidence scores:

   ```
   Here are the suggestions for this issue:

   Suggested Labels:
   [EXISTING] bug (Confidence: 95%)
      Reason: Issue describes application crash - clear bug report

   [NEW] critical (Confidence: 85%)
      Reason: Prevents core functionality from working

   Suggested Description:

   English version:
   Confidence: 90%
   ## Bug Report

   **Issue Type:** Critical Bug

   **Summary:**
   Application crashes when submitting form with empty email field

   **Expected Behavior:**
   Form should display validation error

   **Actual Behavior:**
   Application crashes with null pointer exception
   ...

   Polish version:
   Confidence: 90%
   ## Raport Błędu
   ...
   ```

9. Ask if you want to apply the suggested changes
10. If applying description, ask which language version to use (English/Polish)
11. Apply the selected labels and/or description

### Benefits

These AI-powered features streamline the process of documenting and categorizing pull requests and issues by:

- Analyzing content and suggesting appropriate labels
- Classifying issue types (bug, feature, question, etc.)
- Generating comprehensive descriptions that capture the essence of changes
- Providing bilingual support (English and Polish)
- Saving time on manual documentation
- Maintaining consistent documentation across the project

## Benefits of Interactive Mode

- No need to remember command syntax
- Easy repository selection
- Guided workflow for label operations
- Visual feedback on operations progress and results

## Example Session

Here's an example of what you'll see when using interactive mode:

```
$ pnpm dev

? Please enter your GitHub Personal Access Token: ************************************

? Select a command:
  Add labels to a repository
  Get labels from a repository in JSON format
  Remove labels from a repository
  Suggest labels for a pull request
  Suggest labels for an issue
  Display available commands
  Exit

> Add labels to a repository

✓ Fetching repositories ... Done!

? Select a repository:
  user/repo-1
  user/repo-2
> user/my-project
  user/another-repo

✓ Selected Repository: user/my-project

? Select labels to add:
 ◯ bug - Something isn't working
 ◯ documentation - Improvements or additions to documentation
 ◯ enhancement - New feature or request
 ◯ good first issue - Good for newcomers
 ◉ help wanted - Extra attention is needed
 ◯ invalid - This doesn't seem right
 ◯ question - Further information is requested

✓ Label "help wanted" added successfully!
```
