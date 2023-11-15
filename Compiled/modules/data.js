"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildMemberManager = exports.UserManager = exports.BaseUserManager = exports.GuildMember = exports.GlobalUser = exports.BaseUser = exports.GuildManager = exports.Guild = exports.GuildSettings = exports.DataManager = exports.CacheData = void 0;
const fs_1 = __importDefault(require("fs"));
class CacheData {
    constructor() {
        this.guilds = [];
        this.users = [];
    }
}
exports.CacheData = CacheData;
class DataManager {
    constructor() {
        this.get = () => {
            return require('../data/serverdata.json');
        };
        this.write = () => {
            return fs_1.default.writeFileSync('/workspaces/Enforcer/Compiled/data/serverdata.json', JSON.stringify(this.cacheData));
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
}
exports.DataManager = DataManager;
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
        this.guild = guild;
        this.members = guild.members;
    }
    getRank(xp) {
        let users = this.guild.members;
        let fakeUser = new GuildMember('fake', this.guild.id);
        fakeUser.xp = xp;
        users = users.slice(0, users.length - 1);
        users.push(fakeUser);
        users.sort((a, b) => b.xp - a.xp);
        return users.indexOf(fakeUser) + 1;
    }
}
exports.GuildManager = GuildManager;
// User Data
//
class BaseUser {
    constructor(id) {
        this.id = id;
        this.xp = 0;
        this.stats = {
            gamesWon: 0,
            messagesSent: 0
        };
        this.timerStorage = [];
    }
}
exports.BaseUser = BaseUser;
class GlobalUser extends BaseUser {
    constructor(id) {
        super(id);
        this.namecard = 0;
        this.gems = 0;
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
        this.stats = {
            gamesWon: 0,
            messagesSent: 0
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
        this.id = user.id;
        this.user = user;
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
        this.setNamecard = (card) => {
            this.user.namecard = card;
            return this.user.namecard;
        };
        this.user = user;
    }
    getRank() {
        let users = data.cacheData.users;
        let fakeUser = new GlobalUser('fake');
        fakeUser.xp = this.user.xp;
        users = users.slice(0, users.length - 1);
        users.push(fakeUser);
        users.sort((a, b) => b.xp - a.xp);
        return users.indexOf(fakeUser) + 1;
    }
}
exports.UserManager = UserManager;
class GuildMemberManager extends BaseUserManager {
    constructor(member) {
        super(member);
        // Balance Updates
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
        this.member = member;
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
        let fakeUser = new GuildMember('fake', this.guild.id);
        fakeUser.xp = this.member.xp;
        users = this.guild.members.slice(0, users.length - 1);
        users.push(fakeUser);
        users.sort((a, b) => b.xp - a.xp);
        return users.indexOf(fakeUser) + 1;
    }
}
exports.GuildMemberManager = GuildMemberManager;
// Initialize Data
let data = new DataManager();
exports.default = data;
