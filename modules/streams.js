/*
	Send a notification when a stream is happening
*/

const request = require('request');

function streams(bot) {
	// API keys and shit
	const streamChannels = bot.config.stream_channels;
	const clientID = bot.config.client_id;
	var lastStreamID = [];

	// Function that will be called every minutes
	function twitchRequest() {
		for(sc in streamChannels) {
			const channel = streamChannels[sc]
			const channelID = channel.id;

			// Options used by the request module
			var requestOptions = {
				uri: "https://api.twitch.tv/kraken/streams/" + channelID,
				headers: {
					'Accept': "application/vnd.twitchtv.v5+json",
					'Client-ID': clientID
				}
			};

			request.get(requestOptions, function(err, response, body) {
				if(!err) { // Make sure the request went well
					var stream = null;

					// Sometimes the code would crash due to bad parsing here
					try {
						stream = JSON.parse(body).stream;
					} catch(e) {}

					// Make sure a stream is on
					if(stream != null) {
						if(lastStreamID[channelID] != stream._id) { // Make sure this stream hasn't been announced yet
							var streamEmbed = new bot.Embed();

							streamEmbed.addField("Now Playing", stream.game);
							streamEmbed.addField("Stream Title", stream.channel.status);
							streamEmbed.addField("Followers", stream.channel.followers.toLocaleString('en'), true);
							streamEmbed.addField("Total Views", stream.channel.views.toLocaleString('en'), true);
							streamEmbed.setThumbnail(stream.channel.logo);
							streamEmbed.setFooter("Stream started");
							streamEmbed.setTimestamp(stream.created_at);

							// Get the notifcation role
							const notificationRole = bot.guild.roles.get(channel.role);

							// Make the role mentionable
							notificationRole.setMentionable(true, "Stream notifcation").then(() => {
								// At last, send the notification
								bot.client.channels.get(bot.channels.notification).send("<@&" + channel.role + ">\n" + stream.channel.display_name + " just went live!\nWatch the stream at " + stream.channel.url, streamEmbed).then(() => {
									lastStreamID[channelID] = stream._id; // Make sure it doesn't post it twice
									notificationRole.setMentionable(false); // Make sure the role cannot be mentionned again
								});
							});							
						}
					}
				} 
			});
		}
	}

	setInterval(() => {
		twitchRequest();
	}, 1000*60);
}

module.exports = streams;