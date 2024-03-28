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
const commands_1 = require("../commands");
class answer extends commands_1.baseCommand {
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
            setTimeout(() => {
                if (!interaction.deferred && !interaction.replied)
                    interaction.reply({ ephemeral: true, content: "No response was received from QB. Please check the channel or report the issue." });
            }, 2500);
            return true;
        });
    }
}
answer.command = {
    "name": "answer",
    "description": "Use this to answer quizbowl questions in the right channel.",
    "options": [
        {
            "type": 3,
            "name": "answer",
            "description": "answer",
            "required": true
        }
    ]
};
exports.default = answer;
