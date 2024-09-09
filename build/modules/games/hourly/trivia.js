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
const axios_1 = __importDefault(require("axios"));
const data_1 = __importStar(require("../../data"));
const utilities_1 = require("../../utilities");
const gamemanager_1 = require("../../gamemanager");
class trivia extends gamemanager_1.baseGame {
    constructor(client, channel) {
        super(client, channel);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let embed = new discord_js_1.EmbedBuilder().setTitle("Trivia").setTimestamp().setColor("Green");
            if (this.channel instanceof discord_js_1.TextChannel) {
                let difficulty = (0, utilities_1.random)(1, 3);
                const color = (difficulty == 1) ? [40, 180, 40] : (difficulty == 2) ? [180, 180, 40] : [180, 40, 40];
                let trivia;
                try {
                    trivia = (yield axios_1.default.get(`https://the-trivia-api.com/api/questions?limit=1&difficulty=${(difficulty == 1) ? 'easy' : (difficulty == 2) ? 'medium' : 'hard'}`)).data[0];
                }
                catch (error) {
                    return console.log(error);
                }
                let answers = trivia.incorrectAnswers.concat(trivia.correctAnswer);
                answers = answers.sort(() => Math.random() - 0.5);
                let answerIndex = answers.indexOf(trivia.correctAnswer);
                let row = new discord_js_1.ActionRowBuilder()
                    .addComponents(new discord_js_1.StringSelectMenuBuilder().setCustomId("trivia").setPlaceholder("Select an answer").addOptions(answers.map((answer, index) => {
                    return { label: answer, value: index.toString() };
                })));
                let text = [
                    '## &f' + trivia.question,
                    `&f- &7${answers[0]}`,
                    `&f- &7${answers[1]}`,
                    `&f- &7${answers[2]}`,
                    `&f- &7${answers[3]}`,
                    '&f ',
                    '{c}## &fUnanswered'
                ];
                const canvas = yield (0, utilities_1.createGameCard)('&fAnswer The Trivia', text, { color: color });
                this.message = yield this.channel.send({ files: [new discord_js_1.AttachmentBuilder(canvas.toBuffer(), { name: 'trivia.png' })], components: [row] });
                let answerers = [];
                let CorrectAnswerers = [];
                this.collector = this.channel.createMessageComponentCollector({ time: 3600000, message: this.message }).on('collect', (interaction) => __awaiter(this, void 0, void 0, function* () {
                    let member = interaction.member;
                    if (interaction.customId == "trivia" && interaction instanceof discord_js_1.StringSelectMenuInteraction && !answerers.includes(interaction.user.id) && member instanceof discord_js_1.GuildMember) {
                        answerers.push(interaction.user.id);
                        if (interaction.values[0] == answerIndex.toString() && this.message) {
                            CorrectAnswerers.push(interaction.user.id);
                            this.emit('correctanswer', interaction, (100 * difficulty));
                            interaction.deferUpdate();
                            if (text[text.length - 1] == '{c}## &fUnanswered') {
                                text.splice(text.length - 1, 1, `## &fCorrect Answerers`);
                                text.push(`&f- &7${member.displayName}`);
                            }
                            else
                                text.push(`&f- &7${member.displayName}`);
                            const canvas = yield (0, utilities_1.createGameCard)('&fAnswer The Trivia', text, { color: color });
                            this.message.edit({ files: [new discord_js_1.AttachmentBuilder(canvas.toBuffer(), { name: 'trivia.png' })], components: [row] });
                        }
                        else {
                            let user = new data_1.GuildMemberManager(data_1.default.getGuildManager(interaction.guildId ? interaction.guildId : '').getMember(interaction.user.id));
                            user.addXP(25, this.channel.id);
                            user.userManager.addXP(25);
                            let message = yield interaction.reply({ content: data_1.MessageManager.getMessage('rewards.trivia.incorrect', [interaction.user.id, 25, trivia.correctAnswer]), ephemeral: true });
                            setTimeout(() => {
                                message === null || message === void 0 ? void 0 : message.delete();
                            }, 20000);
                        }
                    }
                }));
            }
        });
    }
    end() {
        if (this.message && this.message.deletable)
            this.message.delete();
        if (this.collector)
            this.collector.stop();
    }
}
exports.default = trivia;
