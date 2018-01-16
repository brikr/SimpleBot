/*
	Logs and stuff
*/

function logs(bot) {
	// IDs of the logs channels
	const channels = {
		users: "370241799798652928",
		messages: "389988341787000832",
		updates: "390701489166876682"
	};

	// Colors for the Embeds
	const colors = {
		userJoined: "#4CAF50",
		userUpdate: "#9C27B0",
		userRemove: "#FFC107",
		userBan: "#F44336",
		userUnban: "#FFFFFF",
		nicknameUpdate: "#9C27B0",
		messageRemove: "#FF5722",
		messageUpdate: "#2196F3"
	};

	var userBanned = false; // Shitty hack so the code doesn't logs a user being banned twice (Ban + Leave event)

	// Main logging command
	function log(options) {
		const logEmbed = new bot.Embed(); // Create an empty RichEmbed

		// Set some data
		logEmbed.setColor(options.color);
		logEmbed.setAuthor("Logs", bot.client.user.avatarURL);
		logEmbed.setThumbnail(options.thumbnail);

		// Generated the fields
		for(f in options.fields) {
			const field = options.fields[f];

			for(const name in field) {
				logEmbed.addField(name, field[name]);
			}
		}

		// Add the date field
		logEmbed.addField("At", new Date().toLocaleString());

		// Send the embed
		bot.guild.channels.get(options.channel).send("", logEmbed);
	}

	/*
		Event Handlers for logging
	*/

	// User joins the server
	bot.client.on("guildMemberAdd", member => {
		// Dates to compare
		const creationDate = member.user.createdAt;
		const todayDate = new Date();

		// Automatically ban an user if the account was created on the same day (Mostly spam/troll account)
		if(creationDate.getFullYear() == todayDate.getFullYear() && creationDate.getMonth() == todayDate.getMonth() && creationDate.getDay() == todayDate.getDay()) {
			member.ban("Account created today, probably a troll account.");
		} else {
			log({
				color: colors.userJoined,
				channel: channels.users,
				thumbnail: member.user.avatarURL,
				fields: [{
					"User Joined": member.user.username
				}, {
					"Created At": member.user.createdAt.toLocaleString()
				}]
			});
		}
	});

	// User's nickname is changed
	bot.client.on("guildMemberUpdate", (oldMember, newMember) => {
		if(oldMember.nickname != newMember.nickname) {
			log({
				color: colors.nicknameUpdate,
				channel: channels.updates,
				thumbnail: newMember.user.avatarURL,
				fields: [{
					"Old Nickname": (oldMember.nickname != null ? oldMember.nickname : oldMember.user.username)
				}, {
					"New Nickname": (newMember.nickname != null ? newMember.nickname : newMember.user.username)
				}]
			});
		}
	});

	// User leave the server
	bot.client.on("guildMemberRemove", member => {
		if(!userBanned) { // If an user has been ban, don't log it twice 
			log({
				color: colors.userRemove,
				channel: channels.users,
				thumbnail: member.user.avatarURL,
				fields: [{
					"User left": (member.nickname != null ? member.nickname : member.user.username)
				}]
			});
		} else {
			userBanned = false;
		}		
	});

	// User got banned
	bot.client.on("guildBanAdd", (guild, user) => {
		userBanned = true;
		log({
			color: colors.userBanned,
			channel: channels.users,
			thumbnail: user.avatarURL,
			fields: [{
				"User Banned": user.username
			}]
		});
	});

	// User got unbanned
	bot.client.on("guildBanRemove", (guild, user) => {
		log({
			color: colors.userUnban,
			channel: channels.users,
			thumbnail: user.avatarURL,
			fields: [{
				"User Unbanned": user.username
			}]
		});
	});

	// Message got edited/updated
	bot.client.on("messageUpdate", (oldMessage, newMessage) => {
		if(oldMessage.content != newMessage.content && (oldMessage.content.length < 1024 && oldMessage.content.length > 0) && (newMessage.content.length < 1024 && newMessage.content.length > 0)) {
			log({
				color: colors.messageUpdate,
				channel: channels.messages,
				thumbnail: newMessage.author.avatarURL,
				fields: [{
					"User": (newMessage.nickname != null ? newMessage.nickname : newMessage.author.username)
				}, {
					"Original": oldMessage.content
				}, {
					"Edit": newMessage.content
				}]
			});
		}
	});

	// Message got deleted
	bot.client.on("messageDelete", message => {
		if(!message.content.startsWith(".") && !message.author.bot && message.content.length > 0 && message.content.length < 1024) {
			log({
				color: colors.messageRemove,
				channel: channels.messages,
				thumbnail: message.author.avatarURL,
				fields: [{
					"User": message.author.username
				}, {
					"Deleted": message.content
				}]
			});
		}
	});

	// User changed their username
	bot.client.on("userUpdate", (oldUser, newUser) => {
		if(oldUser.username != newUser.username) {
			log({
				color: colors.userUpdate,
				channel: channels.updates,
				thumbnail: newUser.avatarURL,
				fields: [{
					"Old Username": oldUser.username
				}, {
					"New Username": newUser.username
				}]
			});
		}
	});
}

module.exports = logs;