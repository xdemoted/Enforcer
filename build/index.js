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
let { fork } = require('child_process');
let path = require('path');
let file = path.resolve('./build/main');
let { Partials, Client, EmbedBuilder } = require('discord.js');
const mainChannel = '1222952464786128987';
const client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
let channel;
let message;
client.on('ready', () => {
    channel = client.channels.cache.get(mainChannel);
    start();
});
let crashCount = 0;
function start() {
    let server = fork(file);
    if (message) {
        let embed = new EmbedBuilder()
            .setTitle('Bot Crash Detected')
            .setDescription('Automatic restart successful. (Check console for error)')
            .setColor('Green');
        message.edit({ embeds: [embed] });
        message = undefined;
    }
    server.on('message', function (data) {
        console.log(data.toString());
    });
    server.on('exit', (code, error) => __awaiter(this, void 0, void 0, function* () {
        console.log('Operator crashed with: ' + error);
        crashCount++;
        if (channel && channel.isTextBased()) {
            if (crashCount > 3) {
                let row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('restart').setLabel('Restart').setStyle(discord_js_1.ButtonStyle.Primary));
                let embed = new EmbedBuilder()
                    .setTitle('Bot Crash Detected')
                    .setDescription('Multiple crashes detected, critical error has occured. Please restart bot manually.')
                    .setColor('Grey');
                message = yield channel.send({ embeds: [embed], components: [row] });
                message.awaitMessageComponent({ filter: i => i.customId === 'restart' && i.user.id == '316243027423395841', time: 86400000 }).then((interaction) => {
                    interaction.deferUpdate();
                    start();
                });
            }
            else {
                let embed = new EmbedBuilder()
                    .setTitle('Bot Crash Detected')
                    .setDescription('An error has been sent to console, automatic restart will be attempted.')
                    .setColor('Grey');
                message = yield channel.send({ embeds: [embed] });
                setTimeout(() => { start(); }, 10000);
            }
        }
        setTimeout(() => { --crashCount; }, 600000);
    }));
}
client.login(require('../token.json').token);
