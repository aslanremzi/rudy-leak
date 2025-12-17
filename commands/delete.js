const db = require('../config/database');
const isAdmin = require('../utils/isAdmin');
const MODERATOR_IDS = process.env.MODERATOR_IDS?.split(',').map(id => id.trim()) || [];

module.exports = {
    name: 'delete',
    description: 'Delete an API key by key value',
    async execute(message, args, client) {
        const userId = message.author.id;

        if (!isAdmin(userId) && !MODERATOR_IDS.includes(userId)) {
            return message.reply('```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Bu komutu kullanmak için yetkiniz yok.\n```');
        }

        if (!args[0]) {
            return message.reply('```ansi\n\u001b[1;33m[RUDY? SERVICEX]\u001b[0m Lütfen silmek istediğiniz anahtarı belirtin. Örnek: $delete <key>\n```');
        }

        const keyToDelete = args[0];

        try {
            const result1 = await db.query('SELECT * FROM api_keys WHERE key = $1', [keyToDelete]);
            
            if (result1.rowCount > 0) {
                const keyData = result1.rows[0];
                await db.query('DELETE FROM api_keys WHERE key = $1', [keyToDelete]);
                
                await message.reply(`\`\`\`ansi\n\u001b[1;32m[RUDY? SERVICEX]\u001b[0m Başarıyla \`${keyToDelete}\` anahtarı silindi (api_keys).\n\`\`\``);
                
                try {
                    const logChannel = await client.channels.fetch(process.env.EXO_CHANNEL_ID);
                    if (logChannel && logChannel.isTextBased()) {
                        const logMessage = `**API KEY DELETED**
• **Key:** \`${keyData.key}\`
• **Table:** \`api_keys\`
• **Package Type:** \`${keyData.package_type}\`
• **Created By:** \`${keyData.created_by || 'Bilinmiyor'}\`
• **Command Channel:** \`${message.channel.name} (ID: ${message.channel.id})\``;
                        await logChannel.send(logMessage);
                    }
                } catch (err) {
                    console.error('Log channel fetch/send error:', err);
                }
                return;
            }

            const result2 = await db.query('SELECT * FROM gapi_keys WHERE key = $1', [keyToDelete]);
            
            if (result2.rowCount > 0) {
                const keyData = result2.rows[0];
                await db.query('DELETE FROM gapi_keys WHERE key = $1', [keyToDelete]);
                
                await message.reply(`\`\`\`ansi\n\u001b[1;32m[RUDY? SERVICEX]\u001b[0m Başarıyla \`${keyToDelete}\` anahtarı silindi (gapi_keys).\n\`\`\``);
                
                try {
                    const logChannel = await client.channels.fetch(process.env.EXO_CHANNEL_ID);
                    if (logChannel && logChannel.isTextBased()) {
                        const logMessage = `**GAPI KEY DELETED**
• **Key:** \`${keyData.key}\`
• **Table:** \`gapi_keys\`
• **Package Type:** \`${keyData.package_type || 'Bilinmiyor'}\`
• **Created By:** \`${keyData.created_by || 'Bilinmiyor'}\`
• **Command Channel:** \`${message.channel.name} (ID: ${message.channel.id})\``;
                        await logChannel.send(logMessage);
                    }
                } catch (err) {
                    console.error('Log channel fetch/send error:', err);
                }
                return;
            }

            return message.reply('```ansi\n\u001b[1;33m[RUDY? SERVICEX]\u001b[0m Belirtilen key bulunamadı.\n```');

        } catch (error) {
            console.error('Key silinirken hata:', error);
            await message.reply('```ansi\n\u001b[1;31m[RUDY? SERVICEX]\u001b[0m Anahtar silinirken bir hata oluştu.\n```');
        }
    }
};