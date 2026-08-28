const supabase = require('../lib/supabaseClient');

async function verifyToken(req, res, next) {
  // Every HTTP request can carry headers — key value pairs that contain metadata about the request. The .authorization header is the standard place to put authentication tokens. We read it here.
 const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  };
  //The header value looks like Bearer eyJhbGci.... We only need the token part — the eyJhbGci... — so we strip the Bearer  prefix off.
  const token = authHeader.replace('Bearer ', '');

  try {
    //This is the actual verification. We hand the token to Supabase and it tells us whether it's valid and which user it belongs to.
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
}

module.exports = { verifyToken };