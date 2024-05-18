import { desktopCapturer, screen } from 'electron';
import { CloudStorage } from '../storage/cloud-storage';

interface Screenshot {
    capturedAt: string;
    url: string;
    timeToNextCapture?: number;
}

interface ForegroundCapturerOptions {
    onCapture?: (captured: Screenshot) => void;
    storage?: CloudStorage;
}

export class ForegroundCapturer {
    private _onCaptureCallback: (captured: Screenshot) => void;
    private _storage: CloudStorage;
    private _interval: NodeJS.Timeout;


    constructor({ onCapture, storage }: ForegroundCapturerOptions = {
    }) {
        this._onCaptureCallback = onCapture;
        this._storage = storage;
    }

    public start() {
        this.takeScreenshotAfter(1000);
    }

    public stop() {
        clearTimeout(this._interval);
    }

    private takeScreenshotAfter(time: number) {
        this._interval = setTimeout(async () => {
            const screenshot = await this.takeScreenshot();
            const timeToNextCapture = this.generateRandomInterval();
            this._onCaptureCallback({ ...screenshot, timeToNextCapture });
            this.takeScreenshotAfter(timeToNextCapture);
        }, time);
    }

    private async takeScreenshot(): Promise<Screenshot> {
        const electronScreen = screen.getPrimaryDisplay();
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: electronScreen.size,
        });

        const capturedAt = new Date().toString();
        const screenshot = sources[0];
        const image = screenshot.thumbnail.toDataURL();
        const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const blob = new Blob([imageBuffer], { type: 'image/png' });

        try {
            const url = await this._storage.upload(blob);
            return {
                capturedAt,
                url
            };
        } catch (error) {
            console.error('Failed to save screenshot', error);
        }
    }

    private generateRandomInterval() {
        return (Math.floor(Math.random() * 10) + 1) * 60 * 1000;
    }
}