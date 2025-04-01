export function helpAction() {
  console.log('Available commands:');
  console.log('  add-labels    - Add labels to a GitHub repository');
  console.log('  get-labels    - Get all labels from a GitHub repository in JSON format');
  console.log('  remove-labels - Remove labels from a GitHub repository');
  console.log('  help          - Display all available commands');
  console.log('\nFor more details, use: gh-labels [command] --help');
}
