const axios = require('axios');
const textVersion = require('textversionjs');

/**
 * @typedef DeckGuide
 * @type {object}
 * @property {number} id - an unique ID
 * @property {'PvP' | 'PvE' | 'Crew'} type - The type of deck
 * @property {string} title - the title of the deck guide
 * @property {number[][]} diceList - the 2-dimensional array for the lists of dice in dice ID
 * @property {string} guide - the paragraph of the guide in form of text/html
 */

/**
 * Fetch data from firebase and returns an Promise liked json object
 * @returns {Promise<DeckGuide[]>} Promise object represent the decks guide data
 */
async function fetchData() {
    try {
        const response = await axios.get('https://random-dice-web.firebaseio.com/decks_guide.json');
        return response.data;
    } catch (err) {
        throw err;
    }
}

/**
 * @typedef ProcessedData
 * @type {object}
 * @property {string} title - the title of the deck guide
 * @property {'PvP' | 'PvE' | 'Crew'} type - The type of deck
 * @property {string[][]} diceList - the 2-dimensional array for the lists of dice in discord emoji ID
 * @property {string} guide - the paragraph of the guide in human text/txt
 */

/**
 * Process the raw data fetched from database and return the processed data that can be used in discord
 * @param {DeckGuide[]} rawData The raw data from database
 * @param {Object.<number, string>} diceEmoji The emoji object with dice ID in relate to discord emoji ID
 * @returns {ProcessedData[]} An processed Data Object
 */
async function processData(rawData, diceEmoji) {
    try {
        return (rawData || (await fetchData())).map((guide) => {
            const title = guide.name;
            const type = guide.type;
            const diceList = guide.diceList.map((list) =>
                list.map((die) => {
                    diceEmoji = diceEmoji || {
                        '-1': '<:z5Dice:751231833232113684>',
                        0: '<:z9Fire:751231757155696660>',
                        1: '<:z9Electric:751231757281525790>',
                        2: '<:z9Wind:751231756887392318>',
                        3: '<:z9Poison:751231757210222632>',
                        4: '<:z9Ice:751231756811894808>',
                        5: '<:z9Iron:751231757164216350>',
                        6: '<:z9Broken:751231756820283454>',
                        7: '<:z9Gamble:751231756807700481>',
                        8: '<:z9Lock:751231757176537118>',
                        9: '<:z8Mine:751231756866420797>',
                        10: '<:z8Light:751231756992118815>',
                        11: '<:z8Thorn:751231757067485226>',
                        12: '<:z8Crack:751231756933398539>',
                        13: '<:z8Critical:751231757398835281>',
                        14: '<:z8Energy:751231757298303047>',
                        15: '<:z8Sacrifice:751231757315080252>',
                        16: '<:z8Arrow:751231757239713893>',
                        17: '<:z7Death:751231756870615060>',
                        18: '<:z7Teleport:751231757172473886>',
                        19: '<:z7Laser:751231756908101744>',
                        20: '<:z7Mimic:751231757130399818>',
                        21: '<:z7Infect:751231756606243013>',
                        22: '<:z7ModifiedElectric:751231757033930873>',
                        23: '<:z7Absorb:751231757055033495>',
                        24: '<:z7MightyWind:751231756958564422>',
                        25: '<:z7Switch:751231756824477737>',
                        26: '<:z7Gear:751231756866289745>',
                        27: '<:z7Wave:751231757084262521>',
                        28: '<:z6Nuclear:750954796659245108>',
                        29: '<:z6Landmine:750954796961366016>',
                        30: '<:z6SandSwamp:750954796936069182>',
                        31: '<:z6Joker:750954796898320454>',
                        32: '<:z6HolySword:750954796931874908>',
                        33: '<:z6Hell:750954796760170496>',
                        34: '<:z6Shield:750954796634210335>',
                        35: '<:z6Blizzard:750954796512706571>',
                        36: '<:z6Growth:750954796894388274>',
                        37: '<:z6Summoner:750954796831342623>',
                        38: '<:z6Solar:750954796852314123>',
                        39: '<:z6Assassin:750954795925504050>',
                        40: '<:z6Atomic:750954796986662943>',
                        41: '<:z6Gun:750954796789268490>',
                        42: '<:z6Metastasis:750954796659376180>',
                        43: '<:z6Typhoon:750954796701319200>',
                        44: '<:z6Supplement:750954796961235004>',
                        45: '<:z6Time:750954796735004712>',
                        46: '<:z6Combo:750954796860833872>',
                        47: '<:z6Lunar:750954796994789476>',
                        48: '<:z6Flow:750954796944719934>',
                        49: '<:z6Star:750954796655312908>',
                        50: '<:z7Flame:751231756434276513>',
                        51: '<:z51stAnniversary:751231757197770814>',
                    };
                    return diceEmoji[die];
                })
            );
            const paragraph = textVersion(guide.guide, {
                linkProcess: (href, linkText) => linkText,
            }).split('\n');
            return {
                title,
                type,
                diceList,
                paragraph,
            };
        });
    } catch (err) {
        throw err;
    }
}

/**
 * transform the processed into an array of
 * @param {ProcessedData[]} processedData An processed Data Object
 * @returns An Array of discord embed objects
 */
async function makeEmbeds(processedData) {
    try {
        return (processedData || (await processData())).map((data) => [
            {
                title: `${data.title} (${data.type})`,
                author: {
                    name: 'Random Dice Community Website',
                    url: 'https://randomdice.gg/',
                    icon_url: 'https://randomdice.gg/title_dice.png',
                },
                color: parseInt('#6ba4a5'.replace('#', ''), 16),
                url: `https://randomdice.gg/decks/guide/${encodeURI(
                    data.title
                )}`,
                fields: [
                    {
                        name: 'Dice List',
                        value: data.diceList
                            .map((list) => list.join(''))
                            .join('\n'),
                    },
                    ...data.paragraph
                        .filter((p) => p !== '')
                        .map((p, i) => ({
                            name: i === 0 ? 'Guide' : '⠀',
                            value: p,
                        })),
                ],
                footer: {
                    text: 'randomdice.gg Decks Guide',
                    icon_url: 'https://randomdice.gg/title_dice.png',
                },
            },
        ]);
    } catch (err) {
        throw err;
    }
}

/**
 * Execute a dry run without pushing actual data into discord, logging the embeds array.
 * @function dryRun
 */
async function dryRun() {
    try {
        const rawData = await fetchData();
        const data = await processData(rawData);
        const embeds = await makeEmbeds(data);
        console.log(embeds);
    } catch (err) {
        console.error(err.message);
        console.error(err.response.data);
    }
}

/**
 * Execute a full run and push messages to discord.
 * @param {string} WEBHOOK_ID
 * @param {string} WEBHOOK_TOKEN
 * @function fullRun
 */
async function fullRun(WEBHOOK_ID, WEBHOOK_TOKEN) {
    try {
        if (!WEBHOOK_ID) {
            console.error('WEBHOOK_ID missing');
            process.exit(1);
        }
        if (!WEBHOOK_TOKEN) {
            console.log('WEBHOOK_TOKEN missing');
            process.exit(1);
        }
        const rawData = await fetchData();
        const data = await processData(rawData);
        const embeds = await makeEmbeds(data);
        const send = async (i = 0) => {
            try {
                await axios.post(`https://discordapp.com/api/webhooks/${WEBHOOK_ID}/${WEBHOOK_TOKEN}`, {
                    embeds: embeds[i]
                });
                if (i + 1 < embeds.length) {
                    setTimeout(() => send(i + 1), 1000);
                }
            } catch (err) {
                throw err;
            }
        }
        await send();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = {
    fullRun,
    dryRun,
    fetchData,
    processData,
    makeEmbeds,
}
