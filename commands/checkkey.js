const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

require('dotenv').config();
const { validateKey } = require('../database/queries');

module.exports = {
  name: 'checkkey',
  description: 'Bir API key\'inin geçerliliğini ve detaylarını kontrol eder.',
  async execute(message, args) {
    const key = args[0];

    if (!key) {
      return message.reply('```ansi\n\u001b[1;31m[RUDY?@raven:~#]\u001b[0m Kullanım: $checkkey <api_key>\n```');
    }

    const result = await validateKey(key);

    if (!result.valid) {
      return message.reply(`\`\`\`diff\n- key error: ${result.reason}\n\`\`\``);
    }

    const { keyData } = result;
    const now = dayjs();
    let timeLeftStr = '—';

    if (keyData.package_type !== 'one-time') {
      const expires = dayjs(keyData.expires_at);
      const diff = expires.diff(now);

      if (diff <= 0) {
  timeLeftStr = 'Süresi dolmuş';
} else {
  const durationObj = dayjs.duration(diff);
  const totalMinutes = Math.floor(durationObj.asMinutes());
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  timeLeftStr = `${days} gün ${hours} saat ${minutes} dakika`;
}


    return message.reply(
      '```ansi\n' +
      '\u001b[1;31m[RUDY?@raven:~#]\u001b[0m 🔍 Key Bilgileri:\n' +
      `\u001b[0m• Paket Türü: ${keyData.package_type}\n` +
      `• Süre: ${timeLeftStr}\n` +
      `• Kullanım: ${keyData.used_count} / ${keyData.total_limit}\n` +
      '```'
    );
  }
}}
