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
class level extends commands_1.baseCommand {
    constructor(commandData) {
        super(commandData);
        this.client = commandData.moduleData.client;
        this.data = commandData.moduleData.data;
        this.memberManager = commandData.memberManager;
        this.user = commandData.user;
        this.serverManager = commandData.serverManager;
    }
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let auser = (_a = interaction.options.get("user")) === null || _a === void 0 ? void 0 : _a.user;
            if (auser) {
                this.user = this.serverManager.getMember(auser.id);
            }
            let member = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.get(this.user.id);
            if (member instanceof discord_js_1.GuildMember) {
                let attachment = new discord_js_1.AttachmentBuilder((yield (0, utilities_1.getNamecard)(member, this.data)).toBuffer('image/png'));
                interaction.reply({ files: [attachment] });
            }
            return true;
        });
    }
}
level.command = {
    "name": "level",
    "description": "See your current level in the server.",
    "options": [
        {
            "type": 6,
            "name": "user",
            "description": "Specify which user"
        }
    ]
};
exports.default = level;
