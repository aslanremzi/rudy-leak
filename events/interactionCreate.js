const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, MessageFlags, ButtonBuilder, ButtonStyle } = require('discord.js');
const { validateKey, incrementUsage } = require('../database/queries');
const axios = require('axios');
const isWhitelisted = require('../utils/isWhitelisted');
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);


const API_BASE_URL = process.env.DISCORD_API_URL;
const GITHUB_API = process.env.GITHUB_API_URL;
const USER_ID_PATTERN = /^\d{17,19}$/;
const IP_PATTERN = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const TIMEOUT = 10000;

const cooldowns = new Map();
const COOLDOWN_AMOUNT = 60 * 1000;

const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [];
const MODERATOR_IDS = process.env.MODERATOR_IDS ? process.env.MODERATOR_IDS.split(',') : [];


const processedInteractions = new Set();

module.exports = (client) => {
    client.on(Events.InteractionCreate, async interaction => {

        const interactionKey = `${interaction.id}-${interaction.user.id}`;
        if (processedInteractions.has(interactionKey)) {
            return;
        }
        processedInteractions.add(interactionKey);


        setTimeout(() => {
            processedInteractions.delete(interactionKey);
        }, 5 * 60 * 1000);

        try {
            if (interaction.isButton()) {
                await handleButtonInteraction(interaction, client);
            } else if (interaction.isModalSubmit()) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }
                await handleModalSubmit(interaction, client);
            }
        } catch (error) {
            //console.error('Interaction error:', error);
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({ content: '❌ Bir hata oluştu.', flags: MessageFlags.Ephemeral });
                } catch (e) {
                    console.error('Failed to send error response:', e);
                }
            } else if (interaction.deferred) {
                try {
                    await interaction.editReply({ content: '❌ Bir hata oluştu.' });
                } catch (e) {
                    console.error('Failed to edit deferred reply:', e);
                }
            }
        }
    });
};

async function handleButtonInteraction(interaction, client) {
    if (interaction.customId.startsWith('start_query_gapi:')) {
        return await handleSearchQuery2(interaction, client);
    }
    else if (interaction.customId.startsWith('start_query:')) {
        await handleSearchQuery(interaction, client);
    } else if (interaction.customId.startsWith('key_info:')) {
        await handleKeyInfo(interaction, client);
    } else if (interaction.customId.startsWith('crack_base64:')) {
        await handleCrackBase64(interaction, client);
    } else if (interaction.customId.startsWith('ip_lookup:')) {
        await handleIpLookup(interaction, client);
    } else if (interaction.customId === 'open_ticket' || interaction.customId.startsWith('open_ticket')) {
        await handleCreateTicket(interaction, client);
    } else if (interaction.customId === 'close_ticket') {
        await handleCloseTicket(interaction, client);
    } else {
        console.log(`Unknown button interaction: ${interaction.customId}`);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '🚫 Bilinmeyen buton etkileşimi.', flags: MessageFlags.Ephemeral });
        }
    }
}

async function handleSearchQuery(interaction, client) {
    const apiKey = interaction.customId.split(':')[1];
    if (!apiKey) return;

    const userId = interaction.user.id;
    const isAdmin = ADMIN_IDS.includes(userId);
    const isModerator = MODERATOR_IDS.includes(userId);
    const isPrivileged = isAdmin || isModerator;

    if (!isPrivileged && cooldowns.has(userId)) {
        const now = Date.now();
        const expirationTime = cooldowns.get(userId) + COOLDOWN_AMOUNT;

        if (now < expirationTime) {
            const remaining = Math.ceil((expirationTime - now) / 1000);
            return await interaction.reply({
                content: `🕒 Bu komutu tekrar kullanabilmek için ${remaining} saniye beklemelisin.`,
                flags: MessageFlags.Ephemeral
            });
        }
    }

    const modal = new ModalBuilder()
        .setCustomId(`search_modal:${apiKey}`)
        .setTitle('Kullanıcı Arama');

    const userIdInput = new TextInputBuilder()
        .setCustomId('user_id_input')
        .setLabel("Kullanıcı ID'sini girin")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('123456789012345678')
        .setMinLength(17)
        .setMaxLength(19)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(userIdInput));

    try {
        await interaction.showModal(modal);
    } catch (error) {
        // console.error('Modal error:', error);
    }
}
async function handleSearchQuery2(interaction, client) {
    const apiKey = interaction.customId.split(':')[1];
    if (!apiKey) return;

    const userId = interaction.user.id;
    const isAdmin = ADMIN_IDS.includes(userId);
    const isModerator = MODERATOR_IDS.includes(userId);
    const isPrivileged = isAdmin || isModerator;

    if (!isPrivileged && cooldowns.has(userId)) {
        const now = Date.now();
        const expirationTime = cooldowns.get(userId) + COOLDOWN_AMOUNT;

        if (now < expirationTime) {
            const remaining = Math.ceil((expirationTime - now) / 1000);
            return await interaction.reply({
                content: `🕒 Bu komutu tekrar kullanabilmek için ${remaining} saniye beklemelisin.`,
                flags: MessageFlags.Ephemeral
            });
        }
    }

    const modal = new ModalBuilder()
        .setCustomId(`search_modal2:${apiKey}`)
        .setTitle('Kullanıcı Arama');

    const userIdInput = new TextInputBuilder()
        .setCustomId('user_id_input')
        .setLabel("Github kullanıcı adı giriniz.")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Username')
        .setMinLength(1)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(userIdInput));

    try {
        await interaction.showModal(modal);
    } catch (error) {
        // console.error('Modal error:', error);
    }
}

async function handleCreateTicket(interaction, client) {
    try {

        if (interaction.replied || interaction.deferred) {
            return;
        }


        await interaction.reply({
            content: '🔄 Bilet oluşturuluyor...',
            flags: MessageFlags.Ephemeral
        });

        if (!interaction.guild) {
            return await interaction.editReply({
                content: '🚫 Ticket sadece sunucularda oluşturulabilir.'
            });
        }


        const existingTicket = interaction.guild.channels.cache.find(
            channel => channel.name === `ticket-${interaction.user.id}`
        );

        if (existingTicket) {
            return await interaction.editReply({
                content: `🚫 Zaten açık bir biletiniz var: ${existingTicket}`
            });
        }


        const TICKETS_CATEGORY_ID = '1378417054981296178';
        const SUPPORT_ROLE_ID = '1378440064526188665';
        let ticketsCategory = null;

        try {
            ticketsCategory = await interaction.guild.channels.fetch(TICKETS_CATEGORY_ID);
        } catch (error) {
            console.error('Failed to fetch tickets category:', error);
        }


        const permissionOverwrites = [
            {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: interaction.user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                ],
            },
            {
                id: SUPPORT_ROLE_ID,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.ManageMessages,
                ],
            }
        ];


        for (const adminId of ADMIN_IDS) {
            if (adminId && adminId.trim()) {
                try {
                    const member = await interaction.guild.members.fetch(adminId.trim()).catch(() => null);
                    if (member) {
                        permissionOverwrites.push({
                            id: adminId.trim(),
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                                PermissionFlagsBits.ManageMessages,
                            ],
                        });
                    }
                } catch (error) {
                    console.log(`Admin ID ${adminId} not found in guild`);
                }
            }
        }


        for (const modId of MODERATOR_IDS) {
            if (modId && modId.trim()) {
                try {
                    const member = await interaction.guild.members.fetch(modId.trim()).catch(() => null);
                    if (member) {
                        permissionOverwrites.push({
                            id: modId.trim(),
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                            ],
                        });
                    }
                } catch (error) {
                    console.log(`Moderator ID ${modId} not found in guild`);
                }
            }
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.id}`,
            type: ChannelType.GuildText,
            topic: `Ticket created by ${interaction.user.tag} (${interaction.user.id})`,
            parent: TICKETS_CATEGORY_ID,
            permissionOverwrites: permissionOverwrites,
        });

        const closeButton = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('🔒 Bileti Kapat')
            .setStyle(ButtonStyle.Danger);

        const buttonRow = new ActionRowBuilder()
            .addComponents(closeButton);

        const welcomeMessage = `🎫 **Destek Bileti Oluşturuldu**

Merhaba ${interaction.user}, destek biletiniz başarıyla oluşturuldu!
<@&1378440064526188665> 'leri en kısa sürede sizinle ilgikenecektir.

**Not:** Bu bileti kapatmak için aşağıdaki butona tıklayın.`;

        await ticketChannel.send({
            content: welcomeMessage,
            components: [buttonRow]
        });

        await interaction.editReply({
            content: `✅ Destek biletiniz oluşturuldu: ${ticketChannel}`
        });

    } catch (error) {
        //console.error('Create ticket error:', error);

        try {
            if (interaction.deferred && !interaction.replied) {
                await interaction.editReply({
                    content: '❌ Bilet oluşturulurken bir hata oluştu.'
                });
            } else if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ Bilet oluşturulurken bir hata oluştu.',
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (editError) {
            console.error('Failed to send error response:', editError);
        }
    }
}

async function handleCloseTicket(interaction, client) {
    try {

        if (interaction.replied || interaction.deferred) {
            return;
        }
        await interaction.reply({
            content: '🔄 Bilet kapatılıyor...',
            flags: MessageFlags.Ephemeral
        });
        const channel = interaction.channel;


        if (!channel.name.startsWith('ticket-') || !channel.topic?.includes('Ticket created by')) {
            return await interaction.editReply({
                content: '🚫 Bu komut sadece ticket kanallarında kullanılabilir.'
            });
        }

        const ticketUserId = channel.topic?.match(/\((\d{17,19})\)/)?.[1] || channel.name.replace('ticket-', '');


        const isTicketOwner = interaction.user.id === ticketUserId;
        const isAdmin = ADMIN_IDS.includes(interaction.user.id);
        const isModerator = MODERATOR_IDS.includes(interaction.user.id);

        if (!isTicketOwner && !isAdmin && !isModerator) {
            return await interaction.editReply({
                content: '🚫 Bu bileti sadece sahibi veya yetkililer kapatabilir.'
            });
        }


        await interaction.editReply({
            content: '✅ Bilet kapatılıyor ve arşivleniyor...'
        });

        const CLOSED_TICKETS_CATEGORY_ID = process.env.TICKET_LOG_CHANNEL;

        try {

            await channel.edit({
                name: `closed-${ticketUserId}`,
                parent: CLOSED_TICKETS_CATEGORY_ID,
                permissionOverwrites: [
                    {
                        id: channel.guild.roles.everyone.id,
                        deny: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                    },
                    {
                        id: ticketUserId,
                        deny: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                    }
                ]
            });

            await interaction.editReply({
                content: '✅ Bilet başarıyla kapatıldı ve arşivlendi.'
            });
        } catch (error) {
            console.error('Failed to close ticket:', error);
            await interaction.editReply({
                content: '❌ Bilet kapatılırken bir hata oluştu.'
            });
        }

    } catch (error) {
        console.error('Close ticket error:', error);

        try {
            if (interaction.deferred && !interaction.replied) {
                await interaction.editReply({
                    content: '❌ Bilet kapatılırken bir hata oluştu.'
                });
            } else if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ Bilet kapatılırken bir hata oluştu.',
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (editError) {
            console.error('Failed to send error response:', editError);
        }
    }
}

async function handleKeyInfo(interaction, client) {
    const apiKey = interaction.customId.split(':')[1];
    if (!apiKey) {
        return await interaction.reply({
            content: '🚫 Geçersiz API anahtarı.',
            flags: MessageFlags.Ephemeral
        });
    }

    try {
        const result = await validateKey(apiKey);

        if (!result.valid) {
            return await interaction.reply({
                content: `🚫 Key hatası: ${result.reason}`,
                flags: MessageFlags.Ephemeral
            });
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
        }

        const keyInfoMessage = `📋 **Key Bilgileri:**
**Package:** ${keyData.package_type}
**Usage:** ${keyData.used_count} / ${keyData.total_limit}
**Time:** ${timeLeftStr}`;

        await interaction.reply({
            content: keyInfoMessage,
            flags: MessageFlags.Ephemeral
        });

    } catch (error) {
        console.error('Key info error:', error);
        await interaction.reply({
            content: '❌ Key bilgileri alınırken hata oluştu.',
            flags: MessageFlags.Ephemeral
        });
    }
}

async function handleCrackBase64(interaction, client) {
    const apiKey = interaction.customId.split(':')[1];
    if (!apiKey) {
        return await interaction.reply({
            content: '🚫 Geçersiz API anahtarı.',
            flags: MessageFlags.Ephemeral
        });
    }

    const modal = new ModalBuilder()
        .setCustomId(`crack_modal:${apiKey}`)
        .setTitle('Base64 Crack Tool');

    const base64Input = new TextInputBuilder()
        .setCustomId('base64_input')
        .setLabel('Base64 String\'ini girin')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('SGVsbG8gV29ybGQ=')
        .setMinLength(1)
        .setMaxLength(4000)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(base64Input));

    try {
        await interaction.showModal(modal);
    } catch (error) {
        console.error('Crack modal error:', error);
    }
}

async function handleIpLookup(interaction, client) {
    const apiKey = interaction.customId.split(':')[1];
    if (!apiKey) {
        return await interaction.reply({
            content: '🚫 Geçersiz API anahtarı.',
            flags: MessageFlags.Ephemeral
        });
    }

    const modal = new ModalBuilder()
        .setCustomId(`ip_modal:${apiKey}`)
        .setTitle('IP Adresi Sorgula');

    const ipInput = new TextInputBuilder()
        .setCustomId('ip_input')
        .setLabel('IP Adresini girin')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('192.168.1.1')
        .setMinLength(7)
        .setMaxLength(15)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(ipInput));

    try {
        await interaction.showModal(modal);
    } catch (error) {
        console.error('IP modal error:', error);
    }
}

async function handleSearchModalSubmit(interaction, client) {
    const apiKey = interaction.customId.split(':')[1];
    const targetUserId = interaction.fields.getTextInputValue('user_id_input').trim();
    const requestUserId = interaction.user.id;

    if (!apiKey || apiKey.length < 10) {
        return await interaction.editReply({ content: '🚫 Geçersiz API anahtarı formatı.' });
    }

    if (!USER_ID_PATTERN.test(targetUserId)) {
        return await interaction.editReply({ content: '🚫 Geçersiz kullanıcı ID formatı.' });
    }

    try {
        const whitelisted = await isWhitelisted(targetUserId);
        if (whitelisted) {
            return await interaction.editReply({
                content: '🚫 Bu kullanıcı ID\'si whitelist\'te ve sorgulanamaz.'
            });
        }

        const keyValidation = await validateKey(apiKey);

        if (!keyValidation.valid) {
            await logInvalidKeyAttempt(client, keyValidation, apiKey, interaction);

            return await interaction.editReply({
                content: `🚫 API anahtarı geçersiz: ${keyValidation.reason}`
            });
        }

        if (keyValidation.keyData.used_count >= keyValidation.keyData.total_limit) {
            return await interaction.editReply({ content: '🚫 API kullanım limiti doldu.' });
        }

        const apiResult = await performQuery(apiKey, targetUserId);

        if (apiResult.success) {
            await incrementUsage(apiKey);

            const isAdmin = ADMIN_IDS.includes(requestUserId);
            const isModerator = MODERATOR_IDS.includes(requestUserId);
            const isPrivileged = isAdmin || isModerator;

            if (!isPrivileged) {
                cooldowns.set(requestUserId, Date.now());
            }

            const base64Input = apiResult.data.data.email;
            const decodedBuffer = Buffer.from(base64Input, 'base64');
            const decodedText = decodedBuffer.toString('utf8');
            const ipAddress = apiResult.data.data.ip;

            let ipDetailsSection = '';

            try {
                const ip2ApiKey = process.env.IP2_API_KEY;
                if (!ip2ApiKey) {
                    ipDetailsSection = '\n\u001b[1;31m🌐 IP Detayları\u001b[0m\n• ⚠️ IP2Location API anahtarı yapılandırılmamış';
                } else {
                    const response = await axios.get(`https://api.ip2location.io/?key=${ip2ApiKey}&ip=${ipAddress}`, {
                        timeout: 10000
                    });

                    const ipData = response.data;

                    if (ipData.error) {
                        ipDetailsSection = `\n\u001b[1;31m🌐 IP Detayları\u001b[0m\n• ❌ IP sorgu hatası: ${ipData.error.error_message}`;
                    } else {
                        ipDetailsSection = `
\u001b[1;32m🌐 IP Detayları\u001b[0m
• IP: ${ipData.ip}
• Ülke: ${ipData.country_name} (${ipData.country_code})
• Şehir: ${ipData.city || '—'}
• Bölge: ${ipData.region_name || '—'}
• Posta Kodu: ${ipData.zip_code || '—'}
• ISP: ${ipData.isp || '—'}

\u001b[1;33m🔒 Proxy Bilgisi\u001b[0m
• Proxy: ${ipData.is_proxy === 'true' ? '✅ Evet' : '❌ Hayır'}
• Proxy Türü: ${ipData.proxy_type || '—'}
• VPN: ${ipData.is_vpn === 'true' ? '✅ Evet' : '❌ Hayır'}
• Hosting: ${ipData.is_hosting === 'true' ? '✅ Evet' : '❌ Hayır'}`;
                    }
                }
            } catch (error) {
                let errorMessage = 'IP sorgusu sırasında bir hata oluştu';

                if (error.response?.status === 401) {
                    errorMessage = 'IP2Location API anahtarı geçersiz';
                } else if (error.response?.status === 429) {
                    errorMessage = 'IP sorgu limiti aşıldı';
                } else if (error.code === 'ECONNABORTED') {
                    errorMessage = 'IP sorgu zaman aşımı';
                }

                ipDetailsSection = `\n\u001b[1;31m🌐 IP Detayları\u001b[0m\n• ❌ ${errorMessage}`;
            }

            const result = `
\`\`\`ansi
\u001b[1;31m[RUDY?@raven:~#]\n
\u001b[0m 📊 Kullanıcı Bilgisi
• Email: ${decodedText}
• Connections: ${apiResult.data.data.connections}
• Query Count: ${apiResult.data.queryCount}
${ipDetailsSection}

\`\`\`
  `.trim();

            await interaction.editReply({ content: result });
        } else {
            await interaction.editReply({ content: apiResult.error || '❌ Kullanıcı bulunamadı.' });
        }
    } catch (error) {
        console.error('Modal submit error:', error);
        await interaction.editReply({ content: '❌ İşlem hatası.' });
    }
}

async function handleSearchModalSubmit2(interaction, client) {
    const apiKey = interaction.customId.split(':')[1];
    const targetUserId = interaction.fields.getTextInputValue('user_id_input').trim();
    const requestUserId = interaction.user.id;

    if (!apiKey || apiKey.length < 10) {
        return await interaction.editReply({ content: '🚫 Geçersiz API anahtarı formatı.' });
    }

    try {
        const keyValidation = await validateKey(apiKey);

        if (!keyValidation.valid) {
            await logInvalidKeyAttempt(client, keyValidation, apiKey, interaction);

            return await interaction.editReply({
                content: `🚫 API anahtarı geçersiz: ${keyValidation.reason}`
            });
        }

        if (keyValidation.keyData.used_count >= keyValidation.keyData.total_limit) {
            return await interaction.editReply({ content: '🚫 API kullanım limiti doldu.' });
        }

        const apiResult = await performQuery2(apiKey, targetUserId);

        if (apiResult.success) {
            await incrementUsage(apiKey);

            const isAdmin = ADMIN_IDS.includes(requestUserId);
            const isModerator = MODERATOR_IDS.includes(requestUserId);
            const isPrivileged = isAdmin || isModerator;

            if (!isPrivileged) {
                cooldowns.set(requestUserId, Date.now());
            }

            const data = apiResult.data.data || apiResult.data;
            const emailEntries = Object.entries(data.emailCount || {});

            let emailSection = '';
            if (emailEntries.length > 0) {
                emailSection = '\n\u001b[1;36m📧 Email Bilgileri\u001b[0m\n' +
                    emailEntries.map(([email, count]) => `• ${email}`).join('\n');
            } else {
                emailSection = '\n\u001b[1;36m📧 Email Bilgileri\u001b[0m\n• Mail bulunamadı!';
            }

            const result = `
\`\`\`ansi
\u001b[1;31m[RUDY?@raven:~#]\n
\u001b[0m📊 Github Kullanıcı Bilgisi\n
• Kullanıcı Adı: ${data.username}
• Konum: ${data.location || '—'}
• Twitter: ${data.twitter_username || '—'}\n${emailSection}
\`\`\`
      `.trim();

            await interaction.editReply({ content: result });
        } else {
            await interaction.editReply({ content: apiResult.error || '❌ Kullanıcı bulunamadı.' });
        }
    } catch (error) {
        console.error('Modal submit error:', error);
        await interaction.editReply({ content: '❌ İşlem hatası.' });
    }
}

async function handleCrackModalSubmit(interaction, client) {
    const base64Input = interaction.fields.getTextInputValue('base64_input').trim();

    if (!base64Input) {
        return await interaction.editReply({
            content: '🚫 Base64 string boş olamaz.'
        });
    }

    try {
        const decodedBuffer = Buffer.from(base64Input, 'base64');
        const decodedText = decodedBuffer.toString('utf8');

        const maxOutputLength = 1800;
        let displayText = decodedText;
        let truncated = false;

        if (decodedText.length > maxOutputLength) {
            displayText = decodedText.substring(0, maxOutputLength);
            truncated = true;
        }

        const response = `\`\`\`
[RUDY? UTF-8 Crack]

Input:
${base64Input.length > 200 ? base64Input.substring(0, 200) + '...' : base64Input}

Decoded Output:
${displayText}${truncated ? '\n\n[Output truncated - too long]' : ''}
\`\`\``;

        await interaction.editReply({ content: response });

    } catch (error) {
        await interaction.editReply({
            content: `\`\`\`bash
[ERROR] Invalid Base64 input.
Ensure your string is properly encoded.
Kali Terminal says: Try harder, script kiddie.
\`\`\``
        });
    }
}

async function handleIpModalSubmit(interaction, client) {
    const ipAddress = interaction.fields.getTextInputValue('ip_input').trim();

    if (!IP_PATTERN.test(ipAddress)) {
        return await interaction.editReply({
            content: '```bash\n🚫 Geçersiz IP adresi formatı. IPv4 formatı kullanın.\n```'
        });
    }

    try {
        const apiKey = process.env.IP2_API_KEY;
        if (!apiKey) {
            return await interaction.editReply({
                content: '```bash\n❌ IP2Location API anahtarı yapılandırılmamış.\n```'
            });
        }

        const response = await axios.get(`https://api.ip2location.io/?key=${apiKey}&ip=${ipAddress}`, {
            timeout: TIMEOUT
        });

        const data = response.data;

        if (data.error) {
            return await interaction.editReply({
                content: `\`\`\`bash\n❌ IP sorgu hatası: ${data.error.error_message}\n\`\`\``
            });
        }

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

        await interaction.editReply({ content: result });

    } catch (error) {
        // console.error('IP lookup error:', error);

        let errorMessage = '❌ IP sorgusu sırasında bir hata oluştu.';

        if (error.response?.status === 401) {
            errorMessage = '❌ IP2Location API anahtarı geçersiz.';
        } else if (error.response?.status === 429) {
            errorMessage = '❌ IP sorgu limiti aşıldı.';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = '❌ IP sorgu zaman aşımı.';
        }

        await interaction.editReply({
            content: `\`\`\`bash\n${errorMessage}\n\`\`\``
        });
    }
}

async function handleModalSubmit(interaction, client) {
    if (interaction.customId.startsWith('search_modal2:')) {
        return await handleSearchModalSubmit2(interaction, client);
    }
    if (interaction.customId.startsWith('search_modal:')) {
        return await handleSearchModalSubmit(interaction, client);
    } else if (interaction.customId.startsWith('crack_modal:')) {
        return await handleCrackModalSubmit(interaction, client);
    } else if (interaction.customId.startsWith('ip_modal:')) {
        return await handleIpModalSubmit(interaction, client);
    } else {
        return await interaction.editReply({ content: '🚫 Geçersiz modal etkileşimi.' });
    }
}

async function performQuery(apiKey, userId) {
    try {
        const response = await axios.get(API_BASE_URL, {
            headers: {
                'Authorization': process.env.AUTH_KEY,
                'user-id': userId
            },
            timeout: TIMEOUT
        });

        if (response.status === 200) return { success: true, data: response.data };
        if (response.status === 404) return { success: false, error: '❌ Kullanıcı bulunamadı.' };
        if (response.status === 429) return { success: false, error: '❌ Çok fazla istek.' };

        return { success: false, error: `❌ API hatası: ${response.status}` };
    } catch (error) {
        if (error.response?.status === 401) return { success: false, error: '🚫 Yetkisiz API.' };
        if (error.response?.status === 404) return { success: false, error: '❌ Kullanıcı bulunamadı.' };
        if (error.code === 'ECONNABORTED') return { success: false, error: '❌ Bağlantı zaman aşımı.' };
        return { success: false, error: '❌ Bağlantı hatası.' };
    }
}

async function performQuery2(apiKey, userId) {
    try {
        const response = await axios.get(`${GITHUB_API}/${userId}`, {
            headers: {
                'Authorization': process.env.GITHUB_API_KEY,
            },
            timeout: TIMEOUT
        });
        //console.log(response);
        if (response.status === 200) return { success: true, data: response.data };
        if (response.status === 404) return { success: false, error: '❌ Kullanıcı bulunamadı.' };
        if (response.status === 429) return { success: false, error: '❌ Çok fazla istek.' };
        if (response.status === 403) return { success: false, error: '❌ Bu Kullanıcı Sorgulanamaz.' };

        return { success: false, error: `❌ API hatası: ${response.status}` };
    } catch (error) {
        if (error.response?.status === 401) return { success: false, error: '🚫 Yetkisiz API.' };
        if (error.response?.status === 404) return { success: false, error: '❌ Kullanıcı bulunamadı.' };
        if (error.code === 'ECONNABORTED') return { success: false, error: '❌ Bağlantı zaman aşımı.' };
        return { success: false, error: '❌ Bağlantı hatası.' };
    }
}

async function logInvalidKeyAttempt(client, keyValidation, apiKey, interaction) {
    try {
        const logChannelId = process.env.EXO_CHANNEL_ID;
        if (!logChannelId) return;

        const logChannel = await client.channels.fetch(logChannelId);
        if (!logChannel || !logChannel.isTextBased()) return;

        const keyData = keyValidation.keyData;
        const logMessage = `**🔒 API KEY EXPIRED OR INVALIDATED**
• **Key:** \`${apiKey}\`
• **Package Type:** \`${keyData?.package_type || 'Bilinmiyor'}\`
• **Expiration Reason:** \`${keyValidation.reason}\`
• **Created By:** \`${keyData?.created_by || 'Bilinmiyor'}\`
• **Used By:** \`${interaction.user.tag} (${interaction.user.id})\`
• **Channel:** \`${interaction.channel?.name || 'DM'} (ID: ${interaction.channel?.id || 'N/A'})\`
• **Guild:** \`${interaction.guild?.name || 'DM'} (ID: ${interaction.guild?.id || 'N/A'})\``;

        await logChannel.send(logMessage);
    } catch (error) {
        console.error('Log channel error:', error);
    }
}

async function handleError(interaction, message) {
    try {
        if (interaction.replied) {
            return await interaction.followUp({ content: message, flags: MessageFlags.Ephemeral });
        } else if (interaction.deferred) {
            return await interaction.editReply({ content: message });
        } else {
            return await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
        }
    } catch (error) {
        console.error('Error handling failed:', error);
    }
}