/* eslint-disable @typescript-eslint/no-var-requires */
const Activity = require('./db/Activity');
const { parentPort } = require('worker_threads');

let token = null;

parentPort.on('message', (message) => {
  token = message.token;
});

setInterval(() => {
  if (!token) {
    return;
  }

  const activitiesToSync = Activity.findAll();

  fetch(`${process.env.API_URL}/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(activitiesToSync),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        Activity.destroy({
          where: {
            id: data.activities.map((a) => a.id),
          },
        });
      }
    })
    .catch((error) => {
      console.error('Network Error', error);
    });
}, process.env.INTERVAL);
