const Discord = require("discord.js")
// const { Client, Intents } = require('discord.js');
const client = new Discord.Client(
  // { intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'] }
  );
const DisTube = require("distube")
const distube = new DisTube(client,
  {
    searchSongs: true,
    emitNewSongOnly: false,
    // leaveOnFinish: true
    leaveOnStop: false,
    youtubeDL: true,
    updateYouTubeDL: true,
    emptyCooldown: 30
}
);
const { token } = require("./info.json");
const prefix = '-';

client.on("ready", () => {
  console.log(`${client.user.tag} Has logged in`)
})


client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift();

  // Queue status template
  const status = (queue) =>
    `Volume: \`${queue.volume}%\` | Filter: \`${
      queue.filters.join(", ") || "Off"
    }\` | Loop: \`${
      queue.repeatMode
        ? queue.repeatMode === 2
          ? "All Queue"
          : "This Song"
        : "Off"
    }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``

  // DisTube event listeners, more in the documentation page
  distube
    .on("playSong", (queue, song) =>
      queue.textChannel.send(
        `:kiss: Playing \`${song.name}\` - \`${
          song.formattedDuration
        }\`\nRequested by: ${song.user.tag}\n${status(queue)}`
      )
    )
    .on("addSong", (queue, song) =>
      queue.textChannel.send(
        `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user.tag}`
      )
    )
    .on("addList", (queue, playlist) =>
      queue.textChannel.send(
        `Added \`${playlist.name}\` playlist (${
          playlist.songs.length
        } songs) to queue\n${status(queue)}`
      )
    )
    // DisTubeOptions.searchSongs = true
    .on("searchResult", (message, result) => {
      let i = 0
      message.channel.send(
        `**Choose an option from below**\n${result
          .map(
            (song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``
          )
          .join("\n")}\n*Enter anything else or wait 30 seconds to cancel*`
      )
    })
    .on("searchCancel",(message)=>message.channel.send(`Searching Cancelled`))
    .on("error",(message,e)=>{
      console.error(e);
      message.channel.send("An error Occured: " + e);
    });
    if(["play","p"].includes(command)){
      if(!message.member.voice.channel) return message.channel.send(":kiss: uhh! Master Chief you should be in a voice channel to command me!");
      if(!args[0]) return message.channel.send(":kiss: Uhh! Master Chief you should tell me what to play!!");
      distube.play(message,args.join(' '));

  }
  if(["stop","s"].includes(command)){
      const bot = message.guild.members.cache.get(client.user.id);
      if(!message.member.voice.channel) return message.channel.send(":kiss: uhh! Master Chief you should be in a voice channel to command me!");
      if(bot.voice.channel != message.member.voice.channel) return message.channel.send(":kiss: Uhh! Master Chief you are not in the same voice channel as me. Please cum inn chief!");
      distube.stop(message);
      message.channel.send(":kiss: I stopped the music as per your command Master Chief!");
  }  
  if(command == "resume"){
    distube.resume(message);
    message.channel.send(":kiss: I resumed the previous playing song as per your command Chief!");
  }
  if(command == "playSkip"){
    distube.playSkip(message, args.join(" "));
    message.channel.send(":kiss: I skipped the current playing song and now playing the new song as per your command Chief!");
  }
  if(command == "pause"){
    distube.pause(message);
    message.channel.send(":kiss: I paused the current playing song as per your command Chief!");
  }
  if(["loop","repeat"].includes(command)){
    let mode = distube.setRepeatMode(message,parseInt(args[0]));
    mode = mode ? mode==2 ? "Repeat queue":"Repeat Song":"Off";
    message.channel.send("Set repeat mode to: `"+mode+"`");
  }
  if(command=="queue"){
    let queue = distube.getQueue(message);
    message.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
        `**${id+1}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``
    ).join("\n"));
  }
  distube.on("error",(message,e)=>{
    console.error(e);
    message.channel.send("An error Occured: " + e);
  });
});

client.login(token)