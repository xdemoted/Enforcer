import { Client, EmbedBuilder, MessageCollector, StringSelectMenuInteraction, TextChannel, InteractionCollector, CacheType, Message, AttachmentBuilder, MessageComponentInteraction, CollectedInteraction, Interaction } from 'discord.js';
import data, { GetFile, MessageManager, eventEmitter } from './data';
import { cardDraw, openChestGif, random } from './utilities';
import fs from 'fs'
import quizbowl from './games/special/quizbowl';
import { RunTimeEvents } from './RunTimeEvents';
export type GameValues = { guildId: string, currentValue: string, reward: number, type: number }
type BaseGameClass = (new (client: Client, channel: TextChannel) => baseGame)
export interface baseGame {
    on(event: 'correctanswer', listener: (msg: Message | Interaction, reward: number) => void): this;
    emit(event: 'correctanswer', msg: Message | Interaction, reward: number): boolean;
}
export class baseGame extends eventEmitter {
    client: Client;
    channel: TextChannel;
    collector: InteractionCollector<any> | MessageCollector | undefined;
    constructor(client: Client, channel: TextChannel) {
        super()
        this.channel = channel;
        this.client = client;
    }
    init(): void {
    }
    end() {
        if (this.collector) this.collector.stop();
    }
}
export default class GameManager {
    client: Client;
    runnableGames: BaseGameClass[] = []
    guilds: { [guildId: string]: { mainChan: TextChannel | false, maniaChan: TextChannel | false, quizbowlChan: TextChannel | false, game: baseGame | undefined, quizbowl: quizbowl | undefined } } = {}
    constructor(client: Client) {
        this.client = client;
        this.init()
    }
    init() {
        let gamesList = fs.readdirSync(GetFile.gamePath + "/hourly")
        for (let game of gamesList) {
            if (!game.endsWith('.js')) continue
            let gameClass: BaseGameClass = require(`${GetFile.gamePath}/hourly/${game}`).default
            this.runnableGames.push(gameClass)
        }
        let runtime = new RunTimeEvents(true)
        let guilds = data.cacheData.guilds
        for (let guild in guilds) {
            let i = guilds[guild].id
            let guildData = this.guilds[guild]
            guildData = { mainChan: false, maniaChan: false, quizbowlChan: false, game: undefined, quizbowl: undefined }
            let mainChan = guilds[guild].settings.mainChannel
            let maniaChan = guilds[guild].settings.maniaChannel
            let quizbowlChan = guilds[guild].settings.qbChannel
            if (mainChan) {
                let channel = this.client.channels.cache.get(mainChan)
                if (channel instanceof TextChannel) {
                    guildData.mainChan = channel
                }
            }
            if (maniaChan) {
                let channel = this.client.channels.cache.get(maniaChan)
                if (channel instanceof TextChannel) {
                    guildData.maniaChan = channel
                }
            }
            if (quizbowlChan) {
                let channel = this.client.channels.cache.get(quizbowlChan)
                if (channel instanceof TextChannel) {
                    guildData.quizbowlChan = channel
                }
            }
            this.guilds[i] = guildData
        }
        runtime.on('daily', (current) => {
            for (let guild in this.guilds) {
                let guildData = this.guilds[guild]
                if (guildData.quizbowlChan) {
                    guildData.quizbowl = new quizbowl(this.client, guildData.quizbowlChan.id)
                }
            }
        })
        runtime.on('hour', (current) => {
            for (let guild in this.guilds) {
                let guildData = this.guilds[guild]
                if (guildData.mainChan) {
                    let randomNum = random(0, this.runnableGames.length - 1)
                    let game = new this.runnableGames[randomNum](this.client, guildData.mainChan)
                    game.init()
                    guildData.game = game
                    game.on('correctanswer', (msg, reward) => {
                        this.reward(msg, reward)
                    })
                }
            }
        })
    }
    async reward(msg: Message | Interaction, reward = 200) {
        // guildID, Channel, Author, User
        reward = Math.round(reward)
        if (msg.guildId == undefined) return
        let guild = data.getGuildManager(msg.guildId)
        let user = guild.getMemberManager(msg instanceof Message ? msg.author.id : msg.user.id)
        let rewardMsg: Message | undefined
        let gemReward = random(1, 5)
        guild.addXP(reward)
        user.addXP(reward, msg.channel?.id)
        user.addWallet(Math.round(reward / 10))
        user.userManager.addXP(reward)
        user.userManager.addGems(gemReward)
        let card = cardDraw(false)
        if (card) {
            user.getUserManager().addCard(card.id)
            let loading = new AttachmentBuilder(fs.readFileSync(GetFile.assets + "/images/loading88px.gif"), { name: "loading.gif" })
            let rewardMsg = await msg.channel?.send({ files: [loading] })
            let attachment = new AttachmentBuilder(await openChestGif(card.background, card.rank), { name: "chestopen.gif" })
            let embed = new EmbedBuilder()
                .setTitle('Reward')
                .setDescription(`Lucky you! Received a "${card.title}" card!\n+${gemReward} gems, +${Math.round(reward / 10)} coins, +${reward} xp`)
                .setImage(`attachment://chestopen.gif`)
            await rewardMsg?.edit({ embeds: [embed], files: [attachment] })
        }
        rewardMsg = await msg.channel?.send(MessageManager.getMessage('rewards.generic', [user.id, reward, 10, gemReward]))
        setTimeout(() => {
            rewardMsg?.delete()
        }, 10000)
    }
}