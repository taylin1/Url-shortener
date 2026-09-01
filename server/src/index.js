require('dotenv').config(); // Loads the .env file into process.env

const express = require('express');
const cors = require('cors')

const shortenRoute = require('./routes/shorten');
const redirectRoute = require('./routes/redirect');
const linksRoute = require('./routes/links');

const app = express();
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    // and any localhost origin (client dev server can be on any port)
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}))
app.use(express.json())

// Health check
app.get('/health', function (req, res) {
  res.json({ status: 'ok' })
})

// Routes
app.use('/api/shorten', shortenRoute);
app.use('/api/links', linksRoute);
app.use('/', redirectRoute);

app.listen(PORT, function () {
  console.log(`Server running on port ${PORT}`)
});

module.exports = app;