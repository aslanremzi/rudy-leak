
require('dotenv').config();

module.exports = {
    name: 'how',
    description: 'Displays system info and command usage (Everyone can use)',
    async execute(message) {
        const adminIDsString = process.env.ADMIN_IDS || '';
        const ADMIN_IDS = adminIDsString.split(',').map(id => id.trim()).filter(id => id.length > 0);

        const adminList = ADMIN_IDS.map(id => `│   • ${id}`).join('\n');

        const howMessage = `
┌─[RUDY? System Info]───────────────────────────────────────────────────────┐
│                                                                           │                                                                                                                                                                                                         
│  Nasıl Kullanılır?                                                        │      
│   • Aramak istediğiniz kullanıcının Discord ID sini kopyalayın.           │
│   • "Search" tuşuna basıp yapıştırın.                                     │
│                                                                           │
│  How to use?                                                              │
│   • Copy the desired Discord ID.                                          │
│   • Click the "Search" button and paste it.                               │
│                                                                           │
│                                                  $Developed by raven      │
└───────────────────────────────────────────────────────────────────────────┘
`;

        await message.channel.send('```' + howMessage + '```');
    }
};
