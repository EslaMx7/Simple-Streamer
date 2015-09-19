var cliParser = require("./cliParser");
var http = require("http");
var fs = require("fs");
var path = require("path");
var srt2vtt = require('srt-to-vtt');

console.log("\r\n");
console.log('Simple Streamer | by : Eslam Hamouda (@EslaMx7) | www.eslamx.com');

var options = cliParser(process.argv);

if(options.subtitle.lastIndexOf('.srt')==options.subtitle.length -4){
  // Convert .srt to .vtt
  var vtt = options.subtitle.replace(".srt",".vtt");
  fs.createReadStream(options.subtitle)
  .pipe(srt2vtt())
  .pipe(fs.createWriteStream(vtt))
  
  options.subtitle = vtt;
}

// console.log(options);

/**
 * Sends a static file to the HTTP client, supporting partial transfers.
 * 
 * @req HTTP request object
 * @res HTTP response object
 * @fn Path to file that should be sent
 * @contentType MIME type for the response (defaults to HTML)
 */      
function sendFile(req, res, fn, contentType) {

  contentType = contentType || "text/html";

  fs.stat(fn, function(err, stats) {
    var headers;

    if (err) {
      res.writeHead(404, {"Content-Type":"text/plain"});
      res.end("Could not read file");
      return;
    }

    var range = req.headers.range || "";    
    var total = stats.size;

    if (range) {

      var parts = range.replace(/bytes=/, "").split("-");
      var partialstart = parts[0];
      var partialend = parts[1];

      var start = parseInt(partialstart, 10);
      var end = partialend ? parseInt(partialend, 10) : total-1;

      var chunksize = (end-start)+1;

      headers = { 
        "Content-Range": "bytes " + start + "-" + end + "/" + total, 
        "Accept-Ranges": "bytes", 
        "Content-Length": chunksize, 
        "Content-Type": contentType 
      };
      res.writeHead(206, headers);

    } else {

      headers = { 
        "Accept-Ranges": "bytes", 
        "Content-Length": stats.size, 
        "Content-Type": contentType 
      };
      res.writeHead(200, headers);

    }

    var readStream = fs.createReadStream(fn, {start:start, end:end});
    readStream.pipe(res);    

  });

}

var server = http.createServer(function(req,res){
	if(req.method=="GET" && req.url == "/"){
		res.write("<head><title>Simple Streamer | by : Eslam Hamouda (@EslaMx7)</title></head>");
		res.write('<video style="width:100%;height:auto;" controls="controls" > <source type="video/mp4" src="'+options.fileName+'"> <track kind="subtitles" src="'+options.subtitle+'" label="English Subtitles" srclang="en" default /></video>');
		res.end();
	}else if(req.method=="GET" && req.url == "/"+options.fileName){
		/*fs.readFile(options.fileName,function(err,content){
			res.writeHead(200,{'Content-Type':'video/mp4'});
			res.end(content);
		});*/
		sendFile(req,res,options.fileName,"video/mp4");
		
	}else if(req.method=="GET" && req.url == "/"+options.subtitle){
		fs.readFile(options.subtitle,function(err,content){
			res.writeHead(200,{'Content-Type':'text/vtt'});
			res.end(content);
		});
		
	}else{
			res.writeHead(404,{'Content-Type':'text/html'});
			res.end();
	}		
})


server.listen(process.env.SS_PORT || options.port || 7000);

console.log("Server listening on port :"+server.address().port);

server.on('error',function(err){
	console.log(err);
})

console.log("Press [Ctrl + C] to exit.")

module.exports = this;