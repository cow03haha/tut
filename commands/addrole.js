const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('add role to target')
        .setDefaultPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('all members in guild')
                .addRoleOption(option => option.setName('role').setDescription('role you want give').setRequired(true))),
    async execute(interaction) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('excuse')
                    .setLabel('執行')
                    .setStyle('SUCCESS'),
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('cancel')
                    .setLabel('取消')
                    .setStyle('DANGER'),
            )
        const filter = i => {
            i.deferUpdate()
            return i.user.id == interaction.user.id
        }

        const reply = await interaction.reply({ content: '是否確定要執行?', components: [row], fetchReply: true })
        try {
            const action = await reply.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 10000 })

            if (action.customId == 'excuse') {
                await reply.edit({ content: '更新中...', components: [] })
                const members = interaction.guild.members.cache.filter(member => !member.user.bot)
                const role = interaction.options.getRole('role')
                let count = 0
                let time = new Date().getTime()

                for (const member of members.values()) {
                    try {
                        if (new Date().getTime() - time > 5000) {
                            await reply.edit(`更新中...\n進度: ${count}/${members.size}`)
                            time = new Date().getTime()
                        }
                        if (!member.roles.cache.has(role.id)) await member.roles.add(role)
                        count++
                    }
                    catch (error) {
                        console.log(error.message)
                    }
                }

                await reply.edit(`更新成功!\n更新人數/總人數: ${count}/${members.size}`)
            }
            else {
                await reply.edit({ content: '取消成功!', components: [] })
            }
        }
        catch (error) {
            await reply.edit({ content: '超過時間!已自動取消', components: [] })
        }
    },
};
