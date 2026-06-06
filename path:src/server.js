const express = require('express');
const config = require('./config'); // Assuming a config file to retrieve default configurations
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Sample API Endpoint
app.get('/api/status', (req, res) => {
  const model = config.getDefaultModel();
  const provider = config.getDefaultProvider();
  res.json({
    message: 'Server is running',
    model: model,
    provider: provider,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});