const express = require('express')
const router = express.Router()

// GET /api/links — coming in Phase 6
router.get('/', function (req, res) {
  res.json({ message: 'links route placeholder' })
})

module.exports = router