require('dotenv').config();

module.exports = {
    name: 'pack3',
    description: 'Displays additional service packages (Admins only)',
    async execute(message) {
        const adminIDsString = process.env.ADMIN_IDS || '';
        const ADMIN_IDS = adminIDsString.split(',').map(id => id.trim()).filter(id => id.length > 0);

        if (!ADMIN_IDS.includes(message.author.id)) {
            return message.reply('You do not have permission to use this command.');
        }

        const packMessage = `
┌─[RUDY? Packages Info]──────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│   Scriptler          │       Fiyat        │                      Açıklama                          │
│────────────────────────────────────────────────────────────────────────────────────────────────────│
│                                                                                                    │
│   RAT                        500TL               İstediğinize göre özelleştirilebilir              │
│                                                                                                    │
│   Login                      500TL               İstediğiniz sitenin login verilerini çekiyoruz    │
│                                                                                                    │
│   AC Bypass                  750TL               İstediğiz oyun için Anti-Cheat Bypass             │
│                                                                                                    │
│   URL Sniper                 750TL               0.1 MS URL Sniper                                 │
│                                                                                                    │
│   Discord bot                1000TL              İstediğiniz özelliklerde discord botu             │
│                                                                                                    │
│   Açıksız SC                 1500TL              Açıksız kişiye özel Panel Scripti                 │
│                                                                                                    │
│                                                                         $Developed by raven        │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
        `;

        await message.channel.send('```' + packMessage + '```');
    }
};
