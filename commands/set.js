const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { validateKey } = require('../database/queries');
const ADMIN_IDS = process.env.ADMIN_IDS.split(',');

module.exports = {
  name: 'set',
  description: 'API anahtarını girerek sorgu arayüzünü başlat.',
  async execute(message, args, client) {
    if (!ADMIN_IDS.includes(message.author.id)) {
      return message.reply('🚫 Bu komutu kullanma yetkin yok.');
    }
    
    const apiKey = args[0];
    if (!apiKey) return message.reply('Lütfen bir API anahtarı giriniz.');
    
    const check = await validateKey(apiKey);
    if (!check.valid) {
      return message.reply(`\`\`\`diff\n- key error: ${check.reason}\n\`\`\``);
    }
    
    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('📡 [RUDY? SERVICEX] Kullanıcı Sorgulama Arayüzü')
      .setDescription(
        '```ansi\n' +
        '\u001b[1;31m🔍 Bu arayüz ile kullanıcı sorgulayabilirsiniz.\n' +
        '\u001b[0mKullanım limitleri ve süre dolumu aktif olarak kontrol edilmektedir.\n' +
        '```'
      )
      .setFooter({ text: `Paket: ${check.keyData.package_type} | Kalan: ${check.keyData.total_limit - check.keyData.used_count}` });
    if (check.keyData.tableName == "api_keys"){
      const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`start_query:${apiKey}`)
        .setLabel('Search')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`key_info:${apiKey}`)
        .setLabel('Key Information')
        .setStyle(ButtonStyle.Secondary),
      // new ButtonBuilder()
      //   .setCustomId(`crack_base64:${apiKey}`)
      //   .setLabel('Crack')
      //   .setStyle(ButtonStyle.Danger),
      // new ButtonBuilder()
      //   .setCustomId(`ip_lookup:${apiKey}`)
      //   .setLabel('IP Lookup')
      //   .setStyle(ButtonStyle.Primary)
    );

    return await message.reply({ embeds: [embed], components: [row] });
    }
  
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`start_query_gapi:${apiKey}`)
        .setLabel('Search')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`key_info:${apiKey}`)
        .setLabel('Key Information')
        .setStyle(ButtonStyle.Secondary),
    );
    
    await message.reply({ embeds: [embed], components: [row] });
  }
};