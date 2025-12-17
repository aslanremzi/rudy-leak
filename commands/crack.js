module.exports = {
    name: 'crack',
    description: 'Decode a Base64 encoded string (UTF-8 output).',
    usage: '$crack <base64_string>',
    async execute(message, args) {
        if (message.channel.id === '1379126067608031363') {
            return;
        }

        if (args.length === 0) {
            return message.reply(
                "```bash\n[ERROR] No input detected.\nUsage: $crack <base64_string>\nTry again with a valid Base64 encoded string.\n```"
            );
        }

        const base64Input = args.join('');

        try {
            const decodedBuffer = Buffer.from(base64Input, 'base64');
            const decodedText = decodedBuffer.toString('utf8');

            const response = [
                '```',
                `[RUDY? UTF-8 Crack]`,
                ``,
                `Input:`,
                `${base64Input}`,
                ``,
                `Decoded Output:`,
                `${decodedText}`,
                '```'
            ].join('\n');

            await message.reply(response);
        } catch (error) {
            await message.reply(
                "```bash\n[ERROR] Invalid Base64 input.\nEnsure your string is properly encoded.\nKali Terminal says: Try harder, script kiddie.\n```"
            );
        }
    },
};
