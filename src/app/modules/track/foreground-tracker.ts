import { exec } from 'child_process';

export interface RunningForegroundActivity {
    pid: number;
    name: string;
    title: string;
    startTime: string;
}

export interface TerminatedForegroundActivity extends RunningForegroundActivity {
    endTime: string;
}

interface ForegroundTrackerOptions {
    onActivitiesStart?: (activities: Array<RunningForegroundActivity>) => void;
    onActivitiesEnd?: (activities: Array<TerminatedForegroundActivity>) => void;
    intervalTime?: number;
}

export class ForegroundTracker {
    private _runningActivity: Array<RunningForegroundActivity> = [];
    private _onActivitiesStartCallback: (activities: Array<RunningForegroundActivity>) => void;
    private _onActivitiesEndCallback: (activities: Array<RunningForegroundActivity>) => void;
    private _interval: NodeJS.Timeout;
    private _intervalTime: number;

    constructor({ onActivitiesStart, onActivitiesEnd, intervalTime }: ForegroundTrackerOptions = {
        intervalTime: 1000,
    }) {
        this._intervalTime = intervalTime;
        this._onActivitiesStartCallback = onActivitiesStart;
        this._onActivitiesEndCallback = onActivitiesEnd;
    }

    private async getRunningActivities(): Promise<Array<RunningForegroundActivity>> {
        const cmd =
            'powershell -command "(Get-Process | Where-Object { $_.MainWindowTitle } | Select-Object Id, Name, MainWindowTitle, StartTime, Responding | ConvertTo-Json)"';
        return await new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else if (stderr) {
                    reject(stderr);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const snapshot = JSON.parse(stdout).map((activity: any) => ({
                        pid: activity.Id,
                        name: activity.Name,
                        title: activity.MainWindowTitle,
                        startTime: this.parseDate(activity.StartTime).toString(),
                    } as RunningForegroundActivity));
                    resolve(snapshot);
                }
            });
        });
    }

    private getTerminatedActivities(snapshot: Array<RunningForegroundActivity>): Array<TerminatedForegroundActivity> {
        return this._runningActivity
            .filter((activity) => !snapshot.some((snapshotActivity) => snapshotActivity.pid === activity.pid))
            .map((activity) => ({ ...activity, endTime: new Date().toString() } as TerminatedForegroundActivity))
    }

    private getNewActivities(snapshot: Array<RunningForegroundActivity>): Array<RunningForegroundActivity> {
        return snapshot.filter((snapshotActivity) => !this._runningActivity.some((activity) => activity.pid === snapshotActivity.pid));
    }

    private parseDate(str: string): Date {
        // Extract the timestamp from the string using a regular expression
        const match = str.match(/\/Date\((\d+)\)\//);

        // Check if a match is found
        if (match) {
            // Extract the timestamp from the matched groups
            const timestamp = parseInt(match[1], 10);

            // Create a Date object using the timestamp
            const date = new Date(timestamp);

            return date;
        } else {
            throw new Error('Invalid date string');
        }
    }

    public start(): void {
        this._interval = setInterval(async () => {
            const snapshot = await this.getRunningActivities();
            const newActivities = this.getNewActivities(snapshot);
            const terminatedActivities = this.getTerminatedActivities(snapshot);

            this._runningActivity = snapshot;

            if (newActivities.length && this._onActivitiesStartCallback) {
                this._onActivitiesStartCallback(newActivities);
            }

            if (terminatedActivities.length && this._onActivitiesEndCallback) {
                this._onActivitiesEndCallback(terminatedActivities);
            }

        }, this._intervalTime);
    }

    public stop(): void {
        if (!this._interval) return;

        clearInterval(this._interval);
    }
}