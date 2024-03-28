import { Client, CommandInteraction } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember } from "../../data";
import { baseCommand, commandData } from "../../commands";
export default class gem extends baseCommand {
    static command = {
        "name": "gem",
        "description": "Manage the gems of a user",
        "options": [
            {
                "type": 3,
                "name": "type",
                "description": "Give | Set | Remove",
                "choices": [
                    {
                        "name": "give",
                        "value": "give"
                    },
                    {
                        "name": "set",
                        "value": "set"
                    },
                    {
                        "name": "remove",
                        "value": "remove"
                    }
                ],
                "required": true
            },
            {
                "type": 6,
                "name": "user",
                "description": "User to be rewarded",
                "required": true
            },
            {
                "type": 4,
                "name": "amount",
                "description": "Amount of gems",
                "required": true
            }
        ]
    }
    client: Client;
    data: DataManager;
    memberManager: GuildMemberManager;
    user: GMember;
    serverManager: GuildManager;
    constructor(commandData: commandData) {
        super(commandData)
        this.client = commandData.moduleData.client;
        this.data = commandData.moduleData.data;
        this.memberManager = commandData.memberManager;
        this.user = commandData.user;
        this.serverManager = commandData.serverManager;
    }
    async execute(interaction: CommandInteraction) {
        let amount = interaction.options.get('amount')?.value
        let type = interaction.options.get('type')?.value
        let user = interaction.options.get('user')?.value
        let userManager = this.memberManager.getUserManager()
        if (typeof user == 'string') {
            userManager = new GuildMemberManager(this.serverManager.getMember(user)).getUserManager()
        } else {
            user = interaction.user.id
        }
        if (typeof type == 'string' && typeof amount == 'number') {
            switch (type) {
                case 'set': {
                    userManager.setGems(amount)
                    interaction.reply(`Set <@${user}>'s gems to ${amount}`)
                }
                    break;
                case 'remove': {
                    userManager.removeGems(amount)
                    interaction.reply(`Removing ${amount} gems from <@${user}>`)
                }
                    break;
                case 'give': {
                    userManager.addGems(amount)
                    interaction.reply(`Giving ${amount} gems to <@${user}>`)
                }
                    break;
                default:
                    interaction.reply('Type Error: Xp Command')
                    break;
            }
        } else {
            interaction.reply('Data Error: Xp Command')
        }
        return true
    }
}