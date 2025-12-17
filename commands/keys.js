const db = require('../config/database');
const dayjs = require('dayjs');
const isAdmin = require('../utils/isAdmin');

module.exports = {
  name: 'keys',
  description: 'List all active API keys',
  async execute(message) {
    if (!isAdmin(message.author.id)) {
      return message.reply('❌ Bu komutu kullanmak için yetkiniz yok.');
    }

    try {
      const now = new Date();

      const { rows } = await db.query(`
        SELECT key, package_type, used_count, total_limit, expires_at, created_at
        FROM api_keys
        WHERE used_count < total_limit
          AND expires_at > $1
        ORDER BY created_at DESC
      `, [now]);

      if (rows.length === 0) {
        return message.reply('There are no active API keys currently.');
      }

      const formatted = rows.map(k => 
        `Key: \`${k.key}\`
Package: \`${k.package_type}\`
Usage: ${k.used_count}/${k.total_limit}
Expires: \`${dayjs(k.expires_at).format('YYYY-MM-DD HH:mm')}\`
Created: \`${dayjs(k.created_at).format('YYYY-MM-DD HH:mm')}\``
      ).join('\n\n');

      const MAX_LENGTH = 2000; 
      if (formatted.length <= MAX_LENGTH) {
        await message.reply(`**Active API Keys:**\n\n${formatted}`);
      } else {
        const chunks = [];
        let chunk = '';
        for (const line of formatted.split('\n\n')) {
          if ((chunk + '\n\n' + line).length > MAX_LENGTH) {
            chunks.push(chunk);
            chunk = line;
          } else {
            chunk += (chunk ? '\n\n' : '') + line;
          }
        }
        if (chunk) chunks.push(chunk);

        for (const c of chunks) {
          await message.reply(`**Active API Keys:**\n\n${c}`);
        }
      }

    } catch (error) {
      console.error('Error fetching active keys:', error);
      await message.reply('An error occurred while fetching active keys.');
    }
  }
};
