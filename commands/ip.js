const axios = require('axios');
require('dotenv').config();

module.exports = {
  name: 'ip',
  description: 'Belirtilen IP adresinin konum ve proxy bilgilerini getirir.',
  async execute(message, args) {
    const ip = args[0];
    if (!ip) {
      return message.reply('```bash\nKullanım: $ip <IPv4>\n```');
    }

    try {
      const apiKey = process.env.IP2_API_KEY;
      const response = await axios.get(`https://api.ip2location.io/?key=${apiKey}&ip=${ip}`);
      const data = response.data;

      const result = `
\`\`\`ansi
\u001b[1;31m[RUDY?@raven:~#]\u001b[0m 🌐 IP Bilgisi

• IP: ${data.ip}
• Ülke: ${data.country_name} (${data.country_code})
• Şehir: ${data.city || '—'}
• Bölge: ${data.region_name || '—'}
• Posta Kodu: ${data.zip_code || '—'}
• ISP: ${data.isp || '—'}

\u001b[1;33mProxy Bilgisi\u001b[0m
• Proxy: ${data.is_proxy === 'true' ? '✅ Evet' : '❌ Hayır'}
• Proxy Türü: ${data.proxy_type || '—'}
• VPN: ${data.is_vpn === 'true' ? '✅ Evet' : '❌ Hayır'}
• Hosting: ${data.is_hosting === 'true' ? '✅ Evet' : '❌ Hayır'}
\`\`\`
      `.trim();

      await message.reply(result);
    } catch (error) {
      console.error('IP sorgu hatası:', error);
      return message.reply('```bash\n[!] IP sorgusu sırasında bir hata oluştu.\n```');
    }
  }
};
