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
class cards extends commands_1.baseCommand {
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
            yield interaction.deferReply();
            let discordUser;
            let userOption = interaction.options.getUser('user');
            if (userOption)
                discordUser = userOption;
            else
                discordUser = interaction.user;
            let user = this.serverManager.getMemberManager(discordUser.id).getUserManager();
            let cards = user.getCards().sort((a, b) => a - b);
            if (cards.length < 1) {
                interaction.editReply({ content: 'There are no cards to display.' });
                return false;
            }
            let cardvas = (0, utilities_1.createCatalog)(cards);
            let attachment = new discord_js_1.AttachmentBuilder((yield cardvas).toBuffer(), { name: 'cards.png' });
            let embed = new discord_js_1.EmbedBuilder()
                .setColor('LuminousVividPink')
                .setTitle(`${discordUser.displayName}'s Cards`)
                .setImage('attachment://cards.png');
            yield interaction.editReply({ embeds: [embed], files: [attachment] });
            setTimeout(() => {
                interaction.deleteReply();
            }, 20000);
            return true;
        });
    }
}
cards.command = {
    "name": "cards",
    "description": "Run this command daily for rewards.",
    "options": [
        {
            "type": 6,
            "name": "user",
            "description": "Specify which user"
        }
    ]
};
exports.default = cards;
