const db = require('../config/database');
const dayjs = require('dayjs');

async function validateKey(key) {
  let result = await db.query('SELECT * FROM api_keys WHERE key = $1', [key]);
  let apiKey = result.rows[0];
  let tableName = 'api_keys';
  
  if (!apiKey) {
    result = await db.query('SELECT * FROM gapi_keys WHERE key = $1', [key]);
    apiKey = result.rows[0];
    tableName = 'gapi_keys';
  }
  
  if (!apiKey) {
    return { valid: false, reason: 'Geçersiz key', keyData: null };
  }
  
  const now = dayjs();
  if (apiKey.package_type !== 'one-time' && now.isAfter(dayjs(apiKey.expires_at))) {
    return {
      valid: false,
      reason: 'Süresi dolmuş key',
      keyData: { ...apiKey, tableName }
    };
  }
  
  if (apiKey.used_count >= apiKey.total_limit) {
    return {
      valid: false,
      reason: 'Kullanım limiti dolmuş',
      keyData: { ...apiKey, tableName }
    };
  }
  
  return {
    valid: true,
    reason: null,
    keyData: { ...apiKey, tableName }
  };
}

async function incrementUsage(key) {
  let result = await db.query('UPDATE api_keys SET used_count = used_count + 1 WHERE key = $1', [key]);
  
  if (result.rowCount === 0) {
    await db.query('UPDATE gapi_keys SET used_count = used_count + 1 WHERE key = $1', [key]);
  }
}

module.exports = {
  validateKey,
  incrementUsage
};
