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
const data_1 = require("../data");
const commands_1 = require("../commands");
const utilities_1 = require("../utilities");
class daily extends commands_1.baseCommand {
    constructor(commandData) {
        super(commandData);
        this.client = commandData.moduleData.client;
        this.data = commandData.moduleData.data;
        this.memberManager = commandData.memberManager;
        this.user = commandData.user;
        this.serverManager = commandData.serverManager;
    }
    execute(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let manifest = data_1.GetFile.tradecardManifest();
            let catalogs = manifest.collections;
            let catalogOptions = catalogs.map(catalog => ({
                label: catalog.title,
                value: catalog.id.toString()
            }));
            let row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
                .setCustomId('catalog')
                .setPlaceholder('Select a catalog')
                .addOptions(catalogOptions));
            yield interaction.reply({ content: "Select a catalog", components: [row] });
            let message = yield interaction.fetchReply();
            let collector = (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, time: 60000, filter: m => m.message.id == message.id });
            collector === null || collector === void 0 ? void 0 : collector.on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                yield i.deferUpdate();
                console.log(catalogs.map(catalog => ({ id: catalog.id.toString() == i.values[0] })));
                console.log(i.values[0]);
                let catalog = catalogs.find(c => c.id.toString() == i.values[0]);
                if (catalog == undefined) {
                    i.update({ content: "Catalog not found." });
                    return;
                }
                let cardIDs = catalog.cards;
                let cards = [];
                for (let card of cardIDs) {
                    let c = manifest.cards.find(c => c.id == card);
                    if (c)
                        cards.push(c);
                }
                let cardOptions = cards.map(card => ({
                    label: card.title,
                    value: card.id.toString()
                }));
                let row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
                    .setCustomId('card')
                    .setPlaceholder('Select a card')
                    .addOptions(cardOptions));
                let catalogvas = yield (0, utilities_1.createCatalog)(catalog.cards, catalog.background);
                collector === null || collector === void 0 ? void 0 : collector.stop();
                if (catalogvas == undefined) {
                    row.components[0].setDisabled(true);
                    yield i.editReply({ content: "Catalog not found.", components: [row] });
                    return;
                }
                let attachment = new discord_js_1.AttachmentBuilder(catalogvas === null || catalogvas === void 0 ? void 0 : catalogvas.toBuffer(), { name: 'catalog.png' });
                yield interaction.editReply({ components: [row], files: [attachment], content: null });
                let cardCollector = (_b = i.channel) === null || _b === void 0 ? void 0 : _b.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, time: 60000, filter: m => m.message.id == message.id });
                cardCollector === null || cardCollector === void 0 ? void 0 : cardCollector.on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
                    yield i.deferReply({ ephemeral: true });
                    let card = cards.find(c => c.id.toString() == i.values[0]);
                    if (!card) {
                        yield i.editReply({ content: "Card not found." });
                        return;
                    }
                    let cardFrame = yield (0, utilities_1.addFrame)(data_1.GetFile.assets + `/images/tradecards/backgrounds/${card.background}`, card.rank, 1);
                    let attachment = new discord_js_1.AttachmentBuilder(cardFrame === null || cardFrame === void 0 ? void 0 : cardFrame.toBuffer(), { name: 'card.png' });
                    let embed = new discord_js_1.EmbedBuilder()
                        .setTitle(card.title)
                        .setImage('attachment://card.png')
                        .setDescription(card.description);
                    yield i.editReply({ embeds: [embed], files: [attachment] });
                    setTimeout(() => {
                        i.deleteReply();
                    }, 20000);
                }));
            }));
            return true;
        });
    }
}
daily.command = {
    "name": "catalog",
    "description": "Use this to find cards."
};
exports.default = daily;
