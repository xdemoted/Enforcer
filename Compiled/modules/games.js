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
exports.dailyQB = exports.games = void 0;
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
const data_1 = __importStar(require("./data"));
const utilities_1 = require("./utilities");
const easyVM = { "*": .05, "-": .475, "+": 0.475 };
const medVM = { "*": .3, "-": .3, "+": 0.3 };
const hardVM = { "*": .3, "-": .3, "+": 0.3 };
const impossibleVM = { "*": .1, "-": .5, "+": 0.4 };
let valueMap = { "+": 10, "-": 20, "*": 30, "/": 40 };
const chanceMap = { "*": .2, "-": .3, "+": 0.3 };
function generateEquation(vm) {
    let termCount = (0, utilities_1.random)(3, 6);
    if (vm == impossibleVM) {
        termCount = (0, utilities_1.random)(100, 200);
    }
    else if (vm == hardVM) {
        termCount = (0, utilities_1.random)(6, 9);
    }
    let terms = [];
    let tAvg = 0;
    let signValue = 0;
    for (let i = 0; i < termCount; i++) {
        let term = (0, utilities_1.random)(3, 50);
        terms.push(term);
        tAvg = tAvg + term;
    }
    tAvg = Math.round(tAvg / termCount);
    if ((0, utilities_1.random)(0, 1) == 1) {
        let tindex = (0, utilities_1.random)(0, terms.length - 1);
        let term = terms[tindex];
        let multipleArray = (0, utilities_1.multiples)(term);
        if (multipleArray.length > 1) {
            let multiple = 0;
            while (multiple == term || multiple == 0) {
                multiple = multipleArray[(0, utilities_1.random)(0, multipleArray.length - 1)];
            }
            term = `(${term} / ${multiple})`;
            terms[tindex] = term;
        }
        signValue = 40;
    }
    for (let i = 0; i < 3; i++) {
        let randTerm = (0, utilities_1.random)(0, terms.length - 1);
        if (typeof terms[randTerm] == 'number' || (typeof terms[randTerm] == 'string' && !terms[randTerm].includes('^'))) {
            let term = typeof terms[randTerm] == 'string' ? eval(terms[randTerm]) : terms[randTerm];
            if ((0, utilities_1.isSqrt)(term)) {
                terms[randTerm] = `${terms[randTerm]}^0.5`;
                signValue = signValue + 30;
            }
            else if (term <= 10) {
                terms[randTerm] = `${terms[randTerm]}^2`;
                signValue = signValue + 30;
            }
        }
        else {
            i--;
        }
    }
    let equation = '';
    for (let i = 0; i < terms.length - 1; i++) {
        const term = terms[i];
        let values = getSign(vm);
        signValue = signValue + values[1];
        equation = equation + `${term} ${values[0]} `;
    }
    equation = equation + terms[terms.length - 1];
    let value = signValue + tAvg + Math.abs(eval(equation.replace(/\^/g, '**')) * ((0, utilities_1.random)(1, 4) / 10));
    return [equation, Math.round((value > 300) ? 300 : value)];
}
function getSign(vm) {
    let value = undefined;
    while (value == undefined) {
        if (Math.random() < vm["+"]) {
            value = ['+', valueMap["+"]];
        }
        else if (Math.random() < vm["-"]) {
            value = ['-', valueMap["-"]];
        }
        else if (Math.random() < vm["*"]) {
            value = ['*', valueMap["*"]];
        }
    }
    return value;
}
class mathGame {
    constructor(client, channel) {
        this.channel = channel;
        this.client = client;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let difficulty = (0, utilities_1.random)(1, 3);
            let equation = ['error: type 0 to answer correctly', 0];
            let color = "Green";
            switch (difficulty) {
                case 1:
                    {
                        equation = generateEquation(easyVM);
                    }
                    break;
                case 2:
                    {
                        equation = generateEquation(medVM);
                        color = "Yellow";
                    }
                    break;
                case 3:
                    {
                        if ((0, utilities_1.random)(3, 6) == 5) {
                            equation = generateEquation(impossibleVM);
                            equation[1] = 1500;
                            color = "DarkRed";
                        }
                        else {
                            equation = generateEquation(hardVM);
                            color = "Red";
                        }
                    }
                    break;
                default:
                    break;
            }
            let embed = new discord_js_1.EmbedBuilder().setTitle("Solve the math problem.").setDescription(equation[0]).setTimestamp().setFooter({ text: "Solve for " + equation[1] + "xp" }).setColor(color);
            let reward = equation[1];
            let answer = eval(equation[0].replace(/\^/g, '**'));
            if (this.channel instanceof discord_js_1.TextChannel) {
                let message = yield this.channel.send({ embeds: [embed] });
                this.collector = this.channel.createMessageCollector({ time: 3600000 });
                this.collector.on('collect', (msg) => __awaiter(this, void 0, void 0, function* () {
                    console.log();
                    if (msg.content.replace(/\D/g, "") == answer) {
                        let user = new data_1.GuildMemberManager(data_1.default.getGuildManager(msg.guildId ? msg.guildId : '').getMember(msg.author.id));
                        user.addXP(reward);
                        user.addWallet(10);
                        embed.setFields([{ name: "Answer", value: answer.toString(), inline: true }])
                            .setTitle(`${msg.author.displayName} solved the problem.`)
                            .setFooter({ text: "Solved for " + equation[1] + "xp" });
                        message.edit({ embeds: [embed] });
                        let rewardMsg = yield msg.channel.send(`<@${msg.author.id}> solved the problem.`);
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
                let strings = ["1st. ", "2nd. ", "3rd. "];
                this.collector = this.channel.createMessageComponentCollector({ time: 3600000, message: triviaMessage }).on('collect', (interaction) => __awaiter(this, void 0, void 0, function* () {
                    let member = interaction.member;
                    if (interaction.customId == "trivia" && interaction instanceof discord_js_1.StringSelectMenuInteraction && !answerers.includes(interaction.user.id) && member instanceof discord_js_1.GuildMember) {
                        answerers.push(interaction.user.id);
                        CorrectAnswerers.push(interaction.user.id);
                        let user = new data_1.GuildMemberManager(data_1.default.getGuildManager(interaction.guildId ? interaction.guildId : '').getMember(interaction.user.id));
                        if (interaction.values[0] == answerIndex.toString()) {
                            user.addXP((trivia.difficulty == "easy" ? 100 : trivia.difficulty == "medium" ? 200 : 300) / CorrectAnswerers.length);
                            user.addWallet(10);
                            embed.addFields([{ name: strings[answerers.length - 1] ? strings[answerers.length - 1] : `${CorrectAnswerers.length}th. `, value: member.displayName, inline: true }]);
                            triviaMessage.edit({ embeds: [embed], components: [row] });
                            let message = yield interaction.reply(`<@${interaction.user.id}> answered correctly.`);
                            setTimeout(() => {
                                message === null || message === void 0 ? void 0 : message.delete();
                            }, 20000);
                        }
                        else {
                            let message = yield interaction.reply(`<@${interaction.user.id}> answered incorrectly.`);
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
            let embed = new discord_js_1.EmbedBuilder().setTitle("Unscramble The Word").setDescription(word).setTimestamp().setColor(difficulty == 1 ? "Green" : difficulty == 2 ? "Yellow" : "Red");
            const value = Math.round(100 * ((length - 3) ** 0.75));
            embed.setFooter({ text: "Unscramble for " + value + "xp" });
            let message = yield this.channel.send({ embeds: [embed] });
            let solved = false;
            this.collector = this.channel.createMessageCollector({ time: 3600000 });
            this.collector.on('collect', (msg) => __awaiter(this, void 0, void 0, function* () {
                if (msg.content.toLowerCase() == word.toLowerCase()) {
                    let user = new data_1.GuildMemberManager(data_1.default.getGuildManager(msg.guildId ? msg.guildId : '').getMember(msg.author.id));
                    user.addXP(value);
                    user.addWallet(10);
                    embed.setFields([{ name: "Answer", value: word, inline: true }])
                        .setTitle(`${msg.author.displayName} unscrambled the word.`)
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
        let randomNum = (0, utilities_1.random)(1, 3);
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
    createThread() {
    }
}
class dailyQB {
    constructor() {
        this.message = '';
        this.channel = '';
        this.prompt = [];
        this.answer = '';
        this.open = true;
        this.startTime = Date.now();
    }
    static init(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let qb = new dailyQB();
                const response = yield axios_1.default.get('https://qbreader.org/api/random-tossup/');
                let data = response.data;
                let prompt = response.data.tossups[0].question.split(".");
                if (prompt[prompt.length - 1] == "") {
                    prompt.splice(prompt.length - 1, 1);
                }
                qb.channel = channel;
                qb.prompt = prompt;
                qb.answer = data.tossups[0].formatted_answer;
                return qb;
            }
            catch (error) {
                return new dailyQB();
            }
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
