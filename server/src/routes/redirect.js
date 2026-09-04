const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

// GET /:code — redirects to the original URL and counts the click
router.get('/:code', async function (req, res) {
  const { code } = req.params

  // Look up the short code in the links table
  // Also select expiration fields to check if link is still valid
  const { data: link, error } = await supabase
    .from('links')
    .select('id, original_url, expires_at, max_clicks')
    .eq('short_code', code)
    .single()

  // If no link found with that code, return 404
  if (error || !link) {
    return res.status(404).json({ error: 'Short link not found' })
  }

  // Check if link has expired by date
  if (link.expires_at) {
    const expirationDate = new Date(link.expires_at)
    const now = new Date()
    if (now > expirationDate) {
      return res.status(410).json({ error: 'This link has expired' })
    }
  }

  // Check if link has reached max clicks
  if (link.max_clicks) {
    const { count } = await supabase
      .from('clicks')
      .select('*', { count: 'exact', head: true })
      .eq('link_id', link.id)

    const currentClicks = count || 0
    if (currentClicks >= link.max_clicks) {
      return res.status(410).json({ error: 'This link has expired (click limit reached)' })
    }
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