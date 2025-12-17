require('dotenv').config();

module.exports = {
  name: 'inf',
  description: 'Displays system info about admins and commands',
  async execute(message, args, client) {
    const adminIDsString = process.env.ADMIN_IDS || '';
    const ADMIN_IDS = adminIDsString.split(',').map(id => id.trim()).filter(id => id.length > 0);

    const MODERATOR_IDS = client.MODERATOR_IDS || [];

    const adminList = ADMIN_IDS.map(id => `│   • ${id}`).join('\n');
    const modList = MODERATOR_IDS.map(id => `│   • ${id}`).join('\n');

    const infoMessage = `
┌─[RUDY? System Info]───────────────────────────────────────────────────────────────────────────────────
│ 
│  Admins: 
${adminList}  
│
│  Moderators:
${modList}
│  
│  Commands & Usage:                                                                           
│   • $newkey                - Generates new key                                               
│   • $delete                - Delete's a key  
│   • $keys                  - Shows active keys 
│   • $search                - Search with key   
│   • $inf                   - Displays this screen                                            
│   • $addwh                 - Add's ID to white-list             /MOD       
│   • $pack                  - Package infos
│   • $packs                 - Extra Package's
│   • $findcord              - Checks user ID on Findcord
│   • $how                   - How to use
│   • $checkwh               - Checks active White-listed ID's    /MOD          
│   • $deletewh              - Delete's White-listed ID           /MOD                            
│   • $ticketsetup           - Set up's ticket creation
│   • $fix                   - Move's done-deal ticket's          /MOD
│   • $close                 - Close's tickets and moves to log   /MOD
│                                                                              $Developed by raven
└───────────────────────────────────────────────────────────────────────────────────────────────────────
    `;

    await message.channel.send('```' + infoMessage + '```');
  }
};
