require('dotenv').config();

module.exports = {
    name: 'pack2',
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
│   Eğitimler          │              Fiyat               │   Eğitim Süresi   │       Açıklama       │
│────────────────────────────────────────────────────────────────────────────────────────────────────│
│                                                                                                    │
│   OSINT Eğitimi                     3000TL                    1-3 Hafta          Detaylı OSINT     │
│                                                                                                    │
│   CSINT Eğitimi                     5000TL                    1-3 Hafta          Detaylı CSINT     │
│                                                                                                    │
│   Kali-Linux Eğitimi                1000TL                     2 Hafta         Linux Fundamentals  │
│                                                                                                    │
│   SQLMAP Eğitimi                    1500TL                    2-4 Hafta        Detaylı SQLMAP -fr  │
│                                                                                                    │
│   API Eğitimi                       1500TL                    2-4 Hafta        API Bağlama Reqs    │
│                                                                                                    │
│   Crack/Login                       2000TL                    4-6 Hafta        Cracking/Force Log  │
│                                                                                                    │
│                                                                         $Developed by raven        │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
        `;

        await message.channel.send('```' + packMessage + '```');
    }
};
