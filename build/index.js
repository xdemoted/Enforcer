let { fork } = require('child_process')
let path = require('path')
let file = path.resolve('./main')
let { Partials, Client, EmbedBuilder } = require('discord.js')
const mainChannel = '1195048388643791000'
const client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
let channel
let message
client.on('ready', () => {
    channel = client.channels.cache.get(mainChannel)
    start()
})
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
    server.on('message', function (data) {
        console.log(data.toString());
    });
    server.on('exit',async (code, error) => {
        console.log('Operator crashed with: ' + error)
        if (channel && channel.isTextBased()) {
            let embed = new EmbedBuilder()
                .setTitle('Bot Crash Detected')
                .setDescription('An error has been sent to console, automatic restart will be attempted.')
                .setColor('Grey')
            message = await channel.send({ embeds: [embed] })
        }
        setTimeout(() => { start() }, 10000)
    })
}
client.login(require('./assets/token.json').token);