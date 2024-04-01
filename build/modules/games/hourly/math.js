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
const utilities_1 = require("../../utilities");
const gamemanager_1 = require("../../gamemanager");
class math extends gamemanager_1.baseGame {
    constructor(client, channel) {
        super(client, channel);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let difficulty = (0, utilities_1.random)(1, 3);
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
            }
            let image = (0, utilities_1.createColorText)(equation[0]);
            let attachment = new discord_js_1.AttachmentBuilder(image.toBuffer(), { name: "equation.png" });
            let embed = new discord_js_1.EmbedBuilder().setTitle("Solve the math problem.").setDescription(equation[0]).setImage('attachment://equation.png').setTimestamp().setFooter({ text: "Solve for " + difficulty * 100 + "xp" }).setColor(color);
            let answer = equation[1];
            if (this.channel instanceof discord_js_1.TextChannel) {
                this.message = yield this.channel.send({ embeds: [embed], files: [attachment] });
                this.collector = this.channel.createMessageCollector({ time: 3600000 });
                this.collector.on('collect', (msg) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    if (msg.content.replace(/[^-0-9]/g, "") == answer.toString()) {
                        this.emit('correctanswer', msg, difficulty * 100);
                        embed.setFields([{ name: "Answer", value: answer.toString(), inline: true }])
                            .setTitle(`${(_a = msg.member) === null || _a === void 0 ? void 0 : _a.displayName} solved the problem.`)
                            .setFooter({ text: "Solved for " + difficulty * 100 + " xp" });
                        if (this.message)
                            this.message.edit({ embeds: [embed] });
                        if (this.collector)
                            this.collector.stop();
                        setTimeout(() => {
                            if (msg.deletable)
                                msg.delete();
                        }, 5000);
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
exports.default = math;
