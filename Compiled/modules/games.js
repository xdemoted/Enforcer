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
exports.dailyQB = exports.blackjackThread = exports.games = void 0;
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
const data_1 = __importStar(require("./data"));
const RunTimeEvents_1 = require("./RunTimeEvents");
const utilities_1 = require("./utilities");
function wordScramble(word) {
    let scrambledWord = "";
    const wordArray = word.split("");
    while (wordArray.length > 0) {
        const randomIndex = Math.floor(Math.random() * wordArray.length);
        scrambledWord += wordArray.splice(randomIndex, 1)[0];
    }
    return scrambledWord;
}
class mathGame {
    constructor(client, channel) {
        this.channel = channel;
        this.client = client;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let difficulty = (0, utilities_1.random)(1, 4);
            let equation = ['error: type 0 to answer correctly', 0];
            let color = "Green";
            switch (difficulty) {
                case 1:
                    {
                        equation = (0, utilities_1.generateEquation)(utilities_1.maps.easy);
                    }
                    break;
                case 2:
                    {
                        equation = (0, utilities_1.generateEquation)(utilities_1.maps.medium);
                        color = "Yellow";
                    }
                    break;
                case 3:
                    {
                        equation = (0, utilities_1.generateEquation)(utilities_1.maps.hard);
                        color = "Red";
                    }
                    break;
                default:
                    {
                        equation = (0, utilities_1.algGen)();
                        color = "LuminousVividPink";
                    }
                    break;
            }
            let embed = new discord_js_1.EmbedBuilder().setTitle("Solve the math problem.").setDescription(equation[0]).setTimestamp().setFooter({ text: "Solve for " + equation[1] + "xp" }).setColor(color);
            let answer = equation[1];
            if (this.channel instanceof discord_js_1.TextChannel) {
                let message = yield this.channel.send({ embeds: [embed] });
                this.collector = this.channel.createMessageCollector({ time: 3600000 });
                this.collector.on('collect', (msg) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    if (msg.content.replace(/[^-0-9]/g, "") == answer.toString()) {
                        let reward = Math.round(answer * (1 - (0, utilities_1.random)(1, 4) * 0.05)) > 300 ? 300 : Math.round(answer * (1 - (0, utilities_1.random)(1, 4) * 0.05));
                        let gemReward = (0, utilities_1.random)(1, Math.ceil(reward / 100));
                        let user = new data_1.GuildMemberManager(data_1.default.getGuildManager(msg.guildId ? msg.guildId : '').getMember(msg.author.id));
                        user.addXP(reward, this.channel.id);
                        user.addWallet(10);
                        user.userManager.addGems(gemReward);
                        embed.setFields([{ name: "Answer", value: answer.toString(), inline: true }])
                            .setTitle(`${(_a = msg.member) === null || _a === void 0 ? void 0 : _a.displayName} solved the problem.`)
                            .setFooter({ text: "Solved for " + ((Math.round(answer * (1 - (0, utilities_1.random)(1, 4) * 0.05)) > 300) ? 300 : Math.round(answer * (1 - (0, utilities_1.random)(1, 4) * 0.05))) + " xp" });
                        message.edit({ embeds: [embed] });
                        let rewardMsg = yield msg.channel.send(data_1.MessageManager.getMessage('rewards.generic', [msg.author.id, reward, 10, gemReward]));
                        setTimeout(() => {
                            if (msg.deletable)
                                msg.delete();
                            rewardMsg.delete();
                        }, 20000);
                        if (this.collector)
                            this.collector.stop();
                    }
                }));
            }
        });
    }
    end() {
        if (this.collector)
            this.collector.stop();
    }
}
class triviaGame {
    constructor(client, channel) {
        this.client = client;
        this.channel = channel;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let embed = new discord_js_1.EmbedBuilder().setTitle("Trivia").setTimestamp().setColor("Green");
            if (this.channel instanceof discord_js_1.TextChannel) {
                let difficulty = "easy";
                switch ((0, utilities_1.random)(1, 3)) {
                    case 2:
                        difficulty = "medium";
                        embed.setColor("Yellow");
                        break;
                    case 3:
                        difficulty = "hard";
                        embed.setColor("Red");
                        break;
                    default:
                        break;
                }
                let trivia;
                try {
                    trivia = (yield axios_1.default.get(`https://the-trivia-api.com/api/questions?limit=1&difficulty=${difficulty}`)).data[0];
                }
                catch (error) {
                    return console.log(error);
                }
                let answers = trivia.incorrectAnswers.concat(trivia.correctAnswer);
                let answerIndex = answers.indexOf(trivia.correctAnswer);
                let selectmenu = new discord_js_1.StringSelectMenuBuilder().setCustomId("trivia").setPlaceholder("Select an answer").addOptions(answers.map((answer, index) => {
                    return { label: answer, value: index.toString() };
                }));
                let row = new discord_js_1.ActionRowBuilder()
                    .addComponents(selectmenu);
                embed.setDescription((0, utilities_1.stringMax)(trivia.question, 4096));
                let triviaMessage = yield this.channel.send({ embeds: [embed], components: [row] });
                let answerers = [];
                let CorrectAnswerers = [];
                console.log(trivia.correctAnswer);
                this.collector = this.channel.createMessageComponentCollector({ time: 3600000, message: triviaMessage }).on('collect', (interaction) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    interaction.deferUpdate();
                    let member = interaction.member;
                    if (interaction.customId == "trivia" && interaction instanceof discord_js_1.StringSelectMenuInteraction && !answerers.includes(interaction.user.id) && member instanceof discord_js_1.GuildMember) {
                        answerers.push(interaction.user.id);
                        if (interaction.values[0] == answerIndex.toString()) {
                            CorrectAnswerers.push(interaction.user.id);
                            let user = new data_1.GuildMemberManager(data_1.default.getGuildManager(interaction.guildId ? interaction.guildId : '').getMember(interaction.user.id));
                            let reward = (trivia.difficulty == "easy" ? 100 : trivia.difficulty == "medium" ? 200 : 300) / CorrectAnswerers.length;
                            let gemReward = (0, utilities_1.random)(1, Math.ceil(reward / 100));
                            user.addXP(reward, this.channel.id);
                            user.addWallet(10);
                            user.userManager.addGems((0, utilities_1.random)(1, Math.ceil(reward / 100)));
                            embed.addFields([{ name: (0, utilities_1.numberedStringArraySingle)('', CorrectAnswerers.length - 1), value: member.displayName, inline: true }]);
                            triviaMessage.edit({ embeds: [embed], components: [row] });
                            let message = yield ((_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.send(data_1.MessageManager.getMessage('rewards.generic', [interaction.user.id, reward, 10, gemReward])));
                            setTimeout(() => {
                                message === null || message === void 0 ? void 0 : message.delete();
                            }, 20000);
                        }
                        else {
                            let message = yield ((_b = interaction.channel) === null || _b === void 0 ? void 0 : _b.send(data_1.MessageManager.getMessage('rewards.trivia.incorrect', [interaction.user.id, trivia.correctAnswer])));
                            setTimeout(() => {
                                message === null || message === void 0 ? void 0 : message.delete();
                            }, 20000);
                        }
                    }
                })).on('end', () => {
                    embed.setFooter({ text: "Correct answer: " + trivia.correctAnswer });
                    embed.setColor("NotQuiteBlack");
                    selectmenu.setDisabled(true);
                    triviaMessage.edit({ embeds: [embed], components: [row] });
                });
            }
        });
    }
    end() {
        if (this.collector)
            this.collector.stop();
    }
}
class scrambleGame {
    constructor(client, channel) {
        this.channel = channel;
        this.client = client;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let word = '';
            let difficulty = (0, utilities_1.random)(1, 3);
            let length = 5;
            switch (difficulty) {
                case 1:
                    {
                        length = (0, utilities_1.random)(4, 5);
                    }
                    break;
                case 2:
                    {
                        length = (0, utilities_1.random)(6, 9);
                    }
                    break;
                case 3:
                    {
                        length = (0, utilities_1.random)(10, 15);
                    }
                    break;
            }
            try {
                word = (yield axios_1.default.get('https://random-word-api.herokuapp.com/word?length=' + length)).data[0];
            }
            catch (error) {
                return;
            }
            let scrambledWord = word;
            while (word == scrambledWord) {
                scrambledWord = wordScramble(word);
            }
            let embed = new discord_js_1.EmbedBuilder().setTitle("Unscramble The Word").setDescription(scrambledWord).setTimestamp().setColor(difficulty == 1 ? "Green" : difficulty == 2 ? "Yellow" : "Red");
            const value = Math.round(100 * ((length - 3) ** 0.75));
            embed.setFooter({ text: "Unscramble for " + value + "xp" });
            let message = yield this.channel.send({ embeds: [embed] });
            let solved = false;
            this.collector = this.channel.createMessageCollector({ time: 3600000 });
            this.collector.on('collect', (msg) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (msg.content.toLowerCase() == word.toLowerCase()) {
                    let user = new data_1.GuildMemberManager(data_1.default.getGuildManager(msg.guildId ? msg.guildId : '').getMember(msg.author.id));
                    user.addXP(value, this.channel.id);
                    user.addWallet(10);
                    user.userManager.addGems((0, utilities_1.random)(1, Math.ceil(value / 100)));
                    embed.setFields([{ name: "Answer", value: word, inline: true }])
                        .setTitle(`${(_a = msg.member) === null || _a === void 0 ? void 0 : _a.displayName} unscrambled the word.`)
                        .setFooter({ text: "Unscrambled for " + value + "xp" })
                        .setColor("NotQuiteBlack");
                    message.edit({ embeds: [embed] });
                    let rewardMsg = yield msg.channel.send(`<@${msg.author.id}> unscrambled the word.`);
                    solved = true;
                    setTimeout(() => {
                        if (msg.deletable)
                            msg.delete();
                        rewardMsg.delete();
                    }, 20000);
                    if (this.collector)
                        this.collector.stop();
                }
            }));
            this.collector.on('end', () => {
                if (!solved) {
                    embed.setFooter({ text: "Unscramble for " + value + "xp" })
                        .setFields([{ name: "Answer", value: word, inline: true }])
                        .setColor("NotQuiteBlack");
                    message.edit({ embeds: [embed] });
                }
            });
        });
    }
    end() {
        if (this.collector)
            this.collector.stop();
    }
}
class games {
    constructor(client, channel) {
        this.channel = channel;
        this.client = client;
    }
    init() {
        if (this.game)
            this.game.end();
        let randomNum = 1; //random(1, 1)
        let channel = this.client.channels.cache.get(this.channel);
        if (channel instanceof discord_js_1.TextChannel) {
            switch (randomNum) {
                case 1:
                    {
                        console.log("math");
                        this.game = new mathGame(this.client, channel);
                        this.game.init();
                    }
                    break;
                case 2:
                    {
                        console.log("trivia");
                        this.game = new triviaGame(this.client, channel);
                        this.game.init();
                    }
                    break;
                default:
                    {
                        console.log("unscramble");
                        this.game = new scrambleGame(this.client, channel);
                        this.game.init();
                    }
                    break;
            }
        }
    }
}
exports.games = games;
class blackjackThread {
    constructor(channel, player) {
        this.channel = channel;
        this.player = player;
    }
    init() {
        let embed = new discord_js_1.EmbedBuilder().setTitle("Welcome to Blackjack").setDescription("React with 🃏 to start the game.").setTimestamp().setColor("Green");
        this.channel.threads.create({ name: this.player.id, autoArchiveDuration: 1440, reason: "Blackjack", message: { content: "Welcome to Blackjack", embeds: [embed] } });
    }
}
exports.blackjackThread = blackjackThread;
class dailyQB {
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
            let embed = new discord_js_1.EmbedBuilder().setTitle("Daily Quiz Bowl").setDescription(this.prompt[0]).setTimestamp().setColor("LuminousVividPink");
            if (!(channel instanceof discord_js_1.TextChannel))
                return;
            this.message = (yield channel.send({ embeds: [embed] })).id;
            new RunTimeEvents_1.RunTimeEvents().on('hour', (current) => {
                if ((0, utilities_1.isOdd)(current) && channel instanceof discord_js_1.TextChannel) {
                    let textMessage = channel.messages.cache.get(this.message);
                    if (textMessage) {
                        i++;
                        string += this.prompt[i];
                        embed.setDescription(string);
                        textMessage.edit({ embeds: [embed] });
                    }
                }
            });
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
exports.dailyQB = dailyQB;
