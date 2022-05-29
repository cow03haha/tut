const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, Formatters } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('get server info'),
    async execute(interaction) {
        const guild = interaction.guild
        const guildChannels = guild.channels.cache
        const channelCount = {
            'GUILD_CATEGORY': 0,
            'GUILD_TEXT': 0,
            'GUILD_VOICE': 0,
        }

        for (const channel of guildChannels.values()) {
            channelCount[channel.type]++
        }

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'owner', value: Formatters.userMention(guild.ownerId), inline: true },
                { name: 'category channels', value: channelCount['GUILD_CATEGORY'].toString(), inline: true },
                { name: 'text channels', value: channelCount['GUILD_TEXT'].toString(), inline: true },
                { name: 'voice channels', value: channelCount['GUILD_VOICE'].toString(), inline: true },
                { name: 'members', value: guild.members.cache.size.toString(), inline: true },
                { name: 'roles', value: guild.roles.cache.size.toString(), inline: true },
            )
            .setFooter({ text: `server id:${guild.id} | sever created` })
            .setTimestamp(guild.createdAt)
        await interaction.reply({ embeds: [embed] })
    },
}