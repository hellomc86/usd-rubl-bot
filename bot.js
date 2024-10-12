const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Ваш токен Телеграм-бота
const token = '7418887312:AAERMl_wgXJrwZfZEffLMilSJmDL3BLznlg';

// Создаем экземпляр бота
const bot = new TelegramBot(token);

const app = express();
app.use(bodyParser.json());

// Обрабатываем запросы Telegram на URL /bot<token>
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body); // Передаем запрос в Telegram Bot API
  res.sendStatus(200); // Отвечаем 200, чтобы подтвердить получение
});

// Запуск сервера на порту 3000
app.listen(3000, () => {
  console.log('Express server is running on port 3000');
});

// Используем объект для отслеживания состояний пользователей
const userStates = {};

// Переменная для хранения имени пользователя
let userName = '';

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  // Сбрасываем состояние пользователя
  userStates[chatId] = 'awaiting_name';

  bot.sendMessage(chatId, 'Добрый день. Как вас зовут?');
});

// Обработчик сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  console.log(chatId);
  console.log(msg);

  // Если имя еще не сохранено, запрашиваем и сохраняем его
  if (userStates[chatId] === 'awaiting_name') {
    userName = msg.text;
    userStates[chatId] = 'name_received'; // Обновляем состояние пользователя
    try {
      // Получаем курс доллара через API
      const response = await axios.get('https://www.cbr-xml-daily.ru/daily_json.js');
      const dollarRate = response.data.Valute.USD.Value;

      // Отправляем сообщение с именем и курсом доллара
      bot.sendMessage(chatId, `Рад знакомству, ${userName}! Курс доллара сегодня ${dollarRate.toFixed(2)}р.`);
    } catch (error) {
      bot.sendMessage(chatId, 'Не удалось получить курс доллара. Попробуйте позже.');
      console.error(error);
    }
  }
});
