const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
require("dotenv").config();
const TOKEN = process.env.TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const app = express();
mongoose.set('strictQuery',false);

const PORT = process.env.PORT || 3000;

const connectDB = async()=>{
  try{
  const conn=await mongoose.connect(MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  }catch(error){
    console.log(error);
    process.exit(1);
  }
};

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

connectDB().then(()=>{
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})


const bot = new TelegramBot(TOKEN, { polling: true });

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
    "Hello! Thank you for reaching out to PromoProBot. To contact the bot owner for any inquiries or assistance, please message @kingmarketing26 directly. Our team will be happy to assist you further. Thank you!"
  );
});

bot.onText(/\/info/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "PromoProBot is a powerful Telegram bot designed to assist with promoting messages in multiple groups. With PromoPro, you can easily schedule and send promotional messages to up to 1000 groups, helping you to reach a wider audience and boost your message's visibility."
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Available commands:\n" +
      "/start - Start the bot\n" +
      "/info - Get information about the bot\n" +
      "/help - Show this help message\n" +
      "/addGroup - To add the bot to a new group\n" +
      "/removeGroup - To remove the bot from a group"
  );
});

const message =
  "Hey there! 🚀\n\nJoin us at DriveShareDAO, the future of sharing economy on blockchain! Earn passive income by renting out your car or sharing rides. Join our community now: https://t.me/drivesharedao. Don't miss out! 🌐";

const maxMessagesPerHour = 84;
//const interval = 3600000 / maxMessagesPerHour;
let currentHourMessages = 0;

let grp_ids = [];
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
  const groupIds = await getGroupNames();
  let i = 0;
  const totalGroups = groupIds.length;

  const sendMessageIntervalId = setInterval(() => {
    if (i < totalGroups) {
      bot.sendMessage(groupIds[i], message);
      // bot.sendAnimation(groupIds[i], url);
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
        }, 28800000 ); // Wait 8 hours minutes before sending messages again
      }
    }
  }, 60000);
  // 1 minute interval between each message
}

sendMessagesToAllGroups();
