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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
const discord_js_1 = require("discord.js");
const data_1 = __importStar(require("./modules/data"));
const RunTimeEvents_1 = require("./modules/RunTimeEvents");
const games_1 = require("./modules/games");
const canvas_1 = __importDefault(require("canvas"));
// Variables
const client = new discord_js_1.Client({ partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel, discord_js_1.Partials.Reaction, discord_js_1.Partials.GuildMember, discord_js_1.Partials.User], intents: 131071 });
let medals = ['🥇', '🥈', '🥉'];
let runtimeEvents = new RunTimeEvents_1.RunTimeEvents();
let activeQB = [];
// Utility Functions
function random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}
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
function getImage(user, dUser) {
    return __awaiter(this, void 0, void 0, function* () {
        let userLevel = user.getLevel();
        const lastRequirement = (userLevel > 1) ? data_1.DataManager.getLevelRequirement(userLevel - 1) : 0;
        const avatarURL = dUser.avatarURL({ extension: 'png' });
        const requirement = data_1.DataManager.getLevelRequirement(userLevel);
        let canvas = canvas_1.default.createCanvas(1200, 300);
        let context = canvas.getContext('2d');
        context.fillStyle = '#171717';
        context.fillRect(0, 0, 1200, 300);
        context.fillStyle = '#171717';
        context.fillRect(325, 200, 800, 50);
        context.fillStyle = '#00EDFF';
        context.fillRect(325, 200, Math.round(((user.user.xp - lastRequirement) / (requirement - lastRequirement)) * 800), 50);
        context.drawImage(yield canvas_1.default.loadImage(avatarURL ? avatarURL : './Compiled/MinistryEnforcerV2/namecards/default.png'), 50, 50, 200, 200);
        context.drawImage(yield canvas_1.default.loadImage('./Compiled/MinistryEnforcerV2/namecards/default.png'), 0, 0, 1200, 300);
        // Rank Info 
        context.fillStyle = '#ffffff';
        context.font = '40px Arial';
        context.fillText(`Rank #${user.getRank()}`, 325, 100);
        // Username
        context.fillText(dUser.username, 325, 190);
        let wid = context.measureText(dUser.username).width;
        // Requirements + Discriminator
        context.font = '30px Arial';
        context.fillText(dUser.discriminator, 335 + wid, 192);
        context.fillText(`${user.user.xp - lastRequirement} / ${requirement - lastRequirement} XP`, 1125 - context.measureText(`${user.user.xp - data_1.DataManager.getLevelRequirement(userLevel - 1)} / ${data_1.DataManager.getLevelRequirement(user.getLevel()) - data_1.DataManager.getLevelRequirement(userLevel)} XP`).width, 192);
        context.fillStyle = '#00EDFF';
        // Top Right Level
        context.fillText("Level", 960, 75);
        context.font = '60px Arial';
        context.fillText(userLevel.toString(), 1043, 75);
        return canvas.toBuffer('image/png');
    });
}
// Client Events
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    client.guilds.fetch();
    (_a = client.application) === null || _a === void 0 ? void 0 : _a.commands.set([]);
    client.guilds.cache.forEach(guild => {
        guild.commands.set(require('./commands.json'));
    });
    runtimeEvents.on('hour', (hour) => __awaiter(void 0, void 0, void 0, function* () {
        if (hour == 13) {
            let newList = [];
            client.guilds.cache.forEach((guild) => __awaiter(void 0, void 0, void 0, function* () {
                let guildData = data_1.default.getGuild(guild.id);
                let channel = guild.channels.cache.get(guildData.settings.qbChannel.toString());
                let qb = activeQB.find(qb => qb.channel == guildData.settings.qbChannel.toString());
                if (channel instanceof discord_js_1.TextChannel) {
                    let quizbowl = yield games_1.dailyQB.init(channel.id);
                    let embed = new discord_js_1.EmbedBuilder()
                        .setTitle('Daily Quiz Bowl')
                        .setDescription(quizbowl.prompt[0] + '.')
                        .setFooter({ text: 'Hints every 2 hours, new prompt at 7 AM CST, use the /answer command to answer.' });
                    if (qb) {
                        let message = channel.messages.cache.get(qb.message);
                        if (message) {
                            message.edit({ embeds: [embed] });
                            quizbowl.message = message === null || message === void 0 ? void 0 : message.id;
                        }
                        newList.push(quizbowl);
                    }
                    else {
                        newList.push(quizbowl);
                        let message = yield channel.send({ embeds: [embed] });
                        quizbowl.message = message === null || message === void 0 ? void 0 : message.id;
                    }
                }
            }));
            activeQB = newList;
        }
        else if (Math.floor((hour - 13) / 2) == (hour - 13) / 2) {
            activeQB.forEach((qb) => __awaiter(void 0, void 0, void 0, function* () {
                let prompt = qb.prompt[Math.floor((hour - 13) / 2)];
                let channel = client.channels.cache.get(qb.channel);
                if (prompt && channel instanceof discord_js_1.TextChannel) {
                    let message = channel.messages.cache.get(qb.message);
                    console.log(message);
                    if (message) {
                        let embed = message.embeds[0];
                        let newEmbed = new discord_js_1.EmbedBuilder()
                            .setTitle('Daily Quiz Bowl')
                            .setDescription(embed.description + prompt + '.')
                            .setFields(embed.fields)
                            .setFooter(embed.footer);
                        message.edit({ embeds: [newEmbed] });
                    }
                }
            }));
        }
        console.log(hour);
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
                userManager.addXP(random(10, 25));
                userManager.addWallet(random(1, 5));
                let guser = new data_1.UserManager(userManager.getGlobalUser());
                guser.addXP(random(1, 5));
                userManager.setTimer('message', Date.now());
            }
        }
    }
});
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    if (interaction.guildId) {
        let serverManager = data_1.default.getGuildManager(interaction.guildId);
        if (!(serverManager instanceof data_1.GuildManager)) {
            serverManager = new data_1.GuildManager(data_1.default.registerGuild(interaction.guildId));
        }
        let user = serverManager.getMember(interaction.user.id);
        let userManager = new data_1.GuildMemberManager(user);
        if (interaction.isChatInputCommand()) {
            if (typeof interaction.guildId !== "string")
                return;
            switch (interaction.commandName) {
                //Xp Commands
                case 'blackjack':
                    {
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
                        let list = serverManager.members.sort((a, b) => b.xp - a.xp);
                        let users = [];
                        for (let i = 0; i < 10; i++) {
                            const user = list[i];
                            if (user) {
                                let username = (_g = interaction.guild) === null || _g === void 0 ? void 0 : _g.members.cache.get(user.id);
                                let field = { name: username ? username.displayName : user.id, value: user.xp.toString(), inline: false };
                                users.push(field);
                            }
                        }
                        let embed = new discord_js_1.EmbedBuilder()
                            .setTitle('Server XP Leaderboard')
                            .addFields(users);
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
                        let msg = yield interaction.reply({ embeds: [embed], components: [row] });
                        msg.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.Button }).on('collect', int => {
                            var _a, _b, _c, _d;
                            users = [];
                            let title = '';
                            switch (int.customId) {
                                case 'gem':
                                    title = 'Global Gems Leaderboard';
                                    list = data_1.default.getGlobalUsers().sort((a, b) => b.gems - a.gems);
                                    for (let i = 0; i < 10; i++) {
                                        const user = list[i];
                                        if (user) {
                                            let username = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(user.id);
                                            let field = { name: username ? username.displayName : user.id, value: user.gems.toString(), inline: false };
                                            users.push(field);
                                        }
                                    }
                                    break;
                                case 'gxp':
                                    title = 'Global XP Leaderboard';
                                    list = data_1.default.getGlobalUsers().sort((a, b) => b.xp - a.xp);
                                    for (let i = 0; i < 10; i++) {
                                        const user = list[i];
                                        if (user) {
                                            let username = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.get(user.id);
                                            let field = { name: username ? username.displayName : user.id, value: user.xp.toString(), inline: false };
                                            users.push(field);
                                        }
                                    }
                                    break;
                                case 'lxp':
                                    title = 'Server XP Leaderboard';
                                    list = serverManager.members.sort((a, b) => b.xp - a.xp);
                                    for (let i = 0; i < 10; i++) {
                                        const user = list[i];
                                        if (user) {
                                            let username = (_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.members.cache.get(user.id);
                                            let field = { name: username ? username.displayName : user.id, value: user.xp.toString(), inline: false };
                                            users.push(field);
                                        }
                                    }
                                    break;
                                case 'cur': {
                                    title = 'Server Coins Leaderboard';
                                    if (!interaction.guild)
                                        return;
                                    const list = serverManager.members.sort((a, b) => (b.balance.bank + b.balance.wallet) - (a.balance.bank + a.balance.wallet));
                                    for (let i = 0; i < 10; i++) {
                                        const user = list[i];
                                        if (user) {
                                            const username = (_d = interaction.guild) === null || _d === void 0 ? void 0 : _d.members.cache.get(user.id);
                                            const field = { name: username ? username.displayName : user.id, value: (user.balance.bank + user.balance.wallet).toString(), inline: false };
                                            users.push(field);
                                        }
                                    }
                                    break;
                                }
                            }
                            let embed = new discord_js_1.EmbedBuilder()
                                .setTitle(title)
                                .setDescription('Users are sorted by XP')
                                .addFields(users);
                            int.update({ embeds: [embed], components: [row] });
                        });
                    }
                    break;
                case 'answer':
                    {
                        let answer = interaction.options.getString('answer');
                        let qb = activeQB.find(qb => qb.channel == interaction.channelId);
                        if (answer && qb) {
                            let response = yield (qb === null || qb === void 0 ? void 0 : qb.checkanswer(answer));
                            let user = new data_1.GuildMemberManager(serverManager.getMember(interaction.user.id));
                            console.log(user.getTimer('qb'));
                            if (user.getTimer('qb') < qb.startTime) {
                                if (response == 'accept') {
                                    if (qb.open) {
                                        interaction.reply({ content: 'Correct Answer! 1000 xp and 50 coins has been awarded for being first.', ephemeral: true });
                                        user.addXP(1000);
                                        user.addWallet(50);
                                        let message = (_h = interaction.channel) === null || _h === void 0 ? void 0 : _h.messages.cache.get(qb.message);
                                        if (message) {
                                            let embed = message.embeds[0];
                                            let newEmbed = new discord_js_1.EmbedBuilder()
                                                .setTitle('Daily Quiz Bowl')
                                                .setDescription(embed.description)
                                                .setFields(embed.fields)
                                                .addFields([{ name: 'First Answerer', value: `${interaction.user.displayName}`, inline: false }])
                                                .setFooter(embed.footer);
                                            message.edit({ embeds: [newEmbed] });
                                        }
                                    }
                                    else {
                                        interaction.reply({ content: 'Correct Answer! 250 xp and 10 coins has been awarded for answering.', ephemeral: true });
                                        user.addXP(250);
                                        user.addWallet(10);
                                    }
                                    user.setTimer('qb', Date.now());
                                }
                                else {
                                    interaction.reply({ content: response + qb.answer, ephemeral: true });
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
                    { // Untested 
                        let auser = (_j = interaction.options.get("user")) === null || _j === void 0 ? void 0 : _j.user;
                        if (auser) {
                            auser = interaction.user;
                            user = serverManager.getMember(auser.id);
                        }
                        if (!auser)
                            return;
                        let attachment = new discord_js_1.AttachmentBuilder(yield getImage(new data_1.GuildMemberManager(user), interaction.user));
                        interaction.reply({ files: [attachment] });
                    }
                    break;
                case 'stats':
                    {
                        if (!(interaction.member instanceof discord_js_1.GuildMember))
                            return;
                        let embed = new discord_js_1.EmbedBuilder()
                            .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                            .setFields([
                            { name: 'XP', value: user.xp.toString(), inline: true },
                            { name: 'Coins', value: (user.balance.wallet + user.balance.bank).toString(), inline: true },
                            { name: 'Gems', value: userManager.getGlobalUser().gems.toString(), inline: true },
                            { name: 'Level', value: userManager.getLevel().toString(), inline: true }
                        ]);
                        interaction.reply({ embeds: [embed] });
                    }
                    break;
                case 'bank':
                case 'balance':
                    {
                        if (!(interaction.member instanceof discord_js_1.GuildMember))
                            return;
                        let embed = new discord_js_1.EmbedBuilder()
                            .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                            .setFields([
                            { name: 'Wallet', value: (user.balance.wallet).toString(), inline: true },
                            { name: 'Bank', value: (user.balance.bank).toString(), inline: true },
                            { name: 'Gems', value: userManager.getGlobalUser().gems.toString(), inline: true },
                        ]);
                        interaction.reply({ embeds: [embed] });
                    }
                    break;
                case 'daily':
                    { // Time Delay Untested
                        if (Date.now() >= (userManager.getTimer('daily') + 64800000)) {
                            let xp = random(150, 250);
                            let gem = random(1, 5);
                            let currency = random(25, 50);
                            userManager.addXP(xp);
                            userManager.addWallet(currency);
                            let guser = new data_1.UserManager(userManager.getGlobalUser());
                            guser.addGems(gem);
                            guser.addXP(xp);
                            let embed = new discord_js_1.EmbedBuilder()
                                .setColor('LuminousVividPink')
                                .setTitle('Daily Rewards')
                                .setDescription('Come back tomorrow for more rewards!')
                                .setFields([{ name: 'XP', inline: true, value: xp.toString() }, { name: 'Currency', inline: true, value: currency.toString() }, { name: 'Gems', inline: true, value: gem.toString() }]);
                            userManager.setTimer('daily', Date.now());
                            interaction.reply({ embeds: [embed] });
                            userManager.addXP(1000);
                        }
                        else {
                            interaction.reply(`You can recieve more rewards at <t:${Math.round((userManager.getTimer('daily') + 64800000) / 1000)}:t>`);
                        }
                    }
                    break;
                case 'flip': { // Untested Code
                    let bet = (_k = interaction.options.get('bet')) === null || _k === void 0 ? void 0 : _k.value;
                    if (typeof bet == 'number' && user.balance.wallet > bet) {
                        let win = random(0, 1);
                        let embed = new discord_js_1.EmbedBuilder()
                            .setThumbnail(win ? 'https://cdn.discordapp.com/attachments/1040422701195603978/1106274390527705168/R.gif' : 'https://cdn.discordapp.com/attachments/858439510425337926/1106440676884893716/broken_coin.png')
                            .setTitle(win ? `It's your Lucky day!` : `Better luck next time`)
                            .setDescription(win ? `Successfully earned ${bet} coins` : `Lost ${bet} coins`)
                            .setColor('Yellow');
                        if (win == 0) {
                            userManager.addWallet(-bet);
                        }
                        else {
                            userManager.addWallet(bet);
                        }
                        yield interaction.reply({ embeds: [embed] });
                    }
                    else {
                        interaction.reply('Your gonna need more coins to make this bet.');
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
                            yield ((_l = interaction.guild) === null || _l === void 0 ? void 0 : _l.channels.fetch());
                            let backOption = { label: 'Back', value: 'back' };
                            let channels = (_m = interaction.guild) === null || _m === void 0 ? void 0 : _m.channels.cache.filter(c => c.type == discord_js_1.ChannelType.GuildText);
                            let channelOptions = [];
                            channels === null || channels === void 0 ? void 0 : channels.forEach(c => {
                                channelOptions.push({ label: convertToCompliant(c.name), value: c.id });
                            });
                            let threadChannels = (_o = interaction.guild) === null || _o === void 0 ? void 0 : _o.channels.cache.filter(c => c.type == discord_js_1.ChannelType.GuildForum);
                            let threadChannelOptions = [];
                            threadChannels === null || threadChannels === void 0 ? void 0 : threadChannels.forEach(c => {
                                threadChannelOptions.push({ label: convertToCompliant(c.name), value: c.id });
                            });
                            threadChannelOptions.push(backOption);
                            channelOptions.push(backOption);
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
                            let row = new discord_js_1.ActionRowBuilder()
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
                            let response = yield interaction.reply({ embeds: [embed], components: [row] });
                            const message = yield interaction.fetchReply();
                            let collect = (_p = interaction.channel) === null || _p === void 0 ? void 0 : _p.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => (c.user.id == interaction.user.id && c.customId == 'setup' && c.message.id == message.id) });
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
                default:
                    {
                        if (checkModerator(interaction, true)) {
                            switch (interaction.commandName) {
                                case 'xp':
                                    let amount = (_q = interaction.options.get('amount')) === null || _q === void 0 ? void 0 : _q.value;
                                    let type = (_r = interaction.options.get('type')) === null || _r === void 0 ? void 0 : _r.value;
                                    //let user = serverManager.getUser((interaction.options.get('user')?.value as unknown as User).id)
                                    if (typeof type == 'string' && typeof amount == 'number') {
                                        switch (type) {
                                            case 'set':
                                                {
                                                    userManager.setXP(amount);
                                                    interaction.reply(`Set <@${user}>'s xp to ${amount}`);
                                                }
                                                break;
                                            case 'remove':
                                                {
                                                    userManager.addXP(-amount);
                                                    interaction.reply(`Removing ${amount} xp from <@${user}>`);
                                                }
                                                break;
                                            case 'give':
                                                {
                                                    userManager.addXP(amount);
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
client.login(require('./token.json').token);
