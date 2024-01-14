"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunTimeEventsDebug = exports.RunTimeEvents = void 0;
const events_1 = __importDefault(require("events"));
class RunTimeEvents extends events_1.default {
    constructor() {
        super();
        const now = new Date();
        const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
        const timeUntilNextHour = 10000; //nextHour.getTime() - now.getTime();
        this.hourlyInterval = setTimeout(() => {
            this.emit('hour', new Date().getHours());
            this.hourlyInterval = setInterval(() => {
                this.emit('hour', new Date().getHours());
            }, 3600000);
        }, timeUntilNextHour);
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
        this.dailyInterval = setTimeout(() => {
            this.emit('daily');
            this.dailyInterval = setInterval(() => {
                this.emit('daily');
            }, 86400000);
        }, timeUntilTomorrow);
        this.minuteInterval = setInterval(() => {
            this.emit('5minute');
        }, 300000); // emit event every 5 minutes
    }
    stop() {
        clearInterval(this.hourlyInterval);
        clearInterval(this.dailyInterval);
        clearInterval(this.minuteInterval);
    }
}
exports.RunTimeEvents = RunTimeEvents;
class RunTimeEventsDebug extends events_1.default {
    constructor() {
        super();
        let time = 13;
        this.hourlyInterval = setTimeout(() => {
            this.emit('hour', time % 24);
            this.hourlyInterval = setInterval(() => {
                time += 2;
                this.emit('hour', time % 24);
            }, 10000);
        }, 5000);
    }
    stop() {
        clearInterval(this.hourlyInterval);
    }
}
exports.RunTimeEventsDebug = RunTimeEventsDebug;
