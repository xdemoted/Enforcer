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
const data_1 = require("../data");
const commands_1 = require("../commands");
const utilities_1 = require("../utilities");
class daily extends commands_1.baseCommand {
    constructor(commandData) {
        super(commandData);
        this.client = commandData.moduleData.client;
        this.data = commandData.moduleData.data;
        this.memberManager = commandData.memberManager;
        this.user = commandData.user;
        this.serverManager = commandData.serverManager;
    }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Date.now() >= (this.memberManager.getTimer('daily') + 64800000)) {
                let xp = (0, utilities_1.random)(150, 250);
                let gem = (0, utilities_1.random)(10, 15);
                let currency = (0, utilities_1.random)(20, 100);
                this.memberManager.addXP(xp, interaction.channelId);
                this.memberManager.addWallet(currency);
                let guser = new data_1.UserManager(this.memberManager.getGlobalUser());
                guser.addGems(gem);
                guser.addXP(xp);
                let embed = new discord_js_1.EmbedBuilder()
                    .setColor('LuminousVividPink')
                    .setTitle('Daily Rewards')
                    .setDescription('Come back tomorrow for more rewards!')
                    .setFields([{ name: 'XP', inline: true, value: xp.toString() }, { name: 'Currency', inline: true, value: currency.toString() }, { name: 'Gems', inline: true, value: gem.toString() }]);
                this.memberManager.setTimer('daily', Date.now());
                let reply = yield interaction.reply({ embeds: [embed] });
                setTimeout(() => {
                    reply.delete();
                }, 20000);
            }
            else {
                interaction.reply({ ephemeral: true, content: `You can recieve more rewards at <t:${Math.round((this.memberManager.getTimer('daily') + 64800000) / 1000)}:t>` });
            }
            return true;
        });
    }
}
daily.command = {
    "name": "daily",
    "description": "Run this command daily for rewards.",
};
exports.default = daily;
