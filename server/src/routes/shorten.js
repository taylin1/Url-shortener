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

// Validates that expiresAt is a future date
function isValidExpirationDate(dateString) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    return date > now
  } catch {
    return false
  }
}

// Validates that maxClicks is a positive integer
function isValidMaxClicks(clicks) {
  return Number.isInteger(clicks) && clicks > 0
}

// POST /api/shorten
router.post('/', verifyToken, async function (req, res) {
  const { url, expiresAt, maxClicks } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL. Must start with http:// or https://' });
  }

  // Validate expiration date if provided
  if (expiresAt && !isValidExpirationDate(expiresAt)) {
    return res.status(400).json({ error: 'Expiration date must be in the future' });
  }

  // Validate max clicks if provided
  if (maxClicks && !isValidMaxClicks(maxClicks)) {
    return res.status(400).json({ error: 'Max clicks must be a positive integer' });
  }

  const shortCode = generateShortCode()

  const { data, error } = await supabase
    .from('links')
    .insert({
      user_id: req.user.id,
      original_url: url,
      short_code: shortCode,
      expires_at: expiresAt || null,
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
    shortUrl: `http://localhost:3001/${data.short_code}`,
    expiresAt: data.expires_at,
    maxClicks: data.max_clicks,
    createdAt: data.created_at
  })
})

module.exports = router;
module.exports.generateShortCode = generateShortCode;
module.exports.isValidUrl = isValidUrl;