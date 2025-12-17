const { PermissionsBitField } = require('discord.js');

const TICKET_LOG_CATEGORY_ID = '1378449525009547325';

module.exports = async function (interaction) {
  const channel = interaction.channel;

  if (!channel.name.startsWith('ticket-')) {
    return interaction.reply({ content: 'Bu komut sadece ticket kanallarında çalışır.', ephemeral: true });
  }

  const userId = channel.name.split('ticket-')[1];
  const user = await interaction.guild.members.fetch(userId).catch(() => null);

  if (user) {
    await channel.permissionOverwrites.edit(user.id, {
      ViewChannel: false
    });
  }

 
  await channel.setParent(TICKET_LOG_CATEGORY_ID).catch(console.error);

 
  await channel.setName(`closed-${userId}`).catch(console.error);

  await interaction.reply({ content: '✅ Ticket kapatıldı, taşındı ve kapalı olarak yeniden adlandırıldı.', ephemeral: true });
};
