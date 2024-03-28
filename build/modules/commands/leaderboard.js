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
const utilities_1 = require("../utilities");
const commands_1 = require("../commands");
class leaderboard extends commands_1.baseCommand {
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
            yield interaction.deferReply();
            let row = new discord_js_1.ActionRowBuilder()
                .addComponents([
                new discord_js_1.ButtonBuilder()
                    .setStyle(discord_js_1.ButtonStyle.Primary)
                    .setCustomId('gem')
                    .setLabel('Gems'),
                new discord_js_1.ButtonBuilder()
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setCustomId('gxp')
                    .setLabel('Global XP'),
                new discord_js_1.ButtonBuilder()
                    .setStyle(discord_js_1.ButtonStyle.Danger)
                    .setCustomId('cur')
                    .setLabel('Coins'),
                new discord_js_1.ButtonBuilder()
                    .setStyle(discord_js_1.ButtonStyle.Success)
                    .setCustomId('lxp')
                    .setLabel('Local XP')
            ]);
            let msg = yield interaction.editReply({ embeds: [new discord_js_1.EmbedBuilder().setTitle('Preview').setDescription('This is a preview').setColor('DarkButNotBlack')], components: [row] });
            let update = (id, int) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                let title = '';
                let sortData = () => { return 0; };
                let sorter = (a, b) => { return sortData(b) - sortData(a); };
                let list;
                switch (id) {
                    case 'gem':
                        title = 'Gems Leaderboard';
                        //@ts-ignore
                        sortData = (user) => { return (user.gems != undefined) ? user.gems : -1; };
                        list = this.data.getGlobalUsers();
                        break;
                    case 'gxp':
                        title = 'Global XP Leaderboard';
                        //@ts-ignore
                        sortData = (user) => { return (user.gems != undefined) ? user.xp : -1; };
                        list = this.data.getGlobalUsers();
                        break;
                    case 'lxp':
                        title = 'XP Leaderboard';
                        //@ts-ignore
                        sortData = (user) => { return (user.guildID != undefined) ? user.xp : -1; };
                        list = this.memberManager.guild.members;
                        break;
                    case 'cur': {
                        title = 'Coins Leaderboard';
                        //@ts-ignore
                        sortData = (user) => { return (user.guildID != undefined) ? user.balance.wallet + user.balance.bank : -1; };
                        list = this.memberManager.guild.members;
                        break;
                    }
                    default: {
                        return;
                    }
                }
                list.sort(sorter);
                let userList = [];
                for (let i = 0; i < 12; i++) {
                    let userData = list[i];
                    if (userData) {
                        let user;
                        try {
                            user = yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(userData.id));
                        }
                        catch (error) { }
                        try {
                            if (!user)
                                user = yield this.client.users.fetch(userData.id);
                        }
                        catch (error) { }
                        if (!user)
                            continue;
                        userList.push(user);
                        //let field: EmbedField = { name: numberedStringArraySingle((user instanceof GMember || user instanceof User) ? user.displayName : userData.id, i), value: sortData(userData).toString(), inline: true }
                        //users.push(field)
                    }
                }
                let attachment = new discord_js_1.AttachmentBuilder((yield (0, utilities_1.getLeaderCard)(userList, 1, this.data)).toBuffer('image/png'), { name: 'leaderboard.png' });
                interaction.editReply({ embeds: [new discord_js_1.EmbedBuilder().setTitle(title).setColor('DarkButNotBlack').setImage(`attachment://leaderboard.png`)], files: [attachment] });
            });
            update('lxp');
            msg.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.Button }).on('collect', (int) => __awaiter(this, void 0, void 0, function* () {
                update(int.customId, int);
            }));
            return false;
        });
    }
}
leaderboard.command = {
    name: "leaderboard",
    description: "View the top 10 users on the leaderboard",
};
exports.default = leaderboard;
