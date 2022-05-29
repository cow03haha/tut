const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, Formatters } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('get user info')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('user you wnat display')
                .setRequired(true)),
    async execute(interaction) {
        const member = interaction.options.getMember('user')
        const roles = await member.roles.cache

        let roleMentionString = ''
        for (const [key, role] of roles) {
            if (role.name !== '@everyone') roleMentionString += Formatters.roleMention(role.id) + ' '
            else roles.delete(key)
        }

        const embed = new MessageEmbed()
            .setColor(member.displayColor)
            .setDescription(Formatters.userMention(member.id))
            .setAuthor({ name: member.user.tag, iconURL: member.displayAvatarURL() })
            .setThumbnail(member.displayAvatarURL())
            .addFields(
                { name: 'joined', value: member.joinedAt.toLocaleString(), inline: true },
                { name: 'created', value: member.user.createdAt.toLocaleString(), inline: true },
                { name: `roles[${roles.size}]`, value: `${roleMentionString ? roleMentionString : 'None'}` },
            )
            .setFooter({ text: `request by ${member.user.tag}` })
            .setTimestamp()
        await interaction.reply({ embeds: [embed] })
    },
}