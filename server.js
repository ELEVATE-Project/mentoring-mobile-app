const express = require('express');
const path = require('path');
const app = express();
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:8100;");
  next();
});
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