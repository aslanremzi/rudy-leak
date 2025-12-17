const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
  name: 'ticket-setup',
  description: 'Sends the ticket creation message with a button (Admin only)',
  async execute(message) {
    const adminIDsString = process.env.ADMIN_IDS || '';
    const ADMIN_IDS = adminIDsString.split(',').map(id => id.trim());
    
    if (!ADMIN_IDS.includes(message.author.id)) {
      return message.reply({
        content: '```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Yetkiniz yok.\n```'
      });
    }
    
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('🎫 Open Ticket')
        .setStyle(ButtonStyle.Primary)
    );
    
    await message.channel.send({
      content:
`\`\`\`ansi
\u001b[1;32m[RUDY? SERVICEX]\u001b[0m Destek Talebi Oluşturmak İçin Butona Tıklayın
\`\`\``,
      components: [row]
    });
  },
};