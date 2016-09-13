var express = require('express');
var FeedParser = require('feedparser');
var htmlparser = require("htmlparser2");
var request = require('request');
var reg = new RegExp(/isthereanydeal/)
var app = express();
var gamelist = []

var parser = new htmlparser.Parser({
  onopentag: function(name, attribs){
    if (attribs.href && reg.test(attribs.href)) {
      console.log("=========================================");
      gamelist.push({name: '', price: -1, savings: 0, link: ''}); // add a new item
      console.log("attribs: ", attribs.href)
    // } else if (attribs.href) {
    } else if (attribs.href && gamelist[gamelist.length-1].link.length < 1) {
      gamelist[gamelist.length-1].link = attribs.href;
      console.log("attribs: ", attribs.href);
    }
  },
  ontext: function(text){
    if (/\d/.test(text)) {
      if (gamelist[gamelist.length-1].price === -1) {
        gamelist[gamelist.length-1].price = text;
        console.log(text);
      }
    } else if (gamelist[gamelist.length-1] && gamelist[gamelist.length-1].name.length < 1) {
      gamelist[gamelist.length-1].name = text;
      console.log(text);
      // console.log("THIS: ", gamelist[gamelist.length-1].name, " THEN ", text);
    }
  },
  onclosetag: function(tagname){
    // console.log("tagname: ", tagname);
  }
}, {decodeEntities: true});


// parser.write("Xyz <script type='text/javascript'>var foo = '<<bar>>';</ script>");
// parser.end();




var req = request('https://isthereanydeal.com/rss/deals/us/'),
    feedparser = new FeedParser({addmeta: false});


req.on('error', function (error) {console.log(error);});
req.on('response', function (res) {
  var stream = this;
  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
  stream.pipe(feedparser);
});




feedparser.on('error', function(error) {
  console.log(error);
});

feedparser.on('readable', function() {
  var stream = this,
      meta = this.meta, // **NOTE** the "meta" is always available in the context of the feedparser instance
      item;
  while (item = stream.read()) {
    // console.log(JSON.stringify(item.description));
    // console.log('------');
    // for (key in item) {
    //   // console.log(item[key]);
    //   // if (item[key] && item[key].length > 5) parser.write(item);
    //   if (item[key] && item[key].length > 5) console.log(typeof item);
    // }
    // console.log(item);
    parser.write(JSON.stringify(item.description));
  }
});


var server = app.listen(3000) // port 8080