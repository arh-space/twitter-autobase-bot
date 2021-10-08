require('dotenv').config();

const express = require('express');
const cors = require('cors');
const CronJob = require('cron').CronJob;

const { TwitterBot } = require('./twitter-bot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const bot = new TwitterBot({
    consumer_key: 'uDrDG2SK8erM7uj0X9qfiKDTm',
    consumer_secret: 'EI21hKLXT3aDYfKlE6ICvwxrvD5Hf1td9bOXn87BH4DRvy6tLc',
    access_token: '1446167755703525387-o7nJgxOiFYJCFlGFeuUyw3Lsztgcnb',
    access_token_secret: 'IgFepoQrjde4L8usl9MzTgqayTJ2d68e49o0B8CYebDOK',
    triggerWord: '!NE'
});

const job = new CronJob(
    '0 */3 * * * *',
    doJob,
    onComplete,
    true
);

async function doJob() {
    console.log(`execute @ ${new Date().toTimeString()}`);
    let tempMessage = {};
    try {
        const authenticatedUserId = await bot.getAdminUserInfo();
        const message = await bot.getDirectMessage(authenticatedUserId);
        if (message.id) {
            tempMessage = message;
            const { data } = await bot.tweetMessage(message);
            const response = await bot.deleteMessage(message);
            console.log(`... DM has been successfuly reposted with id: ${data.id} @ ${data.created_at}`);
            console.log('------------------------------------');
        } else {
            console.log('no tweet to post');
            console.log('------------------------------------');
        };
    } catch (error) {
        console.log(error, 'ERROR.');
        console.log('------------------------------------');
        if (tempMessage.id) {
            await bot.deleteMessage(tempMessage);
        };
    };
};

async function onComplete() {
    console.log('my job is done!');
};

app.get('/', (req, res, next) => {
    res.send('Welcome to twitter bot server!');
});

app.get('/trigger', async (req, res, next) => {
    job.fireOnTick();
    res.send('job triggered!');
});

app.listen(PORT, () => console.log(`Server is listening to port ${PORT}`));
