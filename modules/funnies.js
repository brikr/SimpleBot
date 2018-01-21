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

	// Generate the meme screenshot commands
	fs.readdir("files/" + folders.pictures + "/", (err, files) => {
		files.forEach(file => {
			bot.addCommand(path.basename("files/" + folders.pictures + "/" + file, ".png"), {
				DM: true
			}, command => {
				command.channel.send("", {
					files:[{
						attachment: "files/" + folders.pictures + "/" + file
					}]
				});
			});
		});
	});

	// The simps command
	bot.addCommand("simps", {}, command => {
		fs.readdir("files/" + folders.simps + "/", (err, files) => {
			var file = files[Math.floor(Math.random() * files.length)]; // Get a random file
			command.channel.startTyping();
			command.channel.send("", {
				files:[{
					attachment: "files/" + folders.simps + "/" + file
				}]
			}).then(m => {
				command.channel.stopTyping();
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