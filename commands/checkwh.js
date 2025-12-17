const db = require('../config/database');
const isAdmin = require('../utils/isAdmin');

const MODERATOR_IDS = process.env.MODERATOR_IDS?.split(',').map(id => id.trim()) || [];

module.exports = {
  name: 'checkwh',
  description: 'List all user IDs in the whitelist',
  async execute(message) {
    const userId = message.author.id;

    if (!isAdmin(userId) && !MODERATOR_IDS.includes(userId)) {
      return message.reply('❌ Bu komutu kullanmak için yetkiniz yok.');
    }

    try {
      const { rows } = await db.query('SELECT id FROM whitelist ORDER BY id ASC');

      if (rows.length === 0) {
        return message.reply('Whitelist boş.');
      }

      const formatted = rows.map(row => `\`${row.id}\``).join('\n');
      await message.reply(`**Whitelist kullanıcı ID'leri:**\n${formatted}`);
    } catch (error) {
      console.error('Whitelist listelenirken hata:', error);
      await message.reply('Whitelist listelenirken hata oluştu.');
    }
  }
};
