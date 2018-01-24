/*
	Send a notification when a stream is happening
*/

const request = require('request');

function streams(bot) {
	// API keys and shit
	const channelsID = bot.config.channels_id;
	const clientID = bot.config.client_id;
	var lastStreamID = [];

	// Function that will be called every minutes
	function twitchRequest() {
		for(channel in channelsID) {
			var channelID = channelsID[channel];

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
						if(lastStreamID[channel] != stream._id) { // Make sure this stream hasn't been announced yet
							var streamEmbed = new bot.Embed();

							streamEmbed.addField("Now Playing", stream.game);
							streamEmbed.addField("Stream Title", stream.channel.status);
							streamEmbed.addField("Followers", stream.channel.followers.toLocaleString('en'), true);
							streamEmbed.addField("Total Views", stream.channel.views.toLocaleString('en'), true);
							streamEmbed.setThumbnail(stream.channel.logo);
							streamEmbed.setFooter("Stream started");
							streamEmbed.setTimestamp(stream.created_at);

							// Role to notify
							var notificationString = channel == 0 ? "344292325423316992" : "405458226780307472";

							// At last, send the notification
							bot.client.channels.get(bot.channels.notification).send("<@&" + notificationString + ">\n" + stream.channel.display_name + " just went live!\nWatch the stream at " + stream.channel.url, streamEmbed).then(() => {
								lastStreamID[channel] = stream._id; // Make sure it doesn't post it twice
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