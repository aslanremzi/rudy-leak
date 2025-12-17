const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'fix',
  description: 'Move ticket to D TICKETS category keeping permissions',
  async execute(message, args) {
   
    const MODERATOR_IDS = process.env.MODERATOR_IDS?.split(',').map(id => id.trim()) || [];
    const ADMIN_IDS = process.env.ADMIN_IDS?.split(',').map(id => id.trim()) || [];

    if (!MODERATOR_IDS.includes(message.author.id) && !ADMIN_IDS.includes(message.author.id)) {
      return message.reply({
        content: '```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Bu komutu kullanma yetkiniz yok.\n```',
      });
    }

    const botMember = message.guild.members.me;

   
    if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels) ||
        !botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply({
        content: '```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Botun yeterli yetkisi yok (Manage Channels, Manage Roles).\n```',
      });
    }

    const channel = message.channel;

    if (!channel.name.startsWith('ticket-')) {
      return message.reply({
        content: '```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Bu komut sadece ticket kanallarında kullanılabilir.\n```',
      });
    }

    try {
      const userId = channel.name.split('ticket-')[1];
      if (!userId) {
        return message.reply({
          content: '```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Ticket sahibi bilgisi bulunamadı.\n```',
        });
      }

      await channel.setParent('1378547446321385473');

      await channel.permissionOverwrites.set([
        {
          id: message.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: userId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: '1378440064526188665',
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ]);

      return message.reply({
        content: '```ansi\n\u001b[1;32m[RUDY? SERVICEX]\u001b[0m Ticket başarıyla "D TICKETS" kategorisine taşındı ve açık kaldı.\n```',
      });
    } catch (error) {
      console.error('Error fixing ticket channel permissions:', error);
      return message.reply({
        content: '```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Ticket taşınırken bir hata oluştu.\n```',
      });
    }
  },
};
