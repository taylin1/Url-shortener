const express = require('express')
const router = express.Router()

// POST /api/shorten — coming in Phase 5
router.post('/', function (req, res) {
  res.json({ message: 'shorten route placeholder' })
})

module.exports = router