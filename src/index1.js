const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
// replace the value below with the Telegram token you receive from @BotFather
const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Hello! Welcome to MyBot. Type /help to see the list of available commands."
  );
});

bot.onText(/\/info/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "MyBot is a simple Telegram bot created with Node.js. It can send messages to multiple groups with a maximum of 84 messages per hour."
  );
});

bot.onText(/\/sendmsg/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "To send a message, use the following format: /sendmsg <message>."
  );
});

bot.onText(/\/setgroups/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "To set the groups to send messages to, use the following format: /setgroups <group1> <group2> ... <groupN>."
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Available commands:\n" +
      "/start - Start the bot\n" +
      "/info - Get information about the bot\n" +
      "/sendmsg - Send a message to the groups\n" +
      "/setgroups - Set the groups to send messages to\n" +
      "/help - Show this help message"
  );
});
const groupIds = [
  "@ANYCHAT12",
  "@AGROUP_01",
  "@AGROUP_02",
  "@AGROUP_03",
  "@AGROUP_04",
  "@AGROUP_05",
  "@AGROUP_06",
  "@AGROUP_07",
  "@AGROUP_08",
];

// const message = "Hello, this is a message from your bot!";
const url =
  "https://thumbs.gfycat.com/FinishedSnarlingAfricanelephant-max-1mb.gif";

const maxMessagesPerHour = 84;
const interval = 3600000 / maxMessagesPerHour;
let currentHourMessages = 0;
let batch = 1;

let i = 0;
let timerId = setInterval(() => {
  // check if we've sent the maximum number of messages for the current hour
  if (currentHourMessages < maxMessagesPerHour && batch <= 2) {
    // send the message to the current group chat
    //bot.sendMessage(groupIds[i], message);
    bot.sendAnimation(groupIds[i], url);
    // move to the next group chat
    i++;

    // reset the index if we have reached the end of the array
    if (i >= groupIds.length) {
      i = 0;

      if (batch === 1) {
        setTimeout(() => {
          batch = 2;
        }, 6 * 60 * 60 * 1000);
      }
    }

    currentHourMessages++;
  }

  // if we have reached the maximum number of messages for the current hour, wait until the next hour to reset the counter
  if (currentHourMessages >= maxMessagesPerHour) {
    setTimeout(() => {
      currentHourMessages = 0;

      // Wait for 10 minutes before sending the second batch
      setTimeout(() => {
        i = 0;
        currentHourMessages = 0;

        // Loop through the groups again and send the second batch of messages
        let j = 0;
        let secondBatchTimerId = setInterval(() => {
          // check if we've sent the maximum number of messages for the current hour
          if (currentHourMessages < maxMessagesPerHour) {
            // send the message to the current group chat
            //bot.sendMessage(groupIds[j], message);
            bot.sendAnimation(groupIds[i], url);
            // move to the next group chat
            j++;

            // reset the index if we have reached the end of the array
            if (j >= groupIds.length) {
              clearInterval(secondBatchTimerId);
            }

            currentHourMessages++;
          }
        }, interval);
      }, 600000); // 10 minutes
    }, 3600000 - interval * (i + 1));
  }
}, interval);
