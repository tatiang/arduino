const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use the PORT environment variable provided by Render, or default to 3000

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Make sure to set GITHUB_TOKEN in your environment variables
});

// Middleware for parsing request bodies
app.use(express.json());

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/reduce-health', (req, res) => {
  // Your logic to reduce health
  res.json({ success: true, message: 'Health reduced by 10' });
});

// Additional routes here, for example:
// app.use('/api/users', usersRoute);
// app.use('/api/products', productsRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
