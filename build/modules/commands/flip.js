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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let bet = (_a = interaction.options.get('bet')) === null || _a === void 0 ? void 0 : _a.value;
            if (this.memberManager.getTimer('flip') + 30000 < Date.now()) {
                if (typeof bet == 'number' && bet >= 50) {
                    if (typeof bet == 'number' && this.user.balance.wallet > bet) {
                        this.memberManager.setTimer('flip', Date.now());
                        let win = (0, utilities_1.random)(0, 1);
                        let embed = new discord_js_1.EmbedBuilder()
                            .setThumbnail(win ? 'https://cdn.discordapp.com/attachments/1040422701195603978/1106274390527705168/R.gif' : 'https://cdn.discordapp.com/attachments/858439510425337926/1106440676884893716/broken_coin.png')
                            .setTitle(win ? `It's your Lucky day!` : `Better luck next time`)
                            .setDescription(win ? `Successfully earned ${bet} coins` : `Lost ${bet} coins`)
                            .setFooter({ text: 'You can flip again in 30 seconds.' })
                            .setColor('Yellow');
                        if (win == 0) {
                            this.memberManager.removeWallet(bet);
                        }
                        else {
                            this.memberManager.addWallet(bet);
                        }
                        let message = yield interaction.reply({ embeds: [embed] });
                        setTimeout(() => {
                            message.delete();
                        }, 20000);
                    }
                    else {
                        interaction.reply({ content: `You're gonna need more coins to make this bet.`, ephemeral: true });
                    }
                }
                else {
                    interaction.reply({ content: 'You need to bet atleast 50 coins.', ephemeral: true });
                }
            }
            else {
                interaction.reply({ content: `You can flip again at <t:${Math.round((this.memberManager.getTimer('flip') + 30000) / 1000)}:t>`, ephemeral: true });
            }
            return true;
        });
    }
}
daily.command = {
    "name": "flip",
    "description": "flip a coin for a chance to double your bet.",
    "options": [
        {
            "type": 4,
            "name": "bet",
            "description": "the amount of coins to bet",
            "required": true
        }
    ]
};
exports.default = daily;
