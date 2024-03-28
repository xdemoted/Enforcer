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
class flags extends gamemanager_1.baseGame {
    constructor(client, channel) {
        super(client, channel);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.channel instanceof discord_js_1.TextChannel) {
                let embed = new discord_js_1.EmbedBuilder().setTitle("Flag Guesser").setDescription("Guess the country of the flag.").setTimestamp().setColor("Aqua");
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
                let row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder().setCustomId("flag").setPlaceholder("Select a country").addOptions(options.map((option, index) => {
                    return { label: codes.countries[option], value: option };
                })));
                embed.setURL(`https://flagcdn.com/w2560/${code}.png`);
                embed.setImage(`https://flagcdn.com/w2560/${code}.png`);
                let message = yield this.channel.send({ embeds: [embed], components: [row] });
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
                            console.log(code, options, interaction.values[0]);
                            if (interaction.values[0] == code) {
                                interaction.deferUpdate();
                                this.emit('correctanswer', interaction, 200);
                                CorrectAnswerers.push(interaction.user.id);
                                embed.addFields([{ name: (0, utilities_1.numberedStringArraySingle)('', CorrectAnswerers.length - 1), value: interaction.member.displayName, inline: true }]);
                                message.edit({ embeds: [embed], components: [row] });
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
        }
        if (this.collector)
            this.collector.stop();
    }
}
exports.default = flags;
