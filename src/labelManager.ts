import { Octokit } from "@octokit/rest";
import inquirer from "inquirer";

export async function addLabels(octokit: Octokit, repoFullName: string) {
  console.log(`\n📌 Adding labels to repository: ${repoFullName}\n`);

  const labels = [
    { name: "test", color: "d73a4a", description: "Something isn't working" },
    {
      name: "test 2",
      color: "a2eeef",
      description: "New feature or request",
    },
  ];

  // Ask the user which labels they want to add
  const { selectedLabels } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedLabels",
      message: "Select labels to add:",
      choices: labels.map((label) => ({
        name: `${label.name} - ${label.description}`,
        value: label,
      })),
    },
  ]);

  if (selectedLabels.length === 0) {
    console.log("⚠️ No labels selected. Exiting...");
    return;
  }

  for (const label of selectedLabels) {
    try {
      await octokit.issues.createLabel({
        owner: repoFullName.split("/")[0],
        repo: repoFullName.split("/")[1],
        name: label.name,
        color: label.color,
        description: label.description,
      });

      console.log(`✅ Label "${label.name}" added successfully!`);
    } catch (error: any) {
      if (error.status === 422) {
        console.log(`⚠️ Label "${label.name}" already exists.`);
      } else {
        console.error(`❌ Error adding label "${label.name}":`, error.message);
      }
    }
  }
}
