const isWhitelisted = require('../utils/isWhitelisted');
const axios = require('axios');
const { validateKey, incrementUsage } = require('../database/queries');
const dayjs = require('dayjs');

const cooldowns = new Map(); 

const ADMIN_IDS = process.env.ADMIN_IDS.split(',');
const MODERATOR_IDS = process.env.MODERATOR_IDS.split(',');

module.exports = {
  name: 'search',
  async execute(message, args, client) {
    const now = Date.now();
    const cooldownAmount = 60 * 1000;

    const isAdmin = ADMIN_IDS.includes(message.author.id);
    const isModerator = MODERATOR_IDS.includes(message.author.id);
    const isPrivileged = isAdmin || isModerator;

    if (!isPrivileged && cooldowns.has(message.author.id)) {
      const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const remaining = Math.ceil((expirationTime - now) / 1000);
        return message.reply(
          '```ansi\n\u001b[1;31m[RUDY?@raven:~#]\u001b[0m Bu komutu tekrar kullanabilmek için ' + remaining + ' saniye beklemelisin.\n```'
        );
      }
    }

    const userId = args[0];
    const apiKey = args[1];

    if (!userId || !apiKey) {
      return message.reply(
        '```ansi\n\u001b[1;31m[RUDY?@raven:~#]\u001b[0m Kullanım: $search <kullanıcı_id> <api_key>\n```'
      );
    }

    if (await isWhitelisted(userId)) {
      return message.reply(
        '```ansi\n\u001b[1;31m[RUDY?@raven:~#]\u001b[0m ❌ Bu kullanıcı ID\'si whitelist\'te ve sorgulanamaz.\n```'
      );
    }

    const keyCheck = await validateKey(apiKey);
    if (!keyCheck.valid) {
      await message.reply(
        `\`\`\`diff\n- key error: ${keyCheck.reason}\n\`\`\``
      );

      try {
        const keyData = keyCheck.keyData;
        const logChannel = await client.channels.fetch(process.env.EXO_CHANNEL_ID);
        if (logChannel && logChannel.isTextBased() && keyData) {
          const logMessage = `**🔒 API KEY EXPIRED OR INVALIDATED**
• **Key:** \`${keyData.key}\`
• **Package Type:** \`${keyData.package_type}\`
• **Expiration Reason:** \`${keyCheck.reason}\`
• **Created By:** \`${keyData.created_by || 'Bilinmiyor'}\`
• **Command Channel:** \`${message.channel.name} (ID: ${message.channel.id})\``;
          await logChannel.send(logMessage);
        }
      } catch (err) {
        console.error('Log channel fetch/send error:', err);
      }

      return;
    }

    // %50 error atma
    // if (message.author.id === '843136836947410945' && Math.random() < 0.5) {
    //   return message.channel.send(
    //     '```ansi\n\u001b[1;31m[RUDY?@raven:~#]\u001b[0m ❌ Kullanıcı bulunamadı.\n```'
    //   );
    // }

    try {
      const response = await axios.get('https://cyr0nix.com/api/check', {
        headers: {
          'Authorization': process.env.AUTH_KEY,
          'user-id': userId
        }
      });

      await incrementUsage(apiKey);

      if (!isPrivileged) {
        cooldowns.set(message.author.id, now);
      }

      message.channel.send(
        '```ansi\n\u001b[1;31m[RUDY?@raven:~#]\u001b[0m ✅ Sorgu Sonucu:\n' +
        JSON.stringify(response.data, null, 2) +
        '\n```'
      );
    } catch (error) {
      console.error(error);
      message.channel.send(
        '```ansi\n\u001b[1;31m[RUDY?@raven:~#]\u001b[0m ❌ Kullanıcı bulunamadı.\n```'
      );
    }
  }
};
