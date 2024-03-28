import { Client, CommandInteraction, TextChannel } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember } from "../../data";
import { baseCommand, commandData } from "../../commands";
import { ChannelInteractionCollector, Dialogue } from "../../utilities";
export default class punish extends baseCommand {
    static command = {
        "name": "punish",
        "description": "Punish a user",
        "options": [
            {
                "type": 1,
                "name": "warn",
                "description": "Warn a user",
                "options": [
                    {
                        "type": 6,
                        "name": "user",
                        "description": "Thou shall be smitten",
                        "required": true
                    },
                    {
                        "type": 3,
                        "name": "reason",
                        "description": "The reason for the ban",
                        "required": true,
                        "choices": [
                            {
                                "name": "Nickname",
                                "value": "No blank, inappropriate, or offensive nicknames are allowed"
                            },
                            {
                                "name": "Pingable Names",
                                "value": "All names must be pingable"
                            },
                            {
                                "name": "Politcal / Contraversial",
                                "value": "Political/Controversial conversations are strictly prohibited in our server"
                            },
                            {
                                "name": "Professional / Courteous",
                                "value": "Please try to act professional and courteous in our server"
                            },
                            {
                                "name": "Role Begging",
                                "value": "No Begging for roles"
                            },
                            {
                                "name": "Ghost | Random | Spam pings",
                                "value": "No ghost pings / Random Pings / Spam Pinging"
                            },
                            {
                                "name": "Spamming",
                                "value": "Spamming is not allowed"
                            },
                            {
                                "name": "Ministry",
                                "value": "No Insulting the Minsitry"
                            },
                            {
                                "name": "Link Appropiate",
                                "value": "Links are not allowed to lead to pages that include inappropriate content"
                            },
                            {
                                "name": "Appropiate Media",
                                "value": "All forms of media posted in our server must be appropriate"
                            },
                            {
                                "name": "invite-links",
                                "value": "Links can only include invites to Wolf-Co approved servers."
                            },
                            {
                                "name": "anti-ministry",
                                "value": "No Media is allowed to contain anti-Ministry content."
                            }
                        ]
                    }
                ]
            },
            {
                "type": 1,
                "name": "ban",
                "description": "Ban a user",
                "options": [
                    {
                        "type": 6,
                        "name": "user",
                        "description": "Thou shall be smitten",
                        "required": true
                    },
                    {
                        "type": 4,
                        "name": "messageremove",
                        "description": "How many days of messages should be removed",
                        "choices": [
                            {
                                "name": "1",
                                "value": 1
                            },
                            {
                                "name": "2",
                                "value": 2
                            },
                            {
                                "name": "3",
                                "value": 3
                            },
                            {
                                "name": "4",
                                "value": 4
                            },
                            {
                                "name": "5",
                                "value": 5
                            },
                            {
                                "name": "6",
                                "value": 6
                            },
                            {
                                "name": "7",
                                "value": 7
                            }
                        ],
                        "required": true
                    },
                    {
                        "type": 3,
                        "name": "reason",
                        "description": "The reason for the ban",
                        "required": true,
                        "choices": [
                            {
                                "name": "Nickname",
                                "value": "No blank, inappropriate, or offensive nicknames are allowed"
                            },
                            {
                                "name": "Pingable Names",
                                "value": "All names must be pingable"
                            },
                            {
                                "name": "Politcal / Contraversial",
                                "value": "Political/Controversial conversations are strictly prohibited in our server"
                            },
                            {
                                "name": "Professional / Courteous",
                                "value": "Please try to act professional and courteous in our server"
                            },
                            {
                                "name": "Role Begging",
                                "value": "No Begging for roles"
                            },
                            {
                                "name": "Ghost | Random | Spam pings",
                                "value": "No ghost pings / Random Pings / Spam Pinging"
                            },
                            {
                                "name": "Spamming",
                                "value": "Spamming is not allowed"
                            },
                            {
                                "name": "Ministry",
                                "value": "No Insulting the Minsitry"
                            },
                            {
                                "name": "Link Appropiate",
                                "value": "Links are not allowed to lead to pages that include inappropriate content"
                            },
                            {
                                "name": "Appropiate Media",
                                "value": "All forms of media posted in our server must be appropriate"
                            },
                            {
                                "name": "invite-links",
                                "value": "Links can only include invites to Wolf-Co approved servers."
                            },
                            {
                                "name": "anti-ministry",
                                "value": "No Media is allowed to contain anti-Ministry content."
                            }
                        ]
                    }
                ]
            },
            {
                "type": 1,
                "name": "timeout",
                "description": "Timeout a user",
                "options": [
                    {
                        "type": 6,
                        "name": "user",
                        "description": "Thou shall be smitten",
                        "required": true
                    },
                    {
                        "type": 10,
                        "name": "time",
                        "description": "Time in minutes",
                        "required": true
                    },
                    {
                        "type": 3,
                        "name": "reason",
                        "description": "The reason for the ban",
                        "required": true,
                        "choices": [
                            {
                                "name": "Nickname",
                                "value": "No blank, inappropriate, or offensive nicknames are allowed"
                            },
                            {
                                "name": "Pingable Names",
                                "value": "All names must be pingable"
                            },
                            {
                                "name": "Politcal / Contraversial",
                                "value": "Political/Controversial conversations are strictly prohibited in our server"
                            },
                            {
                                "name": "Professional / Courteous",
                                "value": "Please try to act professional and courteous in our server"
                            },
                            {
                                "name": "Role Begging",
                                "value": "No Begging for roles"
                            },
                            {
                                "name": "Ghost | Random | Spam pings",
                                "value": "No ghost pings / Random Pings / Spam Pinging"
                            },
                            {
                                "name": "Spamming",
                                "value": "Spamming is not allowed"
                            },
                            {
                                "name": "Ministry",
                                "value": "No Insulting the Minsitry"
                            },
                            {
                                "name": "Link Appropiate",
                                "value": "Links are not allowed to lead to pages that include inappropriate content"
                            },
                            {
                                "name": "Appropiate Media",
                                "value": "All forms of media posted in our server must be appropriate"
                            },
                            {
                                "name": "invite-links",
                                "value": "Links can only include invites to Wolf-Co approved servers."
                            },
                            {
                                "name": "anti-ministry",
                                "value": "No Media is allowed to contain anti-Ministry content."
                            }
                        ]
                    }
                ]
            },
            {
                "type": 1,
                "name": "kick",
                "description": "Kick a user",
                "options": [
                    {
                        "type": 6,
                        "name": "user",
                        "description": "Thou shall be smitten",
                        "required": true
                    },
                    {
                        "type": 3,
                        "name": "reason",
                        "description": "The reason for the ban",
                        "required": true,
                        "choices": [
                            {
                                "name": "Nickname",
                                "value": "No blank, inappropriate, or offensive nicknames are allowed"
                            },
                            {
                                "name": "Pingable Names",
                                "value": "All names must be pingable"
                            },
                            {
                                "name": "Politcal / Contraversial",
                                "value": "Political/Controversial conversations are strictly prohibited in our server"
                            },
                            {
                                "name": "Professional / Courteous",
                                "value": "Please try to act professional and courteous in our server"
                            },
                            {
                                "name": "Role Begging",
                                "value": "No Begging for roles"
                            },
                            {
                                "name": "Ghost | Random | Spam pings",
                                "value": "No ghost pings / Random Pings / Spam Pinging"
                            },
                            {
                                "name": "Spamming",
                                "value": "Spamming is not allowed"
                            },
                            {
                                "name": "Ministry",
                                "value": "No Insulting the Minsitry"
                            },
                            {
                                "name": "Link Appropiate",
                                "value": "Links are not allowed to lead to pages that include inappropriate content"
                            },
                            {
                                "name": "Appropiate Media",
                                "value": "All forms of media posted in our server must be appropriate"
                            },
                            {
                                "name": "invite-links",
                                "value": "Links can only include invites to Wolf-Co approved servers."
                            },
                            {
                                "name": "anti-ministry",
                                "value": "No Media is allowed to contain anti-Ministry content."
                            }
                        ]
                    }
                ]
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
        new ChannelInteractionCollector(interaction.channel as TextChannel, () => { return true })
        //console.log(interaction)
        let i = '1'
        let guildSettings = this.data.getGuild(interaction.guildId as string).settings
        let optionMenu = new Dialogue()
            .setDescription('Select the option you would like to modify.')
            .setTitle('Option Menu')
            .addSelectMenu()
            .addOption('Hourly Games Channel', 'hgc', () => { console.log('hgc') })
            .addOption('Daily Quizbowl Channel', 'dqb', () => { console.log('dqb') })
            .addOption('Log Channel', 'lc', () => { console.log('lc') })
            .addOption('Back', 'back', () => { console.log('back') })
        let mainMenu = new Dialogue()
            .setDescription('Use the selection menu below to select settings.')
            .setTitle('Setup Menu')
            .addDynamicField('Hourly Games Channel', () => { return guildSettings.mainChannel.toString() })
            .addDynamicField('Daily Quizbowl Channel', () => { return guildSettings.qbChannel.toString() })
            .addDynamicField('Log Channel', () => { return guildSettings.loggingChannel.toString() })
            .addSelectMenu()
            .addOption('Quizbowl Channel', 'qb', () => {
                optionMenu.setDescription('Select the appropiate channel.')
                    .setTitle('Quizbowl Channel')
                    .addSelectMenu()
            })
            .addOption('Back', 'back', () => { console.log('back') })
        let reply = await (await interaction.reply(mainMenu.parse())).fetch()
        mainMenu.startCollection(reply, 60000)
        return true
    }
}