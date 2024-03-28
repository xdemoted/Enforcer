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
const axios_1 = __importDefault(require("axios"));
const discord_js_1 = require("discord.js");
const data_1 = __importStar(require("../../data"));
const RunTimeEvents_1 = require("../../RunTimeEvents");
const utilities_1 = require("../../utilities");
class quizbowl {
    constructor(client, channel) {
        this.message = '';
        this.channel = '';
        this.prompt = [];
        this.answer = '';
        this.open = true;
        this.startTime = Date.now();
        this.client = client;
        this.channel = channel;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('qb');
            try {
                const response = yield axios_1.default.get('https://qbreader.org/api/random-tossup/');
                let data = response.data;
                let prompt = response.data.tossups[0].question.split(".");
                if (prompt[prompt.length - 1] == "") {
                    prompt.splice(prompt.length - 1, 1);
                }
                this.prompt = prompt;
                this.answer = data.tossups[0].formatted_answer;
            }
            catch (error) {
                console.log("error");
            }
            let channel = this.client.channels.cache.get(this.channel);
            let string = this.prompt[0];
            let i = 0;
            let embed = new discord_js_1.EmbedBuilder().setTitle("Daily Quiz Bowl").setDescription(this.prompt[0]).setTimestamp().setColor("LuminousVividPink").setFooter({ text: 'Answer with /answer <answer>' });
            if (!(channel instanceof discord_js_1.TextChannel))
                return;
            let message = (yield channel.send({ embeds: [embed] }));
            this.message = message.id;
            console.log(this.answer);
            new RunTimeEvents_1.RunTimeEvents().on('hour', (current) => {
                if ((0, utilities_1.isOdd)(current) && channel instanceof discord_js_1.TextChannel) {
                    let textMessage = channel.messages.cache.get(this.message);
                    if (textMessage) {
                        i++;
                        if (typeof this.prompt[i] == 'string') {
                            string += this.prompt[i] + ".";
                            if (this.prompt[i].length < 10) {
                                i++;
                                if (typeof this.prompt[i] == 'string') {
                                    string += this.prompt[i] + ".";
                                }
                            }
                            embed.setDescription(string);
                            textMessage.edit({ embeds: [embed] });
                        }
                    }
                }
            });
            let users = [];
            let correctUsers = [];
            let collector = new discord_js_1.InteractionCollector(this.client, { channel: channel, time: 86400000, filter: (interaction) => interaction.isCommand() });
            collector.on('collect', (interaction) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                if (interaction.isCommand() && interaction.commandName == 'answer') {
                    let command = interaction;
                    let answer = (_b = (_a = command.options.get('answer')) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.toString();
                    let userCD = users.find(user => user.id == command.user.id);
                    if (answer && (userCD == undefined || Date.now() - userCD.cd > 300000)) {
                        userCD ? userCD.cd = Date.now() : users.push({ id: command.user.id, cd: Date.now() });
                        let response = yield this.checkanswer(answer);
                        if (correctUsers.includes(command.user.id))
                            command.reply({ content: 'You have already answered correctly.', ephemeral: true });
                        else {
                            let guild = data_1.default.getGuildManager(command.guildId ? command.guildId : '');
                            if (response == 'accept') {
                                correctUsers.push(command.user.id);
                                let reply = yield command.deferReply();
                                let user = new data_1.GuildMemberManager(guild.getMember(command.user.id));
                                guild.addXP(2000);
                                user.addXP(2000, this.channel);
                                user.userManager.addXP(2000);
                                user.addWallet(100);
                                let gems = (0, utilities_1.random)(25, 50);
                                user.userManager.addGems(gems);
                                let card = (0, utilities_1.cardDraw)(true);
                                if (card) {
                                    user.getUserManager().addCard(card.id);
                                    let attachment = new discord_js_1.AttachmentBuilder(yield (0, utilities_1.openChestGif)(card.background, card.rank), { name: "chestopen.gif" });
                                    let embed = new discord_js_1.EmbedBuilder()
                                        .setTitle('Reward')
                                        .setDescription(`Lucky you! Received a "${card.title}" card!\n+${gems} gems, +${100} coins, +${2000} xp`)
                                        .setImage(`attachment://chestopen.gif`);
                                    yield command.editReply({ embeds: [embed], files: [attachment] });
                                }
                                else {
                                    yield command.editReply(data_1.MessageManager.getMessage('rewards.dailyqb.correct', [command.user.id, 2000, 100, gems]));
                                }
                                setTimeout(() => {
                                    if (reply)
                                        reply.delete();
                                }, 20000);
                            }
                            else if (response == 'reject') {
                                let user = new data_1.GuildMemberManager(data_1.default.getGuildManager(command.guildId ? command.guildId : '').getMember(command.user.id));
                                guild.addXP(25);
                                user.addXP(25, this.channel);
                                user.userManager.addXP(25);
                                let rewardMsg = yield command.reply({ content: data_1.MessageManager.getMessage('rewards.dailyqb.incorrect', [command.user.id, 25]), ephemeral: true });
                                setTimeout(() => {
                                    rewardMsg.delete();
                                }, 20000);
                            }
                            else if (response == 'prompt') {
                                command.reply({ content: 'Please check the prompt.\n*Specifics are not available when asked to prompt.*', ephemeral: true });
                            }
                            else {
                                command.reply({ ephemeral: true, content: `An error has likely occured.\nanswer reponse: ${response}` });
                                console.log(response);
                            }
                        }
                    }
                    else {
                        if (userCD) {
                            let time = Math.round((userCD.cd + 300000) / 1000);
                            command.reply({ content: `You can answer again at <t:${time}:t>`, ephemeral: true });
                        }
                    }
                }
            }));
        });
    }
    checkanswer(answer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get('https://qbreader.org/api/check-answer/', { params: { answerline: this.answer, givenAnswer: answer } });
                return response.data.directive;
            }
            catch (error) {
                return 'error';
            }
        });
    }
}
exports.default = quizbowl;
