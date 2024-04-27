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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const gamemanager_1 = require("../../gamemanager");
const utilities_1 = require("../../utilities");
const data_1 = __importStar(require("../../data"));
const canvas_1 = require("canvas");
function generateFlag(strokeColor) {
    let canvas = new canvas_1.Canvas(250, 250);
    let ctx = canvas.getContext('2d');
    let ctxUtils = new utilities_1.ContextUtilities(ctx);
    ctx.fillStyle = `rgb(${strokeColor[0]},${strokeColor[1]},${strokeColor[2]})`;
    ctxUtils.roundedRect(63, 25, 10, 200, 5, 0);
    ctx.fill();
    ctxUtils.roundedRect(78, 25, 100, 75, 5, 10);
    ctx.strokeStyle = `rgb(${strokeColor[0]},${strokeColor[1]},${strokeColor[2]})`;
    ctx.stroke();
    return canvas;
}
class flags extends gamemanager_1.baseGame {
    constructor(client, channel) {
        super(client, channel);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.channel instanceof discord_js_1.TextChannel) {
                // Answer Setup
                let codes = require(data_1.GetFile.assets + '/countrycodes.json');
                let code = Object.keys(codes.countries)[(0, utilities_1.random)(0, Object.keys(codes.countries).length)];
                let options = [];
                for (let i = 0; i < 3; i++) {
                    let randomCode = Object.keys(codes.countries)[(0, utilities_1.random)(0, Object.keys(codes.countries).length)];
                    while (randomCode == code || options.includes(randomCode)) {
                        randomCode = Object.keys(codes.countries)[(0, utilities_1.random)(0, Object.keys(codes.countries).length)];
                    }
                    options.push(randomCode);
                }
                options.push(code);
                options = options.sort(() => Math.random() - 0.5);
                // Action Row Setup
                let row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder().setCustomId("flag").setPlaceholder("Select a country").addOptions(options.map((option, index) => {
                    return { label: codes.countries[option], value: option };
                })));
                // Image Setup
                let image = yield (0, utilities_1.createImageCanvas)(`https://flagcdn.com/w2560/${code}.png`, [460, 0], 10);
                const palette = yield (0, utilities_1.getPalette)(image);
                let color = palette[0].color.map((color) => Math.round(color * 0.71));
                if (color[0] < 50 && color[1] < 50 && color[2] < 50)
                    color = [180, 180, 180];
                let GameImageDesc = [image, '# &fWhich Country is This?']
                    .concat(options.map((option) => { return `- &7${codes.countries[option]}&f`; }));
                GameImageDesc.push(' ');
                let GameImage = yield (0, utilities_1.createGameCard)('&fFlag Guesser', GameImageDesc, { color: color, icon: generateFlag([255, 255, 255]) });
                let attachment = new discord_js_1.AttachmentBuilder(GameImage.toBuffer(), { name: 'flag.png' });
                let message = yield this.channel.send({ files: [attachment], components: [row] });
                this.message = message;
                let collector = message.createMessageComponentCollector({ time: 3600000 });
                let answerers = [];
                let CorrectAnswerers = [];
                collector.on('collect', (interaction) => __awaiter(this, void 0, void 0, function* () {
                    if (interaction.customId == "flag" && interaction instanceof discord_js_1.StringSelectMenuInteraction) {
                        if (answerers.includes(interaction.user.id))
                            interaction.reply({ content: "You have already answered.", ephemeral: true });
                        else {
                            answerers.push(interaction.user.id);
                            let user = new data_1.GuildMemberManager(data_1.default.getGuildManager(interaction.guildId ? interaction.guildId : '').getMember(interaction.user.id));
                            if (interaction.values[0] == code) {
                                interaction.deferUpdate();
                                this.emit('correctanswer', interaction, 200);
                                CorrectAnswerers.push(interaction.user.id);
                                if (GameImageDesc[GameImageDesc.length - 1] == ' ') {
                                    GameImageDesc.push('## Correct Answerers');
                                }
                                GameImageDesc.push('- &7' + interaction.member.displayName + '&f');
                                GameImage = yield (0, utilities_1.createGameCard)('Flag Guesser', GameImageDesc, { color: color, icon: generateFlag([255, 255, 255]) });
                                attachment = new discord_js_1.AttachmentBuilder(GameImage.toBuffer(), { name: 'flag.png' });
                                message.edit({ files: [attachment], components: [row] });
                            }
                            else {
                                user.addXP(25, this.channel.id);
                                user.userManager.addXP(25);
                                let rewardMsg = yield interaction.reply({ content: data_1.MessageManager.getMessage('rewards.flagincorrect', [interaction.user.id, 25, codes.countries[code]]), ephemeral: true });
                                setTimeout(() => {
                                    rewardMsg.delete();
                                }, 20000);
                            }
                        }
                    }
                }));
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
exports.default = flags;
