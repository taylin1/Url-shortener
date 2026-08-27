const supabase = require('../supabaseClient')

async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed' })
  }
}

module.exports = { verifyToken };