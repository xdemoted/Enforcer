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
exports.games = exports.baseGame = void 0;
const discord_js_1 = require("discord.js");
const data_1 = __importStar(require("./data"));
const utilities_1 = require("./utilities");
const fs_1 = __importDefault(require("fs"));
const quizbowl_1 = __importDefault(require("./games/special/quizbowl"));
const RunTimeEvents_1 = require("./RunTimeEvents");
class baseGame extends data_1.eventEmitter {
    constructor(client, channel) {
        super();
        this.channel = channel;
        this.client = client;
    }
    init() { }
    end() {
        if (this.collector)
            this.collector.stop();
    }
}
exports.baseGame = baseGame;
class games {
    constructor(client) {
        this.guilds = {};
        this.client = client;
    }
    init() {
        let gamesList = fs_1.default.readdirSync(data_1.GetFile.gamePath + "/hourly");
        console.log(gamesList);
        let runtime = new RunTimeEvents_1.RunTimeEvents();
        let guilds = data_1.default.cacheData.guilds;
        for (let guild in guilds) {
            let guildData = this.guilds[guild];
            guildData = { mainChan: false, maniaChan: false, quizbowlChan: false, game: undefined, quizbowl: undefined };
            let mainChan = guilds[guild].settings.mainChannel;
            let maniaChan = guilds[guild].settings.maniaChannel;
            let quizbowlChan = guilds[guild].settings.qbChannel;
            if (mainChan) {
                let channel = this.client.channels.cache.get(mainChan);
                if (channel instanceof discord_js_1.TextChannel) {
                    guildData.mainChan = channel;
                }
            }
            if (maniaChan) {
                let channel = this.client.channels.cache.get(maniaChan);
                if (channel instanceof discord_js_1.TextChannel) {
                    guildData.maniaChan = channel;
                }
            }
            if (quizbowlChan) {
                let channel = this.client.channels.cache.get(quizbowlChan);
                if (channel instanceof discord_js_1.TextChannel) {
                    guildData.quizbowlChan = channel;
                }
            }
        }
        runtime.on('daily', (current) => {
            for (let guild in this.guilds) {
                let guildData = this.guilds[guild];
                if (guildData.quizbowlChan) {
                    guildData.quizbowl = new quizbowl_1.default(this.client, guildData.quizbowlChan.id);
                }
            }
        });
        runtime.on('hour', (current) => {
            for (let guild in this.guilds) {
                let guildData = this.guilds[guild];
            }
        });
    }
    quizbowl(channels) {
    }
    // createGame(providedChannel: string) {
    //     let i = this.games.findIndex(game => game.channelID == providedChannel)
    //     if (!(i == -1)) { this.games[i].game.end(); this.games.splice(i, 1) }
    //     let randomNum = random(1, 4)
    //     let channel = this.client.channels.cache.get(providedChannel)
    //     if (channel instanceof TextChannel) {
    //         let game;
    //         switch (randomNum) {
    //             case 1: {
    //                 console.log("math")
    //                 game = new mathGame(this.client, channel)
    //                 this.games.push({ channelID: providedChannel, game: game })
    //                 game.init()
    //             } break;
    //             case 2: {
    //                 console.log("trivia")
    //                 game = new triviaGame(this.client, channel)
    //                 this.games.push({ channelID: providedChannel, game: game })
    //                 game.init()
    //             } break;
    //             case 3: {
    //                 console.log("flag")
    //                 game = new flagGuesser(this.client, channel)
    //                 this.games.push({ channelID: providedChannel, game: game })
    //                 game.init()
    //             } break;
    //             default: {
    //                 console.log("unscramble")
    //                 game = new scrambleGame(this.client, channel)
    //                 this.games.push({ channelID: providedChannel, game: game })
    //                 game.init()
    //             } break;
    //         }
    //         game.on('correctAnswer', (msg: Message, reward: number) => this.reward(msg, reward, providedChannel))
    //     }
    // }
    reward(msg, reward = 200, providedChannel) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            reward = Math.round(reward);
            if (msg.guildId == undefined)
                return;
            let guild = data_1.default.getGuildManager(msg.guildId);
            let user = guild.getMemberManager(guild.id);
            let rewardMsg;
            let gemReward = (0, utilities_1.random)(1, 5);
            guild.addXP(reward);
            user.addXP(reward, providedChannel);
            user.addWallet(Math.round(reward / 10));
            user.userManager.addXP(reward);
            user.userManager.addGems(gemReward);
            let card = (0, utilities_1.cardDraw)(true);
            if (card) {
                user.getGlobalUser().inventory.cards.push(card.id);
                let loading = new discord_js_1.AttachmentBuilder(fs_1.default.readFileSync(data_1.GetFile.assets + "/images/loading88px.gif"), { name: "loading.gif" });
                let rewardMsg = yield ((_a = msg.channel) === null || _a === void 0 ? void 0 : _a.send({ files: [loading] }));
                let attachment = new discord_js_1.AttachmentBuilder(yield (0, utilities_1.openChestGif)(card.background, card.rank), { name: "chestopen.gif" });
                let embed = new discord_js_1.EmbedBuilder()
                    .setTitle('Reward')
                    .setDescription(`Lucky you! Received a "${card.title}" card!\n+${gemReward} gems, +${Math.round(reward / 10)} coins, +${reward} xp`)
                    .setImage(`attachment://chestopen.gif`);
                yield (rewardMsg === null || rewardMsg === void 0 ? void 0 : rewardMsg.edit({ embeds: [embed], files: [attachment] }));
            }
            rewardMsg = yield ((_b = msg.channel) === null || _b === void 0 ? void 0 : _b.send(data_1.MessageManager.getMessage('rewards.generic', [msg instanceof discord_js_1.Message ? msg.author.id : msg.user.id, reward, 10, gemReward])));
            setTimeout(() => {
                rewardMsg === null || rewardMsg === void 0 ? void 0 : rewardMsg.delete();
            }, 10000);
        });
    }
}
exports.games = games;
//@ts-expect-error
new games().init();
