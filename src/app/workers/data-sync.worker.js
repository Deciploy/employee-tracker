/* eslint-disable @typescript-eslint/no-var-requires */
const Activity = require('./db/Activity');
const { parentPort } = require('worker_threads');

let token = null;

parentPort.on('message', (message) => {
  token = message.token;
});

setInterval(async () => {
  if (!token) {
    return;
  }

  console.log('Syncing Activities started');

  try {
    const activitiesToSync = (
      await Activity.findAll({
        attributes: ['id', 'name', 'title', 'startTime', 'endTime'],
      })
    ).map((a) => ({
      ...a.toJSON(),
      startTime: a.startTime.toString(),
      endTime: a.endTime.toString(),
    }));

    if (activitiesToSync.length === 0) {
      return;
    }

    fetch(`${process.env.API_URL}/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(activitiesToSync),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Activities Synced', data);
        if (data.status) {
          Activity.destroy({
            where: {
              id: activitiesToSync.map((a) => a.id),
            },
          });
        }
      })
      .catch((error) => {
        console.error('Network Error', error);
      });
  } catch (error) {
    await Activity.sync();
  }
}, process.env.INTERVAL);
