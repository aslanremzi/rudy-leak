const MODERATOR_IDS = process.env.MODERATOR_IDS?.split(',').map(id => id.trim()) || [];
const isAdmin = require('../utils/isAdmin');

const TICKET_LOG_CATEGORY_ID = process.env.TICKET_LOG_CHANNEL;

module.exports = {
  name: 'close',
  description: 'Ticketi kapatır (admin/mod komutu)',
  async execute(message) {
    const userId = message.author.id;

    if (!isAdmin(userId) && !MODERATOR_IDS.includes(userId)) {
      return message.reply({
        content: '```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Bu komutu kullanmak için yetkiniz yok.\n```',
      });
    }

    if (!message.channel.name.startsWith('ticket-')) {
      return message.reply({
        content: '```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Bu komut sadece ticket kanallarında kullanılabilir.\n```',
      });
    }

    try {
      const targetUserId = message.channel.name.split('ticket-')[1];
      if (!targetUserId) {
        return message.reply({
          content: '```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Ticket sahibi bilgisi bulunamadı.\n```',
        });
      }

      const guildMember = await message.guild.members.fetch(targetUserId).catch(() => null);

      if (guildMember) {
        await message.channel.permissionOverwrites.edit(guildMember.user.id, {
          ViewChannel: false,
        });
      }

      await message.channel.setParent(TICKET_LOG_CATEGORY_ID);
      await message.channel.setName(`closed-${targetUserId}`);

      return message.reply({
        content: '```ansi\n\u001b[1;32m[RUDY? SERVICEX]\u001b[0m ✅ Ticket kapatıldı, loga taşındı ve yeniden adlandırıldı.\n```',
      });
    } catch (error) {
      console.error('Error closing ticket:', error);
      return message.reply({
        content: '```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Ticket kapatılırken bir hata oluştu.\n```',
      });
    }
  },
};
