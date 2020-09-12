# Fetch Decks Guide to Discord

Transform and/or post message from randomdice.gg to discord.

---
## Installation
```
git clone git@github.com:JackyKit123/randomdice.gg-to-discord.git
```

```
npm install
```

---

## Execute
```js
const rd2discord = require('./index.js');
rd2discord.fullRun(WEBHOOK_ID, WEBHOOK_TOKEN);
// post messages to discord with webhooks providing webhook id and token
```

## Dry Run
```js
const rd2discord = require('./index.js');
rd2discord.dryRun();
// log the data that will be sent with webhooks, no execution
```

---
### Other functions

#### Fetch Data
```js
const rd2discord = require('./index.js');
(async () => {
    console.log(await rd2discord.fetchData());
})

// returns raw data from database
```

#### Process Data
```js
const rd2discord = require('./index.js');
(async () => {
    console.log(await rd2discord.processData());
})
// returns process data to discord usable data
```

#### Make Embeds
```js
const rd2discord = require('./index.js');
(async () => {
    console.log(await rd2discord.makeEmbeds());
})
// returns arrays of created discord embeds
```