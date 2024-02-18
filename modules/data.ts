import fs from 'fs'
import path from 'path'
import EventEmitter from 'events';
import { AnyComponent, AnySelectMenuInteraction, CacheType, CollectedInteraction, Collector, InteractionCollector } from 'discord.js';
const dataPath = path.join(__dirname, '../assets/stored/data.json')
export class eventEmitter extends EventEmitter {
    constructor() {
        super()
    }
    levelUp(userID: string, channelID: string) {
        this.emit('levelUp', userID, channelID)
    }
}
let emitter = new eventEmitter()
export class CacheData {
    guilds: Guild[]
    users: GlobalUser[]
    constructor() {
        this.guilds = []
        this.users = []
    }
}
export class DataManager {
    cacheData: CacheData;
    eventEmitter = emitter;
    constructor() {
        this.cacheData = this.get()
    }
    get = () => {
        return require(dataPath)
    }
    write = () => {
        return fs.writeFileSync(dataPath, JSON.stringify(this.cacheData))
    }
    listFiles = () => {
        return fs.readdirSync('./assets/stored')
    }
    getGlobalUsers = () => {
        return this.cacheData.users
    }
    getGuild = (id: string) => {
        let guild = this.cacheData.guilds.find(guild => guild.id == id)
        if (guild) {
            return guild
        }
        return data.registerGuild(id)
    }
    getGuildManager = (id: string) => {
        let guild = this.cacheData.guilds.find(guild => guild.id == id)
        if (guild) {
            return new GuildManager(guild)
        }
        return new GuildManager(data.registerGuild(id))
    }
    registerGuild = (id: string) => {
        let newServer = new Guild(id)
        this.cacheData.guilds.push(newServer)
        return newServer
    }
    static getLevelRequirement(lvl: number) {
        return (5 * (lvl ** 2) + (50 * lvl) + 100)
    }
    getGlobalRank(xp: number) {
        let data = this.cacheData
        let users = data.users
        let fakeUser = new GlobalUser('fake')
        fakeUser.xp = xp
        users = users.slice(0, users.length - 1)
        users.push(fakeUser)
        users.sort((a, b) => b.xp - a.xp)
        return users.indexOf(fakeUser) + 1
    }
    getUser(id: string) {
        let user = this.cacheData.users.find(user => user.id == id)
        if (user) {
            return user
        }
        return this.registerUser(id)
    }
    registerUser(id: string) {
        let newUser = new GlobalUser(id)
        this.cacheData.users.push(newUser)
        return newUser
    }
}
export class MessageManager {
    static getMessage(messagePath: string, args: (string|number)[]) {
        let Messages = require('../assets/messages.json')
        let path = messagePath.split('.')
        for (let i = 0; i < path.length; i++) {
            if (Messages == undefined) return "**Message Load Error**: Message Path Invalid"
            Messages = Messages[path[i]]
        }
        if (Messages) {
            for (let i = 0; i < args.length; i++) {
                console.log(args[i])
                Messages = Messages.replace(`{${i}}`, args[i])
            }
            return Messages
        }
        return "**Message Load Error**: Message Path Invalid"
    }
}
// Guild Classes
//
export class GuildSettings {
    mainChannel: string | false
    qbChannel: string | false
    loggingChannel: string | false
    maniaChannel: string | false
    maniaGames: string | false
    gameThread: string | false
    gameToggle: boolean
    gameDelay: number
    leaderboard: string | false
    constructor() {
        this.mainChannel = false
        this.qbChannel = false
        this.loggingChannel = false
        this.maniaChannel = false
        this.maniaGames = false
        this.gameThread = false
        this.gameToggle = false
        this.leaderboard = false
        this.gameDelay = 0
    }
}
export class Guild {
    readonly id: string
    xp: number
    members: GuildMember[]
    settings: GuildSettings
    constructor(id: string) {
        this.id = id
        this.members = []
        this.xp = 0
        this.settings = new GuildSettings()
    }
}
export class GuildManager {
    guild: Guild
    members: GuildMember[]
    constructor(guild: Guild) {
        this.guild = guild
        this.members = guild.members
    }
    // Member Management
    addMember = (id: string) => {
        let newMember = new GuildMember(id, this.guild.id)
        this.guild.members.push(newMember)
        return newMember
    }
    removeMember = (id: string) => {
        let member = this.guild.members.findIndex(member => member.id == id)
        if (member >= 0) {
            this.guild.members.splice(member, 1)
        } else {
            console.log("Removal Failed: Member not found")
        }
    }
    getMember = (id: string) => {
        let member = this.guild.members.find(member => member.id == id)
        if (member) {
            return member
        }
        return this.addMember(id)
    }
    // Guild Global XP
    addXP = (xp: number) => {
        this.guild.xp += xp
    }
    removeXP = (xp: number) => {
        this.guild.xp -= xp
    }
    setXP = (xp: number) => {
        this.guild.xp = xp
    }
    // Modify All Members
    addAllXP = (xp: number) => {
        this.guild.members.forEach(member => {
            member.xp += xp
        })
    }
    removeAllXP = (xp: number) => {
        this.guild.members.forEach(member => {
            member.xp -= xp
        })
    }
    setAllXP = (xp: number) => {
        this.guild.members.forEach(member => {
            member.xp = xp
        })
    }
    getRank(xp: number) {
        let users = this.guild.members.slice(0, this.guild.members.length - 1)
        let user = new GuildMember('fake', this.guild.id)
        user.xp = xp
        users.push(user)
        users.sort((a, b) => b.xp - a.xp)
        return users.indexOf(user) + 1
    }
}
// User Data
//
export class stats {
    [index: string]: number
    math: number
    trivia: number
    unscramble: number
    messagesSent: number
    constructor() {
        this.math = 0
        this.trivia = 0
        this.unscramble = 0
        this.messagesSent = 0
    }
}
export class BaseUser {
    readonly id: string;
    xp: number;
    stats: stats
    timerStorage:
        {
            label: string,
            epoch: number
        }[]
    constructor(id: string) {
        this.id = id
        this.xp = 0
        this.stats = new stats()
        this.timerStorage = []
    }
}
export class GlobalUser extends BaseUser {
    namecard: string
    gems: number
    constructor(id: string) {
        super(id)
        this.namecard = ''
        this.gems = 0
    }
}
export class GuildMember extends BaseUser {
    readonly guildID: string;
    balance: {
        bank: number,
        wallet: number
    }
    inventory: {
        miners: undefined,
        booster: undefined
    }
    constructor(userID: string, guildID: string) {
        super(userID)
        this.guildID = guildID
        this.xp = 0
        this.balance = {
            bank: 0,
            wallet: 0
        }
        this.inventory = {
            miners: undefined,
            booster: undefined
        }
    }
}
// User Management
//
export class BaseUserManager {
    readonly id: string;
    user: BaseUser
    constructor(user: BaseUser) {
        this.id = user.id
        this.user = user
    }
    // XP Manipulation
    getLevel = () => {
        let level = 0
        do {
            level++
        } while (this.user.xp >= (5 * (level ** 2) + (50 * level) + 100))
        return level
    }
    addXP = (xp: number) => {
        this.user.xp += xp
        return this.user.xp
    }
    removeXP = (xp: number) => {
        this.user.xp -= xp
        return this.user.xp
    }
    setXP = (xp: number) => {
        this.user.xp = xp
        return this.user.xp
    }
    getTimer = (label: string) => {
        let timer = this.user.timerStorage.find(timer => timer.label == label)
        if (timer) {
            return timer.epoch
        }
        return 0
    }
    setTimer = (label: string, epoch: number) => {
        let timer = this.user.timerStorage.find(timer => timer.label == label)
        if (timer) {
            timer.epoch = epoch
        } else {
            let timer = { label: label, epoch: epoch }
            this.user.timerStorage.push(timer)
        }
    }
    getRank() {
        return 1
    }
    stats = () => (new StatManager(this.user))
}
export class UserManager extends BaseUserManager {
    user: GlobalUser
    constructor(user: GlobalUser) {
        super(user)
        this.user = user
    }
    // XP Manipulation
    addXP = (xp: number) => {
        this.user.xp += xp
        return this.user.xp
    }
    removeXP = (xp: number) => {
        this.user.xp -= xp
        return this.user.xp
    }
    setXP = (xp: number) => {
        this.user.xp = xp
        return this.user.xp
    }
    getRank() {
        let users = data.getGlobalUsers()
        users = users.slice(0, users.length - 1)
        users.sort((a, b) => b.xp - a.xp)
        return users.indexOf(this.user) + 1
    }
    // Gem Manipulation
    addGems = (gems: number) => {
        this.user.gems += gems
        return this.user.gems
    }
    removeGems = (gems: number) => {
        this.user.gems -= gems
        return this.user.gems
    }
    setGems = (gems: number) => {
        this.user.gems = gems
        return this.user.gems
    }
    // Namecard Manipulation
    setNamecard = (url: string) => {
        this.user.namecard = url
        return this.user.namecard
    }
}
export class GuildMemberManager extends BaseUserManager {
    readonly guild: Guild;
    member: GuildMember;
    userManager: UserManager;
    constructor(member: GuildMember) {
        super(member)
        this.member = member
        let user = data.getGlobalUsers().find(user => user.id == member.id)
        if (user) {
            this.userManager = new UserManager(user)
        } else {
            user = new GlobalUser(member.id)
            data.getGlobalUsers().push(new GlobalUser(member.id))
            this.userManager = new UserManager(user)
        }
        let guild = data.cacheData.guilds.find(guild => guild.id == member.guildID)
        if (guild) {
            this.guild = guild
        } else {
            this.guild = data.registerGuild(member.guildID)
        }
    }
    // Balance Updates
    addXP = (xp: number,channel?:string) => {
        const oldLevel = this.getLevel()
        this.user.xp += xp
        const newLevel = this.getLevel()
        if (oldLevel < newLevel&&channel) emitter.levelUp(this.member.id, channel);
        return this.user.xp
    }
    addWallet = (num: number) => {
        this.member.balance.wallet += num
        return this.member.balance.wallet
    }
    removeWallet = (num: number) => {
        this.member.balance.wallet -= num
        return this.member.balance.wallet
    }
    setWallet = (num: number) => {
        this.member.balance.wallet = num
        return this.member.balance.wallet
    }
    addBank = (num: number) => {
        this.member.balance.bank += num
        return this.member.balance.bank
    }
    removeBank = (num: number) => {
        this.member.balance.bank -= num
        return this.member.balance.bank
    }
    setBank = (num: number) => {
        this.member.balance.bank = num
        return this.member.balance.bank
    }
    transferBank = (num: number) => {
        if (this.member.balance.wallet >= num) {
            this.member.balance.wallet -= num
            this.member.balance.bank += num
            return true
        }
        return false
    }
    transferWallet = (num: number) => {
        if (this.member.balance.bank >= num) {
            this.member.balance.bank -= num
            this.member.balance.wallet += num
            return true
        }
        return false
    }
    getRank() {
        let users = this.guild.members
        users = this.guild.members.slice(0, users.length - 1)
        users.sort((a, b) => b.xp - a.xp)
        return users.indexOf(this.member) + 1
    }
    getGlobalUser = () => {
        let user = data.getGlobalUsers().find(user => user.id == this.member.id)
        if (user) {
            return user
        }
        user = new GlobalUser(this.member.id)
        data.getGlobalUsers().push(user)
        return user
    }
    getUserManager = () => {
        let user = data.getGlobalUsers().find(user => user.id == this.member.id)
        if (user) {
            return new UserManager(user)
        }
        user = new GlobalUser(this.member.id)
        data.getGlobalUsers().push(user)
        return new UserManager(user)
    }
}
export class CollectorManager {
    collector: {collector: InteractionCollector<CollectedInteraction>,tag: string}[] = []
    add = (collector: InteractionCollector<CollectedInteraction>,tag:string) => {
        this.collector.push({collector: collector,tag: tag})
    }
    remove = (collector: InteractionCollector<CollectedInteraction>) => {
        let index = this.collector.findIndex(col => col.collector == collector)
        if (index >= 0) {
            this.collector.splice(index, 1)
        }
    }
    get = (tag: string) => {
        return this.collector.find(col => col.tag == tag)
    }
}
export class StatManager {
    user: BaseUser
    constructor(user: BaseUser) {
        this.user = user
    }
    get(id: string) {
        let requested = this.user.stats[id]
        if (requested != undefined) return requested;
        return 0
    }

}
export class manifest {
    namecards:{
        "name":string,
        "path":string,
        "cost":number
    }[]
    constructor() {
        this.namecards = []
    }
}
// Initialize Data
let data = new DataManager()
export default data