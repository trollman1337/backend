const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 4000;

// Retrieve access keys from environment variables
const ACCESS_KEYS = process.env.ACCESS_KEYS ? process.env.ACCESS_KEYS.split(',') : [];

// Middleware to check access key
const authenticate = (req, res, next) => {
  const accessKey = req.headers['x-access-key'];
  if (!ACCESS_KEYS.includes(accessKey)) {
    return res.status(403).json({ error: 'Forbidden: Invalid access key' });
  }
  next();
};

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: 'Rate limit exceeded: Too many requests, your IP is blocked for a minute' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Use middlewares
app.use(authenticate); // Authenticate access keys
app.use(limiter); // Apply rate limiting

// Route to fetch content
app.get('/fetch', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL query parameter is required' });
  }

  try {
    const response = await axios.get(url);
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
