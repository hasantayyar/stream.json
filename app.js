// stream.json
// The geek's home media streaming server.

// Libraries
var connect = require("connect");
var http = require("http");
var fs = require("fs");
var markdown = require("node-markdown").Markdown;

// Includes
var includes_dir = "./includes";
var misc = require(includes_dir + "/misc.js");

var app = connect();
var config_dir = "./config";
var config = require(config_dir + "/config.json");
var videos = require("./videos.json");
var mimeTypes = require(config_dir + "/mimes.json");

app.use(function(req, res) {
  if (req.method == "GET") {
    var req_path = req.url.split("/");

    if (req.url == "/list") {
      res.writeHead(200, "OK", {'Content-Type': "application/json"});
			res.end(JSON.stringify(videos), 'utf-8');
    } else if (req_path[1] == "getPoster") {
      var poster;

      for (var i = 0; i < videos.video.length; i++) {
        if (videos.video[i].id == req_path[2]) {
          poster = videos.video[i].poster;
        }
      }

      if (poster === undefined) {
        res.writeHead(404, "File Not Found");
        res.end();
      } else {
        res.writeHead(200, "OK", {'Content-Type': misc.getMIME(poster, mimeTypes)});
        fs.readFile(poster, function(error, content) {
          res.end(content);
        });
      }
    } else if (req_path[1] == "getVideo") {
      var video;

      for (var i = 0; i < videos.video.length; i++) {
        if (videos.video[i].id == req_path[2]) {
          video = videos.video[i].file;
        }
      }

      if (video === undefined) {
        res.writeHead(404, "Video Not Found");
        res.end();
      } else {
        res.writeHead(200, "OK", {'Content-Type': "text/plain"});
        misc.generateVideoServerURL(function(videoServer) {
          res.end(videoServer + video, 'utf-8');
        }, config);
      }
    } else {
      res.writeHead(403);
      res.end();
    }
  } else {
    res.writeHead(403);
    res.end();
  }
});

var server = http.createServer(app);
server.listen(config.server_port, function () {
  if (server.address().address == "0.0.0.0") {
    console.log("Server running at: localhost:" + server.address().port);
  } else {
    console.log("Server running at: " + server.address().address + ":" + server.address().port);
  }
});