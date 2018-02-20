/*
	Colors and notify command basically
*/

function roles(bot) {

	// Change your color, only for subs though
	bot.addCommand("color", {}, command => {
		if(command.message.member.roles.exists("name", "Subscriber Cutie")) {
			const colorName = command.params.slice(0).join(" "); // Get the color name

			// Make sure the user actually inputed a color
			if(colorName.length > 0) {
				const colorRole = bot.guild.roles.find(role => role.name.toLowerCase() == "#" + colorName.toLowerCase());

				// Check if that color is actually available
				if(colorRole) {
					const userColor = command.message.member.roles.find(role => role.name.startsWith("#")); // Get user's color role if he has one

					// Don't do anything if the member already has it
					if(command.message.member.roles.has(colorRole.id)) {
						command.message.reply("You're already using this color.");
					} else {
						if(userColor) { // Remove the current one
							command.message.member.removeRole(userColor);
						}

						command.message.member.addRole(colorRole);
						command.message.reply("Your color has been set to `" + colorRole.name.replace("#", "") + "`!");
					}
				} else {
					command.message.reply("Invalid color.");
				}
			} else {
				command.message.reply("You need to choose a color from this list -> <https://cdn.discordapp.com/attachments/372516063344197633/396397936789159936/Color_List.png>");
			}
		} else {
			command.message.reply("Twitch Subscribers only feature, make sure your Twitch account is linked on Discord.");
		}
	});

	// Toggle the notify role
	bot.addCommand("notify", {}, command => {
		const notificationRole = bot.guild.roles.find(r => r.name == "Notifications");

		if(command.message.member.roles.has(notificationRole.id)) {
			command.message.member.removeRole(notificationRole);
			command.message.reply("You will no longer receive a notification for SimpleFlips's streams.").then((message) => command.delete(message, 2));
		} else {
			command.message.member.addRole(notificationRole);
			command.message.reply("You will now receive a notification for SimpleFlips's streams!").then((message) => command.delete(message, 2));
		}
	});


	// Toggle the loohtify role
	bot.addCommand("loohtify", {}, command => {
		const notificationRole = bot.guild.roles.get("405458226780307472");

		if(command.message.member.roles.has(notificationRole.id)) {
			command.message.member.removeRole(notificationRole);
			command.message.reply("You will no longer receive a notification for Looh's streams.").then((message) => command.delete(message, 2));
		} else {
			command.message.member.addRole(notificationRole);
			command.message.reply("You will now receive a notification for Looh's streams!").then((message) => command.delete(message, 2));
		}
	});
}

module.exports = roles;