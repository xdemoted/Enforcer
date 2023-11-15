"use strict";
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
exports.dailyQB = void 0;
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
let defaultEmbeds = { math: new discord_js_1.EmbedBuilder().setTitle("Math").setColor("Green").setFooter({ text: "Math Game" }).setTimestamp().setDescription("Solve the math problem below!"), trivia: new discord_js_1.EmbedBuilder().setTitle("Trivia").setColor("LuminousVividPink") };
class mathGame {
    constructor(channel, cyclic) {
        this.channel = channel;
        this.cyclic = cyclic;
    }
    init() {
    }
}
class games {
    constructor(channel, cyclic) {
        this.channel = channel;
        this.cyclic = cyclic;
    }
    init() {
    }
}
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
                console.error(error);
                return 'error';
            }
        });
    }
}
exports.dailyQB = dailyQB;
