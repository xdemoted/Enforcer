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
const data_1 = __importDefault(require("../../data"));
class countChannel {
    constructor(client, channel) {
        this.message = '';
        this.channel = '';
        this.prompt = [];
        this.answer = '';
        this.open = true;
        this.startTime = Date.now();
        this.client = client;
        this.channel = channel;
        this.data = data_1.default;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = this.client.channels.cache.get(this.channel);
            if (channel && channel instanceof discord_js_1.TextChannel) {
                let guild = data_1.default.getGuildManager(channel.guild.id);
                let currentCount = guild.guild.count;
                if (currentCount == 0) {
                    let lastMessage = channel.messages.cache.last();
                    if (lastMessage && parseInt(lastMessage.content) > 0) {
                        currentCount = parseInt(lastMessage.content);
                    }
                }
                channel.createMessageCollector().on('collect', (msg) => __awaiter(this, void 0, void 0, function* () {
                    if (parseInt(msg.content) == currentCount + 1) {
                        currentCount++;
                        msg.react('✅');
                        console.log(guild.guild.count);
                    }
                    else {
                        msg.react('❌');
                    }
                }));
            }
        });
    }
}
exports.default = countChannel;
