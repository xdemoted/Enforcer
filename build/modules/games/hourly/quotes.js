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
const discord_js_1 = require("discord.js");
const gamemanager_1 = require("../../gamemanager");
const utilities_1 = require("../../utilities");
const data_1 = __importStar(require("../../data"));
const axios_1 = __importDefault(require("axios"));
class quoteData {
}
class quotes extends gamemanager_1.baseGame {
    constructor(client, channel) {
        super(client, channel);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.channel instanceof discord_js_1.TextChannel) {
                // Answer Setup
                let options = (yield axios_1.default.get('https://api.quotable.io/quotes/random?limit=4')).data;
                if (options instanceof Array) {
                    options = options.sort(() => Math.random() - 0.5);
                    let correctIndex = (0, utilities_1.random)(0, 3);
                    // Action Row Setup
                    let row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder().setCustomId("quote").setPlaceholder("Select a country").addOptions(options.map((option, index) => {
                        return { label: option.author, value: index.toString() };
                    })));
                    let text = [
                        '# &fWho is the author of the quote?',
                        `## &7"&b${options[correctIndex].content}&7"`,
                        `&f- &7${options[0].author}`,
                        `&f- &7${options[1].author}`,
                        `&f- &7${options[2].author}`,
                        `&f- &7${options[3].author}`,
                        '&f ',
                        '{c}## &fUnanswered'
                    ];
                    let GameImage = yield (0, utilities_1.createGameCard)('&fGuess the author', text, { color: [180, 180, 180] });
                    let attachment = new discord_js_1.AttachmentBuilder(GameImage.toBuffer(), { name: 'quote.png' });
                    let message = yield this.channel.send({ files: [attachment], components: [row] });
                    this.message = message;
                    let collector = message.createMessageComponentCollector({ time: 3600000 });
                    let answerers = [];
                    let CorrectAnswerers = [];
                    collector.on('collect', (interaction) => __awaiter(this, void 0, void 0, function* () {
                        if (interaction.customId == "quote" && interaction instanceof discord_js_1.StringSelectMenuInteraction) {
                            if (answerers.includes(interaction.user.id))
                                interaction.reply({ content: "You have already answered.", ephemeral: true });
                            else {
                                answerers.push(interaction.user.id);
                                let user = new data_1.GuildMemberManager(data_1.default.getGuildManager(interaction.guildId ? interaction.guildId : '').getMember(interaction.user.id));
                                if (interaction.values[0] == correctIndex.toString()) {
                                    interaction.deferUpdate();
                                    this.emit('correctanswer', interaction, 200);
                                    CorrectAnswerers.push(interaction.user.id);
                                    if (text[text.length - 1] == '{c}## &fUnanswered') {
                                        text.push('## Correct Answerers');
                                    }
                                    text.push('- &7' + interaction.member.displayName + '&f');
                                    GameImage = yield (0, utilities_1.createGameCard)('Flag Guesser', text, { color: [180, 180, 180] });
                                    attachment = new discord_js_1.AttachmentBuilder(GameImage.toBuffer(), { name: 'quote.png' });
                                    message.edit({ files: [attachment], components: [row] });
                                }
                                else {
                                    user.addXP(25, this.channel.id);
                                    user.userManager.addXP(25);
                                    let rewardMsg = yield interaction.reply({ content: data_1.MessageManager.getMessage('rewards.flagincorrect', [interaction.user.id, 25, options[correctIndex].author]), ephemeral: true });
                                    setTimeout(() => {
                                        rewardMsg.delete();
                                    }, 20000);
                                }
                            }
                        }
                    }));
                }
            }
        });
    }
    end() {
        if (this.message) {
            if (this.message.deletable)
                this.message.delete();
        }
        if (this.collector)
            this.collector.stop();
    }
}
exports.default = quotes;
