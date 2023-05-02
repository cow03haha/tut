const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, Modal, TextInputComponent, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('匿名')
        .setDescription('匿名投稿'),
    async execute(interaction) {
        const modal = new Modal()
            .setCustomId('anoymous')
            .setTitle('匿名表單')
        const input = new TextInputComponent()
            .setCustomId('input')
            .setLabel('你想說的話')
            .setStyle('PARAGRAPH')
        const row = new MessageActionRow().addComponents(input)
        const image = new TextInputComponent()
            .setCustomId('image')
            .setLabel('圖片(選填)(請貼入網址，建議使用discord圖片連結)')
            .setStyle('SHORT')
        const row2 = new MessageActionRow().addComponents(image)
        modal.addComponents(row).addComponents(row2)

        await interaction.showModal(modal)
    },
    async send(interaction) {
        const channel = await interaction.guild.channels.fetch('877838515575062548')
        const input = interaction.fields.getTextInputValue('input')
        const image = interaction.fields.getTextInputValue('image')
        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
            .setDescription(`**${input}**`)
            .setTimestamp(interaction.createdAt)
            .setFooter({ text: `成員ID: ${interaction.user.id}` })
        if (image.startsWith('https')) embed.setImage(image)
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('anoymous_accept')
                    .setLabel('確認')
                    .setStyle('SUCCESS'),
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('anoymous_cancel')
                    .setLabel('取消')
                    .setStyle('DANGER'),
            )

        await interaction.reply({ content: '提交成功!請等候管理員審核', ephemeral: true })
        await channel.send({ content: '`匿名表單審核`', embeds: [embed], components: [row] })
    },
    async check(interaction) {
        const row = interaction.message.components
        for (const i of row[0].components) {
            i.setDisabled(true)
        }

        if (interaction.component.style === 'SUCCESS') {
            const channel = await interaction.guild.channels.fetch('742918509037879368')
            const embed = interaction.message.embeds[0].setTitle('').setAuthor(null).setFooter(null).setTimestamp()
            await interaction.update({ content: '`審核成功!`', components: row })
            await channel.send({ embeds: [embed] })
        }
        else {
            await interaction.update({ content: '`取消成功!`', components: row })
        }
    },
};
