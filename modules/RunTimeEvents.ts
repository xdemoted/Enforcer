import EventEmitter from 'events';
export class RunTimeEventsDebug extends EventEmitter {
  private hourlyInterval: NodeJS.Timeout;
  private dailyInterval: NodeJS.Timeout;
  private minuteInterval: NodeJS.Timeout;
  constructor() {
    super()

    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
    const timeUntilNextHour = nextHour.getTime() - now.getTime();

    this.hourlyInterval = setTimeout(() => {
      this.emit('hour',new Date().getHours())
      this.hourlyInterval = setInterval(() => {
        this.emit('hour',new Date().getHours())
      }, 60 * 60 * 1000); // emit event every hour
    }, timeUntilNextHour); // emit event at the next hour

    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();

    this.dailyInterval = setTimeout(() => {
      this.emit('daily')
      this.dailyInterval = setInterval(() => {
        this.emit('daily')
      }, 24 * 60 * 60 * 1000); // emit event every day
    }, timeUntilTomorrow); // emit event tomorrow at midnight
    this.minuteInterval = setInterval(() => {
      this.emit('5minute');
    }, 60 * 5000); // emit event every 5 minutes
  }
  public stop() {
    clearInterval(this.hourlyInterval);
    clearInterval(this.dailyInterval);
    clearInterval(this.minuteInterval);
  }
}
export class RunTimeEvents extends EventEmitter {
  private hourlyInterval: NodeJS.Timeout;
  constructor() {
    super()
    let time = 13
    this.hourlyInterval = setTimeout(() => {
      this.emit('hour',time % 24)
      this.hourlyInterval = setInterval(() => {
        time += 2
        this.emit('hour',time % 24)
      }, 10000);
    }, 30000);
  }
  public stop() {
    clearInterval(this.hourlyInterval);
  }
}
