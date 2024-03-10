import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, MessageComponentInteraction, TextChannel } from "discord.js"

let { fork } = require('child_process')
let path = require('path')
let file = path.resolve('./main')
let { Partials, Client, EmbedBuilder } = require('discord.js')
const mainChannel = '1195048388643791000'
const client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
let channel:TextChannel
let message:Message|undefined
client.on('ready', () => {
    channel = client.channels.cache.get(mainChannel)
    start()
})
let crashCount = 0
function start() {
    let server = fork(file)
    if (message) {
        let embed = new EmbedBuilder()
        .setTitle('Bot Crash Detected')
        .setDescription('Automatic restart successful. (Check console for error)')
        .setColor('Green')
        message.edit({ embeds: [embed] })
        message = undefined
    }
    server.on('message', function (data:any) {
        console.log(data.toString());
    });
    server.on('exit',async (code:any, error:any) => {
        console.log('Operator crashed with: ' + error)
        crashCount++
        if (channel && channel.isTextBased()) {
            if (crashCount > 3) {
                let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder().setCustomId('restart').setLabel('Restart').setStyle(ButtonStyle.Primary)
                )
                let embed = new EmbedBuilder()
                .setTitle('Bot Crash Detected')
                .setDescription('Multiple crashes detected, critical error has occured. Please restart bot manually.')
                .setColor('Grey')
                message = await channel.send({ embeds: [embed], components: [row] })
                message.awaitMessageComponent({ filter: i => i.customId === 'restart', time: 60000 }).then((interaction:MessageComponentInteraction) => {
                    interaction.update({ content: 'Restarting...', components: [] })
                    start()
                })
            }
            let embed = new EmbedBuilder()
                .setTitle('Bot Crash Detected')
                .setDescription('An error has been sent to console, automatic restart will be attempted.')
                .setColor('Grey')
            message = await channel.send({ embeds: [embed] })
        }
        setTimeout(() => { start() }, 10000)
        setTimeout(() => { --crashCount }, 600000)
    })
}
client.login(require('./assets/token.json').token);