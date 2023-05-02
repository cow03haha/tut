const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('更改你的')
        .setDefaultPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('DM(direct message) to all user in guild(carefully use)')
                .addStringOption(option =>
                    option
                        .setName('content')
                        .setDescription('The message you want sent')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('role')
                .setDescription('DM(direct message) to user that in specific role')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role you want specific')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('content')
                        .setDescription('The message you want sent')
                        .setRequired(true))),
    async execute(interaction) {
        const reply = await interaction.reply({ content: 'sending...', fetchReply: true })

        let target = null
        if (interaction.options.getSubcommand() === 'all') {
            target = interaction.guild.members.cache
        }
        else if (interaction.options.getSubcommand() === 'role') {
            target = interaction.options.getRole('role').members
        }
        target.forEach((member, key) => {
            if (member === interaction.member || member.user.bot) target.delete(key)
        })

        let sendedCount = 0
        const content = `Message from **${interaction.guild.name}**\nAuthor: ${interaction.member}\n\n${interaction.options.getString('content')}`
        for (const member of target.values()) {
            try {
                await member.send(content)
                sendedCount++
            }
            catch (error) {
                console.log(error)
            }
        }

        await reply.edit(`send success!\nsended/all: ${sendedCount}/${target.size}`)
    },
}