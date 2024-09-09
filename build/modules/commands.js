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
exports.CommandExecutor = exports.baseCommand = void 0;
const discord_js_1 = require("discord.js");
const data_1 = require("./data");
const fs_1 = __importDefault(require("fs"));
class baseCommand {
    constructor(commandData) { }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () { return true; });
    }
}
exports.baseCommand = baseCommand;
class CommandExecutor {
    constructor(moduleData) {
        this.moduleData = moduleData;
        this.commands = [];
        this.commandMap = new Map();
    }
    init() {
        let commandList = fs_1.default.readdirSync(data_1.GetFile.commandPath);
        for (let command of commandList) {
            if (!command.endsWith('.js'))
                continue;
            let commandClass = require(`${data_1.GetFile.commandPath}/${command}`).default;
            this.commands.push(commandClass.command);
            this.commandMap.set(commandClass.command.name, { command: commandClass, permission: 0 });
        }
        commandList = fs_1.default.readdirSync(data_1.GetFile.commandPath + "/moderator");
        for (let command of commandList) {
            if (!command.endsWith('.js'))
                continue;
            let commandClass = require(`${data_1.GetFile.commandPath}/moderator/${command}`).default;
            this.commands.push(commandClass.command);
            this.commandMap.set(commandClass.command.name, { command: commandClass, permission: 1 });
        }
        commandList = fs_1.default.readdirSync(data_1.GetFile.commandPath + "/host");
        for (let command of commandList) {
            if (!command.endsWith('.js'))
                continue;
            let commandClass = require(`${data_1.GetFile.commandPath}/host/${command}`).default;
            this.commands.push(commandClass.command);
            this.commandMap.set(commandClass.command.name, { command: commandClass, permission: 2 });
        }
    }
    execute(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let data = this.commandMap.get(interaction.commandName);
            if (data) {
                if (interaction.guildId == null)
                    return interaction.reply({ content: "Data Error: GuildID cannot be null.", ephemeral: true });
                let command = data.command;
                let permission = data.permission;
                if (permission > 0) {
                    let userPerms = (_a = interaction.member) === null || _a === void 0 ? void 0 : _a.permissions;
                    if (permission == 1) {
                        if (!(userPerms instanceof discord_js_1.PermissionsBitField))
                            return;
                        if (!userPerms.has('ManageGuild'))
                            return interaction.reply({ content: "Moderator commands are not available to you", ephemeral: true });
                    }
                    else if (permission == 2) {
                        if (!this.moduleData.hosts.includes(interaction.user.id))
                            return interaction.reply({ content: "Host commands are not available to you", ephemeral: true });
                    }
                }
                let serverManager = this.moduleData.data.getGuildManager(interaction.guildId);
                let memberManager = serverManager.getMemberManager(interaction.user.id);
                let commandData = {
                    moduleData: this.moduleData,
                    serverManager: serverManager,
                    user: memberManager.member,
                    memberManager: memberManager
                };
                yield new command(commandData).execute(interaction);
            }
            else {
                yield interaction.reply({ content: "Command not found", ephemeral: true });
            }
        });
    }
}
exports.CommandExecutor = CommandExecutor;
//@ts-ignore
new CommandExecutor({ client: null, data: null }).init();
