// Imports

import { AttachmentBuilder, Client, ActionRowBuilder, CommandInteraction, Interaction, Message, Embed, TextChannel, SelectMenuInteraction, SelectMenuBuilder, EmbedField, SelectMenuOptionBuilder, User, GuildMemberRoleManager, ButtonBuilder, ButtonInteraction, Partials, GatewayIntentBits, AnyAPIActionRowComponent, AnyComponentBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ButtonStyle, ComponentType, StringSelectMenuInteraction, StringSelectMenuBuilder, StageChannel, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder, NewsChannel, PublicThreadChannel, VoiceChannel, PrivateThreadChannel, PartialDMChannel, DMChannel, InteractionCollector, CacheType, GuildMember as DiscordGuildMember } from "discord.js";
import can from 'canvas';

const client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
let medals = ['🥇', '🥈', '🥉']
let charMap = "`~1!2@3#4$5%6^7&8*9(0)-_=+qwertyuiop[{]};:'.>,<qwertyuiopasdfghjklzxcvbnm /?|" + '"'
import data, { BaseUserManager, GuildMember, GuildMemberManager, UserManager, Guild, DataManager, GuildManager, BaseUser, GlobalUser } from './modules/datamanager'
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
client.on('ready', () => {
    client.guilds.fetch()
    client.application?.commands.set([])
    client.guilds.cache.forEach(guild => {
        guild.commands.set(require('./commands.json'))
    })
})
client.on('messageCreate', message => {
    // Add xp on message and game responses
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
                        interaction.reply(`You can recieve more rewards at <t:${Math.round((userManager.getTimer('daily')+ 64800000) / 1000)}:t>`)
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
                        let embed = new EmbedBuilder()
                            .setTitle('Server Setup Menu')
                            .setDescription('Use the selection menu below to modify different parts of the server.')
                        let row = new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(new StringSelectMenuBuilder()
                                .addOptions([
                                    {
                                        label: 'Games Channel',
                                        value: 'gchan'
                                    },
                                    {
                                        label: 'Games (Enabled/Disabled)',
                                        value: 'gbool'
                                    },
                                    {
                                        label: 'Games Delay',
                                        value: 'gdelay'
                                    }
                                ])
                                .setCustomId('setup')
                            )
                        interaction.reply({ embeds: [embed], components: [row] })
                        let collect = interaction.channel?.createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' })
                        function collector(collect: InteractionCollector<SelectMenuInteraction<CacheType>>) {
                            collect?.on('collect', async int => {
                                collect.stop()
                                switch (int.values[0]) {
                                    case 'gdelay': {
                                        let emb = new EmbedBuilder()
                                            .setTitle('Set Game Delay')
                                            .setDescription('Select a number below in hours.')
                                        let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                            .addComponents(new StringSelectMenuBuilder()
                                                .addOptions([
                                                    {
                                                        label: '1',
                                                        value: '1'
                                                    },
                                                    {
                                                        label: '2',
                                                        value: '2'
                                                    },
                                                    {
                                                        label: '3',
                                                        value: '3'
                                                    },
                                                    {
                                                        label: '4',
                                                        value: '4',
                                                    },
                                                    {
                                                        label: '5',
                                                        value: '5',
                                                    }, {
                                                        label: '6',
                                                        value: '6',
                                                    }
                                                ])
                                                .setCustomId('delay')
                                            );

                                        await int.update({ embeds: [emb], components: [row2] });
                                        let collect = (interaction.channel as DMChannel | PartialDMChannel | NewsChannel | TextChannel | PrivateThreadChannel | PublicThreadChannel<boolean> | VoiceChannel | null)?.createMessageComponentCollector({ filter: t => t.customId == 'delay' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                                        collect?.on('collect', async int => {
                                            let guild = data.getGuild(interaction.guildId as string)
                                            guild.settings.gameDelay = Number(int.values[0]) * 3600000
                                            let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                            if (collect) {
                                                await int.update({ embeds: [embed], components: [row] });
                                                collector(collect as InteractionCollector<SelectMenuInteraction<CacheType>>)
                                            }
                                        })
                                    }
                                        break;
                                    case 'gchan': {
                                        let emb = new EmbedBuilder()
                                            .setTitle('Set Game Channel')
                                            .setDescription('Select a channel below.')
                                        let row2 = new ActionRowBuilder<ChannelSelectMenuBuilder>()
                                            .addComponents(new ChannelSelectMenuBuilder()
                                                .setCustomId('channel')
                                                .setChannelTypes([ChannelType.GuildText])
                                            );
                                        await int.update({ embeds: [emb], components: [row2] });
                                        let collect = (interaction.channel as DMChannel | PartialDMChannel | NewsChannel | TextChannel | PrivateThreadChannel | PublicThreadChannel<boolean> | VoiceChannel | null)?.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: ComponentType.ChannelSelect, idle: 120000, max: 1 })
                                        collect?.on('collect', async channel => {
                                            let guild = data.getGuild(interaction.guildId as string)
                                            guild.settings.mainChannel = channel.values[0]
                                            let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                            if (collect) {
                                                await channel.update({ embeds: [embed], components: [row] });
                                                collector(collect as InteractionCollector<SelectMenuInteraction<CacheType>>)
                                            }
                                        })
                                    }
                                        break;
                                    case 'gbool':
                                        let emb = new EmbedBuilder()
                                            .setTitle('Set if games are enabled.')
                                            .setDescription('Select Enabled or Disabled')
                                        let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                            .addComponents(new StringSelectMenuBuilder()
                                                .addOptions([
                                                    {
                                                        label: 'Enabled',
                                                        value: 'true'
                                                    },
                                                    {
                                                        label: 'Disabled',
                                                        value: 'false'
                                                    }
                                                ])
                                                .setCustomId('bool')
                                            );

                                        await int.update({ embeds: [emb], components: [row2] });
                                        let collect = (interaction.channel as DMChannel | PartialDMChannel | NewsChannel | TextChannel | PrivateThreadChannel | PublicThreadChannel<boolean> | VoiceChannel | null)?.createMessageComponentCollector({ filter: t => t.customId == 'bool' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                                        collect?.on('collect', async int => {
                                            let guild = data.getGuild(interaction.guildId as string)
                                            guild.settings.gameToggle = eval(int.values[0])
                                            let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                            if (collect) {
                                                await int.update({ embeds: [embed], components: [row] });
                                                collector(collect as InteractionCollector<SelectMenuInteraction<CacheType>>)
                                            }
                                        })
                                        break;
                                    default:
                                        break;
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