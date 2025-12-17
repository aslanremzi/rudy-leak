const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'giveaway',
  description: 'Rastgele kazananları seçmek için bir çekiliş başlatır.',
  async execute(message, args) {
    const winnerCount = parseInt(args[0], 10);

    if (isNaN(winnerCount) || winnerCount <= 0) {
      return message.reply('```bash\n[!] Lütfen geçerli bir kazanan sayısı girin. Örn: $giveaway 2\n```');
    }

    const isAdmin = message.client.ADMIN_IDS.includes(message.author.id);
    if (!isAdmin) {
      return message.reply('```bash\n[!] Bu komutu sadece yöneticiler kullanabilir.\n```');
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ffff)
      .setTitle('🎉 ÇEKİLİŞ BAŞLADI!')
      .setDescription('Aşağıdaki mesaja 🎉 tepkisi vererek çekilişe katılın.\nKazanan sayısı: `' + winnerCount + '`')
      .setFooter({ text: '[Kali-Linux] Giveaway System' });

    const sentMessage = await message.channel.send({ embeds: [embed] });
    await sentMessage.react('🎉');

    // Store the message ID and winner count globally (you may improve this if needed)
    message.client.currentGiveaway = {
      messageId: sentMessage.id,
      channelId: sentMessage.channel.id,
      winnerCount,
    };
  },
};
