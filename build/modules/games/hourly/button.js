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
const discord_js_1 = require("discord.js");
const gamemanager_1 = require("../../gamemanager");
const data_1 = __importDefault(require("../../data"));
class button extends gamemanager_1.baseGame {
    constructor(client, channel) {
        super(client, channel);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const row = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId('click')
                .setLabel(`Don't Touch`)
                .setStyle(discord_js_1.ButtonStyle.Primary));
            this.message = yield this.channel.send({ content: 'Its a button, it does things... I think?', components: [row] });
            this.collector = this.channel.createMessageComponentCollector({ time: 3600000, filter: i => (i.customId === 'click' && this.message.id == i.message.id), componentType: discord_js_1.ComponentType.Button, });
            this.collector.on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
                let outcome = Math.random();
                let guild = data_1.default.getGuildManager(i.guildId);
                switch (true) {
                    case outcome <= 0.05:
                        i.reply({ content: 'With the click of the button your soul feels sapped of a great amount of knowledge.', ephemeral: true });
                        guild.getMemberManager(i.user.id).removeXP(1000);
                        break;
                    case outcome <= 0.1:
                        i.reply({ content: 'An audible click rings as you feel xp forcefully stuffed down your throat.', ephemeral: true });
                        guild.getMemberManager(i.user.id).addXP(1000);
                        break;
                    case outcome <= 0.3:
                        i.reply({ content: 'As the click sounds, you feel a sudden numbness as if experience was sapped from your soul.', ephemeral: true });
                        guild.getMemberManager(i.user.id).removeXP(105);
                        break;
                    case outcome <= 0.5:
                        i.reply({ content: 'With the click of the button your soul heavy with newfound knowledge', ephemeral: true });
                        guild.getMemberManager(i.user.id).addXP(100);
                        break;
                    case outcome <= 0.85:
                        i.reply({ content: 'With the click of the button your soul heavy with newfound knowledge', ephemeral: true });
                        guild.getMemberManager(i.user.id).addXP(500);
                        break;
                    default:
                        i.reply({ content: 'As the button clicks, your brain becomes foggy, as if you forgot experiences of your past.', ephemeral: true });
                        guild.getMemberManager(i.user.id).removeXP(500);
                        break;
                }
            }));
        });
    }
    end() {
        if (this.collector)
            this.collector.stop();
        if (this.message && this.message.deletable)
            this.message.delete();
    }
}
exports.default = button;
