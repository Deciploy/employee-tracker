/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process');
const Activity = require('./db/Activity');

const COMMAND =
  'powershell -command "(Get-Process | Where-Object { $_.MainWindowTitle } | Select-Object Id, Name, MainWindowTitle, StartTime, Responding | ConvertTo-Json)"';

const INTERVAL_TIME = 1000 * 60; // 1 minute

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

function parseDate(str) {
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
    console.error('Invalid date string format');
  }
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

    const snapshot = JSON.parse(stdout).map((s) => ({
      ...s,
      StartTime: parseDate(s.StartTime),
    }));

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
          terminatedActivities.forEach((a) => {
            const index = runningActivity.findIndex((r) => r.Id === a.Id);
            runningActivity.splice(index, 1);
          });
        })
        .catch((err) => {
          console.error('DB error:', err);
        });
    }
  });
}, INTERVAL_TIME);
