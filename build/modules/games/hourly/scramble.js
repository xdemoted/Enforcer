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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const gamemanager_1 = require("../../gamemanager");
const utilities_1 = require("../../utilities");
class scramble extends gamemanager_1.baseGame {
    constructor(client, channel) {
        super(client, channel);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
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
                        length = (0, utilities_1.random)(6, 7);
                    }
                    break;
                case 3:
                    {
                        length = (0, utilities_1.random)(8, 9);
                    }
                    break;
            }
            let word = (0, utilities_1.getWord)(length);
            let scrambledWord = word;
            while (word == scrambledWord) {
                scrambledWord = scramble.wordScramble(word);
            }
            let text = [
                `{c}## &f${scrambledWord}`,
                '&f',
                '{c}## &fUnanswered'
            ];
            console.log(word, scrambledWord, difficulty);
            const color = (difficulty == 1) ? [40, 180, 40] : (difficulty == 2) ? [180, 180, 40] : [180, 40, 40];
            const canvas = yield (0, utilities_1.createGameCard)('&fUnscramble The Word', text, { color: color, paranthesesColor: true });
            const attachment = new discord_js_1.AttachmentBuilder(canvas.toBuffer(), { name: 'calculator.png' });
            const reward = 100 * difficulty;
            this.message = yield this.channel.send({ files: [attachment] });
            let solved = false;
            this.collector = this.channel.createMessageCollector({ time: 3600000 });
            this.collector.on('collect', (msg) => __awaiter(this, void 0, void 0, function* () {
                if (msg.content.toLowerCase() == word.toLowerCase() && this.message) {
                    this.emit('correctanswer', msg, reward);
                    solved = true;
                    let text = [
                        `{c}## &f${scrambledWord} = ${word}`,
                        '&f',
                        `{c}## &b${msg.author.displayName} Unscrambled the word`
                    ];
                    const canvas = yield (0, utilities_1.createGameCard)('&fUnscramble The Word', text, { color: [180, 180, 180], paranthesesColor: true });
                    this.message.edit({ files: [new discord_js_1.AttachmentBuilder(canvas.toBuffer(), { name: 'calculator.png' })] });
                    if (this.collector)
                        this.collector.stop();
                }
            }));
        });
    }
    end() {
        if (this.message && this.message.deletable) {
            this.message.delete();
        }
        if (this.collector)
            this.collector.stop();
    }
    static wordScramble(word) {
        let scrambledWord = "";
        const wordArray = word.split("");
        while (wordArray.length > 0) {
            const randomIndex = Math.floor(Math.random() * wordArray.length);
            scrambledWord += wordArray.splice(randomIndex, 1)[0];
        }
        return scrambledWord;
    }
}
exports.default = scramble;
