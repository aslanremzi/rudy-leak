const db = require('../config/database');
const isAdmin = require('../utils/isAdmin');

const MODERATOR_IDS = process.env.MODERATOR_IDS?.split(',').map(id => id.trim()) || [];

module.exports = {
  name: 'deletewh',
  description: 'Remove a user ID from the whitelist',
  async execute(message, args) {
    const userId = message.author.id;

    if (!isAdmin(userId) && !MODERATOR_IDS.includes(userId)) {
      return message.reply('```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Bu komutu kullanmak için yetkiniz yok.\n```');
    }

    const targetId = args[0];
    if (!targetId) {
      return message.reply('```ansi\n\u001b[1;33m[RUDY? SERVICEX]\u001b[0m Lütfen silmek istediğiniz kullanıcı ID\'sini belirtin.\n```');
    }

    try {
      const { rowCount } = await db.query(
        'DELETE FROM whitelist WHERE id = $1',
        [targetId]
      );

      if (rowCount === 0) {
        return message.reply('```ansi\n\u001b[1;33m[RUDY? SERVICEX]\u001b[0m Belirtilen kullanıcı ID whitelist\'te bulunamadı.\n```');
      }

      await message.reply(`\`\`\`ansi\n\u001b[1;32m[RUDY? SERVICEX]\u001b[0m Kullanıcı ID \`${targetId}\` whitelist'ten kaldırıldı.\n\`\`\``);
    } catch (error) {
      console.error('Whitelist silinirken hata:', error);
      await message.reply('```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Whitelist silinirken bir hata oluştu.\n```');
    }
  }
};
