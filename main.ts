// Imports
import { GuildMember as GMember, AttachmentBuilder, Client, ActionRowBuilder, CommandInteraction, Interaction, TextChannel, SelectMenuInteraction, EmbedField, User, ButtonBuilder, Partials, PermissionFlagsBits, ChannelType, EmbedBuilder, ButtonStyle, ComponentType, StringSelectMenuInteraction, StringSelectMenuBuilder, StageChannel, InteractionCollector, CacheType, GuildMember as DiscordGuildMember, SelectMenuComponentOptionData, MessageComponentInteraction, ForumChannel, Attachment } from "discord.js";
import data, { GuildMemberManager, UserManager, DataManager, GuildManager, BaseUser, GlobalUser, GuildMember, CollectorManager, BaseUserManager, manifest } from './modules/data'
import { RunTimeEvents, RunTimeEventsDebug } from "./modules/RunTimeEvents";
import { dailyQB, games, blackjackThread } from "./modules/games";
import { createNameCard, numberedStringArraySingle, random } from "./modules/utilities";
import can, { loadImage } from 'canvas';

// Variables
const client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
let medals = ['🥇', '🥈', '🥉']
let runtimeEvents = new RunTimeEvents(true)
let activeQB: dailyQB[] = []
let collectorManager = new CollectorManager()
can.registerFont('./assets/fonts/segmento.otf', { family: 'Segmento' })
const previewEmbed = new EmbedBuilder().setTitle('Preview').setDescription('This is a preview').setColor('DarkButNotBlack')
// Utility Functions
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
async function getLeaderCard(users: (GMember | User)[]) {
    let canvas = can.createCanvas(2450, 1925)
    let context = canvas.getContext('2d')
    for (let i = 0; i < users.length; i++) {
        context.drawImage(await getNamecard(users[i], i + 1), Math.floor(i / 6) * 1250, (i % 6) * 325, 1200, 300)
    }
    return canvas
}
async function getNamecard(gUser: GMember | User, rank?: number) {
    let user: BaseUserManager
    let gUser2: GlobalUser
    if (gUser instanceof User) { user = new UserManager(data.getUser(gUser.id)); gUser2 = data.getUser(gUser.id) } else {
        user = new GuildMemberManager(data.getGuildManager(gUser.guild.id).getMember(gUser.id))
        gUser2 = (user as GuildMemberManager).getGlobalUser()
    }
    let userLevel = user.getLevel()
    const avatarURL = gUser.displayAvatarURL({ extension: 'png' })
    const lastRequirement = (userLevel > 1) ? DataManager.getLevelRequirement(userLevel - 1) : 0
    const requirement = DataManager.getLevelRequirement(userLevel)
    let hexColor = (gUser instanceof GMember && gUser.displayHexColor != '#000000') ? gUser.displayHexColor : '#00EDFF'
    let canvas = can.createCanvas(1200, 300)
    let context = canvas.getContext('2d')
    context.fillStyle = hexColor
    context.drawImage(await loadImage((await createNameCard(gUser2.namecard)).toBuffer()), 0, 0, 1200, 300)
    context.globalCompositeOperation = 'destination-over'
    // Avatar PFP
    let avatarCanvas = can.createCanvas(260, 260)
    let avatarContext = avatarCanvas.getContext('2d')
    avatarContext.arc(130, 130, 130, 0, Math.PI * 2, true)
    avatarContext.fill()
    avatarContext.globalCompositeOperation = 'source-in'
    avatarContext.drawImage(await can.loadImage(avatarURL ? avatarURL + "?size=1024" : './assets/images/namecards/namecard.png'), 0, 0, 260, 260)
    context.drawImage(await can.loadImage(avatarCanvas.toBuffer()), 20, 20, 260, 260)
    // Background
    let percent = Math.round(((user.user.xp - lastRequirement) / (requirement - lastRequirement)) * 700)
    context.fillRect(325, 200, percent, 50)
    context.globalCompositeOperation = 'source-over'
    context.font = '40px Segmento'
    context.fillText(gUser.displayName, 325, 180)
    context.fillStyle = '#ffffff'
    context.fillText(`Rank #${rank ? rank : user.getRank()}`, 325, 60)
    context.fillStyle = hexColor
    context.font = '30px Segmento'
    let wid = context.measureText(`Level`).width
    context.font = '40px Segmento'
    let wid2 = context.measureText(user.getLevel().toString()).width
    context.fillText(user.getLevel().toString(), 1100 - (wid2), 75)
    context.font = '30px Segmento'
    context.fillText(`Level`, 1100 - (wid2 + wid), 75)
    wid = context.measureText(`${user.user.xp - lastRequirement} / ${requirement - lastRequirement} XP`).width
    context.fillStyle = '#ffffff'
    context.fillText(`${user.user.xp - lastRequirement} / ${requirement - lastRequirement} XP`, 1025 - wid, 180)
    return canvas
}
// Client Events
client.on('ready', async () => {
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
    client.guilds.fetch()
    client.application?.commands.set([])
    client.guilds.cache.forEach(guild => {
        guild.commands.set(require('./assets/commands.json'))
    })
    runtimeEvents.on('daily', async hour => {
        activeQB = []
        client.guilds.cache.forEach(async guild => {
            let guildData = data.getGuild(guild.id)
            let channel = guild.channels.cache.get(guildData.settings.qbChannel.toString())
            if (channel instanceof TextChannel) {
                activeQB.push(new dailyQB(client, channel.id))
            }
        })
    })
    runtimeEvents.on('hour', async hour => {
        client.guilds.cache.forEach(guild => {
            let guildData = data.getGuild(guild.id)
            let channel = guildData.settings.mainChannel.toString()
            let gameManager = new games(client, channel)
            gameManager.init()
        })
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
                userManager.addXP(random(10, 25), message.channel.id)
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
        let memberManager = new GuildMemberManager(user)
        if (interaction.isChatInputCommand()) {
            if (typeof interaction.guildId !== "string") return;
            switch (interaction.commandName) {
                //Xp Commands
                case 'blackjack': {
                    let guild = data.getGuild(interaction.guildId)
                    let forumID = guild.settings.gameThread
                    let forumChannel = forumID ? client.channels.cache.get(forumID.toString()) : undefined
                    let guildMember = new GuildManager(guild).getMember(interaction.user.id)
                    if (forumChannel instanceof ForumChannel) {
                        interaction.reply({ content: 'Thread created', ephemeral: true })
                        new blackjackThread(forumChannel, guildMember)
                    } else {
                        interaction.reply({ content: 'No Game Thread Channel Set', ephemeral: true })
                    }
                    //mainChannel: 'string',
                    //qbChannel: 'string',
                    //loggingChannel: 'string',
                    //maniaChannel: 'thread',
                    //maniaGames: 'string',
                    //gameThread: 'thread'
                } break;
                case 'leaderboard': {
                    await interaction.deferReply()
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
                    let msg = await interaction.editReply({ embeds: [previewEmbed], components: [row] })
                    let update = async (id: 'gem' | 'gxp' | 'lxp' | 'cur', int?: MessageComponentInteraction) => {
                        let users: (GuildMember | GlobalUser)[] = []
                        let title = '';
                        let sortData: ((user: GuildMember | GlobalUser) => number) = () => { return 0 }
                        let sorter = (a: GuildMember | GlobalUser, b: GuildMember | GlobalUser) => { return sortData(b) - sortData(a) }
                        let list
                        switch (id) {
                            case 'gem':
                                title = 'Gems Leaderboard'
                                //@ts-ignore
                                sortData = (user) => { return (user.gems != undefined) ? user.gems : -1 }
                                list = data.getGlobalUsers()
                                break;
                            case 'gxp':
                                title = 'Global XP Leaderboard'
                                //@ts-ignore
                                sortData = (user) => { return (user.gems != undefined) ? user.xp : -1 }
                                list = data.getGlobalUsers()
                                break
                            case 'lxp':
                                title = 'XP Leaderboard'
                                //@ts-ignore
                                sortData = (user) => { return (user.guildID != undefined) ? user.xp : -1 }
                                list = memberManager.guild.members
                                break;
                            case 'cur': {
                                title = 'Coins Leaderboard';
                                //@ts-ignore
                                sortData = (user) => { return (user.guildID != undefined) ? user.balance.wallet + user.balance.bank : -1 }
                                list = memberManager.guild.members
                                break;
                            }
                            default: {
                                return;
                            }
                        }
                        list.sort(sorter)
                        let userList: (GMember | User)[] = []
                        for (let i = 0; i < 12; i++) {
                            let userData = list[i]
                            if (userData) {
                                let user: GMember | User | undefined
                                try {
                                    user = await interaction.guild?.members.fetch(userData.id)
                                } catch (error) { }
                                if (!user) user = await client.users.fetch(userData.id)
                                userList.push(user)
                                //let field: EmbedField = { name: numberedStringArraySingle((user instanceof GMember || user instanceof User) ? user.displayName : userData.id, i), value: sortData(userData).toString(), inline: true }
                                //users.push(field)
                            }
                        }
                        let attachment = new AttachmentBuilder((await getLeaderCard(userList)).toBuffer('image/png'), { name: 'leaderboard.png' })
                        let embed = new EmbedBuilder()
                            .setTitle(title)
                            .setDescription(`Users are sorted by ${title.replace(' Leaderboard', '')}`)
                            .setImage(`attachment://leaderboard.png`)
                        await msg.edit({ embeds: [embed], components: [row], files: [attachment] })
                    }
                    update('lxp')
                    msg.createMessageComponentCollector({ componentType: ComponentType.Button }).on('collect', async int => {
                        update(int.customId as 'gem' | 'gxp' | 'lxp' | 'cur', int)
                    })
                }
                    break;
                case 'namecard': {
                    let url = interaction.options.getString('url')
                    if (url) {
                        let userManager = new UserManager(memberManager.getGlobalUser())
                        userManager.setNamecard(url)
                        interaction.reply({ content: 'Namecard updated', ephemeral: true })
                    } else {
                        interaction.reply({ content: 'Namecard update failed', ephemeral: true })
                    }
                } break;
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
                                    user.addXP(1000, interaction.channelId)
                                    user.addWallet(50)
                                    let message = interaction.channel?.messages.cache.get(qb.message)
                                    if (message) {
                                        let embed = message.embeds[0]
                                        let newEmbed = new EmbedBuilder()
                                            .setTitle('Daily Quiz Bowl')
                                            .setDescription(embed.description)
                                            .setFields(embed.fields)
                                            .addFields([{ name: 'First Answerer', value: `${interaction.user.displayName}`, inline: false }])
                                            .setFooter(embed.footer)
                                            .setColor('Green')
                                        message.edit({ embeds: [newEmbed] })
                                    }
                                } else {
                                    interaction.reply({ content: 'Correct Answer! 250 xp and 10 coins has been awarded for answering.', ephemeral: true })
                                    user.addXP(250, interaction.channelId)
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
                case 'level': {
                    let auser = interaction.options.get("user")?.user
                    if (auser) {
                        user = serverManager.getMember(auser.id)
                    }
                    let member: GMember | undefined = interaction.guild?.members.cache.get(user.id)
                    if (member instanceof GMember) {
                        let attachment = new AttachmentBuilder((await getNamecard(member)).toBuffer('image/png'))
                        interaction.reply({ files: [attachment] })
                    }
                }
                    break;
                case 'stats': { // Replace this later with an actual stat board
                    if (!(interaction.member instanceof DiscordGuildMember)) return
                    let embed = new EmbedBuilder()
                        .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                        .setFields([
                            { name: 'XP', value: user.xp.toString(), inline: true },
                            { name: 'Coins', value: (user.balance.wallet + user.balance.bank).toString(), inline: true },
                            { name: 'Gems', value: memberManager.getGlobalUser().gems.toString(), inline: true },
                            { name: 'Level', value: memberManager.getLevel().toString(), inline: true }
                        ])
                    interaction.reply({ embeds: [embed] })
                }

                    break;
                case 'bank':
                case 'balance': {
                    let member = interaction.member
                    if (!(member instanceof GMember)) return
                    member
                    let amember = interaction.options.get("user")?.member
                    if (amember instanceof GMember) {
                        member = amember
                        user = serverManager.getMember(member.id)
                    }
                    let embed = new EmbedBuilder()
                        .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                        .setFields([
                            { name: 'Wallet', value: (user.balance.wallet).toString(), inline: true },
                            { name: 'Bank', value: (user.balance.bank).toString(), inline: true },
                            { name: 'Gems', value: memberManager.getGlobalUser().gems.toString(), inline: true },])
                    interaction.reply({ embeds: [embed] })
                }
                    break;
                case 'daily': {
                    if (Date.now() >= (memberManager.getTimer('daily') + 64800000)) {
                        let xp = random(150, 250)
                        let gem = random(10, 15)
                        let currency = random(20, 100)
                        memberManager.addXP(xp, interaction.channelId)
                        memberManager.addWallet(currency)
                        let guser = new UserManager(memberManager.getGlobalUser())
                        guser.addGems(gem)
                        guser.addXP(xp)
                        let embed = new EmbedBuilder()
                            .setColor('LuminousVividPink')
                            .setTitle('Daily Rewards')
                            .setDescription('Come back tomorrow for more rewards!')
                            .setFields([{ name: 'XP', inline: true, value: xp.toString() }, { name: 'Currency', inline: true, value: currency.toString() }, { name: 'Gems', inline: true, value: gem.toString() }])
                        memberManager.setTimer('daily', Date.now())
                        let reply = await interaction.reply({ embeds: [embed] })
                        setTimeout(() => {
                            reply.delete()
                        }, 20000);
                    } else {
                        interaction.reply(`You can recieve more rewards at <t:${Math.round((memberManager.getTimer('daily') + 64800000) / 1000)}:t>`)
                    }
                }
                    break
                case 'flip': { // Untested Code
                    let bet = interaction.options.get('bet')?.value
                    if (memberManager.getTimer('flip') + 30000 < Date.now()) {
                        if (typeof bet == 'number' && bet > 50) {
                            if (typeof bet == 'number' && user.balance.wallet < bet) {
                                memberManager.setTimer('flip', Date.now())
                                let win = random(0, 1)
                                let embed = new EmbedBuilder()
                                    .setThumbnail(win ? 'https://cdn.discordapp.com/attachments/1040422701195603978/1106274390527705168/R.gif' : 'https://cdn.discordapp.com/attachments/858439510425337926/1106440676884893716/broken_coin.png')
                                    .setTitle(win ? `It's your Lucky day!` : `Better luck next time`)
                                    .setDescription(win ? `Successfully earned ${bet} coins` : `Lost ${bet} coins`)
                                    .setColor('Yellow')
                                if (win == 0) {
                                    memberManager.removeWallet(bet)
                                } else {
                                    memberManager.addWallet(bet)
                                }
                                await interaction.reply({ embeds: [embed] })
                            } else {
                                interaction.reply({ content: `You're gonna need more coins to make this bet.`, ephemeral: true })
                            }
                        } else {
                            interaction.reply({ content: 'You need to bet atleast 50 coins.', ephemeral: true })
                        }
                    } else {
                        interaction.reply({ content: `You can flip again at <t:${Math.round((memberManager.getTimer('flip') + 30000) / 1000)}:t>`, ephemeral: true })
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
                        // Guild Channel Fetch
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
                        // Guild Data Fetch
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
                        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
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
                        const int = await interaction.reply({ embeds: [embed], components: [row] })
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
                case 'write': {
                    if (checkOwner(interaction, true)) {
                        data.write()
                        interaction.reply('The cache is now updated.')
                    }
                }
                    break;
                case 'publicshop': {
                    let data: manifest = require('./assets/images/namecards/manifest.json')
                    let namecards = data.namecards
                    let canvas = can.createCanvas(2450, 1925)
                    let context = canvas.getContext('2d')
                    for (let i = 0; i < data.namecards.length; i++) {
                        let namecard = data.namecards[i]
                        context.drawImage(await loadImage(`./assets/images/namecards/${namecard.path}`), Math.floor(i / 6) * 1250, (i % 6) * 325, 1200, 300)
                    }

                }
                default: {
                    if (checkModerator(interaction, true)) {
                        switch (interaction.commandName) {
                            case 'xp':
                                let amount = interaction.options.get('amount')?.value
                                let type = interaction.options.get('type')?.value
                                let user = interaction.options.get('user')?.value
                                if (typeof user == 'string') {
                                    memberManager = new GuildMemberManager(serverManager.getMember(user))
                                } else {
                                    user = interaction.user.id
                                }
                                if (typeof type == 'string' && typeof amount == 'number') {
                                    switch (type) {
                                        case 'set': {
                                            memberManager.setXP(amount)
                                            interaction.reply(`Set <@${user}>'s xp to ${amount}`)
                                        }
                                            break;
                                        case 'remove': {
                                            memberManager.removeXP(amount)
                                            interaction.reply(`Removing ${amount} xp from <@${user}>`)
                                        }
                                            break;
                                        case 'give': {
                                            memberManager.removeXP(amount)
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
                            case 'gem': {
                                let amount = interaction.options.get('amount')?.value
                                let type = interaction.options.get('type')?.value
                                let user = interaction.options.get('user')?.value
                                let userManager = memberManager.getUserManager()
                                if (typeof user == 'string') {
                                    userManager = new GuildMemberManager(serverManager.getMember(user)).getUserManager()
                                } else {
                                    user = interaction.user.id
                                }
                                if (typeof type == 'string' && typeof amount == 'number') {
                                    switch (type) {
                                        case 'set': {
                                            userManager.setGems(amount)
                                            interaction.reply(`Set <@${user}>'s gems to ${amount}`)
                                        }
                                            break;
                                        case 'remove': {
                                            userManager.removeGems(amount)
                                            interaction.reply(`Removing ${amount} gems from <@${user}>`)
                                        }
                                            break;
                                        case 'give': {
                                            userManager.addGems(amount)
                                            interaction.reply(`Giving ${amount} gems to <@${user}>`)
                                        }
                                            break;
                                        default:
                                            interaction.reply('Type Error: Xp Command')
                                            break;
                                    }
                                } else {
                                    interaction.reply('Data Error: Xp Command')
                                }
                            }
                            case 'punish': {
                                console.log(interaction)
                            } break
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
client.login(require('./assets/token.json').token);