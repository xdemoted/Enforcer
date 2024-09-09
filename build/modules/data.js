"use strict";
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = exports.MessageStorageManager = exports.namecardManifest = exports.StatManager = exports.CollectorManager = exports.GuildMemberManager = exports.UserManager = exports.BaseUserManager = exports.GuildMember = exports.GlobalUser = exports.BaseUser = exports.stats = exports.GuildManager = exports.Guild = exports.GuildSettings = exports.MessageManager = exports.DataManager = exports.CacheData = exports.eventEmitter = exports.GetFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const events_1 = __importDefault(require("events"));
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const utilities_1 = require("./utilities");
class GetFile {
}
exports.GetFile = GetFile;
_a = GetFile;
GetFile.assets = path_1.default.join(__dirname, '../assets');
GetFile.namecardPath = _a.assets + '/images/namecards/manifest.json';
GetFile.tradecardPath = _a.assets + "/images/tradecards/manifest.json";
GetFile.serverPath = _a.assets + "/stored/data.json";
GetFile.settingPath = _a.assets + "/stored/settings.json";
GetFile.commandPath = path_1.default.join(__dirname, './commands');
GetFile.gamePath = path_1.default.join(__dirname, './games');
GetFile.namecardManifest = () => {
    return require(_a.namecardPath);
};
GetFile.tradecardManifest = () => {
    return require(_a.tradecardPath);
};
GetFile.serverData = () => {
    return require(_a.serverPath);
};
GetFile.wordList = () => {
    return require(_a.assets + '/words.json');
};
class eventEmitter extends events_1.default {
    constructor() {
        super();
    }
    levelUp(userID, channelID) {
        this.emit('levelUp', userID, channelID);
    }
}
exports.eventEmitter = eventEmitter;
let emitter = new eventEmitter();
class CacheData {
    constructor() {
        this.guilds = [];
        this.users = [];
    }
}
exports.CacheData = CacheData;
class DataManager {
    constructor() {
        this.eventEmitter = emitter;
        this.get = () => {
            return GetFile.serverData();
        };
        this.write = () => {
            return fs_1.default.writeFileSync(GetFile.serverPath, JSON.stringify(this.cacheData));
        };
        this.listFiles = () => {
            return fs_1.default.readdirSync('./assets/stored');
        };
        this.getGlobalUsers = () => {
            return this.cacheData.users;
        };
        this.getGuild = (id) => {
            let guild = this.cacheData.guilds.find(guild => guild.id == id);
            if (guild) {
                return guild;
            }
            return data.registerGuild(id);
        };
        this.getGuildManager = (id) => {
            let guild = this.cacheData.guilds.find(guild => guild.id == id);
            if (guild) {
                return new GuildManager(guild);
            }
            return new GuildManager(data.registerGuild(id));
        };
        this.registerGuild = (id) => {
            let newServer = new Guild(id);
            this.cacheData.guilds.push(newServer);
            return newServer;
        };
        this.cacheData = this.get();
    }
    static getLevelRequirement(lvl) {
        return (5 * (lvl ** 2) + (50 * lvl) + 100);
    }
    getGlobalRank(xp) {
        let data = this.cacheData;
        let users = data.users;
        let fakeUser = new GlobalUser('fake');
        fakeUser.xp = xp;
        users = users.slice(0, users.length - 1);
        users.push(fakeUser);
        users.sort((a, b) => b.xp - a.xp);
        return users.indexOf(fakeUser) + 1;
    }
    getUser(id) {
        let user = this.cacheData.users.find(user => user.id == id);
        if (user) {
            return user;
        }
        return this.registerUser(id);
    }
    registerUser(id) {
        let newUser = new GlobalUser(id);
        this.cacheData.users.push(newUser);
        return newUser;
    }
    checkData() {
        let data = this.cacheData;
        if (data.guilds == undefined) {
            data.guilds = [];
        }
        if (data.users == undefined) {
            data.users = [];
        }
        else {
            for (let i = 0; i < data.users.length; i++) {
                data.users[i] = Object.assign(new GlobalUser(data.users[i].id), data.users[i]);
                data.users[i].xp = Math.round(data.users[i].xp);
            }
        }
        data.guilds.forEach(guild => {
            if (guild.members == undefined) {
                guild.members = [];
            }
            else {
                guild.members.forEach(member => {
                    member.xp = Math.round(member.xp);
                    member = Object.assign(new GuildMember(member.id, guild.id), member);
                });
            }
            if (guild.settings == undefined) {
                guild.settings = new GuildSettings();
            }
            else {
                guild.settings = Object.assign(new GuildSettings(), guild.settings);
            }
            if (guild.xp == undefined) {
                guild.xp = 0;
            }
        });
    }
}
exports.DataManager = DataManager;
class MessageManager {
    static getMessage(messagePath, args) {
        let Messages = require('../assets/messages.json');
        let path = messagePath.split('.');
        for (let i = 0; i < path.length; i++) {
            if (Messages == undefined)
                return "**Message Load Error**: Message Path Invalid";
            Messages = Messages[path[i]];
        }
        if (Messages) {
            for (let i = 0; i < args.length; i++) {
                console.log(args[i]);
                Messages = Messages.replace(`{${i}}`, args[i]);
            }
            return Messages;
        }
        return "**Message Load Error**: Message Path Invalid";
    }
}
exports.MessageManager = MessageManager;
// Guild Classes
//
class GuildSettings {
    constructor() {
        this.mainChannel = false;
        this.qbChannel = false;
        this.loggingChannel = false;
        this.maniaChannel = false;
        this.maniaGames = false;
        this.gameThread = false;
        this.gameToggle = false;
        this.leaderboard = false;
        this.countChannel = false;
        this.gameDelay = 0;
    }
}
exports.GuildSettings = GuildSettings;
class Guild {
    constructor(id) {
        this.id = id;
        this.members = [];
        this.xp = 0;
        this.settings = new GuildSettings();
        this.count = 0;
    }
}
exports.Guild = Guild;
class GuildManager {
    constructor(guild) {
        // Member Management
        this.addMember = (id) => {
            let newMember = new GuildMember(id, this.guild.id);
            this.guild.members.push(newMember);
            return newMember;
        };
        this.removeMember = (id) => {
            let member = this.guild.members.findIndex(member => member.id == id);
            if (member >= 0) {
                this.guild.members.splice(member, 1);
            }
            else {
                console.log("Removal Failed: Member not found");
            }
        };
        this.getMember = (id) => {
            let member = this.guild.members.find(member => member.id == id);
            if (member) {
                return member;
            }
            return this.addMember(id);
        };
        this.getMemberManager = (id) => {
            let member = this.guild.members.find(member => member.id == id);
            if (member) {
                return new GuildMemberManager(member);
            }
            return new GuildMemberManager(this.addMember(id));
        };
        // Guild Global XP
        this.addXP = (xp) => {
            this.guild.xp += xp;
        };
        this.removeXP = (xp) => {
            this.guild.xp -= xp;
        };
        this.setXP = (xp) => {
            this.guild.xp = xp;
        };
        // Modify All Members
        this.addAllXP = (xp) => {
            this.guild.members.forEach(member => {
                member.xp += xp;
            });
        };
        this.removeAllXP = (xp) => {
            this.guild.members.forEach(member => {
                member.xp -= xp;
            });
        };
        this.setAllXP = (xp) => {
            this.guild.members.forEach(member => {
                member.xp = xp;
            });
        };
        this.id = guild.id;
        this.guild = guild;
        this.members = guild.members;
    }
    getRank(xp) {
        let users = this.guild.members.slice(0, this.guild.members.length - 1);
        let user = new GuildMember('fake', this.guild.id);
        user.xp = xp;
        users.push(user);
        users.sort((a, b) => b.xp - a.xp);
        return users.indexOf(user) + 1;
    }
}
exports.GuildManager = GuildManager;
// User Data
//
class stats {
    constructor() {
        this.math = 0;
        this.trivia = 0;
        this.unscramble = 0;
        this.messagesSent = 0;
    }
}
exports.stats = stats;
class BaseUser {
    constructor(id) {
        this.id = id;
        this.xp = 0;
        this.stats = new stats();
        this.timerStorage = [];
    }
}
exports.BaseUser = BaseUser;
class GlobalUser extends BaseUser {
    constructor(id) {
        super(id);
        this.pity = 0;
        this.namecard = '';
        this.gems = 0;
        this.inventory = {
            cards: []
        };
    }
}
exports.GlobalUser = GlobalUser;
class GuildMember extends BaseUser {
    constructor(userID, guildID) {
        super(userID);
        this.guildID = guildID;
        this.xp = 0;
        this.balance = {
            bank: 0,
            wallet: 0
        };
        this.inventory = {
            miners: undefined,
            booster: undefined
        };
    }
}
exports.GuildMember = GuildMember;
// User Management
//
class BaseUserManager {
    constructor(user) {
        // XP Manipulation
        this.getLevel = () => {
            let level = 0;
            do {
                level++;
            } while (this.user.xp >= (5 * (level ** 2) + (50 * level) + 100));
            return level;
        };
        this.addXP = (xp) => {
            this.user.xp += xp;
            return this.user.xp;
        };
        this.removeXP = (xp) => {
            this.user.xp -= xp;
            return this.user.xp;
        };
        this.setXP = (xp) => {
            this.user.xp = xp;
            return this.user.xp;
        };
        this.getTimer = (label) => {
            let timer = this.user.timerStorage.find(timer => timer.label == label);
            if (timer) {
                return timer.epoch;
            }
            return 0;
        };
        this.setTimer = (label, epoch) => {
            let timer = this.user.timerStorage.find(timer => timer.label == label);
            if (timer) {
                timer.epoch = epoch;
            }
            else {
                let timer = { label: label, epoch: epoch };
                this.user.timerStorage.push(timer);
            }
        };
        this.stats = () => (new StatManager(this.user));
        this.id = user.id;
        this.user = user;
    }
    getRank() {
        return 1;
    }
}
exports.BaseUserManager = BaseUserManager;
class UserManager extends BaseUserManager {
    constructor(user) {
        super(user);
        // XP Manipulation
        this.addXP = (xp) => {
            this.user.xp += xp;
            return this.user.xp;
        };
        this.removeXP = (xp) => {
            this.user.xp -= xp;
            return this.user.xp;
        };
        this.setXP = (xp) => {
            this.user.xp = xp;
            return this.user.xp;
        };
        // Gem Manipulation
        this.addGems = (gems) => {
            this.user.gems += gems;
            return this.user.gems;
        };
        this.removeGems = (gems) => {
            this.user.gems -= gems;
            return this.user.gems;
        };
        this.setGems = (gems) => {
            this.user.gems = gems;
            return this.user.gems;
        };
        // Namecard Manipulation
        this.setNamecard = (url) => {
            this.user.namecard = url;
            return this.user.namecard;
        };
        this.getCards = () => {
            return this.user.inventory.cards;
        };
        this.addCard = (card) => {
            this.user.inventory.cards.push(card);
            return this.user.inventory.cards;
        };
        this.removeCard = (card) => {
            this.user.inventory.cards.splice(this.user.inventory.cards.indexOf(card), 1);
            return this.user.inventory.cards;
        };
        this.user = user;
    }
    getRank() {
        let users = data.getGlobalUsers();
        users = users.slice(0, users.length - 1);
        users.sort((a, b) => b.xp - a.xp);
        return users.indexOf(this.user) + 1;
    }
}
exports.UserManager = UserManager;
class GuildMemberManager extends BaseUserManager {
    constructor(member) {
        super(member);
        // Balance Updates
        this.addXP = (xp, channel) => {
            const oldLevel = this.getLevel();
            this.user.xp += xp;
            const newLevel = this.getLevel();
            if (oldLevel < newLevel && channel)
                emitter.levelUp(this.member.id, channel);
            return this.user.xp;
        };
        this.addWallet = (num) => {
            this.member.balance.wallet += num;
            return this.member.balance.wallet;
        };
        this.removeWallet = (num) => {
            this.member.balance.wallet -= num;
            return this.member.balance.wallet;
        };
        this.setWallet = (num) => {
            this.member.balance.wallet = num;
            return this.member.balance.wallet;
        };
        this.addBank = (num) => {
            this.member.balance.bank += num;
            return this.member.balance.bank;
        };
        this.removeBank = (num) => {
            this.member.balance.bank -= num;
            return this.member.balance.bank;
        };
        this.setBank = (num) => {
            this.member.balance.bank = num;
            return this.member.balance.bank;
        };
        this.transferBank = (num) => {
            if (this.member.balance.wallet >= num) {
                this.member.balance.wallet -= num;
                this.member.balance.bank += num;
                return true;
            }
            return false;
        };
        this.transferWallet = (num) => {
            if (this.member.balance.bank >= num) {
                this.member.balance.bank -= num;
                this.member.balance.wallet += num;
                return true;
            }
            return false;
        };
        this.getGlobalUser = () => {
            let user = data.getGlobalUsers().find(user => user.id == this.member.id);
            if (user) {
                return user;
            }
            user = new GlobalUser(this.member.id);
            data.getGlobalUsers().push(user);
            return user;
        };
        this.getUserManager = () => {
            let user = data.getGlobalUsers().find(user => user.id == this.member.id);
            if (user) {
                return new UserManager(user);
            }
            user = new GlobalUser(this.member.id);
            data.getGlobalUsers().push(user);
            return new UserManager(user);
        };
        this.member = member;
        let user = data.getGlobalUsers().find(user => user.id == member.id);
        if (user) {
            this.userManager = new UserManager(user);
        }
        else {
            user = new GlobalUser(member.id);
            data.getGlobalUsers().push(new GlobalUser(member.id));
            this.userManager = new UserManager(user);
        }
        let guild = data.cacheData.guilds.find(guild => guild.id == member.guildID);
        if (guild) {
            this.guild = guild;
        }
        else {
            this.guild = data.registerGuild(member.guildID);
        }
    }
    getRank() {
        let users = this.guild.members;
        users = this.guild.members.slice(0, users.length - 1);
        users.sort((a, b) => b.xp - a.xp);
        return users.indexOf(this.member) + 1;
    }
}
exports.GuildMemberManager = GuildMemberManager;
class CollectorManager {
    constructor() {
        this.collector = [];
        this.add = (collector, tag) => {
            this.collector.push({ collector: collector, tag: tag });
        };
        this.remove = (collector) => {
            let index = this.collector.findIndex(col => col.collector == collector);
            if (index >= 0) {
                this.collector.splice(index, 1);
            }
        };
        this.get = (tag) => {
            return this.collector.find(col => col.tag == tag);
        };
    }
}
exports.CollectorManager = CollectorManager;
class StatManager {
    constructor(user) {
        this.user = user;
    }
    get(id) {
        let requested = this.user.stats[id];
        if (requested != undefined)
            return requested;
        return 0;
    }
}
exports.StatManager = StatManager;
class namecardManifest {
    constructor() {
        this.namecards = [];
    }
}
exports.namecardManifest = namecardManifest;
class MessageStorageManager {
    constructor(client) {
        this.cache = require(GetFile.assets + '/stored/messages.json');
        this.client = client;
        this.init();
    }
    write() {
        fs_1.default.writeFileSync(GetFile.assets + '/stored/messages.json', JSON.stringify(this.cache));
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let guild of this.cache.guilds) {
                for (let message of guild.messages) {
                    this.startCollection(guild.id, message.channel, message.id);
                }
            }
        });
    }
    registerMessage(guildID, channelID, messageID) {
        return __awaiter(this, void 0, void 0, function* () {
            let guild = this.cache.guilds.find(guild => guild.id == guildID);
            if (guild) {
                guild.messages.push({ id: messageID, channel: channelID, intent: '' });
            }
            else {
                this.cache.guilds.push({ id: guildID, messages: [{ id: messageID, channel: channelID, intent: '' }] });
            }
            this.write();
            this.startCollection(guildID, channelID, messageID);
        });
    }
    startCollection(guildID, channelID, messageID) {
        return __awaiter(this, void 0, void 0, function* () {
            let guild = this.cache.guilds.find(guild => guild.id == guildID);
            if (guild) {
                let storedmessage = guild.messages.find(message => message.id == messageID);
                if (storedmessage) {
                    let Dguild = this.client.guilds.cache.get(guildID);
                    if (!Dguild)
                        return;
                    let channel = Dguild.channels.cache.get(channelID);
                    if (channel instanceof discord_js_1.TextChannel) {
                        let message = yield channel.messages.fetch(messageID);
                        let intent = storedmessage.intent;
                        if (intent.startsWith('catalog')) {
                            let id = intent.slice(7, intent.length);
                            let card = GetFile.tradecardManifest().collections.find(collection => collection.id == parseInt(id));
                            let collector = message.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect });
                            collector.on('collect', (interaction) => __awaiter(this, void 0, void 0, function* () {
                                let card = GetFile.tradecardManifest().cards.find(card => card.id == parseInt(interaction.values[0]));
                                if (card) {
                                    let attachment = new discord_js_1.AttachmentBuilder((yield (0, utilities_1.addFrame)(card.background, card.rank)).toBuffer(), { name: 'card.png' });
                                    let infoEmbed = new builders_1.EmbedBuilder()
                                        .setTitle(card.title)
                                        .setDescription(card.description)
                                        .setImage("attachment://card.png")
                                        //@ts-ignore
                                        .setColor("Green");
                                    interaction.reply({ embeds: [infoEmbed], files: [attachment], ephemeral: true });
                                    setTimeout(() => {
                                        interaction.deleteReply();
                                    }, 20000);
                                }
                            }));
                        }
                    }
                    else {
                        guild.messages.splice(guild.messages.indexOf(storedmessage), 1);
                    }
                }
            }
        });
    }
    get(guildID, messageID) {
        let guild = this.cache.guilds.find(guild => guild.id == guildID);
        if (guild) {
            let message = guild.messages.find(message => message.id == messageID);
            if (message) {
                return message;
            }
        }
        return false;
    }
}
exports.MessageStorageManager = MessageStorageManager;
// Initialize Data
let data = new DataManager();
exports.data = data;
let someProperty = 'someValue';
exports.default = data;
