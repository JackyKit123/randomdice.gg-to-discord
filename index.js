const Discord = require('discord.js');
const axios = require('axios');
const textVersion = require('textversionjs');

/**
 * @typedef DeckGuide
 * @type {object}
 * @property {number} id - an unique ID
 * @property {'PvP' | 'Co-op' | 'Crew'} type - The type of deck
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
        const response = await axios.get(
            'https://random-dice-web.firebaseio.com/decks_guide.json'
        );
        return response.data;
    } catch (err) {
        throw err;
    }
}

/**
 * @typedef ProcessedData
 * @type {object}
 * @property {string} title - the title of the deck guide
 * @property {'PvP' | 'Co-op' | 'Crew'} type - The type of deck
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
                        28: '<:z6Nuclear:756318468017487968>',
                        29: '<:z6Landmine:756318467921018931>',
                        30: '<:z6SandSwamp:756318467954835488>',
                        31: '<:z6Joker:756318467602514025>',
                        32: '<:z6HolySword:756318467941990450>',
                        33: '<:z6Hell:756318467786801332>',
                        34: '<:z6Shield:756318468072144926>',
                        35: '<:z6Blizzard:756318467350724638>',
                        36: '<:z6Growth:756318468055498822>',
                        37: '<:z6Summoner:756318468026138704>',
                        38: '<:z6Solar:756318468017619016>',
                        39: '<:z6Assassin:756318466855796837>',
                        40: '<:z6Atomic:756318467057123431>',
                        41: '<:z6Gun:756318467426091121>',
                        42: '<:z6Metastasis:756318467770023979>',
                        43: '<:z6Typhoon:756318468013555782>',
                        44: '<:z6Supplement:756318467967418398>',
                        45: '<:z6Time:756318467895853138>',
                        46: '<:z6Combo:756318467937927258>',
                        47: '<:z6Lunar:756318467946184804>',
                        48: '<:z6Flow:756318468139384952>',
                        49: '<:z6Star:756318468034527302>',
                        50: '<:z7Flame:751231756434276513>',
                        51: '<:z7Healing:756318467686137976>',
                        52: '<:z7Clone:756318467782869012>',
                        53: '<:z6Silence:756318467946446889>',
                        54: '<:z6ix10:756320150910926969>',
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
        return (processedData || (await processData())).map((data) => {
            const fields = [
                ...data.diceList.map((list, i) => ({
                    name: i === 0 ? 'Guide' : '⠀',
                    value: list.join(' '),
                })),
                ...data.paragraph
                    .filter((p) => p !== '')
                    .map((p, i) => ({
                        name: i === 0 ? 'Guide' : '⠀',
                        value: p,
                    })),
            ];
            return fields.length > 16
                ? [
                      new Discord.MessageEmbed()
                          .setTitle(`${data.title} (${data.type})`)
                          .setAuthor(
                              'Random Dice Community Website',
                              'https://randomdice.gg/title_dice.png',
                              'https://randomdice.gg/'
                          )
                          .setColor('#6ba4a5')
                          .setURL(
                              `https://randomdice.gg/decks/guide/${encodeURI(
                                  data.title
                              )}`
                          )
                          .addFields(fields.slice(0, 16)),
                      new Discord.MessageEmbed()
                          .setColor('#6ba4a5')
                          .addFields(fields.slice(16))
                          .setFooter(
                              'randomdice.gg Decks Guide',
                              'https://randomdice.gg/title_dice.png'
                          ),
                  ]
                : new Discord.MessageEmbed()
                      .setTitle(`${data.title} (${data.type})`)
                      .setAuthor(
                          'Random Dice Community Website',
                          'https://randomdice.gg/title_dice.png',
                          'https://randomdice.gg/'
                      )
                      .setColor('#6ba4a5')
                      .setURL(
                          `https://randomdice.gg/decks/guide/${encodeURI(
                              data.title
                          )}`
                      )
                      .addFields(fields)
                      .setFooter(
                          'randomdice.gg Decks Guide',
                          'https://randomdice.gg/title_dice.png'
                      );
        }).flat();
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
        }
        if (!WEBHOOK_TOKEN) {
            console.error('WEBHOOK_TOKEN missing');
        }
        const hook = new Discord.WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN);
        const rawData = await fetchData();
        const data = await processData(rawData);
        const embeds = await makeEmbeds(data);
        const send = async (i = 0) => {
            try {
                await hook.send(undefined, {
                    embeds: [embeds[i]],
                });
                if (i + 1 < embeds.length) {
                    setTimeout(() => send(i + 1), 1000);
                }
            } catch (err) {
                throw err;
            }
        };
        await send();
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    fullRun,
    dryRun,
    fetchData,
    processData,
    makeEmbeds,
};
