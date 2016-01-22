'use strict';

var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();


// Home page
router.get('/', function(req, res, next) {

  // Resolve file path using 'path', otherwise a ForbiddenError will be thrown.
  var filePath = path.join(path.resolve(__dirname), '/../', 'views', 'index.html');
  
  res.status(200);
  res.set('Cache-Control', 'public, max-age=86400'); 
  res.sendFile(filePath);
});


// Request video partial
router.get('/stream/:video_name', function(req, res, next) {
  
  var file = path.join(path.resolve(__dirname), '/../', 'videos', req.params.video_name);
  fs.stat(file, function(err, stats) {
  
    var totalFileSize = stats.size;
    
    // Calculate start and end positions of the byte-stream.
    var range = req.headers.range;
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    var end = positions[1] ? parseInt(positions[1], 10) : totalFileSize - 1; 
    var chunksize = (end - start) + 1;
    
    // Prepare the headers.
    var headers = {
      "Accept-Ranges": "bytes",
      "Content-Range": "bytes " + start + "-" + end + "/" + totalFileSize,
      "Content-Length": chunksize
    };
    
    // Identify the content-type.
    var mediaType = getMediaType(req.params.video_name);
    if(mediaType) {
      headers['Content-Type'] = mediaType;
    }

    // Send the chunk to the client.
    res.writeHead(206, headers);
    var stream = 
      fs.createReadStream(file, { 
        start: start, 
        end: end 
      })
      .on("open", function() {
        stream.pipe(res);
      })
      .on("error", function(err) {
        res.end(err);
      });
  });
});


function getMediaType(fileName) {
  var ext = fileName.split('.').pop();
  var imt = null;
  switch(ext) {
    case 'mp4': imt = 'video/mp4'; break;
    case 'ogg': imt = 'video/ogg'; break;
    case 'webm': imt = 'video/webm'; break;
  }
  return imt;
}

module.exports = router;
