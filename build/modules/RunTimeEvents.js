"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunTimeEventsDebug = exports.RunTimeEvents = void 0;
const events_1 = __importDefault(require("events"));
class RunTimeEvents extends events_1.default {
    constructor(runInstantly) {
        super();
        setTimeout(() => {
            const now = new Date();
            const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
            const timeUntilNextHour = nextHour.getTime() - now.getTime();
            if (runInstantly) {
                this.emit('daily');
                this.emit('hour', new Date().getHours());
                this.emit('5minute');
            }
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
        }, 5000);
    }
    stop() {
        clearInterval(this.hourlyInterval);
        clearInterval(this.dailyInterval);
        clearInterval(this.minuteInterval);
    }
}
exports.RunTimeEvents = RunTimeEvents;
class RunTimeEventsDebug extends events_1.default {
    constructor(runInstantly) {
        console.log('A RunTime Debug Has Started');
        super();
        setTimeout(() => {
            if (runInstantly) {
                this.emit('hour', new Date().getHours());
                this.emit('5minute');
            }
            this.hourlyInterval = setTimeout(() => {
                this.emit('hour', new Date().getHours());
                this.hourlyInterval = setInterval(() => {
                    this.emit('hour', new Date().getHours());
                }, 5000);
            }, 10000);
            this.minuteInterval = setInterval(() => {
                this.emit('5minute');
            }, 300000); // emit event every 5 minutes
        }, 5000);
    }
    stop() {
        clearInterval(this.hourlyInterval);
        clearInterval(this.dailyInterval);
        clearInterval(this.minuteInterval);
    }
}
exports.RunTimeEventsDebug = RunTimeEventsDebug;
