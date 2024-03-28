import { CommandInteraction, PermissionsBitField } from "discord.js";
import { moduleData } from "../main";
import { GetFile, GuildManager, GuildMember, GuildMemberManager } from "./data";
import fs from 'fs'
type BaseCommandClass = (new (args: { moduleData: moduleData, serverManager: GuildManager, user: GuildMember, memberManager: GuildMemberManager }) => baseCommand) & {
    command: {
        name: string,
        description: string,
        options?: any[]
    }
};
export class baseCommand {
    static command: {
        name: string,
        description: string,
        options?: any[]
    }
    constructor(commandData: commandData) { }
    async execute(interaction: CommandInteraction) { return true }
}
export interface commandData {
    moduleData: moduleData,
    serverManager: GuildManager
    user: GuildMember
    memberManager: GuildMemberManager
}
export class CommandExecutor {
    commands: any[]
    private commandMap: Map<string, {command: BaseCommandClass, permission: number}>
    private moduleData: moduleData
    constructor(moduleData: moduleData) {
        this.moduleData = moduleData
        this.commands = []
        this.commandMap = new Map()
    }
    init() {
        let commandList = fs.readdirSync(GetFile.commandPath)
        for (let command of commandList) {
            if (!command.endsWith('.js')) continue
            let commandClass: BaseCommandClass = require(`${GetFile.commandPath}/${command}`).default
            this.commands.push(commandClass.command)
            this.commandMap.set(commandClass.command.name, {command: commandClass, permission: 0})
        }
        commandList = fs.readdirSync(GetFile.commandPath + "/moderator")
        for (let command of commandList) {
            if (!command.endsWith('.js')) continue
            let commandClass: BaseCommandClass = require(`${GetFile.commandPath}/moderator/${command}`).default
            this.commands.push(commandClass.command)
            this.commandMap.set(commandClass.command.name, {command: commandClass, permission: 1})
        }
        commandList = fs.readdirSync(GetFile.commandPath + "/host")
        for (let command of commandList) {
            if (!command.endsWith('.js')) continue
            let commandClass: BaseCommandClass = require(`${GetFile.commandPath}/host/${command}`).default
            this.commands.push(commandClass.command)
            this.commandMap.set(commandClass.command.name, {command: commandClass, permission: 2})
        }

    }
    async execute(interaction: CommandInteraction) {
        let data = this.commandMap.get(interaction.commandName)
        if (data) {
            if (interaction.guildId == null) return interaction.reply({ content: "Data Error: GuildID cannot be null.", ephemeral: true })
            let command = data.command
            let permission = data.permission
            if (permission > 0) {
                let userPerms = interaction.member?.permissions
                if (permission==1) {
                    if (!(userPerms instanceof PermissionsBitField)) return;
                    if (!userPerms.has('ManageGuild')) return interaction.reply({ content: "Moderator commands are not available to you", ephemeral: true })
                } else if (permission == 2) {
                    if (!this.moduleData.hosts.includes(interaction.user.id)) return interaction.reply({ content: "Host commands are not available to you", ephemeral: true })
                }
            }
            let serverManager = this.moduleData.data.getGuildManager(interaction.guildId)
            let memberManager = serverManager.getMemberManager(interaction.user.id)
            let commandData: commandData = {
                moduleData: this.moduleData,
                serverManager: serverManager,
                user: memberManager.member,
                memberManager: memberManager
            }
            await new command(commandData).execute(interaction)
        } else {
            await interaction.reply({ content: "Command not found", ephemeral: true })
        }
    }
}
//@ts-ignore
new CommandExecutor({ client: null, data: null }).init()