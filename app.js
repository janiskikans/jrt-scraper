const { parseHTML } = require('linkedom');
const { sendMessage } = require('./src/discordSender')
const {EmbedBuilder, codeBlock} = require("discord.js");

const TARGET_URL = 'https://www.jrt.lv/en/calendar/';

const fetchPageContent = async () => {
    const response =  await fetch(TARGET_URL);

    return await response.text();
}

const getPlays = async () => {
    const { document } = parseHTML(await fetchPageContent());

    const repertoiresList = document.querySelector('.repertoires-list-v2');
    const playsElems = repertoiresList.querySelectorAll('.row-wrapper')

    const plays = [];

    playsElems.forEach((playEl) => {
        // Date info
        const day = Number(playEl.querySelector('.day').textContent);
        const month = playEl.querySelector('.day_full').textContent;
        const time = playEl.querySelector('.laiks').textContent.trim();

        // Play info
        const title = playEl.querySelector('.url > .title').textContent;
        const location = playEl.querySelector('.url > .address').textContent;

        // Ticket info
        const buyBlock = playEl.querySelector('div.pirkt');
        const priceEl = buyBlock ? buyBlock.querySelector('.cena') : null;
        const soldOutTextEl = buyBlock ? buyBlock.querySelector('.izpardots') : null;

        const dateTime = new Date(`${time} ${month} ${day}, ${new Date().getFullYear()}`);

        plays.push({
            date: dateTime,
            title,
            location,
            price: priceEl ? priceEl.textContent : null,
            isAvailable: !soldOutTextEl && priceEl,
        })
    })

    return plays;
}

const outputPlaysInfoTable = (plays) => {
    const tableData = [];

    plays.forEach(play => {
        tableData.push(
            {
                'Date': play.date.toLocaleString('en-GB'),
                'Title': play.title,
                'Location': play.location,
                'Is available?': play.isAvailable ? 'Yes' : 'No',
                'Price': play.price ?? '-',
            }
        )
    })

    console.table(tableData);
}

const sendNotifications = async (plays) => {
    const availablePlays = plays.filter(play => play.isAvailable);
    let playMessage = '';

    availablePlays.forEach(play => {
        playMessage += `${play.date.toLocaleString('en-GB')} - ${play.title} - ${play.price}\n`;
    })

    const embedField = {
        name: 'Izrādes',
        value: codeBlock(playMessage),
    }

    const embed = new EmbedBuilder().setTitle('JRT.lv');

    if (availablePlays.length) {
        embed.addFields(embedField);
    } else {
        embed.setDescription(`Nav pieejamu izrāžu. Kopā atrastas ${plays.length} izrādes.`);
    }

    await sendMessage('', [embed]);
}

const scrape = async () => {
    const plays = await getPlays();
    outputPlaysInfoTable(plays);
    sendNotifications(plays);
}

scrape();
