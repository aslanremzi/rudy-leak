require('dotenv').config();

module.exports = {
    name: 'packs',
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
│   Ek Servisler      │   Fiyat   │   Kullanım hakkı   │   Açıklama                                  │
│────────────────────────────────────────────────────────────────────────────────────────────────────│
│                                                                                                    │
│   White-list           150TL             1            Seçtiğiniz ID'yi Wh alır ve sorgulanamaz     │
│                                                                                                    │
│   CSINT/OSINT          150TL             1            İlettiğiniz Mail/Şifre üzerine detaylı sorgu │
│                                                                                                    │
│                                                                         $Developed by raven        │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
        `;

        await message.channel.send('```' + packMessage + '```');
    }
};
