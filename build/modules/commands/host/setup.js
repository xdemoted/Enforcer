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
const commands_1 = require("../../commands");
class setup extends commands_1.baseCommand {
    constructor(commandData) {
        super(commandData);
        this.client = commandData.moduleData.client;
        this.data = commandData.moduleData.data;
        this.memberManager = commandData.memberManager;
        this.user = commandData.user;
        this.serverManager = commandData.serverManager;
    }
    execute(interaction) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            let data = this.data;
            if (!(interaction.channel instanceof discord_js_1.StageChannel)) {
                function convertToCompliant(string) {
                    const regex = /[^a-z0-9_-]/g;
                    return string.replace(regex, '');
                }
                // Guild Channel Fetch
                yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.channels.fetch());
                let backOption = { label: 'Back', value: 'back' };
                let channels = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.channels.cache.filter(c => c.type == discord_js_1.ChannelType.GuildText);
                let channelOptions = [];
                channels === null || channels === void 0 ? void 0 : channels.forEach(c => {
                    channelOptions.push({ label: convertToCompliant(c.name), value: c.id });
                });
                let threadChannels = (_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.channels.cache.filter(c => c.type == discord_js_1.ChannelType.GuildForum);
                let threadChannelOptions = [];
                threadChannels === null || threadChannels === void 0 ? void 0 : threadChannels.forEach(c => {
                    threadChannelOptions.push({ label: convertToCompliant(c.name), value: c.id });
                });
                threadChannelOptions.push(backOption);
                channelOptions.push(backOption);
                // Guild Data Fetch
                let guild = this.data.getGuild(interaction.guildId);
                let embed = new discord_js_1.EmbedBuilder()
                    .setTitle('Server Setup Menu')
                    .setDescription('Use the selection menu below to modify different parts of the server.')
                    .addFields([
                    { name: 'Timed Games Channel', value: guild.settings.mainChannel.toString(), inline: false },
                    { name: 'Daily Quiz Bowl Channel', value: guild.settings.qbChannel.toString() },
                    { name: 'Logging Channel', value: guild.settings.loggingChannel.toString() },
                    { name: 'Mania Channel', value: guild.settings.maniaChannel.toString() },
                    { name: 'Game Thread Channel', value: guild.settings.gameThread.toString() }
                ]);
                const row = new discord_js_1.ActionRowBuilder()
                    .addComponents(new discord_js_1.StringSelectMenuBuilder()
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
                    .setCustomId('setup'));
                const int = yield interaction.reply({ embeds: [embed], components: [row] });
                const message = yield interaction.fetchReply();
                let collect = (_d = interaction.channel) === null || _d === void 0 ? void 0 : _d.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => (c.user.id == interaction.user.id && c.customId == 'setup' && c.message.id == message.id) });
                function collector(collect) {
                    collect === null || collect === void 0 ? void 0 : collect.on('collect', (int) => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b, _c, _d, _e;
                        collect.stop();
                        switch (int.values[0]) {
                            case 'tgchan':
                                {
                                    let embed2 = new discord_js_1.EmbedBuilder()
                                        .setTitle('Timed Games Channel Setup')
                                        .setDescription('Select the channel you would like to set as the timed games channel. Select back to go back.');
                                    let row2 = new discord_js_1.ActionRowBuilder()
                                        .addComponents(new discord_js_1.StringSelectMenuBuilder()
                                        .addOptions(channelOptions)
                                        .setCustomId('channel'));
                                    yield int.update({ embeds: [embed2], components: [row2] });
                                    let collect = (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1 });
                                    collect === null || collect === void 0 ? void 0 : collect.on('collect', (channel) => __awaiter(this, void 0, void 0, function* () {
                                        if (channel.values[0] !== 'back') {
                                            let guild = data.getGuild(interaction.guildId);
                                            guild.settings.mainChannel = channel.values[0];
                                        }
                                        let collect = interaction.channel.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                        if (collect) {
                                            yield channel.update({ embeds: [embed], components: [row] });
                                            collector(collect);
                                        }
                                    }));
                                }
                                break;
                            case 'dqbchan':
                                {
                                    let embed2 = new discord_js_1.EmbedBuilder()
                                        .setTitle('Quiz Bowl Setup')
                                        .setDescription('Select the channel you would like to set as the quiz bowl channel. Select back to go back.');
                                    let row2 = new discord_js_1.ActionRowBuilder()
                                        .addComponents(new discord_js_1.StringSelectMenuBuilder()
                                        .addOptions(channelOptions)
                                        .setCustomId('channel'));
                                    yield int.update({ embeds: [embed2], components: [row2] });
                                    let collect = (_b = interaction.channel) === null || _b === void 0 ? void 0 : _b.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1 });
                                    collect === null || collect === void 0 ? void 0 : collect.on('collect', (channel) => __awaiter(this, void 0, void 0, function* () {
                                        if (channel.values[0] !== 'back') {
                                            let guild = data.getGuild(interaction.guildId);
                                            guild.settings.qbChannel = channel.values[0];
                                        }
                                        let collect = interaction.channel.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                        if (collect) {
                                            yield channel.update({ embeds: [embed], components: [row] });
                                            collector(collect);
                                        }
                                    }));
                                }
                                break;
                            case 'logchan':
                                {
                                    let embed2 = new discord_js_1.EmbedBuilder()
                                        .setTitle('Log Channel Setup')
                                        .setDescription('Select the channel you would like to set as the logging channel. Select back to go back.');
                                    let row2 = new discord_js_1.ActionRowBuilder()
                                        .addComponents(new discord_js_1.StringSelectMenuBuilder()
                                        .addOptions(channelOptions)
                                        .setCustomId('channel'));
                                    yield int.update({ embeds: [embed2], components: [row2] });
                                    let collect = (_c = interaction.channel) === null || _c === void 0 ? void 0 : _c.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1 });
                                    collect === null || collect === void 0 ? void 0 : collect.on('collect', (channel) => __awaiter(this, void 0, void 0, function* () {
                                        if (channel.values[0] !== 'back') {
                                            let guild = data.getGuild(interaction.guildId);
                                            guild.settings.loggingChannel = channel.values[0];
                                        }
                                        let collect = interaction.channel.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                        if (collect) {
                                            yield channel.update({ embeds: [embed], components: [row] });
                                            collector(collect);
                                        }
                                    }));
                                }
                                break;
                            case 'manchan':
                                {
                                    let embed2 = new discord_js_1.EmbedBuilder()
                                        .setTitle('Mania Setup')
                                        .setDescription('Select the channel you would like to set as the mania channel. Select back to go back.');
                                    let row2 = new discord_js_1.ActionRowBuilder()
                                        .addComponents(new discord_js_1.StringSelectMenuBuilder()
                                        .addOptions(channelOptions)
                                        .setCustomId('channel'));
                                    yield int.update({ embeds: [embed2], components: [row2] });
                                    let collect = (_d = interaction.channel) === null || _d === void 0 ? void 0 : _d.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1 });
                                    collect === null || collect === void 0 ? void 0 : collect.on('collect', (channel) => __awaiter(this, void 0, void 0, function* () {
                                        if (channel.values[0] !== 'back') {
                                            let guild = data.getGuild(interaction.guildId);
                                            guild.settings.maniaChannel = channel.values[0];
                                        }
                                        let collect = interaction.channel.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                        if (collect) {
                                            yield channel.update({ embeds: [embed], components: [row] });
                                            collector(collect);
                                        }
                                    }));
                                }
                                break;
                            case 'gtchan':
                                {
                                    let embed2 = new discord_js_1.EmbedBuilder()
                                        .setTitle('Game Thread Setup')
                                        .setDescription('Select the threads channel you would like to set as the main channel. Select back to go back.');
                                    let row2 = new discord_js_1.ActionRowBuilder()
                                        .addComponents(new discord_js_1.StringSelectMenuBuilder()
                                        .addOptions(threadChannelOptions)
                                        .setCustomId('channel'));
                                    yield int.update({ embeds: [embed2], components: [row2] });
                                    let collect = (_e = interaction.channel) === null || _e === void 0 ? void 0 : _e.createMessageComponentCollector({ filter: t => t.customId == 'channel' && t.user.id == interaction.user.id, componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1 });
                                    collect === null || collect === void 0 ? void 0 : collect.on('collect', (channel) => __awaiter(this, void 0, void 0, function* () {
                                        if (channel.values[0] !== 'back') {
                                            let guild = data.getGuild(interaction.guildId);
                                            guild.settings.gameThread = channel.values[0];
                                        }
                                        let collect = interaction.channel.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, idle: 120000, max: 1, filter: c => c.user.id == interaction.user.id && c.customId == 'setup' });
                                        if (collect) {
                                            yield channel.update({ embeds: [embed], components: [row] });
                                            collector(collect);
                                        }
                                    }));
                                }
                                break;
                        }
                    }));
                }
                if (collect) {
                    collector(collect);
                }
            }
            return true;
        });
    }
}
setup.command = {
    "name": "setup",
    "description": "Setup a server's settings"
};
exports.default = setup;
