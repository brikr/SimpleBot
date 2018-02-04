/*
	Moderators only commands
*/

const fs = require('fs');

function mods(bot) {
	// Manage the JSON file
	const json = {
		data: {},

		load: function() {
			json.data = JSON.parse(fs.readFileSync("warnings.json", "utf-8"));
		},

		save: function() {
			fs.writeFileSync("warnings.json", JSON.stringify(json.data, null, "\t"));
		}
	}

	// Load the initial JSON
	json.load();

	// Check GBJ timeouts
	function checkGayBabyJail() {
		// Is there anyone gay baby jailed ?
		if(json.data.gbj.length > 0) {
			for(baby in json.data.gbj) {
				const jailedBaby = json.data.gbj[baby]; // The "gbj" object

				// In case the user left while in GBJ
				if(bot.guild.members.has(jailedBaby.id)) {
					const babyMember = bot.guild.members.get(jailedBaby.id); // The GuildMember
					const gayBabyRole = bot.guild.roles.get("354711424364183575"); // The Role

					if(babyMember.roles.exists(role => role == gayBabyRole)) { // Make sure the user is still gay baby jailed
						if(jailedBaby.timeLeft - 1 == 0 || jailedBaby.timeLeft <= 0 || jailedBaby.timeLeft == null) { // If the gay baby needs to be freed
							babyMember.removeRole(gayBabyRole);
							json.data.gbj.splice(baby, 1);
						} else {
							jailedBaby.timeLeft = jailedBaby.timeLeft - 1;
						}
					} else {
						json.data.gbj.splice(baby, 1);
					}
				} else {
					json.data.gbj.splice(baby, 1);
				}
			}

			json.save(); // Always save the file
		}
	}

	// Gay baby jail checker interval
	setInterval(checkGayBabyJail, 1000);

	/*
		Commands
	*/
	bot.addCommand("ban", {}, command => {
		if(command.isMod) {
			if(command.message.mentions.members.size > 0) {
				const banReason = command.text.split(" ").splice(2).join(" "); // Really shitty way to remove the ".ban <mention>"
				const bannedUser = command.message.mentions.members.first();
				const bannedUserName = bannedUser.nickname ? bannedUser.nickname : bannedUser.user.username; // Check if there's a nickname first

				if(bannedUser == command.message.member) {
					command.message.reply("You can't ban another mod.");
				} else if(bannedUser.roles.find(r => r.name == "Mod")) {
					command.message.reply("Don't ban yourself, idiot.");
				} else {
					command.channel.send("User `" + bannedUserName + "` has been banned with the following reason: `" + banReason + "`.");
					bannedUser.ban({
						reason: banReason,
						days: 7
					});
				}
				command.message.delete();
			} else {
				command.message.reply("You need to mention the user.");
			}
		} else {
			command.message.reply("Moderators only.");
		}
	});

	bot.addCommand("warn", {}, command => {
		if(command.isMod) {
			if(command.message.mentions.members.size > 0) {
				const warnReason = command.text.split(" ").splice(2).join(" "); // Really shitty way to remove the ".warn <mention>"
				const warnedUser = command.message.mentions.members.first();
				const warnedUserName = warnedUser.nickname ? warnedUser.nickname : warnedUser.user.username; // Check if there's a nickname first

				command.channel.send("User `" + warnedUserName + "` has been warned with the following reason: `" + warnReason + "`.");
				command.message.delete();

				// Check if there's a warnings array in the warnings.json file
				if(!json.data.warnings) {
					json.data.warnings = {};
				}

				// Check if there's an array linked to that userID
				if(!json.data.warnings[warnedUser.id]) {
					json.data.warnings[warnedUser.id] = [];
				}

				// Add said warning into the user (As an object)
				json.data.warnings[warnedUser.id].push({
					"Reason": warnReason,
					"Date": new Date().toLocaleString()
				});

				// Save the JSON
				json.save();
			} else {
				command.message.reply("You need to mention the user.");
			}

		} else {
			command.message.reply("Moderators only.");
		}
	});

	bot.addCommand("warns", {}, command => {
		if(command.isMod) {
			if(command.message.mentions.members.size > 0) {
				const warnedUser = command.message.mentions.members.first();
				const warnedUserName = warnedUser.nickname ? warnedUser.nickname : warnedUser.user.username;
				if(json.data.warnings[warnedUser.id]) {
					const warnings = json.data.warnings[warnedUser.id].reverse();

					const warningsEmbed = new bot.Embed();
					warningsEmbed.setThumbnail(warnedUser.user.avatarURL);

					const max = warnings.length < 5 ? warnings.length : 5;

					for(var w = 0; w < max; w++) {
						warningsEmbed.addField("On " + warnings[w].Date.split(" ")[0] + " at " + warnings[w].Date.split(" ")[1], warnings[w].Reason);
					}

					command.channel.send(warnedUserName + " has been warned " + warnings.length + " time(s)!", warningsEmbed);
					command.message.delete();

				} else {
					command.message.reply("This user has never been warned.");
				}
			} else {
				command.message.reply("You need to mention the user.");
			}
		} else {
			command.message.reply("Moderators only.");
		}
	});

	bot.addCommand("gbj", {}, command => {
		if(command.isMod) {
			if(command.message.mentions.members.size > 0 && command.params.length > 1) {
				// Getting the last params, getting the letter and the number.
				const timeString = command.text.split(" ").splice(2).join(" ");
				const timeLetter = timeString.charAt(timeString.length - 1).toLowerCase();
				const timeNumber = timeString.substring(0, timeString.length - 1);

				var timeLeft = 0; // Time left in second
				var timeText = "second(s)";

				switch(timeLetter) {
					case "d":
						timeLeft = timeNumber * 86400; // Seconds in a day
						timeText = "day(s)";
						break;

					case "h":
						timeLeft = timeNumber * 3600 // Seconds in an hour
						timeText = "hour(s)";
						break;

					case "m":
						timeLeft = timeNumber * 60 // Seconds in a minute
						timeText = "minute(s)"
						break;

					default: 
						timeLeft = timeNumber; // Defaults in seconds
						break;
				}

				const jailedUser = command.message.mentions.members.first();
				const jailedUsername = jailedUser.nickname ? jailedUser.nickname : jailedUser.user.username; // Check if there's a nickname first

				if(jailedUser.roles.find(r => r.name == "Mod")) {
					command.message.reply("Can't gay baby jail another mod.");
				} else {
					command.channel.send("User `" + jailedUsername + "` is going to gay baby jail for `" + timeNumber + " " + timeText +"`!").then(msg => {
						jailedUser.addRole(bot.guild.roles.get("354711424364183575")).then(role => {
							json.data.gbj.push({
								"id": jailedUser.id,
								"timeLeft": timeLeft
							});
						});
					});
				}

				command.message.delete();
			} else {
				command.message.reply("You need to mention the user.");
			}
		} else {
			command.message.reply("Moderators only.");
		}
	});

	// Test the lock command
	bot.addCommand("testlock", {
		remove: true
	}, command => {
		if(command.isMod) {
			console.log(command.channel.permissionOverwrites);
		}
	});

	// Lock a channel
	bot.addCommand("lock", {}, command => {
		if(command.isMod) {
			const everyoneRole = bot.guild.roles.find(r => r.name == "@everyone");
			const modRole = bot.guild.roles.find(r => r.name == "Mod");
			const channel = command.channel;

			channel.overwritePermissions(everyoneRole, {
				SEND_MESSAGES: false
			}).then(() => {
				channel.overwritePermissions(modRole, {
					SEND_MESSAGES: true
				}).then(() => {
					channel.send(channel + " has been locked. Use `.unlock` to unlock it.");
				});
			});
		} else {
			command.reply("Mods only.");
		}
	});

	// Unlock a channel
	bot.addCommand("unlock", {}, command => {
		if(command.isMod) {
			const everyoneRole = bot.guild.roles.find(r => r.name == "@everyone");
			const modRole = bot.guild.roles.find(r => r.name == "Mod");
			const channel = command.channel;

			channel.overwritePermissions(everyoneRole, {
				SEND_MESSAGES: true
			}).then(() => {
				channel.send(channel + " has been unlocked.");
			});
		} else {
			command.reply("Mods only");
		}
	});
}

module.exports = mods;