var express = require('express');
var FeedParser = require('feedparser');
var htmlparser = require("htmlparser2");
var request = require('request');
var req = request('https://isthereanydeal.com/rss/deals/us/');
var feedparser = new FeedParser({addmeta: false});
var reg = new RegExp(/isthereanydeal/)
var app = express();
var gamelist = []
var parser = new htmlparser.Parser({
  onopentag: function(name, attribs){
    if (attribs.href && reg.test(attribs.href)) {
      // New title discovered, create a new item
      // Each information piece will add to the last element in the array
      console.log("=========================================");
      gamelist.push({name: '', price: null, savings: null, link: ''}); // Add a new item
      console.log("attribs: ", attribs.href)
    } else if (attribs.href && gamelist[gamelist.length-1].link.length < 1) {
      gamelist[gamelist.length-1].link = attribs.href; // Add Link
      console.log("attribs: ", attribs.href);
    }
  },
  ontext: function(text){
    if (/\$/.test(text)) {
      if (gamelist[gamelist.length-1].price === null) {
        gamelist[gamelist.length-1].price = parseInt(text); // Add price
        console.log(text);
      }
    } else if (/\%/.test(text)) {
      if (gamelist[gamelist.length-1].savings === null) {
        gamelist[gamelist.length-1].savings = parseInt(text); // Add Savings %
        console.log(text); 
      }
    } else if (gamelist[gamelist.length-1] && gamelist[gamelist.length-1].name.length < 1) {
      gamelist[gamelist.length-1].name = text; // Add name of game
      console.log(text); 
    }
  },
  onclosetag: function(tagname){}
}, {decodeEntities: true});

// -------- Initialize gamelist on start of node -------- //
req.on('error', function (error) {console.log(error);});
req.on('response', function (res) {
  var stream = this;
  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
  stream.pipe(feedparser);
});
feedparser.on('error', function(error) {console.log(error);});
feedparser.on('readable', function() {
  // **NOTE** the "meta" is always available in the context of the feedparser instance
  var stream = this, meta = this.meta, item;
  while (item = stream.read()) {
    parser.write(JSON.stringify(item.description));
    parser.end();
  }





});

var server = app.listen(3000) // port 8080