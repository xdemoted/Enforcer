"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
const discord_js_1 = require("discord.js");
const data_1 = __importStar(require("./modules/data"));
const RunTimeEvents_1 = require("./modules/RunTimeEvents");
const games_1 = require("./modules/games");
const utilities_1 = require("./modules/utilities");
const canvas_1 = __importStar(require("canvas"));
// Variables
const client = new discord_js_1.Client({ partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel, discord_js_1.Partials.Reaction, discord_js_1.Partials.GuildMember, discord_js_1.Partials.User], intents: 131071 });
let medals = ['🥇', '🥈', '🥉'];
let runtimeEvents = new RunTimeEvents_1.RunTimeEvents(true);
let activeQB = [];
let collectorManager = new data_1.CollectorManager();
canvas_1.default.registerFont('./assets/fonts/segmento.otf', { family: 'Segmento' });
const previewEmbed = new discord_js_1.EmbedBuilder().setTitle('Preview').setDescription('This is a preview').setColor('DarkButNotBlack');
// Utility Functions
function checkModerator(interaction, reply) {
    var _a;
    let permissions = (_a = interaction.member) === null || _a === void 0 ? void 0 : _a.permissions;
    if (permissions && typeof permissions != 'string') {
        if (permissions.has(discord_js_1.PermissionFlagsBits.Administrator)) {
            return true;
        }
        else {
            if (reply) {
                interaction.reply("This command has been reserved for administration.");
            }
            return false;
        }
    }
}
function checkOwner(interaction, reply) {
    var _a, _b;
    let permissions = (_a = interaction.member) === null || _a === void 0 ? void 0 : _a.permissions;
    if (permissions && typeof permissions != 'string') {
        if (((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.ownerId) == interaction.user.id) {
            return true;
        }
        else {
            if (reply) {
                interaction.reply("This command has been reserved for the server owner.");
            }
            return false;
        }
    }
}
// Image Generation
function getWelcomeBanner(imagelink) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = canvas_1.default.createCanvas(1200, 300);
        let context = canvas.getContext('2d');
        context.drawImage(yield canvas_1.default.loadImage(imagelink), 478, 51, 203, 203);
        context.drawImage(yield canvas_1.default.loadImage('./welcome.png'), 0, 0, 1200, 300);
        return canvas.toBuffer('image/png');
    });
}
function getLeaderCard(users) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = canvas_1.default.createCanvas(2450, 1925);
        let context = canvas.getContext('2d');
        for (let i = 0; i < users.length; i++) {
            context.drawImage(yield getNamecard(users[i], i + 1), Math.floor(i / 6) * 1250, (i % 6) * 325, 1200, 300);
        }
        return canvas;
    });
}
function getNamecard(gUser, rank) {
    return __awaiter(this, void 0, void 0, function* () {
        let user;
        let gUser2;
        if (gUser instanceof discord_js_1.User) {
            user = new data_1.UserManager(data_1.default.getUser(gUser.id));
            gUser2 = data_1.default.getUser(gUser.id);
        }
        else {
            user = new data_1.GuildMemberManager(data_1.default.getGuildManager(gUser.guild.id).getMember(gUser.id));
            gUser2 = user.getGlobalUser();
        }
        let userLevel = user.getLevel();
        const avatarURL = gUser.displayAvatarURL({ extension: 'png' });
        const lastRequirement = (userLevel > 1) ? data_1.DataManager.getLevelRequirement(userLevel - 1) : 0;
        const requirement = data_1.DataManager.getLevelRequirement(userLevel);
        let hexColor = (gUser instanceof discord_js_1.GuildMember && gUser.displayHexColor != '#000000') ? gUser.displayHexColor : '#00EDFF';
        let canvas = canvas_1.default.createCanvas(1200, 300);
        let context = canvas.getContext('2d');
        context.fillStyle = hexColor;
        context.drawImage(yield (0, canvas_1.loadImage)((yield (0, utilities_1.createNameCard)(gUser2.namecard)).toBuffer()), 0, 0, 1200, 300);
        context.globalCompositeOperation = 'destination-over';
        // Avatar PFP
        let avatarCanvas = canvas_1.default.createCanvas(260, 260);
        let avatarContext = avatarCanvas.getContext('2d');
        avatarContext.arc(130, 130, 130, 0, Math.PI * 2, true);
        avatarContext.fill();
        avatarContext.globalCompositeOperation = 'source-in';
        avatarContext.drawImage(yield canvas_1.default.loadImage(avatarURL ? avatarURL + "?size=1024" : './assets/images/namecards/namecard.png'), 0, 0, 260, 260);
        context.drawImage(yield canvas_1.default.loadImage(avatarCanvas.toBuffer()), 20, 20, 260, 260);
        // Background
        let percent = Math.round(((user.user.xp - lastRequirement) / (requirement - lastRequirement)) * 700);
        context.fillRect(325, 200, percent, 50);
        context.globalCompositeOperation = 'source-over';
        context.font = '40px Segmento';
        context.fillText(gUser.displayName, 325, 180);
        context.fillStyle = '#ffffff';
        context.fillText(`Rank #${rank ? rank : user.getRank()}`, 325, 60);
        context.fillStyle = hexColor;
        context.font = '30px Segmento';
        let wid = context.measureText(`Level`).width;
        context.font = '40px Segmento';
        let wid2 = context.measureText(user.getLevel().toString()).width;
        context.fillText(user.getLevel().toString(), 1100 - (wid2), 75);
        context.font = '30px Segmento';
        context.fillText(`Level`, 1100 - (wid2 + wid), 75);
        wid = context.measureText(`${user.user.xp - lastRequirement} / ${requirement - lastRequirement} XP`).width;
        context.fillStyle = '#ffffff';
        context.fillText(`${user.user.xp - lastRequirement} / ${requirement - lastRequirement} XP`, 1025 - wid, 180);
        return canvas;
    });
}
// Client Events
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    data_1.default.eventEmitter.on('levelUp', (userID, channelID) => __awaiter(void 0, void 0, void 0, function* () {
        let channel = client.channels.cache.get(channelID);
        if (channel instanceof discord_js_1.TextChannel) {
            let user = channel.guild.members.cache.get(userID);
            if (user instanceof discord_js_1.GuildMember) {
                let message = yield channel.send(`**Level Up!** <@${userID}> is now level ${new data_1.GuildMemberManager(data_1.default.getGuildManager(channel.guild.id).getMember(user.id)).getLevel()}`);
                setTimeout(() => {
                    if (message.deletable)
                        message.delete();
                }, 10000);
            }
        }
    }));
    client.guilds.fetch();
    (_a = client.application) === null || _a === void 0 ? void 0 : _a.commands.set([]);
    client.guilds.cache.forEach(guild => {
        guild.commands.set(require('./assets/commands.json'));
    });
    runtimeEvents.on('daily', (hour) => __awaiter(void 0, void 0, void 0, function* () {
        activeQB = [];
        client.guilds.cache.forEach((guild) => __awaiter(void 0, void 0, void 0, function* () {
            let guildData = data_1.default.getGuild(guild.id);
            let channel = guild.channels.cache.get(guildData.settings.qbChannel.toString());
            if (channel instanceof discord_js_1.TextChannel) {
                activeQB.push(new games_1.dailyQB(client, channel.id));
            }
        }));
    }));
    runtimeEvents.on('hour', (hour) => __awaiter(void 0, void 0, void 0, function* () {
        client.guilds.cache.forEach(guild => {
            let guildData = data_1.default.getGuild(guild.id);
            let channel = guildData.settings.mainChannel.toString();
            let gameManager = new games_1.games(client, channel);
            gameManager.init();
        });
    }));
    runtimeEvents.on('5minute', () => {
        data_1.default.write();
    });
}));
client.on('messageDelete', (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f;
    if ((_b = message.author) === null || _b === void 0 ? void 0 : _b.bot)
        return;
    let channelID = data_1.default.getGuild((_c = message.guild) === null || _c === void 0 ? void 0 : _c.id).settings.loggingChannel;
    let channel = (_d = message.guild) === null || _d === void 0 ? void 0 : _d.channels.cache.get(channelID.toString());
    if (channel instanceof discord_js_1.TextChannel) {
        if (message.content == undefined || message.content.length < 256) {
            let embed = new discord_js_1.EmbedBuilder()
                .setColor('Red')
                .setTitle('Message Deleted')
                .setDescription(`Message sent by <@${(_e = message.author) === null || _e === void 0 ? void 0 : _e.id}> deleted in <#${message.channel.id}>`)
                .addFields([{ name: 'Content', value: (message.content) ? message.content : 'No Message Content', inline: false }])
                .setTimestamp(message.createdAt);
            channel.send({ embeds: [embed], files: Array.from(message.attachments.values()) });
        }
        else if (message.content) {
            let embed = new discord_js_1.EmbedBuilder()
                .setColor('Red')
                .setTitle('Message Deleted')
                .setDescription(`Message sent by <@${(_f = message.author) === null || _f === void 0 ? void 0 : _f.id}> deleted in <#${message.channel.id}>`)
                .addFields([{ name: 'Content', value: 'Posted Above', inline: false }])
                .setTimestamp(message.createdAt);
            channel.send({ embeds: [embed], files: Array.from(message.attachments.values()), content: message.content });
        }
    }
}));
client.on('messageCreate', message => {
    // Add xp on message and game responses
    if (message.content.length > 5) {
        if (message.guild) {
            let serverManager = data_1.default.getGuildManager(message.guild.id);
            let user = serverManager.getMember(message.author.id);
            let userManager = new data_1.GuildMemberManager(user);
            if (userManager.getTimer('message') + 60000 < Date.now()) {
                userManager.addXP((0, utilities_1.random)(10, 25), message.channel.id);
                userManager.addWallet((0, utilities_1.random)(1, 5));
                let guser = new data_1.UserManager(userManager.getGlobalUser());
                guser.addXP((0, utilities_1.random)(1, 5));
                userManager.setTimer('message', Date.now());
            }
        }
    }
});
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    if (interaction.guildId) {
        let serverManager = data_1.default.getGuildManager(interaction.guildId);
        if (!(serverManager instanceof data_1.GuildManager)) {
            serverManager = new data_1.GuildManager(data_1.default.registerGuild(interaction.guildId));
        }
        let user = serverManager.getMember(interaction.user.id);
        let memberManager = new data_1.GuildMemberManager(user);
        if (interaction.isChatInputCommand()) {
            if (typeof interaction.guildId !== "string")
                return;
            switch (interaction.commandName) {
                //Xp Commands
                case 'blackjack':
                    {
                        let guild = data_1.default.getGuild(interaction.guildId);
                        let forumID = guild.settings.gameThread;
                        let forumChannel = forumID ? client.channels.cache.get(forumID.toString()) : undefined;
                        let guildMember = new data_1.GuildManager(guild).getMember(interaction.user.id);
                        if (forumChannel instanceof discord_js_1.ForumChannel) {
                            interaction.reply({ content: 'Thread created', ephemeral: true });
                            new games_1.blackjackThread(forumChannel, guildMember);
                        }
                        else {
                            interaction.reply({ content: 'No Game Thread Channel Set', ephemeral: true });
                        }
                        //mainChannel: 'string',
                        //qbChannel: 'string',
                        //loggingChannel: 'string',
                        //maniaChannel: 'thread',
                        //maniaGames: 'string',
                        //gameThread: 'thread'
                    }
                    break;
                case 'leaderboard':
                    {
                        yield interaction.deferReply();
                        let row = new discord_js_1.ActionRowBuilder()
                            .addComponents([
                            new discord_js_1.ButtonBuilder()
                                .setStyle(discord_js_1.ButtonStyle.Primary)
                                .setCustomId('gem')
                                .setLabel('Gems'),
                            new discord_js_1.ButtonBuilder()
                                .setStyle(discord_js_1.ButtonStyle.Secondary)
                                .setCustomId('gxp')
                                .setLabel('Global XP'),
                            new discord_js_1.ButtonBuilder()
                                .setStyle(discord_js_1.ButtonStyle.Danger)
                                .setCustomId('cur')
                                .setLabel('Coins'),
                            new discord_js_1.ButtonBuilder()
                                .setStyle(discord_js_1.ButtonStyle.Success)
                                .setCustomId('lxp')
                                .setLabel('Local XP')
                        ]);
                        let msg = yield interaction.editReply({ embeds: [previewEmbed], components: [row] });
                        let update = (id, int) => __awaiter(void 0, void 0, void 0, function* () {
                            var _x;
                            let users = [];
                            let title = '';
                            let sortData = () => { return 0; };
                            let sorter = (a, b) => { return sortData(b) - sortData(a); };
                            let list;
                            switch (id) {
                                case 'gem':
                                    title = 'Gems Leaderboard';
                                    //@ts-ignore
                                    sortData = (user) => { return (user.gems != undefined) ? user.gems : -1; };
                                    list = data_1.default.getGlobalUsers();
                                    break;
                                case 'gxp':
                                    title = 'Global XP Leaderboard';
                                    //@ts-ignore
                                    sortData = (user) => { return (user.gems != undefined) ? user.xp : -1; };
                                    list = data_1.default.getGlobalUsers();
                                    break;
                                case 'lxp':
                                    title = 'XP Leaderboard';
                                    //@ts-ignore
                                    sortData = (user) => { return (user.guildID != undefined) ? user.xp : -1; };
                                    list = memberManager.guild.members;
                                    break;
                                case 'cur': {
                                    title = 'Coins Leaderboard';
                                    //@ts-ignore
                                    sortData = (user) => { return (user.guildID != undefined) ? user.balance.wallet + user.balance.bank : -1; };
                                    list = memberManager.guild.members;
                                    break;
                                }
                                default: {
                                    return;
                                }
                            }
                            list.sort(sorter);
                            let userList = [];
                            for (let i = 0; i < 12; i++) {
                                let userData = list[i];
                                if (userData) {
                                    let user;
                                    try {
                                        user = yield ((_x = interaction.guild) === null || _x === void 0 ? void 0 : _x.members.fetch(userData.id));
                                    }
                                    catch (error) { }
                                    if (!user)
                                        user = yield client.users.fetch(userData.id);
                                    userList.push(user);
                                    //let field: EmbedField = { name: numberedStringArraySingle((user instanceof GMember || user instanceof User) ? user.displayName : userData.id, i), value: sortData(userData).toString(), inline: true }
                                    //users.push(field)
                                }
                            }
                            let attachment = new discord_js_1.AttachmentBuilder((yield getLeaderCard(userList)).toBuffer('image/png'), { name: 'leaderboard.png' });
                            let embed = new discord_js_1.EmbedBuilder()
                                .setTitle(title)
                                .setDescription(`Users are sorted by ${title.replace(' Leaderboard', '')}`)
                                .setImage(`attachment://leaderboard.png`);
                            yield msg.edit({ embeds: [embed], components: [row], files: [attachment] });
                        });
                        update('lxp');
                        msg.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.Button }).on('collect', (int) => __awaiter(void 0, void 0, void 0, function* () {
                            update(int.customId, int);
                        }));
                    }
                    break;
                case 'namecard':
                    {
                        let url = interaction.options.getString('url');
                        if (url) {
                            let userManager = new data_1.UserManager(memberManager.getGlobalUser());
                            userManager.setNamecard(url);
                            interaction.reply({ content: 'Namecard updated', ephemeral: true });
                        }
                        else {
                            interaction.reply({ content: 'Namecard update failed', ephemeral: true });
                        }
                    }
                    break;
                case 'answer':
                    {
                        let answer = interaction.options.getString('answer');
                        let qb = activeQB.find(qb => qb.channel == interaction.channelId);
                        if (answer && qb) {
                            let response = yield (qb === null || qb === void 0 ? void 0 : qb.checkanswer(answer));
                            let user = new data_1.GuildMemberManager(serverManager.getMember(interaction.user.id));
                            if (user.getTimer('qb') < qb.startTime) {
                                if (response == 'accept') {
                                    if (qb.open) {
                                        interaction.reply({ content: 'Correct Answer! 1000 xp and 50 coins has been awarded for being first.', ephemeral: true });
                                        user.addXP(1000, interaction.channelId);
                                        user.addWallet(50);
                                        let message = (_g = interaction.channel) === null || _g === void 0 ? void 0 : _g.messages.cache.get(qb.message);
                                        if (message) {
                                            let embed = message.embeds[0];
                                            let newEmbed = new discord_js_1.EmbedBuilder()
                                                .setTitle('Daily Quiz Bowl')
                                                .setDescription(embed.description)
                                                .setFields(embed.fields)
                                                .addFields([{ name: 'First Answerer', value: `${interaction.user.displayName}`, inline: false }])
                                                .setFooter(embed.footer)
                                                .setColor('Green');
                                            message.edit({ embeds: [newEmbed] });
                                        }
                                    }
                                    else {
                                        interaction.reply({ content: 'Correct Answer! 250 xp and 10 coins has been awarded for answering.', ephemeral: true });
                                        user.addXP(250, interaction.channelId);
                                        user.addWallet(10);
                                    }
                                    user.setTimer('qb', Date.now());
                                }
                                else {
                                    interaction.reply({ content: response, ephemeral: true });
                                }
                            }
                            else {
                                interaction.reply({ content: 'Come back tomorrow for a new prompt.', ephemeral: true });
                            }
                        }
                        else {
                            interaction.reply({ ephemeral: true, content: 'No Active Quiz Bowl' });
                        }
                    }
                    break;
                case 'level':
                    {
                        let auser = (_h = interaction.options.get("user")) === null || _h === void 0 ? void 0 : _h.user;
                        if (auser) {
                            user = serverManager.getMember(auser.id);
                        }
                        let member = (_j = interaction.guild) === null || _j === void 0 ? void 0 : _j.members.cache.get(user.id);
                        if (member instanceof discord_js_1.GuildMember) {
                            let attachment = new discord_js_1.AttachmentBuilder((yield getNamecard(member)).toBuffer('image/png'));
                            interaction.reply({ files: [attachment] });
                        }
                    }
                    break;
                case 'stats':
                    { // Replace this later with an actual stat board
                        if (!(interaction.member instanceof discord_js_1.GuildMember))
                            return;
                        let embed = new discord_js_1.EmbedBuilder()
                            .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                            .setFields([
                            { name: 'XP', value: user.xp.toString(), inline: true },
                            { name: 'Coins', value: (user.balance.wallet + user.balance.bank).toString(), inline: true },
                            { name: 'Gems', value: memberManager.getGlobalUser().gems.toString(), inline: true },
                            { name: 'Level', value: memberManager.getLevel().toString(), inline: true }
                        ]);
                        interaction.reply({ embeds: [embed] });
                    }
                    break;
                case 'bank':
                case 'balance':
                    {
                        let member = interaction.member;
                        if (!(member instanceof discord_js_1.GuildMember))
                            return;
                        member;
                        let amember = (_k = interaction.options.get("user")) === null || _k === void 0 ? void 0 : _k.member;
                        if (amember instanceof discord_js_1.GuildMember) {
                            member = amember;
                            user = serverManager.getMember(member.id);
                        }
                        let embed = new discord_js_1.EmbedBuilder()
                            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                            .setFields([
                            { name: 'Wallet', value: (user.balance.wallet).toString(), inline: true },
                            { name: 'Bank', value: (user.balance.bank).toString(), inline: true },
                            { name: 'Gems', value: memberManager.getGlobalUser().gems.toString(), inline: true },
                        ]);
                        interaction.reply({ embeds: [embed] });
                    }
                    break;
                case 'daily':
                    {
                        if (Date.now() >= (memberManager.getTimer('daily') + 64800000)) {
                            let xp = (0, utilities_1.random)(150, 250);
                            let gem = (0, utilities_1.random)(10, 15);
                            let currency = (0, utilities_1.random)(20, 100);
                            memberManager.addXP(xp, interaction.channelId);
                            memberManager.addWallet(currency);
                            let guser = new data_1.UserManager(memberManager.getGlobalUser());
                            guser.addGems(gem);
                            guser.addXP(xp);
                            let embed = new discord_js_1.EmbedBuilder()
                                .setColor('LuminousVividPink')
                                .setTitle('Daily Rewards')
                                .setDescription('Come back tomorrow for more rewards!')
                                .setFields([{ name: 'XP', inline: true, value: xp.toString() }, { name: 'Currency', inline: true, value: currency.toString() }, { name: 'Gems', inline: true, value: gem.toString() }]);
                            memberManager.setTimer('daily', Date.now());
                            let reply = yield interaction.reply({ embeds: [embed] });
                            setTimeout(() => {
                                reply.delete();
                            }, 20000);
                        }
                        else {
                            interaction.reply(`You can recieve more rewards at <t:${Math.round((memberManager.getTimer('daily') + 64800000) / 1000)}:t>`);
                        }
                    }
                    break;
                case 'flip': { // Untested Code
                    let bet = (_l = interaction.options.get('bet')) === null || _l === void 0 ? void 0 : _l.value;
                    if (memberManager.getTimer('flip') + 30000 < Date.now()) {
                        if (typeof bet == 'number' && bet > 50) {
                            if (typeof bet == 'number' && user.balance.wallet < bet) {
                                memberManager.setTimer('flip', Date.now());
                                let win = (0, utilities_1.random)(0, 1);
                                let embed = new discord_js_1.EmbedBuilder()
                                    .setThumbnail(win ? 'https://cdn.discordapp.com/attachments/1040422701195603978/1106274390527705168/R.gif' : 'https://cdn.discordapp.com/attachments/858439510425337926/1106440676884893716/broken_coin.png')
                                    .setTitle(win ? `It's your Lucky day!` : `Better luck next time`)
                                    .setDescription(win ? `Successfully earned ${bet} coins` : `Lost ${bet} coins`)
                                    .setColor('Yellow');
                                if (win == 0) {
                                    memberManager.removeWallet(bet);
                                }
                                else {
                                    memberManager.addWallet(bet);
                                }
                                yield interaction.reply({ embeds: [embed] });
                            }
                            else {
                                interaction.reply({ content: `You're gonna need more coins to make this bet.`, ephemeral: true });
                            }
                        }
                        else {
                            interaction.reply({ content: 'You need to bet atleast 50 coins.', ephemeral: true });
                        }
                    }
                    else {
                        interaction.reply({ content: `You can flip again at <t:${Math.round((memberManager.getTimer('flip') + 30000) / 1000)}:t>`, ephemeral: true });
                    }
                    break;
                }
                case 'crash': {
                    if (interaction.user.id == '316243027423395841') {
                        let x;
                        x.crash();
                    }
                }
                case 'setup':
                    {
                        if (checkOwner(interaction, true) && !(interaction.channel instanceof discord_js_1.StageChannel)) {
                            function convertToCompliant(string) {
                                const regex = /[^a-z0-9_-]/g;
                                return string.replace(regex, '');
                            }
                            // Guild Channel Fetch
                            yield ((_m = interaction.guild) === null || _m === void 0 ? void 0 : _m.channels.fetch());
                            let backOption = { label: 'Back', value: 'back' };
                            let channels = (_o = interaction.guild) === null || _o === void 0 ? void 0 : _o.channels.cache.filter(c => c.type == discord_js_1.ChannelType.GuildText);
                            let channelOptions = [];
                            channels === null || channels === void 0 ? void 0 : channels.forEach(c => {
                                channelOptions.push({ label: convertToCompliant(c.name), value: c.id });
                            });
                            let threadChannels = (_p = interaction.guild) === null || _p === void 0 ? void 0 : _p.channels.cache.filter(c => c.type == discord_js_1.ChannelType.GuildForum);
                            let threadChannelOptions = [];
                            threadChannels === null || threadChannels === void 0 ? void 0 : threadChannels.forEach(c => {
                                threadChannelOptions.push({ label: convertToCompliant(c.name), value: c.id });
                            });
                            threadChannelOptions.push(backOption);
                            channelOptions.push(backOption);
                            // Guild Data Fetch
                            let guild = data_1.default.getGuild(interaction.guildId);
                            let embed = new discord_js_1.EmbedBuilder()
                                .setTitle('Server Setup Menu')
                                .setDescription('Use the selection menu below to modify different parts of the server.')
                                .addFields([
                                { name: 'Timed Games Channel', value: guild.settings.mainChannel.toString(), inline: false },
                                { name: 'Daily Quiz Bowl Channel', value: guild.settings.qbChannel.toString() },
                                { name: 'Logging Channel', value: guild.settings.loggingChannel.toString() },
                                { name: 'Mania Channel', value: guild.settings.maniaChannel.toString() },
                                { name: 'Game Thread Channel', value: guild.settings.gameThread.toString() }
                            ]);
                            const row = new discord_js_1.ActionRowBuilder()
                                .addComponents(new discord_js_1.StringSelectMenuBuilder()
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
                                .setCustomId('setup'));
                            const int = yield interaction.reply({ embeds: [embed], components: [row] });
                            const message = yield interaction.fetchReply();
                            let collect = (_q = interaction.channel) === null || _q === void 0 ? void 0 : _q.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => (c.user.id == interaction.user.id && c.customId == 'setup' && c.message.id == message.id) });
                            function collector(collect) {
                                collect === null || collect === void 0 ? void 0 : collect.on('collect', (int) => __awaiter(this, void 0, void 0, function* () {
                                    var _a, _b, _c, _d, _e;
                                    collect.stop();
                                    switch (int.values[0]) {
                                        case 'tgchan':
                                            {
                                                let embed2 = new discord_js_1.EmbedBuilder()
                                                    .setTitle('Timed Games Channel Setup')
                                                    .setDescription('Select the channel you would like to set as the timed games channel. Select back to go back.');
                                                let row2 = new discord_js_1.ActionRowBuilder()
                                                    .addComponents(new discord_js_1.StringSelectMenuBuilder()
                                                    .addOptions(channelOptions)
                                                    .setCustomId('channel'));
                                                yield int.update({ embeds: [embed2], components: [row2] });
                                                let collect = (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1 });
                                                collect === null || collect === void 0 ? void 0 : collect.on('collect', (channel) => __awaiter(this, void 0, void 0, function* () {
                                                    if (channel.values[0] !== 'back') {
                                                        let guild = data_1.default.getGuild(interaction.guildId);
                                                        guild.settings.mainChannel = channel.values[0];
                                                    }
                                                    let collect = interaction.channel.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                                    if (collect) {
                                                        yield channel.update({ embeds: [embed], components: [row] });
                                                        collector(collect);
                                                    }
                                                }));
                                            }
                                            break;
                                        case 'dqbchan':
                                            {
                                                let embed2 = new discord_js_1.EmbedBuilder()
                                                    .setTitle('Quiz Bowl Setup')
                                                    .setDescription('Select the channel you would like to set as the quiz bowl channel. Select back to go back.');
                                                let row2 = new discord_js_1.ActionRowBuilder()
                                                    .addComponents(new discord_js_1.StringSelectMenuBuilder()
                                                    .addOptions(channelOptions)
                                                    .setCustomId('channel'));
                                                yield int.update({ embeds: [embed2], components: [row2] });
                                                let collect = (_b = interaction.channel) === null || _b === void 0 ? void 0 : _b.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1 });
                                                collect === null || collect === void 0 ? void 0 : collect.on('collect', (channel) => __awaiter(this, void 0, void 0, function* () {
                                                    if (channel.values[0] !== 'back') {
                                                        let guild = data_1.default.getGuild(interaction.guildId);
                                                        guild.settings.qbChannel = channel.values[0];
                                                    }
                                                    let collect = interaction.channel.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                                    if (collect) {
                                                        yield channel.update({ embeds: [embed], components: [row] });
                                                        collector(collect);
                                                    }
                                                }));
                                            }
                                            break;
                                        case 'logchan':
                                            {
                                                let embed2 = new discord_js_1.EmbedBuilder()
                                                    .setTitle('Log Channel Setup')
                                                    .setDescription('Select the channel you would like to set as the logging channel. Select back to go back.');
                                                let row2 = new discord_js_1.ActionRowBuilder()
                                                    .addComponents(new discord_js_1.StringSelectMenuBuilder()
                                                    .addOptions(channelOptions)
                                                    .setCustomId('channel'));
                                                yield int.update({ embeds: [embed2], components: [row2] });
                                                let collect = (_c = interaction.channel) === null || _c === void 0 ? void 0 : _c.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1 });
                                                collect === null || collect === void 0 ? void 0 : collect.on('collect', (channel) => __awaiter(this, void 0, void 0, function* () {
                                                    if (channel.values[0] !== 'back') {
                                                        let guild = data_1.default.getGuild(interaction.guildId);
                                                        guild.settings.loggingChannel = channel.values[0];
                                                    }
                                                    let collect = interaction.channel.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                                    if (collect) {
                                                        yield channel.update({ embeds: [embed], components: [row] });
                                                        collector(collect);
                                                    }
                                                }));
                                            }
                                            break;
                                        case 'manchan':
                                            {
                                                let embed2 = new discord_js_1.EmbedBuilder()
                                                    .setTitle('Mania Setup')
                                                    .setDescription('Select the channel you would like to set as the mania channel. Select back to go back.');
                                                let row2 = new discord_js_1.ActionRowBuilder()
                                                    .addComponents(new discord_js_1.StringSelectMenuBuilder()
                                                    .addOptions(channelOptions)
                                                    .setCustomId('channel'));
                                                yield int.update({ embeds: [embed2], components: [row2] });
                                                let collect = (_d = interaction.channel) === null || _d === void 0 ? void 0 : _d.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1 });
                                                collect === null || collect === void 0 ? void 0 : collect.on('collect', (channel) => __awaiter(this, void 0, void 0, function* () {
                                                    if (channel.values[0] !== 'back') {
                                                        let guild = data_1.default.getGuild(interaction.guildId);
                                                        guild.settings.maniaChannel = channel.values[0];
                                                    }
                                                    let collect = interaction.channel.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                                    if (collect) {
                                                        yield channel.update({ embeds: [embed], components: [row] });
                                                        collector(collect);
                                                    }
                                                }));
                                            }
                                            break;
                                        case 'gtchan':
                                            {
                                                let embed2 = new discord_js_1.EmbedBuilder()
                                                    .setTitle('Game Thread Setup')
                                                    .setDescription('Select the threads channel you would like to set as the main channel. Select back to go back.');
                                                let row2 = new discord_js_1.ActionRowBuilder()
                                                    .addComponents(new discord_js_1.StringSelectMenuBuilder()
                                                    .addOptions(threadChannelOptions)
                                                    .setCustomId('channel'));
                                                yield int.update({ embeds: [embed2], components: [row2] });
                                                let collect = (_e = interaction.channel) === null || _e === void 0 ? void 0 : _e.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1 });
                                                collect === null || collect === void 0 ? void 0 : collect.on('collect', (channel) => __awaiter(this, void 0, void 0, function* () {
                                                    if (channel.values[0] !== 'back') {
                                                        let guild = data_1.default.getGuild(interaction.guildId);
                                                        guild.settings.gameThread = channel.values[0];
                                                    }
                                                    let collect = interaction.channel.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                                    if (collect) {
                                                        yield channel.update({ embeds: [embed], components: [row] });
                                                        collector(collect);
                                                    }
                                                }));
                                            }
                                            break;
                                    }
                                }));
                            }
                            if (collect) {
                                collector(collect);
                            }
                        }
                    }
                    break;
                case 'write':
                    {
                        if (checkOwner(interaction, true)) {
                            data_1.default.write();
                            interaction.reply('The cache is now updated.');
                        }
                    }
                    break;
                case 'publicshop': {
                    let data = require('./assets/images/namecards/manifest.json');
                    let namecards = data.namecards;
                    let canvas = canvas_1.default.createCanvas(2450, 1925);
                    let context = canvas.getContext('2d');
                    for (let i = 0; i < data.namecards.length; i++) {
                        let namecard = data.namecards[i];
                        context.drawImage(yield (0, canvas_1.loadImage)(`./assets/images/namecards/${namecard.path}`), Math.floor(i / 6) * 1250, (i % 6) * 325, 1200, 300);
                    }
                }
                default:
                    {
                        if (checkModerator(interaction, true)) {
                            switch (interaction.commandName) {
                                case 'xp':
                                    let amount = (_r = interaction.options.get('amount')) === null || _r === void 0 ? void 0 : _r.value;
                                    let type = (_s = interaction.options.get('type')) === null || _s === void 0 ? void 0 : _s.value;
                                    let user = (_t = interaction.options.get('user')) === null || _t === void 0 ? void 0 : _t.value;
                                    if (typeof user == 'string') {
                                        memberManager = new data_1.GuildMemberManager(serverManager.getMember(user));
                                    }
                                    else {
                                        user = interaction.user.id;
                                    }
                                    if (typeof type == 'string' && typeof amount == 'number') {
                                        switch (type) {
                                            case 'set':
                                                {
                                                    memberManager.setXP(amount);
                                                    interaction.reply(`Set <@${user}>'s xp to ${amount}`);
                                                }
                                                break;
                                            case 'remove':
                                                {
                                                    memberManager.removeXP(amount);
                                                    interaction.reply(`Removing ${amount} xp from <@${user}>`);
                                                }
                                                break;
                                            case 'give':
                                                {
                                                    memberManager.removeXP(amount);
                                                    interaction.reply(`Giving ${amount} xp to <@${user}>`);
                                                }
                                                break;
                                            default:
                                                interaction.reply('Type Error: Xp Command');
                                                break;
                                        }
                                    }
                                    else {
                                        interaction.reply('Data Error: Xp Command');
                                    }
                                    break;
                                case 'gem': {
                                    let amount = (_u = interaction.options.get('amount')) === null || _u === void 0 ? void 0 : _u.value;
                                    let type = (_v = interaction.options.get('type')) === null || _v === void 0 ? void 0 : _v.value;
                                    let user = (_w = interaction.options.get('user')) === null || _w === void 0 ? void 0 : _w.value;
                                    let userManager = memberManager.getUserManager();
                                    if (typeof user == 'string') {
                                        userManager = new data_1.GuildMemberManager(serverManager.getMember(user)).getUserManager();
                                    }
                                    else {
                                        user = interaction.user.id;
                                    }
                                    if (typeof type == 'string' && typeof amount == 'number') {
                                        switch (type) {
                                            case 'set':
                                                {
                                                    userManager.setGems(amount);
                                                    interaction.reply(`Set <@${user}>'s gems to ${amount}`);
                                                }
                                                break;
                                            case 'remove':
                                                {
                                                    userManager.removeGems(amount);
                                                    interaction.reply(`Removing ${amount} gems from <@${user}>`);
                                                }
                                                break;
                                            case 'give':
                                                {
                                                    userManager.addGems(amount);
                                                    interaction.reply(`Giving ${amount} gems to <@${user}>`);
                                                }
                                                break;
                                            default:
                                                interaction.reply('Type Error: Xp Command');
                                                break;
                                        }
                                    }
                                    else {
                                        interaction.reply('Data Error: Xp Command');
                                    }
                                }
                                case 'punish':
                                    {
                                        console.log(interaction);
                                    }
                                    break;
                                default:
                                    {
                                        interaction.reply('Command Unknown. (Update in Progress)');
                                    }
                                    break;
                            }
                        }
                    }
                    break;
            }
        }
    }
}));
client.login(require('./assets/token.json').token);
