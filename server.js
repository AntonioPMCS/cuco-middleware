// Load environment variables first
require('dotenv').config();

const express = require('express');
const routes = require('./routes/index');
const PORT = process.env.PORT || 3000;

const app = express();

// Use the routes
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
