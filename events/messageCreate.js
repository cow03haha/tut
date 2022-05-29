module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return

        if (message.content === 'hi') {
            const channel = message.channel
            await channel.send('早安')
        }
    },
}