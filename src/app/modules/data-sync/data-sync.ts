import { AxiosInstance } from "axios";
import { Activity } from "../db";

interface DataSyncOptions {
    intervalTime?: number;
}

export class DataSync {
    private _intervalTime: number;

    constructor(private axios: AxiosInstance, { intervalTime }: DataSyncOptions = { intervalTime: 1000 }) {
        this._intervalTime = intervalTime;

        this.start();
    }

    private start() {
        this.sync();
        setInterval(() => {
            this.sync();
        }, this._intervalTime);
    }

    private async sync() {
        try {
            const activitiesToSync = await Activity.findAll({
                attributes: ['id', 'name', 'title', 'startTime', 'endTime'],
            });

            if (activitiesToSync.length === 0) {
                return;
            }
            const response = await this.axios.post('/activity', activitiesToSync.map((activity) => activity.toJSON()));


            if (response.status === 200) {
                await Activity.destroy({
                    where: {
                        id: activitiesToSync.map((activity) => activity.get('id')),
                    },
                });
            }

            console.log('data synced successfully');

        } catch (error) {
            console.error("Something went wrong:", error.message);
        }
    }
}