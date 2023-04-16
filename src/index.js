const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();

const TOKEN = process.env.TOKEN;
const MONGO_URI = process.env.MONGO_URI;

const bot = new TelegramBot(TOKEN, { polling: true });

//mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(MONGO_URI);

const GroupSchema = new mongoose.Schema({
  name: String,
});

const Group = mongoose.model("Group", GroupSchema);
bot.onText(/\/addGroup/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "To add the bot to a new group type /addGroup <@group_id>"
  );
});
bot.onText(/\/removeGroup/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "To remove the bot from a group type /removeGroup <@group_id>"
  );
});

bot.onText(/\/addGroup (.+)/, (msg, match) => {
  const groupName = match[1];

  if (!groupName || !/^@/.test(groupName)) {
    bot.sendMessage(
      msg.chat.id,
      "Invalid group name. Please enter a group name that starts with '@'"
    );
    return;
  }

  const group = new Group({ name: groupName });
  Group.findOne({ name: groupName })
    .exec()
    .then((result) => {
      if (result) {
        bot.sendMessage(msg.chat.id, "Bot already added to the group.");
      } else {
        group
          .save()
          .then((result) => {
            bot.sendMessage(msg.chat.id, "Group added successfully");
            console.log(result);
          })
          .catch((error) => {
            bot.sendMessage(msg.chat.id, "Failed to add group");
            console.log(error);
          });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

bot.onText(/\/removeGroup (.+)/, (msg, match) => {
  const groupName = match[1];

  Group.deleteOne({ name: groupName })
    .then((result) => {
      if (result.deletedCount === 1) {
        bot.sendMessage(msg.chat.id, "Group removed successfully");
      } else {
        bot.sendMessage(msg.chat.id, "Group not found");
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

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

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Available commands:\n" +
      "/start - Start the bot\n" +
      "/info - Get information about the bot\n" +
      "/sendmsg - Send a message to the groups\n" +
      "/setgroups - Set the groups to send messages to\n" +
      "/help - Show this help message\n" +
      "/addGroup - To add the bot to a new group\n" +
      "/removeGroup - To remove the bot from a group"
  );
});

const url = "https://media1.giphy.com/media/kHC4qdJwYqIWjo5IM6/giphy.gif";
const maxMessagesPerHour = 84;
//const interval = 3600000 / maxMessagesPerHour;
let currentHourMessages = 0;

let grp_ids=[];
async function getGroupNames() {
  try {
    const result = await Group.find();
    grp_ids = result.map((group) => group.name);
    return grp_ids;
  } catch (error) {
    console.log(error);
  }
}


async function sendMessagesToAllGroups() {
  
  const groupIds=await getGroupNames();
  let i = 0;
  const totalGroups = groupIds.length;

  const sendMessageIntervalId = setInterval(() => {
    if (i < totalGroups) {
          bot.sendAnimation(groupIds[i], url);
      i++;
      currentHourMessages++;
      if (currentHourMessages >= maxMessagesPerHour) {
        clearInterval(sendMessageIntervalId);
        setTimeout(() => {
          sendMessagesToAllGroups();
        }, 21600000); // Wait 6 hours before sending messages again
        currentHourMessages = 0;
      }
    } else {
      clearInterval(sendMessageIntervalId);
      if (totalGroups === i) {
        setTimeout(() => {
          sendMessagesToAllGroups();
        }, 600000); // Wait 10 minutes before sending messages again
      }
    }
  }, 60000);
   // 1 minute interval between each message
}

sendMessagesToAllGroups();
