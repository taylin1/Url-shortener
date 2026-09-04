const express = require('express')
const router = express.Router()

// Import the server side Supabase client that uses the service role key
// This gives us full database access without RLS restrictions
const supabase = require('../supabaseClient')

// Import the auth middleware that checks if the user is logged in
// Any route that uses this will require a valid token
const { verifyToken } = require('../middleware/auth')

// GET /api/links
// verifyToken runs first before the main function
// if the token is invalid it never reaches the main function
router.get('/', verifyToken, async function (req, res) {

  // req.user was attached by verifyToken middleware
  // we grab the user's id so we only fetch their links
  const userId = req.user.id
  console.log('Fetching links for user:', userId)

  // Query the links table in Supabase
  // We select specific columns we need — not everything
  const { data: links, error } = await supabase
    .from('links')
    .select(`
      id,
      original_url,
      short_code,
      name,
      expires_at,
      max_clicks,
      created_at
    `)

    // Only return links that belong to this user
    .eq('user_id', userId)

    // Sort by newest first so the dashboard shows recent links at the top
    .order('created_at', { ascending: false })

  // If the database query failed, return a 500 error
  // 500 means something went wrong on the server side
  if (error) {
    console.error('Error fetching links:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return res.status(500).json({ error: 'Failed to fetch links', details: error.message })
  }

  console.log('Successfully fetched links:', links.length)

  // Fetch click counts separately to avoid relational query issues
  // This works even if there's no foreign key relationship defined
  const linkIds = links.map(function (l) { return l.id })
  const clickCounts = {}

  if (linkIds.length > 0) {
    const { data: clicks, error: clicksError } = await supabase
      .from('clicks')
      .select('link_id')
      .in('link_id', linkIds)

    if (!clicksError && clicks) {
      clicks.forEach(function (click) {
        clickCounts[click.link_id] = (clickCounts[click.link_id] || 0) + 1
      })
    }
  }

  // Reformat the data before sending it to React
  // Supabase returns snake_case column names (original_url, short_code)
  // We convert to camelCase (originalUrl, shortCode) which is
  // the JavaScript convention React expects
  const formattedLinks = links.map(function (link) {
    return {
      id: link.id,

      // Rename snake_case to camelCase
      originalUrl: link.original_url,
      shortCode: link.short_code,
      name: link.name || null,

      // Build the full short URL so React doesn't have to construct it
      shortUrl: `http://localhost:3001/${link.short_code}`,

      // Use pre-fetched click counts
      clickCount: clickCounts[link.id] || 0,

      // Include expiration fields
      expiresAt: link.expires_at,
      maxClicks: link.max_clicks,

      createdAt: link.created_at
    }
  })

  // Send the formatted links back to React
  // 200 means the request was successful
  return res.status(200).json(formattedLinks)
})

// DELETE /api/links/:id
// Removes a link owned by the authenticated user
router.delete('/:id', verifyToken, async function (req, res) {
  const userId = req.user.id
  const { id } = req.params

  // Scope the delete to this user so nobody can delete another user's link
  const { data, error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select()

  if (error) {
    return res.status(500).json({ error: 'Failed to delete link' })
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Link not found' })
  }

  return res.status(200).json({ success: true })
})

// PUT /api/links/:id
// Updates a link owned by the authenticated user
// Can update originalUrl, name, expiresAt, and maxClicks
router.put('/:id', verifyToken, async function (req, res) {
  const userId = req.user.id
  const { id } = req.params
  const { originalUrl, name, expiresDays, maxClicks } = req.body

  // Import validation functions from shorten route
  const { isValidUrl, isValidExpirationDays, daysToExpirationDate, isValidName } = require('./shorten')

  // Validate URL if provided
  if (originalUrl && !isValidUrl(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL. Must start with http:// or https://' })
  }

  // Validate expiration days if provided
  if (expiresDays && !isValidExpirationDays(expiresDays)) {
    return res.status(400).json({ error: 'Expiration must be between 1 and 5 days' })
  }

  // Validate max clicks if provided
  if (maxClicks !== undefined && maxClicks !== null) {
    if (!Number.isInteger(maxClicks) || maxClicks <= 0) {
      return res.status(400).json({ error: 'Max clicks must be a positive integer' })
    }
  }

  // Validate name if provided
  if (name && !isValidName(name)) {
    return res.status(400).json({ error: 'Name must be 50 characters or fewer' })
  }

  // Build update object with only provided fields
  const updateData = {}
  if (originalUrl) updateData.original_url = originalUrl
  if (name !== undefined && name !== null) updateData.name = name || null
  if (expiresDays) updateData.expires_at = daysToExpirationDate(expiresDays)
  if (maxClicks !== undefined) updateData.max_clicks = maxClicks

  // If no fields to update, return error
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No fields to update' })
  }

  // Scope the update to this user so nobody can edit another user's link
  const { data, error } = await supabase
    .from('links')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select(`
      id,
      original_url,
      short_code,
      expires_at,
      max_clicks,
      created_at
    `)
    .single()

  if (error) {
    return res.status(500).json({ error: 'Failed to update link' })
  }

  if (!data) {
    return res.status(404).json({ error: 'Link not found' })
  }

  // Fetch click count separately
  const { count } = await supabase
    .from('clicks')
    .select('*', { count: 'exact', head: true })
    .eq('link_id', id)

  // Format and return the updated link
  const formattedLink = {
    id: data.id,
    originalUrl: data.original_url,
    shortCode: data.short_code,
    shortUrl: `http://localhost:3001/${data.short_code}`,
    name: data.name || null,
    clickCount: count || 0,
    expiresAt: data.expires_at,
    maxClicks: data.max_clicks,
    createdAt: data.created_at
  }

  return res.status(200).json(formattedLink)
})

// Export the router so index.js can register it
module.exports = router