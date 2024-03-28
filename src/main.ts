// Imports
import { GuildMember as GMember, Client, Interaction, TextChannel, Partials, EmbedBuilder } from "discord.js";
import data, { GuildMemberManager, UserManager, DataManager } from './modules/data'
import { RunTimeEvents } from "./modules/RunTimeEvents";
import GameManager from "./modules/gamemanager";
import { random } from "./modules/utilities";
import can from 'canvas';
import { CommandExecutor } from "./modules/commands";

// Settings
const authorizedUsers: string[] = ['316243027423395841']
// Types
export interface moduleData { data: DataManager, client: Client, hosts: string[] }
const client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
let moduleData: moduleData = { data: data, client: client, hosts: authorizedUsers }
let runtimeEvents = new RunTimeEvents(true)
let commandExecutor: CommandExecutor
can.registerFont('./build/assets/fonts/segmento.otf', { family: 'Segmento' })
client.on('ready', async () => {
    data.checkData()
    data.eventEmitter.on('levelUp', async (userID: string, channelID: string) => {
        let channel = client.channels.cache.get(channelID)
        if (channel instanceof TextChannel) {
            let user = channel.guild.members.cache.get(userID)
            if (user instanceof GMember) {
                let message = await channel.send(`**Level Up!** <@${userID}> is now level ${new GuildMemberManager(data.getGuildManager(channel.guild.id).getMember(user.id)).getLevel()}`)
                setTimeout(() => {
                    if (message.deletable) message.delete()
                }, 10000)
            }
        }
    })
    commandExecutor = new CommandExecutor(moduleData)
    commandExecutor.init()
    client.guilds.fetch()
    client.guilds.cache.forEach(guild => {
        guild.commands.set(commandExecutor.commands)
    })
    new GameManager(client)
    runtimeEvents.on('5minute', () => {
        data.write()
    })
})
client.on('messageDelete', async message => {
    if (message.author?.bot) return;
    let channelID = data.getGuild(message.guild?.id as string).settings.loggingChannel
    let channel = message.guild?.channels.cache.get(channelID.toString())
    if (channel instanceof TextChannel) {
        if (message.content == undefined || message.content.length < 256) {
            let embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Message Deleted')
                .setDescription(`Message sent by <@${message.author?.id}> deleted in <#${message.channel.id}>`)
                .addFields([{ name: 'Content', value: (message.content) ? message.content : 'No Message Content', inline: false }])
                .setTimestamp(message.createdAt)
            channel.send({ embeds: [embed], files: Array.from(message.attachments.values()) })
        } else if (message.content) {
            let embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Message Deleted')
                .setDescription(`Message sent by <@${message.author?.id}> deleted in <#${message.channel.id}>`)
                .addFields([{ name: 'Content', value: 'Posted Above', inline: false }])
                .setTimestamp(message.createdAt)
            channel.send({ embeds: [embed], files: Array.from(message.attachments.values()), content: message.content })
        }
    }
})
client.on('messageCreate', message => {
    if (message.content.length > 5) {
        if (message.guild) {
            let serverManager = data.getGuildManager(message.guild.id)
            let user = serverManager.getMember(message.author.id)
            let userManager = new GuildMemberManager(user)
            if (userManager.getTimer('message') + 60000 < Date.now()) {
                const xpReward = random(10, 25)
                userManager.addXP(xpReward, message.channel.id)
                userManager.getUserManager().addXP(xpReward)
                userManager.addWallet(random(1, 2))
                userManager.setTimer('message', Date.now())
            }
        }
    }
})
client.on('interactionCreate', async (interaction: Interaction) => {
    if (commandExecutor && interaction.isCommand()) commandExecutor.execute(interaction)
})
client.login(require('../token.json').token);

export default client;