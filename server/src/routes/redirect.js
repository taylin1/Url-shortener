const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

// GET /:code — redirects to the original URL and counts the click
router.get('/:code', async function (req, res) {
  const { code } = req.params

  // Look up the short code in the links table
  const { data: link, error } = await supabase
    .from('links')
    .select('id, original_url')
    .eq('short_code', code)
    .single()

  // If no link found with that code, return 404
  if (error || !link) {
    return res.status(404).json({ error: 'Short link not found' })
  }

  // Record the click in the clicks table
  // Each click is a new row with the link_id and a timestamp
  await supabase
    .from('clicks')
    .insert({
      link_id: link.id,
      clicked_at: new Date().toISOString()
    })

  // Redirect the user to the original URL
  return res.redirect(link.original_url)
})

module.exports = router