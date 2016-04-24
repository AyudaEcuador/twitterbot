var Twitter = require('twitter');
var util = require('util');

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL)

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

var Tweet = mongoose.model('Tweet', { data: {} });

client.stream('statuses/filter', {track: '#AyudaEC'}, function(stream) {
  stream.on('data', function(tweet) {
    console.log(tweet.text);
    // save in database
    var doc = new Tweet({ data: tweet });
    doc.save(function(err) {
      if (err) {
        console.log(util.inspect(err));
      } else {
        console.log('Tweet: '+tweet.id+' inserted.');
      }
    });
    // Retweet
    if (tweet.user.name != "AyudaEcuador") {
      client.post('statuses/retweet/' + tweet.id_str, function(error, tweet, response){
        if (!error) {
          console.log(tweet);
        } else {
          console.log(util.inspect(error));
        }
      });
    }
  });

  stream.on('error', function(error) {
    throw error;
  });
});
