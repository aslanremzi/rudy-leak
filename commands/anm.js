require('dotenv').config();

const CATEGORY_ID = '1378547446321385473';

const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [];

module.exports = {
  name: 'anm',
  description: 'Sends a Kali-themed message to all channels under a specific category (Admin only).',
  async execute(message, args, client) {
    if (!ADMIN_IDS.includes(message.author.id)) {
      return message.reply('Bu komutu kullanmak için yetkiniz yok.');
    }

    const msg = args.join(' ');
    if (!msg) return message.reply('Lütfen bir mesaj girin. Örnek: `$anm Bot bakımda!`');

    const kaliMessage =
      '```ansi\n' +
      '\u001b[1;31m[RUDY?@raven:~#]\u001b[0m ' + msg + '\n' +
      '```';

    const category = message.guild.channels.cache.get(CATEGORY_ID);
    if (!category || category.type !== 4) {
      return message.reply('Kategori bulunamadı veya geçersiz.');
    }

    const channels = category.children.cache.filter(c => c.isTextBased());

    for (const [id, channel] of channels) {
      try {
        await channel.send(kaliMessage);
      } catch (error) {
        console.error(`Mesaj gönderilemedi: ${channel.name}`, error);
      }
    }

    return message.reply('Mesaj tüm kanallara gönderildi.');
  },
};
