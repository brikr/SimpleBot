/*
	Little fun commands
*/

const fs = require('fs'), path = require('path'), request = require('request');

function fun(bot) {
	// Folders used to store the memes
	const folders = {
		simps: "simpleflips",
		pictures: "pictures"
	};

	// Cooldown for commands
	var cooldown = new Map();

	// Generate the meme screenshot commands
	fs.readdir("files/" + folders.pictures + "/", (err, files) => {
		files.forEach(file => {
			const commandName = path.basename("files/" + folders.pictures + "/" + file, ".png");

			bot.addCommand(commandName, {
				DM: true,
				remove: true
			}, command => {
				// Is the current command in a cooldown ?
				if(cooldown.has(commandName)) {
					command.message.reply("Wait `" + parseInt(cooldown.get(commandName)) + " second(s)` before using this command again.").then(message => {
						setTimeout(() => {
							message.delete();
						}, 2000);
					});
				} else {
					command.channel.send("", {
						files:[{
							attachment: "files/" + folders.pictures + "/" + file
						}]
					});

					const cooldownInterval = setInterval(() => {
						var secondsLeft = cooldown.has(commandName) ? cooldown.get(commandName) : 15;
						secondsLeft -= 1;

						if(secondsLeft == 0) {
							cooldown.delete(commandName);
							clearInterval(cooldownInterval);
						} else {
							cooldown.set(commandName, secondsLeft);
						}
					}, 1000);
				}
			});
		});
	});
	
	// The info command
	bot.addCommand("info", {}, command => {
		const infoEmbed = new bot.Embed();

		infoEmbed.setAuthor("Server Stats", bot.guild.iconURL);

		infoEmbed.addField("Members", bot.guild.memberCount, true);
		infoEmbed.addField("Online", bot.guild.presences.size, true);

		command.channel.send("", infoEmbed);
	});

	// The save command
	bot.addCommand("save", {}, command => {
		if(command.isMod) {
			if(command.message.attachments.size > 0) {
				const pictureToSave = command.message.attachments.first();

				command.channel.send("Uploading the picture...").then(msg => {
					request(pictureToSave.url).pipe(fs.createWriteStream("files/" + folders.simps + "/" + pictureToSave.filename)).on("close", () => {
						command.message.delete();
						msg.edit("Picture uploaded correctly!");
					});
				});
			}
			else {
				command.message.reply("You need to attach a picture to the command, idiot.");
			}
		} else {
			command.message.reply("Only moderators can use this command.");
		}
	});

	// The gay command
	bot.addCommand("gay", {}, command => {
		command.message.reply("no u");
	});
}

module.exports = fun;