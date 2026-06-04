const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Main route — universal app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'FloraCare', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`🌿 FloraCare запущен на порту ${PORT}`);
});
