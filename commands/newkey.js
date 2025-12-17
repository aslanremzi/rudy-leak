const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const dayjs = require('dayjs');
const isAdmin = require('../utils/isAdmin');

const packageConfigs = {
  'one-time': { days: 1, limit: 1 },
  'standard': { days: 1, limit: 5 },
  'advanced': { days: 7, limit: 70 },
  'pro': { days: 30, limit: 320 },
  'business': { days: 90, limit: 1000 },
  'enterprise': { days: 365, limit: 4000 }
};

module.exports = {
  name: 'newkey',
  description: 'Generate a new API key',
  async execute(message, args, client) {
    if (!isAdmin(message.author.id)) {
      return message.reply('❌ Bu komutu kullanmak için yetkiniz yok.');
    }

    try {
      const package_type = args[0] || 'standard';

      if (!packageConfigs[package_type]) {
        return message.reply(`Invalid package type. Choose one of: ${Object.keys(packageConfigs).join(', ')}`);
      }

      const { days, limit } = packageConfigs[package_type];
      const newKey = uuidv4();
      const createdAt = new Date();
      const expiresAt = dayjs(createdAt).add(days, 'day').toDate();

      await db.query(
        `INSERT INTO api_keys (key, package_type, total_limit, used_count, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newKey, package_type, limit, 0, createdAt, expiresAt]
      );

      await message.reply(`API key generated: \`${newKey}\``);

      const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('Log channel not found');
        return;
      }

      const logMessage = `**API KEY GENERATED**
• **Key:** \`${newKey}\`
• **Package Type:** \`${package_type}\`
• **Total Usage Limit:** \`${limit} requests\`
• **Created At:** \`${createdAt.toISOString()}\`
• **Expires At:** \`${expiresAt.toISOString()}\`
• **Created By:** \`${message.author.tag} (${message.author.id})\`
• **Command Channel:** \`${message.channel.name} (ID: ${message.channel.id})\`
• **Server:** \`${message.guild ? message.guild.name : 'DM'} (ID: ${message.guild ? message.guild.id : 'N/A'})\``;

      await logChannel.send(logMessage);

    } catch (error) {
      console.error('Error generating API key:', error);
      await message.reply('An error occurred while generating the API key.');
    }
  }
};
