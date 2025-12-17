const { PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

const TICKET_CATEGORY_ID = '1378417054981296178'; 
const TICKET_ROLE_ID = '1378440064526188665'; 

module.exports = async function (interaction) {
  const guild = interaction.guild;
  const user = interaction.user;

  const existingChannel = guild.channels.cache.find(c =>
    c.name === `ticket-${user.id}` && c.parentId === TICKET_CATEGORY_ID
  );
  if (existingChannel) {
    return interaction.reply({ 
      content: '```ansi\n\u001b[1;31m[KALI-LINUX]\u001b[0m Zaten açık bir ticket\'ınız var.\n```', 
      flags: MessageFlags.Ephemeral 
    });
  }

  const ticketChannel = await guild.channels.create({
    name: `ticket-${user.id}`,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY_ID,  
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel]
      },
      {
        id: user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory
        ]
      },
      {
        id: TICKET_ROLE_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory
        ]
      }
    ]
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
  );

  await ticketChannel.send({
    content: 
`\
\`\`\`ansi
\u001b[1;32m[RUDY? SERVICEX]\u001b[0m Ticket oluşturuldu: <@${user.id}>
\u001b[1;31m[!]\u001b[0m Kapatmak için aşağıdaki butonu kullan.
\`\`\`
<@&${TICKET_ROLE_ID}>`,
    components: [row]
  });

  await interaction.reply({ 
    content: 
`\
\`\`\`ansi
\u001b[1;32m[RUDY? SERVICEX]\u001b[0m 🎫 Ticket oluşturuldu: <#${ticketChannel.id}>
\u001b[1;31m[!]\u001b[0m Destek için burada bekleyin...
\`\`\``, 
    flags: MessageFlags.Ephemeral 
  });
};
