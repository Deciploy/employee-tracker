/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process');
const Activity = require('./db/Activity');

const COMMAND =
  'powershell -command "(Get-Process | Where-Object { $_.MainWindowTitle } | Select-Object Id, Name, MainWindowTitle, StartTime, Responding | ConvertTo-Json)"';

const runningActivity = [];

function getTerminatedActivities(snapshot) {
  return runningActivity.filter(
    (a) => snapshot.findIndex((s) => s.Id === a.Id) === -1,
  );
}

function getNewActivities(snapshot) {
  return snapshot.filter(
    (s) => runningActivity.findIndex((a) => a.Id === s.Id) === -1,
  );
}

setInterval(() => {
  exec(COMMAND, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`PowerShell Error: ${stderr}`);
      return;
    }

    const snapshot = JSON.parse(stdout);

    const terminatedActivities = getTerminatedActivities(snapshot);
    const newActivities = getNewActivities(snapshot);

    if (newActivities.length > 0) {
      runningActivity.push(...newActivities);
    }

    if (terminatedActivities.length > 0) {
      const activitiesToSave = terminatedActivities.map((a) => ({
        pid: a.Id,
        name: a.Name,
        title: a.MainWindowTitle,
        startTime: a.StartTime,
        endTime: new Date(),
      }));

      Activity.bulkCreate(activitiesToSave)
        .then(() => {
          runningActivity.splice(
            runningActivity.findIndex((a) => a.Id === a.Id),
            1,
          );
        })
        .catch((err) => {
          console.error('DB error:', err);
        });
    }
  });
}, 5000);
