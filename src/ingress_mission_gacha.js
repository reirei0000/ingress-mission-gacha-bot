const csv = require('csvtojson');
const TeleBot = require('telebot');
const { nanoid } = require('nanoid');


const bot = new TeleBot(process.argv[2])  // BotToken
let missions
csv().fromFile('src/missions.csv').then(m => missions = m);

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
      `${ n['ken'] } ${ n['shi'] } ${ n['machi'] } ${ n['title']
      }`.toLowerCase().includes(query.toLowerCase()));
    if (selected.length > 0) {
      query_result = `"${ query }" が含まれるミッションから選択します`
      selectMissions = selected;
    } else {
      query_result = `"${ query }" が含まれるミッションありません。\n登録されている全てのミッションから選択します`
    }
  }

  const answers = bot.answerList(msg.id, {cacheTime: -1});
  let name = 'Jone Doe'
  if (msg.from && msg.from.first_name)
  name = msg.from.first_name

  answers.addArticle(createArticle(
    '🗺 #ingress mission Gacha',
    query_result,
    `${ name } さんの <a href="${ selectMissions[Math.floor(Math.random() * selectMissions.length) ]['Bannergress'] }">次のミッション</a>`
  ));

  return bot.answerQuery(answers);

});

bot.start();
