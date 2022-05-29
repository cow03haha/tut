const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, Modal, TextInputComponent, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('匿名')
        .setDescription('匿名測試'),
    async execute(interaction) {
        const modal = new Modal()
            .setCustomId('anoymous')
            .setTitle('匿名表單')
        const input = new TextInputComponent()
            .setCustomId('input')
            .setLabel('你想說的話')
            .setStyle('PARAGRAPH')
        const row = new MessageActionRow().addComponents(input)
        modal.addComponents(row)

        await interaction.showModal(modal)
    },
    async send(interaction) {
        const channel = await interaction.guild.channels.fetch('976152113862279198')
        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setDescription(`**${interaction.fields.getTextInputValue('input')}**`)
            .setTimestamp()

        await interaction.reply('提交成功!')
        await channel.send({ embeds: [embed] })
    },
};
