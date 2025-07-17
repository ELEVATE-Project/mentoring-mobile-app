const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 7601;

const basePath = '/mentoring';

// Serve static files from www/
app.use(basePath, express.static(path.join(__dirname, 'www')));

// Serve index.html for SPA routing
app.get(`${basePath}/*`, (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});