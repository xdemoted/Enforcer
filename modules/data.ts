import fs from 'fs'
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
    constructor() {
        this.cacheData = this.get()
    }
    get = () => {
        return require('../data/serverdata.json')
    }
    write = () => {
        return fs.writeFileSync('/workspaces/Enforcer/Compiled/data/serverdata.json', JSON.stringify(this.cacheData))
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
    constructor() {
        this.mainChannel = false
        this.qbChannel = false
        this.loggingChannel = false
        this.maniaChannel = false
        this.maniaGames = false
        this.gameThread = false
        this.gameToggle = false
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
        let users = this.guild.members
        let fakeUser = new GuildMember('fake', this.guild.id)
        fakeUser.xp = xp
        users = users.slice(0, users.length - 1)
        users.push(fakeUser)
        users.sort((a, b) => b.xp - a.xp)
        return users.indexOf(fakeUser) + 1
    }
}
// User Data
//
export class BaseUser {
    readonly id: string;
    xp: number;
    stats: {
        gamesWon: number,
        messagesSent: number
    }
    timerStorage:
        {
            label: string,
            epoch: number
        }[]
    constructor(id: string) {
        this.id = id
        this.xp = 0
        this.stats = {
            gamesWon: 0,
            messagesSent: 0
        }
        this.timerStorage = []
    }
}
export class GlobalUser extends BaseUser {
    namecard: number
    gems: number
    constructor(id: string) {
        super(id)
        this.namecard = 0
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
        this.stats = {
            gamesWon: 0,
            messagesSent: 0
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
        let users = data.cacheData.users
        let fakeUser = new GlobalUser('fake')
        fakeUser.xp = this.user.xp
        users = users.slice(0, users.length - 1)
        users.push(fakeUser)
        users.sort((a, b) => b.xp - a.xp)
        return users.indexOf(fakeUser) + 1
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
    setNamecard = (card: number) => {
        this.user.namecard = card
        return this.user.namecard
    }
}
export class GuildMemberManager extends BaseUserManager {
    readonly guild: Guild;
    member: GuildMember;
    constructor(member: GuildMember) {
        super(member)
        this.member = member
        let guild = data.cacheData.guilds.find(guild => guild.id == member.guildID)
        if (guild) {
            this.guild = guild
        } else {
            this.guild = data.registerGuild(member.guildID)
        }
    }
    // Balance Updates
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
        let fakeUser = new GuildMember('fake', this.guild.id)
        fakeUser.xp = this.member.xp
        users = this.guild.members.slice(0, users.length - 1)
        users.push(fakeUser)
        users.sort((a, b) => b.xp - a.xp)
        return users.indexOf(fakeUser) + 1
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
}

// Initialize Data
let data = new DataManager()
export default data