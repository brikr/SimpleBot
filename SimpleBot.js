/*
	Main entrypoint of SimpleBot
*/

const Discord = require('discord.js'),
	  fs = require('fs');

// The whole bot brain is there
function SimpleBot() {
	const client = new Discord.Client();

	// Channel IDs
	const channels = {
		mod: "372516063344197633",
		music: "368950883007856640",
		lounge: "137567383215800320",
		notification: "344292106187309057"
	};

	// Main bot Object
	const bot = {
		client: client,
		channels: channels,
		config: require('./config.json'),
		Embed: function() {
			return new Discord.RichEmbed();
		},
		commands: [],
		modulesLoaded: false
	};

	// Login
	client.login(bot.config.discord_key);	

	/*
		Event handlers
	*/

	// On ready
	client.on("ready", () => {
		// Prepare some variables
		bot.guild = client.guilds.get("137567383215800320");

		// Loading modules
		if(!bot.modulesLoaded) {
			fs.readdir("modules", (err, files) => {
				files.forEach(file => {
					require("./modules/" + file)(bot);
				});
			});

			/*
				I use a variable here so this function doesn't run twice,
				the "ready" event can get triggered when the bot disconnect/reconnect
			*/
			bot.modulesLoaded = true;
		}

		// Change SimpleBot avatar every 5 minutes
		setInterval(() => { 
			fs.readdir("./files/simpleflips/", (err, files) => {
				var file = files[Math.floor(Math.random() * files.length)];
				bot.client.user.setAvatar("./files/simpleflips/" + file);
			});
		}, 300000);
	});

	// On message
	client.on("message", message => {
		if(message.content.startsWith(".")) {
			const command = message.content.split(" ")[0].replace(".", "").trim(); // Trim the message to end up with the command name

			// Does the command exists
			if(bot.commands[command]) {
				const options = bot.commands[command];

				const params = message.content.replace("." + command, "").trim().split(" ");
				if(params[0].length == 0) // The split command may create an array with one empty string, just a fix to make it empty if it's the case
						delete params[0]; 
				
				if(message.guild || options.DM) { // Is the message sent in a server or is allowed to be ran in DMs
					// Data send to the function handling the command
					const commandData = {
						message: message,
						text: message.content,
						channel: message.channel,
						params: params
					}

					// Is the user a mod ?
					if(message.member.roles.exists(role => role.name == "Mod")) {
						commandData.isMod = true;
					}

					// Run the command's function
					bot.commands[command].command(commandData);

					// Delete the user's message if the command wants to
					if(options.remove) {
						message.delete();
					}
				} else { // Command not allowed to run
					message.reply("This command has to be ran on the server.");
				}
			}
		}
	});

	/*
		Functions
	*/

	// Add a command to the bot
	bot.addCommand = function(name, options, command) {
		if(name && command) {
			options.command = command;
			bot.commands[name] = options;
		} else {
			throw "Command not defined correctly.";
		}
	};
}

new SimpleBot();