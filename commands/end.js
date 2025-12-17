const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'end',
  description: 'Aktif çekilişi sonlandırır ve kazananları seçer.',
  async execute(message) {
    const giveaway = message.client.currentGiveaway;
    const isAdmin = message.client.ADMIN_IDS.includes(message.author.id);
    if (!isAdmin) {
      return message.reply('```bash\n[!] Bu komutu sadece yöneticiler kullanabilir.\n```');
    }

    if (!giveaway) {
      return message.reply('```bash\n[!] Aktif bir çekiliş bulunamadı.\n```');
    }

    const channel = await message.client.channels.fetch(giveaway.channelId);
    const msg = await channel.messages.fetch(giveaway.messageId);
    const reaction = msg.reactions.cache.get('🎉');

    const users = await reaction.users.fetch();
    const participants = users.filter(u => !u.bot).map(u => u);

    if (participants.length === 0) {
      return message.channel.send('```bash\n[!] Katılımcı bulunamadı, kazanan seçilemedi.\n```');
    }

    const winners = [];
    const count = Math.min(giveaway.winnerCount, participants.length);

    while (winners.length < count) {
      const random = participants.splice(Math.floor(Math.random() * participants.length), 1)[0];
      winners.push(random);
    }

    const winnerMentions = winners.map(w => `<@${w.id}>`).join('\n');

    const resultEmbed = new EmbedBuilder()
      .setColor(0x00ffff)
      .setTitle('🎉 ÇEKİLİŞ SONUCU')
      .setDescription(`Kazananlar:\n${winnerMentions}`)
      .setFooter({ text: '[Kali-Linux] Giveaway System' });

    await message.channel.send({ embeds: [resultEmbed] });

    // Reset current giveaway
    message.client.currentGiveaway = null;
  },
};
