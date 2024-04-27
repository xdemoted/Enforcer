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
const canvas_1 = require("canvas");
function generateCalculator(strokeColor) {
    let canvas = new canvas_1.Canvas(250, 250);
    let ctx = canvas.getContext('2d');
    let ctxUtils = new utilities_1.ContextUtilities(ctx);
    ctx.strokeStyle = `rgb(${strokeColor[0]},${strokeColor[1]},${strokeColor[2]})`;
    ctxUtils.roundedRect(75, 50, 100, 135, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(85, 60, 80, 30, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(85, 95, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(113, 95, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(141, 95, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(85, 123, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(113, 123, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(141, 123, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(85, 151, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(113, 151, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(141, 151, 24, 24, 5, 5);
    ctx.stroke();
    return canvas;
}
class math extends gamemanager_1.baseGame {
    constructor(client, channel) {
        super(client, channel);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let difficulty = (0, utilities_1.random)(1, 3);
            const equation = utilities_1.MathGenerator.generateEquation((difficulty == 1) ? utilities_1.maps.easy : (difficulty == 2) ? utilities_1.maps.medium : utilities_1.maps.hard);
            const color = (difficulty == 1) ? [40, 180, 40] : (difficulty == 2) ? [180, 180, 40] : [180, 40, 40];
            const reward = difficulty * 100;
            let text = [
                `## &f${equation[0]}`,
                '&f',
                '{c}## &fUnanswered'
            ];
            const canvas = yield (0, utilities_1.createGameCard)('&fSolve The Equation', text, { color: color, icon: generateCalculator([255, 255, 255]), paranthesesColor: true });
            const attachment = new discord_js_1.AttachmentBuilder(canvas.toBuffer(), { name: 'calculator.png' });
            this.message = yield this.channel.send({ files: [attachment] });
            this.collector = this.channel.createMessageCollector({ time: 3600000 });
            this.collector.on('collect', (msg) => __awaiter(this, void 0, void 0, function* () {
                if (msg.content == equation[1].toString() && this.message) {
                    this.emit('correctanswer', msg, reward);
                    text.splice(2, 1, `{c}# &b${msg.author.displayName} solved the equation`);
                    const canvas = yield (0, utilities_1.createGameCard)('&fSolve The Equation', text, { color: [180, 180, 180], icon: generateCalculator([255, 255, 255]), paranthesesColor: true });
                    const attachment = new discord_js_1.AttachmentBuilder(canvas.toBuffer(), { name: 'calculator.png' });
                    this.message.edit({ files: [attachment] });
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
}
exports.default = math;
exports.default = math;
