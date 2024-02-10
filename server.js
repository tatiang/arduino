const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

app.use(express.json());

app.get('/', (req, res) => {
  res.write('Tamagotchi is live!\n');
  res.write('Commands:\n');
  // List commands or additional info here
  res.end();
});

async function updateHealthInGitHub(amount, operation) {
  const owner = 'tatiang'; // Your GitHub username
  const repo = 'arduino'; // Your repository name
  const path = 'tamagotchi.json'; // Path to the file in the repository

  try {
    // Fetch the current file content
    const getContentResponse = await octokit.repos.getContent({
      owner,
      repo,
      path,
      // Ensure you're targeting the correct branch if not default
      // ref: 'heads/main' // Optional: specify if your file is in a branch other than the default
    });

    // Decode the file content from base64
    const content = Buffer.from(getContentResponse.data.content, 'base64').toString();
    const json = JSON.parse(content);

    // Update the health value based on operation
    if (operation === "increase") {
      json.health += amount;
    } else if (operation === "decrease") {
      json.health = Math.max(0, json.health - amount); // Prevent negative health
    } else {
      throw new Error("Invalid operation");
    }

    // Encode the updated content back to base64
    const updatedContent = Buffer.from(JSON.stringify(json)).toString('base64');

    // Commit the updated file back to GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `${operation} health by ${amount}`,
      content: updatedContent,
      sha: getContentResponse.data.sha, // The SHA of the file to update
    });

    console.log('Health updated successfully on GitHub.');
  } catch (error) {
    console.error('Error updating health on GitHub:', error);
    throw error; // Rethrow or handle the error appropriately
  }
}

app.get('/update-health', async (req, res) => {
    const { amount, operation } = req.query; // Get amount and operation from query parameters
    
    // Convert amount to number and validate operation
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || (operation !== "increase" && operation !== "decrease")) {
        return res.status(400).send("Invalid request parameters");
    }

    try {
        await updateHealthInGitHub(amountNum, operation); // Assuming this function is defined to handle GitHub update
        res.json({ success: true, message: `Health ${operation}d by ${amount}` });
    } catch (error) {
        console.error(`Failed to update health: ${error}`);
        res.status(500).send("Failed to update health");
    }
});

app.post('/reduce-health', async (req, res) => {
  const owner = 'tatiang'; // Replace with your GitHub username
  const repo = 'arduino'; // Replace with your repository name
  const path = 'tamagotchi.json'; // Path to the file in the repository

  try {
    // Fetch the current file content
    const getContentResponse = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    const content = Buffer.from(getContentResponse.data.content, 'base64').toString();
    const json = JSON.parse(content);

    // Update the health value
    json.health = Math.max(0, json.health - 10); // Decrease health by 10, not going below 0

    // Encode the updated content to base64
    const updatedContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');

    // Commit the updated file back to GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: 'Reduce health by 10',
      content: updatedContent,
      sha: getContentResponse.data.sha,
    });

    res.json({ success: true, message: 'Health reduced by 10' });
  } catch (error) {
    console.error('Failed to update health on GitHub:', error);
    res.status(500).json({ success: false, message: 'Failed to update health' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
