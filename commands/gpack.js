require('dotenv').config();

module.exports = {
    name: 'gpack',
    description: 'Displays package information (Admins only)',
    async execute(message) {
        const adminIDsString = process.env.ADMIN_IDS || '';
        const ADMIN_IDS = adminIDsString.split(',').map(id => id.trim()).filter(id => id.length > 0);

        if (!ADMIN_IDS.includes(message.author.id)) {
            return message.reply('You do not have permission to use this command.');
        }

        const packMessage = `
┌─[RUDY? Packages Info]─────────────────────────────────────────────────────────────────────────────┐
│                                                                                                   │
│   Sorgu paketleri   │   Fiyat   │   Sorgu Hakkı   │   Sorgu Başı Fiyat   │   Süre   │   Avantaj   │
│───────────────────────────────────────────────────────────────────────────────────────────────────│
│                                                                                                   │
│    One-time             50TL            1                  50TL            Tek Sefer       -      │
│                                                                                                   │
│    Standart             200TL           5                  40TL            1 Gün          %34     │
│                                                                                                   │
│    Advanced             1,500TL         70                 21TL            7 Gün          %58     │
│                                                                                                   │
│    Pro                  5,000TL         320                16TL            30 Gün         %68     │
│                                                                                                   │
│    Business             13,499TL        1000               13TL            90 Gün         %74     │
│                                                                                                   │
│    Enterprise           43,499TL        4000               11TL            365 Gün        %78     │
│                                                                                                   │
│                                                                      $Developed by raven          │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
        `;

        await message.channel.send('```' + packMessage + '```');
    }
};
