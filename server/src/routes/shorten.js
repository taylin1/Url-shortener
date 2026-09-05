const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { verifyToken } = require('../middleware/auth');

// Generates a random short code e.g. "abc123"
function generateShortCode(length = 6) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    code += characters[randomIndex]

    
  }

  return code
}

// Validates that the string is a real URL
function isValidUrl(string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Validates that expiresDays is a number between 1 and 5
function isValidExpirationDays(days) {
  return Number.isInteger(days) && days >= 1 && days <= 5
}

// Converts days to a future date string
function daysToExpirationDate(days) {
  const now = new Date()
  const expirationDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return expirationDate.toISOString()
}

// Validates that maxClicks is a positive integer
function isValidMaxClicks(clicks) {
  return Number.isInteger(clicks) && clicks > 0
}

// Validates that name is <= 50 chars
function isValidName(name) {
  if (!name) return true; // optional
  return typeof name === 'string' && name.length <= 50;
}

// POST /api/shorten
router.post('/', verifyToken, async function (req, res) {
  const { url, expiresDays, maxClicks, name } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL. Must start with http:// or https://' });
  }

  // Validate expiration days if provided
  if (expiresDays && !isValidExpirationDays(expiresDays)) {
    return res.status(400).json({ error: 'Expiration must be between 1 and 5 days' });
  }

  // Validate max clicks if provided
  if (maxClicks && !isValidMaxClicks(maxClicks)) {
    return res.status(400).json({ error: 'Max clicks must be a positive integer' });
  }

  // Validate name if provided
  if (name && !isValidName(name)) {
    return res.status(400).json({ error: 'Name must be 50 characters or fewer' });
  }

  const shortCode = generateShortCode()

  const { data, error } = await supabase
    .from('links')
    .insert({
      user_id: req.user.id,
      original_url: url,
      short_code: shortCode,
      name: name || null,
      expires_at: expiresDays ? daysToExpirationDate(expiresDays) : null,
      max_clicks: maxClicks || null
    })
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: 'Failed to create short link' })
  }

  return res.status(201).json({
    id: data.id,
    originalUrl: data.original_url,
    shortCode: data.short_code,
    shortUrl: `${process.env.BASE_URL || 'http://localhost:3001'}/${data.short_code}`,
    name: data.name || null,
    expiresAt: data.expires_at,
    maxClicks: data.max_clicks,
    createdAt: data.created_at
  })
})

module.exports = router;
module.exports.generateShortCode = generateShortCode;
module.exports.isValidUrl = isValidUrl;
module.exports.isValidExpirationDays = isValidExpirationDays;
module.exports.isValidMaxClicks = isValidMaxClicks;
module.exports.isValidName = isValidName;
module.exports.daysToExpirationDate = daysToExpirationDate;