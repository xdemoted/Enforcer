// Imports
import { AttachmentBuilder, Client, ActionRowBuilder, CommandInteraction, Interaction, TextChannel, SelectMenuInteraction, EmbedField, User, ButtonBuilder, Partials, PermissionFlagsBits, ChannelType, EmbedBuilder, ButtonStyle, ComponentType, StringSelectMenuInteraction, StringSelectMenuBuilder, StageChannel, InteractionCollector, CacheType, GuildMember as DiscordGuildMember, SelectMenuComponentOptionData } from "discord.js";
import data, { GuildMemberManager, UserManager, DataManager, GuildManager, BaseUser, GlobalUser } from './modules/data'
import { RunTimeEvents } from "./modules/RunTimeEvents";
import { dailyQB } from "./modules/games";
import can from 'canvas';

// Variables
const client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
let medals = ['🥇', '🥈', '🥉']
let runtimeEvents = new RunTimeEvents()
let activeQB: dailyQB[] = []
// Utility Functions
function random(min: number, max: number) {
    return Math.round(Math.random() * (max - min)) + min
}
function checkModerator(interaction: CommandInteraction, reply?: boolean) {
    let permissions = interaction.member?.permissions
    if (permissions && typeof permissions != 'string') {
        if (permissions.has(PermissionFlagsBits.Administrator)) {
            return true
        } else {
            if (reply) {
                interaction.reply("This command has been reserved for administration.")
            }
            return false
        }
    }
}
function checkOwner(interaction: CommandInteraction, reply?: boolean) {
    let permissions = interaction.member?.permissions
    if (permissions && typeof permissions != 'string') {
        if (interaction.guild?.ownerId == interaction.user.id) {
            return true
        } else {
            if (reply) {
                interaction.reply("This command has been reserved for the server owner.")
            }
            return false
        }
    }
}

// Image Generation
async function getWelcomeBanner(imagelink: string) {
    let canvas = can.createCanvas(1200, 300)
    let context = canvas.getContext('2d')
    context.drawImage(await can.loadImage(imagelink), 478, 51, 203, 203)
    context.drawImage(await can.loadImage('./welcome.png'), 0, 0, 1200, 300)
    return canvas.toBuffer('image/png')
}
async function getImage(user: GuildMemberManager | UserManager, dUser: User) {
    let userLevel = user.getLevel()
    const lastRequirement = (userLevel > 1) ? DataManager.getLevelRequirement(userLevel - 1) : 0
    const avatarURL = dUser.avatarURL({ extension: 'png' })
    const requirement = DataManager.getLevelRequirement(userLevel)
    let canvas = can.createCanvas(1200, 300)
    let context = canvas.getContext('2d')
    context.fillStyle = '#171717'
    context.fillRect(0, 0, 1200, 300)
    context.fillStyle = '#171717'
    context.fillRect(325, 200, 800, 50)
    context.fillStyle = '#00EDFF'
    context.fillRect(325, 200, Math.round(((user.user.xp - lastRequirement) / (requirement - lastRequirement)) * 800), 50)
    context.drawImage(await can.loadImage(avatarURL ? avatarURL : './Compiled/MinistryEnforcerV2/namecards/default.png'), 50, 50, 200, 200)
    context.drawImage(await can.loadImage('./Compiled/MinistryEnforcerV2/namecards/default.png'), 0, 0, 1200, 300)
    // Rank Info 
    context.fillStyle = '#ffffff'
    context.font = '40px Arial'
    context.fillText(`Rank #${user.getRank()}`, 325, 100)
    // Username
    context.fillText(dUser.username, 325, 190)
    let wid = context.measureText(dUser.username).width
    // Requirements + Discriminator
    context.font = '30px Arial'
    context.fillText(dUser.discriminator, 335 + wid, 192)
    context.fillText(`${user.user.xp - lastRequirement} / ${requirement - lastRequirement} XP`, 1125 - context.measureText(`${user.user.xp - DataManager.getLevelRequirement(userLevel - 1)} / ${DataManager.getLevelRequirement(user.getLevel()) - DataManager.getLevelRequirement(userLevel)} XP`).width, 192)
    context.fillStyle = '#00EDFF'
    // Top Right Level
    context.fillText("Level", 960, 75)
    context.font = '60px Arial'
    context.fillText(userLevel.toString(), 1043, 75)
    return canvas.toBuffer('image/png')
}

// Client Events
client.on('ready', async () => {
    client.guilds.fetch()
    client.application?.commands.set([])
    client.guilds.cache.forEach(guild => {
        guild.commands.set(require('./commands.json'))
    })
    runtimeEvents.on('hour', async hour => {
        if (hour == 13) {
            let newList: dailyQB[] = []
            client.guilds.cache.forEach(async guild => {
                let guildData = data.getGuild(guild.id)
                let channel = guild.channels.cache.get(guildData.settings.qbChannel.toString())
                let qb = activeQB.find(qb => qb.channel == guildData.settings.qbChannel.toString())
                if (channel instanceof TextChannel) {
                    let quizbowl = await dailyQB.init(channel.id)
                    let embed = new EmbedBuilder()
                        .setTitle('Daily Quiz Bowl')
                        .setDescription(quizbowl.prompt[0] + '.')
                        .setFooter({ text: 'Hints every 2 hours, new prompt at 7 AM CST, use the /answer command to answer.' })
                        .setColor('Green')
                    if (qb) {
                        let message = channel.messages.cache.get(qb.message)
                        if (message) {
                            message.edit({ embeds: [embed] })
                            quizbowl.message = message?.id
                        }
                        newList.push(quizbowl)
                    } else {
                        newList.push(quizbowl)
                        let message = await channel.send({ embeds: [embed] })
                        quizbowl.message = message?.id
                    }
                }
            })
            activeQB = newList
        } else if (Math.floor((hour - 13) / 2) == (hour - 13) / 2) {
            activeQB.forEach(async qb => {
                let prompt = qb.prompt[Math.floor((hour - 13) / 2)]
                let channel = client.channels.cache.get(qb.channel)
                if (prompt && channel instanceof TextChannel) {
                    let message = channel.messages.cache.get(qb.message)
                    if (message) {
                        let embed = message.embeds[0]
                        let newEmbed = new EmbedBuilder()
                            .setTitle('Daily Quiz Bowl')
                            .setDescription(embed.description + prompt + '.')
                            .setFields(embed.fields)
                            .setFooter(embed.footer)
                            .setColor('Green')
                        message.edit({ embeds: [newEmbed] })
                    }
                }
            })
        }
    })
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
    // Add xp on message and game responses
    if (message.content.length > 5) {
        if (message.guild) {
            let serverManager = data.getGuildManager(message.guild.id)
            let user = serverManager.getMember(message.author.id)
            let userManager = new GuildMemberManager(user)
            if (userManager.getTimer('message') + 60000 < Date.now()) {
                userManager.addXP(random(10, 25))
                userManager.addWallet(random(1, 5))
                let guser = new UserManager(userManager.getGlobalUser())
                guser.addXP(random(1, 5))
                userManager.setTimer('message', Date.now())
            }
        }
    }
})
client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.guildId) {
        let serverManager = data.getGuildManager(interaction.guildId)
        if (!(serverManager instanceof GuildManager)) {
            serverManager = new GuildManager(data.registerGuild(interaction.guildId))
        }
        let user = serverManager.getMember(interaction.user.id)
        let userManager = new GuildMemberManager(user)
        if (interaction.isChatInputCommand()) {
            if (typeof interaction.guildId !== "string") return;
            switch (interaction.commandName) {
                //Xp Commands
                case 'blackjack': {
                    //mainChannel: 'string',
                    //qbChannel: 'string',
                    //loggingChannel: 'string',
                    //maniaChannel: 'thread',
                    //maniaGames: 'string',
                    //gameThread: 'thread'
                } break;
                case 'leaderboard': {
                    let list: BaseUser[] = serverManager.members.sort((a, b) => b.xp - a.xp)
                    let users: EmbedField[] = []
                    for (let i = 0; i < 10; i++) {
                        const user = list[i]
                        if (user) {
                            let username = interaction.guild?.members.cache.get(user.id)
                            let field: EmbedField = { name: username ? username.displayName : user.id, value: user.xp.toString(), inline: false }
                            users.push(field)
                        }
                    }
                    let embed = new EmbedBuilder()
                        .setTitle('Server XP Leaderboard')
                        .addFields(users)
                    let row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setCustomId('gem')
                                .setLabel('Gems'),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Secondary)
                                .setCustomId('gxp')
                                .setLabel('Global XP'),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Danger)
                                .setCustomId('cur')
                                .setLabel('Coins'),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Success)
                                .setCustomId('lxp')
                                .setLabel('Local XP')
                        ])
                    let msg = await interaction.reply({ embeds: [embed], components: [row] })
                    msg.createMessageComponentCollector({ componentType: ComponentType.Button }).on('collect', int => {
                        users = []
                        let title = ''
                        switch (int.customId) {
                            case 'gem':
                                title = 'Global Gems Leaderboard'
                                list = data.getGlobalUsers().sort((a, b) => b.gems - a.gems)
                                for (let i = 0; i < 10; i++) {
                                    const user = (list[i] as GlobalUser)
                                    if (user) {
                                        let username = interaction.guild?.members.cache.get(user.id)
                                        let field: EmbedField = { name: username ? username.displayName : user.id, value: user.gems.toString(), inline: false }
                                        users.push(field)
                                    }
                                }
                                break;
                            case 'gxp':
                                title = 'Global XP Leaderboard'
                                list = data.getGlobalUsers().sort((a, b) => b.xp - a.xp)
                                for (let i = 0; i < 10; i++) {
                                    const user = list[i]
                                    if (user) {
                                        let username = interaction.guild?.members.cache.get(user.id)
                                        let field: EmbedField = { name: username ? username.displayName : user.id, value: user.xp.toString(), inline: false }
                                        users.push(field)
                                    }
                                }
                                break
                            case 'lxp':
                                title = 'Server XP Leaderboard'
                                list = serverManager.members.sort((a, b) => b.xp - a.xp)
                                for (let i = 0; i < 10; i++) {
                                    const user = list[i]
                                    if (user) {
                                        let username = interaction.guild?.members.cache.get(user.id)
                                        let field: EmbedField = { name: username ? username.displayName : user.id, value: user.xp.toString(), inline: false }
                                        users.push(field)
                                    }
                                }
                                break;
                            case 'cur': {
                                title = 'Server Coins Leaderboard';
                                if (!interaction.guild) return;
                                const list = serverManager.members.sort((a: any, b: any) => (b.balance.bank + b.balance.wallet) - (a.balance.bank + a.balance.wallet));
                                for (let i = 0; i < 10; i++) {
                                    const user = list[i];
                                    if (user) {
                                        const username = interaction.guild?.members.cache.get(user.id);
                                        const field: EmbedField = { name: username ? username.displayName : user.id, value: (user.balance.bank + user.balance.wallet).toString(), inline: false };
                                        users.push(field);
                                    }
                                }
                                break;
                            }
                        }
                        let embed = new EmbedBuilder()
                            .setTitle(title)
                            .setDescription('Users are sorted by XP')
                            .addFields(users)
                        int.update({ embeds: [embed], components: [row] })
                    })
                }
                    break;
                case 'answer': {
                    let answer = interaction.options.getString('answer')
                    let qb = activeQB.find(qb => qb.channel == interaction.channelId)
                    if (answer && qb) {
                        let response = await qb?.checkanswer(answer)
                        let user = new GuildMemberManager(serverManager.getMember(interaction.user.id))
                        if (user.getTimer('qb') < qb.startTime) {
                            if (response == 'accept') {
                                if (qb.open) {
                                    interaction.reply({ content: 'Correct Answer! 1000 xp and 50 coins has been awarded for being first.', ephemeral: true })
                                    user.addXP(1000)
                                    user.addWallet(50)
                                    let message = interaction.channel?.messages.cache.get(qb.message)
                                    if (message) {
                                        let embed = message.embeds[0]
                                        let newEmbed = new EmbedBuilder()
                                            .setTitle('Daily Quiz Bowl')
                                            .setDescription(embed.description)
                                            .setFields(embed.fields)
                                            .addFields([{name: 'First Answerer', value: `${interaction.user.displayName}`, inline: false }])
                                            .setFooter(embed.footer)
                                            .setColor('Green')
                                        message.edit({embeds:[newEmbed]})
                                    }
                                } else {
                                    interaction.reply({ content: 'Correct Answer! 250 xp and 10 coins has been awarded for answering.', ephemeral: true })
                                    user.addXP(250)
                                    user.addWallet(10)
                                }
                                user.setTimer('qb', Date.now())
                            } else {
                                interaction.reply({ content: response, ephemeral: true })
                            }
                        } else {
                            interaction.reply({ content: 'Come back tomorrow for a new prompt.', ephemeral: true })
                        }
                    } else {
                        interaction.reply({ ephemeral: true, content: 'No Active Quiz Bowl' })
                    }
                }
                    break;
                case 'level': { // Untested 
                    let auser = interaction.options.get("user")?.user
                    if (auser) {
                        auser = interaction.user;
                        user = serverManager.getMember(auser.id)
                    }
                    if (!auser) return;
                    let attachment = new AttachmentBuilder(await getImage(new GuildMemberManager(user), interaction.user))
                    interaction.reply({ files: [attachment] })
                }
                    break;
                case 'stats': {
                    if (!(interaction.member instanceof DiscordGuildMember)) return
                    let embed = new EmbedBuilder()
                        .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                        .setFields([
                            { name: 'XP', value: user.xp.toString(), inline: true },
                            { name: 'Coins', value: (user.balance.wallet + user.balance.bank).toString(), inline: true },
                            { name: 'Gems', value: userManager.getGlobalUser().gems.toString(), inline: true },
                            { name: 'Level', value: userManager.getLevel().toString(), inline: true }
                        ])
                    interaction.reply({ embeds: [embed] })
                }

                    break;
                case 'bank':
                case 'balance': {
                    if (!(interaction.member instanceof DiscordGuildMember)) return
                    let embed = new EmbedBuilder()
                        .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                        .setFields([
                            { name: 'Wallet', value: (user.balance.wallet).toString(), inline: true },
                            { name: 'Bank', value: (user.balance.bank).toString(), inline: true },
                            { name: 'Gems', value: userManager.getGlobalUser().gems.toString(), inline: true },])
                    interaction.reply({ embeds: [embed] })
                }
                    break;
                case 'daily': { // Time Delay Untested
                    if (Date.now() >= (userManager.getTimer('daily') + 64800000)) {
                        let xp = random(150, 250)
                        let gem = random(1, 5)
                        let currency = random(25, 50)
                        userManager.addXP(xp)
                        userManager.addWallet(currency)
                        let guser = new UserManager(userManager.getGlobalUser())
                        guser.addGems(gem)
                        guser.addXP(xp)
                        let embed = new EmbedBuilder()
                            .setColor('LuminousVividPink')
                            .setTitle('Daily Rewards')
                            .setDescription('Come back tomorrow for more rewards!')
                            .setFields([{ name: 'XP', inline: true, value: xp.toString() }, { name: 'Currency', inline: true, value: currency.toString() }, { name: 'Gems', inline: true, value: gem.toString() }])
                        userManager.setTimer('daily', Date.now())
                        interaction.reply({ embeds: [embed] })
                        userManager.addXP(1000)
                    } else {
                        interaction.reply(`You can recieve more rewards at <t:${Math.round((userManager.getTimer('daily') + 64800000) / 1000)}:t>`)
                    }
                }
                    break
                case 'flip': { // Untested Code
                    let bet = interaction.options.get('bet')?.value
                    if (typeof bet == 'number' && user.balance.wallet > bet) {
                        let win = random(0, 1)
                        let embed = new EmbedBuilder()
                            .setThumbnail(win ? 'https://cdn.discordapp.com/attachments/1040422701195603978/1106274390527705168/R.gif' : 'https://cdn.discordapp.com/attachments/858439510425337926/1106440676884893716/broken_coin.png')
                            .setTitle(win ? `It's your Lucky day!` : `Better luck next time`)
                            .setDescription(win ? `Successfully earned ${bet} coins` : `Lost ${bet} coins`)
                            .setColor('Yellow')
                        if (win == 0) {
                            userManager.addWallet(-bet)
                        } else {
                            userManager.addWallet(bet)
                        }
                        await interaction.reply({ embeds: [embed] })
                    } else {
                        interaction.reply('Your gonna need more coins to make this bet.')
                    }
                    break;
                }
                case 'crash': {
                    if (interaction.user.id == '316243027423395841') {
                        let x
                        (x as any).crash()
                    }
                }
                case 'setup': {
                    if (checkOwner(interaction, true) && !(interaction.channel instanceof StageChannel)) {
                        function convertToCompliant(string: string) {
                            const regex = /[^a-z0-9_-]/g;
                            return string.replace(regex, '');
                        }
                        await interaction.guild?.channels.fetch()
                        let backOption = { label: 'Back', value: 'back' }
                        let channels = interaction.guild?.channels.cache.filter(c => c.type == ChannelType.GuildText)
                        let channelOptions: SelectMenuComponentOptionData[] = []
                        channels?.forEach(c => {
                            channelOptions.push({ label: convertToCompliant(c.name), value: c.id })
                        })
                        let threadChannels = interaction.guild?.channels.cache.filter(c => c.type == ChannelType.GuildForum)
                        let threadChannelOptions: SelectMenuComponentOptionData[] = []
                        threadChannels?.forEach(c => {
                            threadChannelOptions.push({ label: convertToCompliant(c.name), value: c.id })
                        })
                        threadChannelOptions.push(backOption)
                        channelOptions.push(backOption)
                        let guild = data.getGuild(interaction.guildId as string)
                        let embed = new EmbedBuilder()
                            .setTitle('Server Setup Menu')
                            .setDescription('Use the selection menu below to modify different parts of the server.')
                            .addFields([
                                { name: 'Timed Games Channel', value: guild.settings.mainChannel.toString(), inline: false },
                                { name: 'Daily Quiz Bowl Channel', value: guild.settings.qbChannel.toString() },
                                { name: 'Logging Channel', value: guild.settings.loggingChannel.toString() },
                                { name: 'Mania Channel', value: guild.settings.maniaChannel.toString() },
                                { name: 'Game Thread Channel', value: guild.settings.gameThread.toString() }
                            ])
                        let row = new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(new StringSelectMenuBuilder()
                                .addOptions([
                                    {
                                        label: 'Timed Games Channel',
                                        value: 'tgchan'
                                    },
                                    {
                                        label: 'Daily Quiz Bowl Channel',
                                        value: 'dqbchan'
                                    },
                                    {
                                        label: 'Logging Channel',
                                        value: 'logchan'
                                    },
                                    {
                                        label: 'Mania Channel',
                                        value: 'manchan'
                                    },
                                    {
                                        label: 'Mania Games',
                                        value: 'mgchan'
                                    },
                                    {
                                        label: 'Game Thread Channel',
                                        value: 'gtchan'
                                    }
                                ])
                                .setCustomId('setup')
                            )
                        let response = await interaction.reply({ embeds: [embed], components: [row] })
                        const message = await interaction.fetchReply()
                        let collect = interaction.channel?.createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => (c.user.id == interaction.user.id && c.customId == 'setup' && c.message.id == message.id) })
                        function collector(collect: InteractionCollector<SelectMenuInteraction<CacheType>>) {
                            collect?.on('collect', async int => {
                                collect.stop()
                                switch (int.values[0]) {
                                    case 'tgchan': {
                                        let embed2 = new EmbedBuilder()
                                            .setTitle('Timed Games Channel Setup')
                                            .setDescription('Select the channel you would like to set as the timed games channel. Select back to go back.')
                                        let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                            .addComponents(new StringSelectMenuBuilder()
                                                .addOptions(channelOptions)
                                                .setCustomId('channel')
                                            )
                                        await int.update({ embeds: [embed2], components: [row2] })
                                        let collect = interaction.channel?.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                                        collect?.on('collect', async channel => {
                                            if (channel.values[0] !== 'back') {
                                                let guild = data.getGuild(interaction.guildId as string)
                                                guild.settings.mainChannel = channel.values[0]
                                            }
                                            let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                            if (collect) {
                                                let embed = new EmbedBuilder()
                                                    .setTitle('Server Setup Menu')
                                                    .setDescription('Use the selection menu below to modify different parts of the server.')
                                                    .addFields([
                                                        { name: 'Timed Games Channel', value: guild.settings.mainChannel.toString(), inline: false },
                                                        { name: 'Daily Quiz Bowl Channel', value: guild.settings.qbChannel.toString() },
                                                        { name: 'Logging Channel', value: guild.settings.loggingChannel.toString() },
                                                        { name: 'Mania Channel', value: guild.settings.maniaChannel.toString() },
                                                        { name: 'Game Thread Channel', value: guild.settings.gameThread.toString() }
                                                    ])
                                                await channel.update({ embeds: [embed], components: [row] });
                                                collector(collect as InteractionCollector<StringSelectMenuInteraction<CacheType>>)
                                            }
                                        })
                                    } break;
                                    case 'dqbchan': {
                                        let embed2 = new EmbedBuilder()
                                            .setTitle('Quiz Bowl Setup')
                                            .setDescription('Select the channel you would like to set as the quiz bowl channel. Select back to go back.')
                                        let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                            .addComponents(new StringSelectMenuBuilder()
                                                .addOptions(channelOptions)
                                                .setCustomId('channel')
                                            )
                                        await int.update({ embeds: [embed2], components: [row2] })
                                        let collect = interaction.channel?.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                                        collect?.on('collect', async channel => {
                                            if (channel.values[0] !== 'back') {
                                                let guild = data.getGuild(interaction.guildId as string)
                                                guild.settings.qbChannel = channel.values[0]
                                            }
                                            let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                            if (collect) {
                                                let embed = new EmbedBuilder()
                                                    .setTitle('Server Setup Menu')
                                                    .setDescription('Use the selection menu below to modify different parts of the server.')
                                                    .addFields([
                                                        { name: 'Timed Games Channel', value: guild.settings.mainChannel.toString(), inline: false },
                                                        { name: 'Daily Quiz Bowl Channel', value: guild.settings.qbChannel.toString() },
                                                        { name: 'Logging Channel', value: guild.settings.loggingChannel.toString() },
                                                        { name: 'Mania Channel', value: guild.settings.maniaChannel.toString() },
                                                        { name: 'Game Thread Channel', value: guild.settings.gameThread.toString() }
                                                    ])
                                                await channel.update({ embeds: [embed], components: [row] });
                                                collector(collect as InteractionCollector<StringSelectMenuInteraction<CacheType>>)
                                            }
                                        })
                                    } break;
                                    case 'logchan': {
                                        let embed2 = new EmbedBuilder()
                                            .setTitle('Log Channel Setup')
                                            .setDescription('Select the channel you would like to set as the logging channel. Select back to go back.')
                                        let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                            .addComponents(new StringSelectMenuBuilder()
                                                .addOptions(channelOptions)
                                                .setCustomId('channel')
                                            )
                                        await int.update({ embeds: [embed2], components: [row2] })
                                        let collect = interaction.channel?.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                                        collect?.on('collect', async channel => {
                                            if (channel.values[0] !== 'back') {
                                                let guild = data.getGuild(interaction.guildId as string)
                                                guild.settings.loggingChannel = channel.values[0]
                                            }
                                            let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                            if (collect) {
                                                let embed = new EmbedBuilder()
                                                    .setTitle('Server Setup Menu')
                                                    .setDescription('Use the selection menu below to modify different parts of the server.')
                                                    .addFields([
                                                        { name: 'Timed Games Channel', value: guild.settings.mainChannel.toString(), inline: false },
                                                        { name: 'Daily Quiz Bowl Channel', value: guild.settings.qbChannel.toString() },
                                                        { name: 'Logging Channel', value: guild.settings.loggingChannel.toString() },
                                                        { name: 'Mania Channel', value: guild.settings.maniaChannel.toString() },
                                                        { name: 'Game Thread Channel', value: guild.settings.gameThread.toString() }
                                                    ])
                                                await channel.update({ embeds: [embed], components: [row] });
                                                collector(collect as InteractionCollector<StringSelectMenuInteraction<CacheType>>)
                                            }
                                        })
                                    } break;
                                    case 'manchan': {
                                        let embed2 = new EmbedBuilder()
                                            .setTitle('Mania Setup')
                                            .setDescription('Select the channel you would like to set as the mania channel. Select back to go back.')
                                        let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                            .addComponents(new StringSelectMenuBuilder()
                                                .addOptions(channelOptions)
                                                .setCustomId('channel')
                                            )
                                        await int.update({ embeds: [embed2], components: [row2] })
                                        let collect = interaction.channel?.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                                        collect?.on('collect', async channel => {
                                            if (channel.values[0] !== 'back') {
                                                let guild = data.getGuild(interaction.guildId as string)
                                                guild.settings.maniaChannel = channel.values[0]
                                            }
                                            let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                            if (collect) {
                                                let embed = new EmbedBuilder()
                                                    .setTitle('Server Setup Menu')
                                                    .setDescription('Use the selection menu below to modify different parts of the server.')
                                                    .addFields([
                                                        { name: 'Timed Games Channel', value: guild.settings.mainChannel.toString(), inline: false },
                                                        { name: 'Daily Quiz Bowl Channel', value: guild.settings.qbChannel.toString() },
                                                        { name: 'Logging Channel', value: guild.settings.loggingChannel.toString() },
                                                        { name: 'Mania Channel', value: guild.settings.maniaChannel.toString() },
                                                        { name: 'Game Thread Channel', value: guild.settings.gameThread.toString() }
                                                    ])
                                                await channel.update({ embeds: [embed], components: [row] });
                                                collector(collect as InteractionCollector<StringSelectMenuInteraction<CacheType>>)
                                            }
                                        })
                                    } break;
                                    case 'gtchan': {
                                        let embed2 = new EmbedBuilder()
                                            .setTitle('Game Thread Setup')
                                            .setDescription('Select the threads channel you would like to set as the main channel. Select back to go back.')
                                        let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                            .addComponents(new StringSelectMenuBuilder()
                                                .addOptions(threadChannelOptions)
                                                .setCustomId('channel')
                                            )
                                        await int.update({ embeds: [embed2], components: [row2] })
                                        let collect = interaction.channel?.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                                        collect?.on('collect', async channel => {
                                            if (channel.values[0] !== 'back') {
                                                let guild = data.getGuild(interaction.guildId as string)
                                                guild.settings.gameThread = channel.values[0]
                                            }
                                            let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                            if (collect) {
                                                let embed = new EmbedBuilder()
                                                    .setTitle('Server Setup Menu')
                                                    .setDescription('Use the selection menu below to modify different parts of the server.')
                                                    .addFields([
                                                        { name: 'Timed Games Channel', value: guild.settings.mainChannel.toString(), inline: false },
                                                        { name: 'Daily Quiz Bowl Channel', value: guild.settings.qbChannel.toString() },
                                                        { name: 'Logging Channel', value: guild.settings.loggingChannel.toString() },
                                                        { name: 'Mania Channel', value: guild.settings.maniaChannel.toString() },
                                                        { name: 'Game Thread Channel', value: guild.settings.gameThread.toString() }
                                                    ])
                                                await channel.update({ embeds: [embed], components: [row] });
                                                collector(collect as InteractionCollector<StringSelectMenuInteraction<CacheType>>)
                                            }
                                        })
                                    } break;
                                }
                            })
                        }
                        if (collect) {
                            collector(collect)
                        }
                    }
                }
                    break;
                default: {
                    if (checkModerator(interaction, true)) {
                        switch (interaction.commandName) {
                            case 'xp':
                                let amount = interaction.options.get('amount')?.value
                                let type = interaction.options.get('type')?.value
                                //let user = serverManager.getUser((interaction.options.get('user')?.value as unknown as User).id)
                                if (typeof type == 'string' && typeof amount == 'number') {
                                    switch (type) {
                                        case 'set': {
                                            userManager.setXP(amount)
                                            interaction.reply(`Set <@${user}>'s xp to ${amount}`)
                                        }
                                            break;
                                        case 'remove': {
                                            userManager.addXP(-amount)
                                            interaction.reply(`Removing ${amount} xp from <@${user}>`)
                                        }
                                            break;
                                        case 'give': {
                                            userManager.addXP(amount)
                                            interaction.reply(`Giving ${amount} xp to <@${user}>`)
                                        }
                                            break;
                                        default:
                                            interaction.reply('Type Error: Xp Command')
                                            break;
                                    }
                                } else {
                                    interaction.reply('Data Error: Xp Command')
                                }
                                break;

                            default: {
                                interaction.reply('Command Unknown. (Update in Progress)')
                            }
                                break;
                        }
                    }
                }
                    break
            }
        }
    }
})
client.login(require('./token.json').token);