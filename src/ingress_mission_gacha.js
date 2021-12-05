const csv = require('csvtojson');
const https = require('https');
const TeleBot = require('telebot');
const { nanoid } = require('nanoid');

const INGRESS2S_SPREADSHEET = 'https://docs.google.com/spreadsheets/d/1F50Yejamn7F1K_gm0dVgJ8sJEBkzivb3Y626f8O35SM/gviz/tq?tqx=out:csv&sheet=Second%20Sunday'


const bot = new TeleBot(process.env.API_TOKEN)  // BotToken
let missions = []
const getMissions = () => {
  https.get(INGRESS2S_SPREADSHEET, (resp) => {
    let data = ''
    resp.on('data', (chunk) => { data += chunk })
    resp.on('end', () => { csv().fromString(data).then( m => { missions = m; console.log(missions)} ) })
  }).on("error", (err) => {
    console.log("Error: " + err.message)
  })
}
getMissions()
setInterval(getMissions, 1000 * 3600 * 12)

const createInputMessageContent = text => ({
  message_text: `${ text }`,
  parse_mode: 'HTML',
  disable_web_page_preview: false
});

const createArticle = (title, description, message) => ({
  type: 'article',
  id: nanoid(),
  title,
  input_message_content: createInputMessageContent(message),
  hide_url: true,
  description
});


bot.on('inlineQuery', msg => {

  let query = msg.query;
  let query_result = `登録されている全てのミッションから選択します`
  let selectMissions = missions;
  console.log(`inline query: ${ query }`);

  if (query != '') {
    let selected = missions.filter((n) =>
      `${ n['都道府県'] } ${ n['市町村'] } ${ n['町'] } ${ n['タイトル']
      }`.toLowerCase().includes(query.toLowerCase()));
    if (selected.length > 0) {
      query_result = `"${ query }" が含まれるミッションからランダムで選択します`
      selectMissions = selected;
    } else {
      query_result = `"${ query }" が含まれるミッションはありません。\n登録されている全てのミッションからランダムで選択します`
    }
  }

  const answers = bot.answerList(msg.id, {cacheTime: -1});
  let name = 'Jone Doe'
  if (msg.from && msg.from.first_name)
    name = msg.from.first_name

  answers.addArticle(createArticle(
    '🗺 #ingress mission Gacha',
    query_result,
    `${ name } さんの <a href="${ selectMissions[Math.floor(Math.random() * selectMissions.length) ]['Bannergres'] }">次のミッション</a>`
  ));
  if (missions == selectMissions)
    return bot.answerQuery(answers);
  selectMissions.forEach(m => answers.addArticle(
    createArticle(m['タイトル'], `${ m['都道府県'] } ${ m['市町村'] } ${ m['町'] }`,
    `${ name } さんの <a href="${ m['Bannergres'] }">次のミッション</a>`)))

  return bot.answerQuery(answers);

});

bot.start();
