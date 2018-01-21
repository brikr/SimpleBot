/*
	Send a notification when a stream is happening
*/

const request = require('request');

function streams(bot) {
	// API keys and shit
	const channelID = bot.config.channel_id;
	const clientID = bot.config.client_id;
	var lastStreamID = "";

	// Options used by the request module
	const requestOptions = {
		uri: "https://api.twitch.tv/kraken/streams/" + channelID,
		headers: {
			'Accept': "application/vnd.twitchtv.v5+json",
			'Client-ID': clientID
		}
	};

	// Function that will be called every minutes
	function twitchRequest() {
		request.get(requestOptions, function(err, response, body) {
			if(!err) { // Make sure the request went well
				try { // Shitty try/catch here, the bot may sometimes crash from this and who the fuck knows why
					const stream = JSON.parse(body).stream;

					// Make sure a stream is on
					if(stream != null) {
						if(lastStreamID != stream.id) { // Make sure this stream hasn't been announced yet
							var streamEmbed = simplebot.createEmbed();

							streamEmbed.addField("Now Playing", stream.game);
							streamEmbed.addField("Stream Title", stream.channel.status);
							streamEmbed.addField("Followers", stream.channel.followers.toLocaleString('en'), true);
							streamEmbed.addField("Total Views", stream.channel.views.toLocaleString('en'), true);
							streamEmbed.setThumbnail(stream.channel.logo);
							streamEmbed.setFooter("Stream started at");
							streamEmbed.setTimestamp(stream.created_at);

							// At least, send the notification
							bot.guild.channels.get(bot.channels.notification).send("<@&344292325423316992>\n" + stream.channel.display_name + " just went live!\nWatch the stream at " + stream.channel.url, streamEmbed).then(() => {
								lastStreamID = stream.id; // Make sure it doesn't post it twice
							});
						}
					}
				} catch(e) {}
			} 
		});
	}

	setInterval(() => {
		twitchRequest();
	}, 1000*60);

}

module.exports = streams;