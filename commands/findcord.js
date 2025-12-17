const axios = require('axios');
require('dotenv').config();

module.exports = {
  name: 'findcord',
  description: '🔍 Find Discord user information using Findcord API',
  usage: '$findcord <user_id>',
  async execute(message, args) {
    const userId = args[0];
    const authToken = process.env.FINDCORD_AUTH;
    const apiUrl = process.env.FINDCORD_API_URL;

    if (!userId) {
      return message.reply('```bash\n[!] Usage: $findcord <user_id>\n```');
    }

    if (!authToken || !apiUrl) {
      return message.reply('```bash\n[!] Configuration error: Missing API URL or Auth token.\n```');
    }

    try {
       const response = await axios.get(`https://app.findcord.com/api/user/${userId}`, {
            headers: {
                'Authorization': authToken,
            },
        });
      const user = response.data;
      console.log(user)

      const output = [];
      output.push('```bash');
      output.push(`┌─[root@findcord]─[~]`);
      output.push(`└──╼ $ findcord ${userId}\n`);

      output.push(`[+] Username:         ${user.UserInfo.UserName || 'N/A'}`);
      output.push(`[+] Global Name:      ${user.UserInfo.UserGlobalName || 'N/A'}`);
      output.push(`[+] ID:               ${user.UserInfo.UserID || 'N/A'}`);
      output.push(`[+] Created At:       ${user.UserInfo.UserCreated || 'N/A'}`);
      output.push(`[+] Avatar:           ${user.UserInfo.UserdisplayAvatar || 'N/A'}`);

      if (user.WhereNow) {
        output.push(`\n[+] Currently In:`);
        output.push(`    ├─ Server:        ${user.WhereNow.GuildName || 'N/A'}`);
        output.push(`    ├─ Channel:       ${user.WhereNow.VoiceName || 'N/A'}`);
        output.push(`    ├─ Members:       ${user.WhereNow.UserSize || 'N/A'}`);
        output.push(`    ├─ Time:          ${user.WhereNow.ElapsedTime || 'N/A'}`);
        output.push(`    └─ Since:         ${user.WhereNow.StartDate || 'N/A'}`);
      }

      if (user.Punishments && user.Punishments.length > 0) {
        output.push(`\n[+] Punishments:`);
        user.Punishments.forEach((Punishments) => {
          output.push(`    ├─ [${Punishments.Type || 'Unknown'}] Reason: ${Punishments.Reason || 'N/A'} (Server: ${Punishments.GuildName || 'Unknown'})`);
        });
      } else {
        output.push(`\n[+] Punishments:     None`);
      }

      output.push('```');
      message.channel.send(output.join('\n'));

    } catch (err) {
      console.error('Findcord API error:', err.response?.data || err.message || err);
      message.channel.send('```bash\n[!] Error: Failed to fetch data. Check the User ID and try again.\n```');
    }
  }
};
