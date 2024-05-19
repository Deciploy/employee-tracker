import { app, BrowserWindow, ipcMain } from 'electron';
import { Activity, sequelize } from './app/modules/db';
import axios from 'axios';
import { DataSync } from './app/modules/data-sync';
import { CloudStorage } from './app/modules/storage/cloud-storage';
import { ForegroundTracker, ForegroundCapturer } from './app/modules/track';
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async (): Promise<void> => {
  // Automatically create all tables
  await sequelize.sync();
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    icon: __dirname + '/assets/images/icon.png',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegrationInWorker: true,
    },
  });

  // Hide the menu bar
  mainWindow.setMenuBarVisibility(false);

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Initialize the tracker and capturer
let uploadScreenshot: (url: string, capturedAt: string) => Promise<void>;

const tracker = new ForegroundTracker({
  intervalTime: parseInt(process.env.APP_TRACK_INTERVAL),
  onActivitiesEnd: (activities) => {
    Activity.bulkCreate(activities.map((activity) => ({
      pid: activity.pid,
      name: activity.name,
      title: activity.title,
      startTime: activity.startTime,
      endTime: activity.endTime,
    })));
  }
});

const storage = new CloudStorage({
  url: process.env.CLOUDINARY_URL,
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
});

const capturer = new ForegroundCapturer({
  storage,
  onCapture: (screenshot) => {
    if (uploadScreenshot) {
      uploadScreenshot(screenshot.url, screenshot.capturedAt).
        then(() => console.log(`Uploaded screenshot next capture in ${screenshot.timeToNextCapture / (60 * 1000)} min`))
        .catch(console.error);
    }
  }
});


ipcMain.on('track', async (event, args) => {
  if (args.command === 'start') {
    tracker.start();
    capturer.start();
  } else {
    tracker.stop();
    capturer.stop();
  }
});


ipcMain.on('token', async (event, args) => {
  if (!args.token) {
    return;
  }

  const axiosInstance = axios.create({
    baseURL: process.env.NX_APP_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${args.token}`,
    },
  })

  new DataSync(axiosInstance, { intervalTime: parseInt(process.env.APP_SYNC_INTERVAL) });

  uploadScreenshot = async (url, capturedAt) => {
    await axiosInstance.post('/screenshot', {
      url,
      capturedAt,
    });
  }
});