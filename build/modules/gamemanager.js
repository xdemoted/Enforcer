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
exports.baseGame = void 0;
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
    init() {
    }
    end() {
        if (this.collector)
            this.collector.stop();
    }
}
exports.baseGame = baseGame;
class GameManager {
    constructor(client) {
        this.runnableGames = [];
        this.guilds = {};
        this.client = client;
        this.init();
    }
    init() {
        let gamesList = fs_1.default.readdirSync(data_1.GetFile.gamePath + "/hourly");
        for (let game of gamesList) {
            if (!game.endsWith('.js'))
                continue;
            let gameClass = require(`${data_1.GetFile.gamePath}/hourly/${game}`).default;
            this.runnableGames.push(gameClass);
        }
        let runtime = new RunTimeEvents_1.RunTimeEvents(true);
        let guilds = data_1.default.cacheData.guilds;
        for (let guild in guilds) {
            let i = guilds[guild].id;
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
            this.guilds[i] = guildData;
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
                if (guildData.mainChan) {
                    if (guildData.game) {
                        guildData.game.end();
                    }
                    let randomNum = (0, utilities_1.random)(0, this.runnableGames.length - 1);
                    let game = new this.runnableGames[randomNum](this.client, guildData.mainChan);
                    game.init();
                    guildData.game = game;
                    game.on('correctanswer', (msg, reward) => {
                        this.reward(msg, reward);
                    });
                }
            }
        });
    }
    reward(msg, reward = 200) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            // guildID, Channel, Author, User
            reward = Math.round(reward);
            if (msg.guildId == undefined)
                return;
            let guild = data_1.default.getGuildManager(msg.guildId);
            let user = guild.getMemberManager(msg instanceof discord_js_1.Message ? msg.author.id : msg.user.id);
            let rewardMsg;
            let gemReward = (0, utilities_1.random)(1, 5);
            guild.addXP(reward);
            user.addXP(reward, (_a = msg.channel) === null || _a === void 0 ? void 0 : _a.id);
            user.addWallet(Math.round(reward / 10));
            user.userManager.addXP(reward);
            user.userManager.addGems(gemReward);
            let card = (0, utilities_1.cardDraw)(false);
            if (card) {
                user.getUserManager().addCard(card.id);
                let loading = new discord_js_1.AttachmentBuilder(fs_1.default.readFileSync(data_1.GetFile.assets + "/images/loading88px.gif"), { name: "loading.gif" });
                let rewardMsg = yield ((_b = msg.channel) === null || _b === void 0 ? void 0 : _b.send({ files: [loading] }));
                let attachment = new discord_js_1.AttachmentBuilder(yield (0, utilities_1.openChestGif)(card.background, card.rank), { name: "chestopen.gif" });
                let embed = new discord_js_1.EmbedBuilder()
                    .setTitle('Reward')
                    .setDescription(`Lucky you! Received a "${card.title}" card!\n+${gemReward} gems, +${Math.round(reward / 10)} coins, +${reward} xp`)
                    .setImage(`attachment://chestopen.gif`);
                yield (rewardMsg === null || rewardMsg === void 0 ? void 0 : rewardMsg.edit({ embeds: [embed], files: [attachment] }));
            }
            rewardMsg = yield ((_c = msg.channel) === null || _c === void 0 ? void 0 : _c.send(data_1.MessageManager.getMessage('rewards.generic', [user.id, reward, 10, gemReward])));
            setTimeout(() => {
                rewardMsg === null || rewardMsg === void 0 ? void 0 : rewardMsg.delete();
            }, 10000);
        });
    }
}
exports.default = GameManager;
