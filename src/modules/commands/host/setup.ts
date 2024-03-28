import { ActionRowBuilder, CacheType, ChannelType, Client, CommandInteraction, ComponentType, EmbedBuilder, InteractionCollector, SelectMenuComponentOptionData, SelectMenuInteraction, StageChannel, StringSelectMenuBuilder, StringSelectMenuInteraction, TextChannel } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember } from "../../data";
import { baseCommand, commandData } from "../../commands";
export default class setup extends baseCommand {
    static command = {
        "name": "setup",
        "description": "Setup a server's settings"
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
        let data = this.data
        if (!(interaction.channel instanceof StageChannel)) {
            function convertToCompliant(string: string) {
                const regex = /[^a-z0-9_-]/g;
                return string.replace(regex, '');
            }
            // Guild Channel Fetch
            await interaction.guild?.channels.fetch()
            let backOption = { label: 'Back', value: 'back' }
            let channels = interaction.guild?.channels.cache.filter(c => c.type == ChannelType.GuildText)
            let channelOptions: SelectMenuComponentOptionData[] = []
            channels?.forEach(c => {
                channelOptions.push({ label: convertToCompliant(c.name), value: c.id })
            })
            let threadChannels = interaction.guild?.channels.cache.filter(c => c.type == ChannelType.GuildForum)
            let threadChannelOptions: SelectMenuComponentOptionData[] = []
            threadChannels?.forEach(c => {
                threadChannelOptions.push({ label: convertToCompliant(c.name), value: c.id })
            })
            threadChannelOptions.push(backOption)
            channelOptions.push(backOption)
            // Guild Data Fetch
            let guild = this.data.getGuild(interaction.guildId as string)
            let embed = new EmbedBuilder()
                .setTitle('Server Setup Menu')
                .setDescription('Use the selection menu below to modify different parts of the server.')
                .addFields([
                    { name: 'Timed Games Channel', value: guild.settings.mainChannel.toString(), inline: false },
                    { name: 'Daily Quiz Bowl Channel', value: guild.settings.qbChannel.toString() },
                    { name: 'Logging Channel', value: guild.settings.loggingChannel.toString() },
                    { name: 'Mania Channel', value: guild.settings.maniaChannel.toString() },
                    { name: 'Game Thread Channel', value: guild.settings.gameThread.toString() }
                ])
            const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(new StringSelectMenuBuilder()
                    .addOptions([
                        {
                            label: 'Timed Games Channel',
                            value: 'tgchan'
                        },
                        {
                            label: 'Daily Quiz Bowl Channel',
                            value: 'dqbchan'
                        },
                        {
                            label: 'Logging Channel',
                            value: 'logchan'
                        },
                        {
                            label: 'Mania Channel',
                            value: 'manchan'
                        },
                        {
                            label: 'Mania Games',
                            value: 'mgchan'
                        },
                        {
                            label: 'Game Thread Channel',
                            value: 'gtchan'
                        }
                    ])
                    .setCustomId('setup')
                )
            const int = await interaction.reply({ embeds: [embed], components: [row] })
            const message = await interaction.fetchReply()
            let collect = interaction.channel?.createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => (c.user.id == interaction.user.id && c.customId == 'setup' && c.message.id == message.id) })
            function collector(collect: InteractionCollector<SelectMenuInteraction<CacheType>>) {
                collect?.on('collect', async int => {
                    collect.stop()
                    switch (int.values[0]) {
                        case 'tgchan': {
                            let embed2 = new EmbedBuilder()
                                .setTitle('Timed Games Channel Setup')
                                .setDescription('Select the channel you would like to set as the timed games channel. Select back to go back.')
                            let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                .addComponents(new StringSelectMenuBuilder()
                                    .addOptions(channelOptions)
                                    .setCustomId('channel')
                                )
                            await int.update({ embeds: [embed2], components: [row2] })
                            let collect = interaction.channel?.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                            collect?.on('collect', async channel => {
                                if (channel.values[0] !== 'back') {
                                    let guild = data.getGuild(interaction.guildId as string)
                                    guild.settings.mainChannel = channel.values[0]
                                }
                                let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                if (collect) {
                                    await channel.update({ embeds: [embed], components: [row] });
                                    collector(collect as InteractionCollector<StringSelectMenuInteraction<CacheType>>)
                                }
                            })
                        } break;
                        case 'dqbchan': {
                            let embed2 = new EmbedBuilder()
                                .setTitle('Quiz Bowl Setup')
                                .setDescription('Select the channel you would like to set as the quiz bowl channel. Select back to go back.')
                            let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                .addComponents(new StringSelectMenuBuilder()
                                    .addOptions(channelOptions)
                                    .setCustomId('channel')
                                )
                            await int.update({ embeds: [embed2], components: [row2] })
                            let collect = interaction.channel?.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                            collect?.on('collect', async channel => {
                                if (channel.values[0] !== 'back') {
                                    let guild = data.getGuild(interaction.guildId as string)
                                    guild.settings.qbChannel = channel.values[0]
                                }
                                let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                if (collect) {
                                    await channel.update({ embeds: [embed], components: [row] });
                                    collector(collect as InteractionCollector<StringSelectMenuInteraction<CacheType>>)
                                }
                            })
                        } break;
                        case 'logchan': {
                            let embed2 = new EmbedBuilder()
                                .setTitle('Log Channel Setup')
                                .setDescription('Select the channel you would like to set as the logging channel. Select back to go back.')
                            let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                .addComponents(new StringSelectMenuBuilder()
                                    .addOptions(channelOptions)
                                    .setCustomId('channel')
                                )
                            await int.update({ embeds: [embed2], components: [row2] })
                            let collect = interaction.channel?.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                            collect?.on('collect', async channel => {
                                if (channel.values[0] !== 'back') {
                                    let guild = data.getGuild(interaction.guildId as string)
                                    guild.settings.loggingChannel = channel.values[0]
                                }
                                let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                if (collect) {
                                    await channel.update({ embeds: [embed], components: [row] });
                                    collector(collect as InteractionCollector<StringSelectMenuInteraction<CacheType>>)
                                }
                            })
                        } break;
                        case 'manchan': {
                            let embed2 = new EmbedBuilder()
                                .setTitle('Mania Setup')
                                .setDescription('Select the channel you would like to set as the mania channel. Select back to go back.')
                            let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                .addComponents(new StringSelectMenuBuilder()
                                    .addOptions(channelOptions)
                                    .setCustomId('channel')
                                )
                            await int.update({ embeds: [embed2], components: [row2] })
                            let collect = interaction.channel?.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                            collect?.on('collect', async channel => {
                                if (channel.values[0] !== 'back') {
                                    let guild = data.getGuild(interaction.guildId as string)
                                    guild.settings.maniaChannel = channel.values[0]
                                }
                                let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                if (collect) {
                                    await channel.update({ embeds: [embed], components: [row] });
                                    collector(collect as InteractionCollector<StringSelectMenuInteraction<CacheType>>)
                                }
                            })
                        } break;
                        case 'gtchan': {
                            let embed2 = new EmbedBuilder()
                                .setTitle('Game Thread Setup')
                                .setDescription('Select the threads channel you would like to set as the main channel. Select back to go back.')
                            let row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
                                .addComponents(new StringSelectMenuBuilder()
                                    .addOptions(threadChannelOptions)
                                    .setCustomId('channel')
                                )
                            await int.update({ embeds: [embed2], components: [row2] })
                            let collect = interaction.channel?.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: ComponentType.StringSelect, idle: 120000, max: 1 })
                            collect?.on('collect', async channel => {
                                if (channel.values[0] !== 'back') {
                                    let guild = data.getGuild(interaction.guildId as string)
                                    guild.settings.gameThread = channel.values[0]
                                }
                                let collect = (interaction.channel as TextChannel).createMessageComponentCollector({ componentType: ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                if (collect) {
                                    await channel.update({ embeds: [embed], components: [row] });
                                    collector(collect as InteractionCollector<StringSelectMenuInteraction<CacheType>>)
                                }
                            })
                        } break;
                    }
                })
            }
            if (collect) {
                collector(collect)
            }
        }
        return true
    }
}