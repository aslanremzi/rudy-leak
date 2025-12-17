const db = require('../config/database');

async function isWhitelisted(userId) {
  const { rowCount } = await db.query('SELECT 1 FROM whitelist WHERE id = $1', [userId]);
  return rowCount > 0;
}

module.exports = isWhitelisted;
