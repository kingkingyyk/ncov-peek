export class Utils {

    static parseTimestamp(s: string): Date {
        let split = s.split(' ');
        let date = split[0].split('/');
        let time = split[1].split(':');
        let ampm = null;
        if (split.length > 2) ampm = split[2];
        let month = parseInt(date[0]) - 1;
        let day = parseInt(date[1]);
        let year = parseInt(date[2]);
        if (year < 2000) year += 2000;

        let hour = parseInt(time[0]);
        let min = parseInt(time[1]);
        if (ampm === "PM") hour += 12;

        return new Date(Date.UTC(year, month, day, hour, min, 0, 0));
    }

    static parseDate(s: string): Date {
        let date = s.split('/');
        let month = parseInt(date[0]) - 1;
        let day = parseInt(date[1]);
        let year = parseInt(date[2]);
        if (year < 2000) year += 2000;
        return new Date(year, month, day, 0, 0, 0, 0);
    }


    static parseCSV(str: string): [][] {
        let data = [];
        for (let line of str.split('\n')) if (line.length > 0) {
            let openQuote = false;
            let currStr = '';
            let lineData = [];
            line = line + ',';
            for (let char of line.split('')) {
                if (char === '"') openQuote = !openQuote;
                if (char === ',' && !openQuote) {
                    lineData.push(currStr);
                    currStr = '';
                } else if (char != '"') {
                    currStr = currStr + char;
                }
            }
            data.push(lineData);
        }
        return data;
    }
}

export class Country {
    timeSeriesMap: object;
    timeSeries: TimeSeriesData[];
    timeSeriesChartData: object[];
    locations: string[];

    constructor(public name: string) {
        this.clearData();
    }

    addLocation(loc: string) { if (this.locations.indexOf(loc) < 0 && loc.length > 0 && loc !== this.name) this.locations.push(loc); }
    addConfirmedCount(timestamp: Date, num: number): void { this.getTimeSeriesDataObject(timestamp.toString()).addConfirmedCount(num); }
    addDeathCount(timestamp: Date, num: number): void { this.getTimeSeriesDataObject(timestamp.toString()).addDeathCount(num); }
    addRecoveredCount(timestamp: Date, num: number): void { this.getTimeSeriesDataObject(timestamp.toString()).addRecoveredCount(num); }

    getTimeSeriesDataObject(timestamp: string): TimeSeriesData {
        let dat = null;
        if (timestamp in this.timeSeriesMap) dat = this.timeSeriesMap[timestamp];
        else {
            dat = new TimeSeriesData(new Date(timestamp));
            this.timeSeriesMap[timestamp] = dat;
        }
        return dat;
    }

    clearData(): void {
        this.timeSeriesMap = {};
        this.timeSeries = [];
        this.locations = [];
    }

    syncData() {
        let keys = Object.keys(this.timeSeriesMap);
        keys.sort((a, b) => Date.parse(a) - Date.parse(b));
        this.timeSeries = []
        for (let key of keys) this.timeSeries.push(this.timeSeriesMap[key]);
        for (let i = 1; i < this.timeSeries.length; i++) {
            let data = this.timeSeries[i]
            if (data.confirmedCount == 0) data.confirmedCount = this.timeSeries[i - 1].confirmedCount;
            if (data.deathCount == 0) data.deathCount = this.timeSeries[i - 1].deathCount;
            if (data.recoveredCount == 0) data.recoveredCount = this.timeSeries[i - 1].recoveredCount;
        }

        this.timeSeriesChartData = [];
        for (let i = 0; i < this.timeSeries.length; i++) {
            let ts = this.timeSeries[i];
            this.timeSeriesChartData.push([ts.timestamp, ts.confirmedCount, ts.deathCount, ts.recoveredCount]);
        }
    }

    toTimeSeries(): object[] {
        return this.timeSeriesChartData;
    }

    latestData() {
        return this.timeSeries[this.timeSeries.length - 1];
    }

    firstConfirmedDate() : Date {
        for (let ts of this.timeSeries) if (ts.confirmedCount > 0) return ts.timestamp;
    }
}

export class TimeSeriesData {
    confirmedCount = 0;
    deathCount = 0;
    recoveredCount = 0;

    constructor(public timestamp: Date) { }

    addConfirmedCount(num: number): void { this.confirmedCount += num; }
    addDeathCount(num: number): void { this.deathCount += num; }
    addRecoveredCount(num: number): void { this.recoveredCount += num; }

    get deathRate(): string {
        return ((this.deathCount * 100) / this.confirmedCount).toFixed(1);
    }

    get recoveryRate(): string {
        return ((this.recoveredCount * 100) / this.confirmedCount).toFixed(1);
    }
}