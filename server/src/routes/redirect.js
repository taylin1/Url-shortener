const express = require('express')
const router = express.Router()

// GET /:code — coming in Phase 6
router.get('/:code', function (req, res) {
  res.json({ message: 'redirect route placeholder' })
})

module.exports = router