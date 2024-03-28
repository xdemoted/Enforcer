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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
const discord_js_1 = require("discord.js");
const data_1 = __importStar(require("./modules/data"));
const RunTimeEvents_1 = require("./modules/RunTimeEvents");
const gamemanager_1 = __importDefault(require("./modules/gamemanager"));
const utilities_1 = require("./modules/utilities");
const canvas_1 = __importDefault(require("canvas"));
const commands_1 = require("./modules/commands");
// Settings
const authorizedUsers = ['316243027423395841'];
const client = new discord_js_1.Client({ partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel, discord_js_1.Partials.Reaction, discord_js_1.Partials.GuildMember, discord_js_1.Partials.User], intents: 131071 });
let moduleData = { data: data_1.default, client: client, hosts: authorizedUsers };
let runtimeEvents = new RunTimeEvents_1.RunTimeEvents(true);
let commandExecutor;
canvas_1.default.registerFont('./build/assets/fonts/segmento.otf', { family: 'Segmento' });
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    data_1.default.checkData();
    data_1.default.eventEmitter.on('levelUp', (userID, channelID) => __awaiter(void 0, void 0, void 0, function* () {
        let channel = client.channels.cache.get(channelID);
        if (channel instanceof discord_js_1.TextChannel) {
            let user = channel.guild.members.cache.get(userID);
            if (user instanceof discord_js_1.GuildMember) {
                let message = yield channel.send(`**Level Up!** <@${userID}> is now level ${new data_1.GuildMemberManager(data_1.default.getGuildManager(channel.guild.id).getMember(user.id)).getLevel()}`);
                setTimeout(() => {
                    if (message.deletable)
                        message.delete();
                }, 10000);
            }
        }
    }));
    commandExecutor = new commands_1.CommandExecutor(moduleData);
    commandExecutor.init();
    client.guilds.fetch();
    client.guilds.cache.forEach(guild => {
        guild.commands.set(commandExecutor.commands);
    });
    new gamemanager_1.default(client);
    runtimeEvents.on('5minute', () => {
        data_1.default.write();
    });
}));
client.on('messageDelete', (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    if ((_a = message.author) === null || _a === void 0 ? void 0 : _a.bot)
        return;
    let channelID = data_1.default.getGuild((_b = message.guild) === null || _b === void 0 ? void 0 : _b.id).settings.loggingChannel;
    let channel = (_c = message.guild) === null || _c === void 0 ? void 0 : _c.channels.cache.get(channelID.toString());
    if (channel instanceof discord_js_1.TextChannel) {
        if (message.content == undefined || message.content.length < 256) {
            let embed = new discord_js_1.EmbedBuilder()
                .setColor('Red')
                .setTitle('Message Deleted')
                .setDescription(`Message sent by <@${(_d = message.author) === null || _d === void 0 ? void 0 : _d.id}> deleted in <#${message.channel.id}>`)
                .addFields([{ name: 'Content', value: (message.content) ? message.content : 'No Message Content', inline: false }])
                .setTimestamp(message.createdAt);
            channel.send({ embeds: [embed], files: Array.from(message.attachments.values()) });
        }
        else if (message.content) {
            let embed = new discord_js_1.EmbedBuilder()
                .setColor('Red')
                .setTitle('Message Deleted')
                .setDescription(`Message sent by <@${(_e = message.author) === null || _e === void 0 ? void 0 : _e.id}> deleted in <#${message.channel.id}>`)
                .addFields([{ name: 'Content', value: 'Posted Above', inline: false }])
                .setTimestamp(message.createdAt);
            channel.send({ embeds: [embed], files: Array.from(message.attachments.values()), content: message.content });
        }
    }
}));
client.on('messageCreate', message => {
    if (message.content.length > 5) {
        if (message.guild) {
            let serverManager = data_1.default.getGuildManager(message.guild.id);
            let user = serverManager.getMember(message.author.id);
            let userManager = new data_1.GuildMemberManager(user);
            if (userManager.getTimer('message') + 60000 < Date.now()) {
                const xpReward = (0, utilities_1.random)(10, 25);
                userManager.addXP(xpReward, message.channel.id);
                userManager.getUserManager().addXP(xpReward);
                userManager.addWallet((0, utilities_1.random)(1, 2));
                userManager.setTimer('message', Date.now());
            }
        }
    }
});
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (commandExecutor && interaction.isCommand())
        commandExecutor.execute(interaction);
}));
client.login(require('../token.json').token);
exports.default = client;
