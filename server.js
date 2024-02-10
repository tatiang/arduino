const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
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
