var imagePage = require('./imagePage');
var mainPage = require('./mainPage');

var express = require('express');
var bodyParser = require('body-parser');
var app = module.exports = express();
app.use(bodyParser.urlencoded( { extended: true }));
app.use(express.static('static'));
app.use('/thumbs', express.static('uploads/thumbs'));
app.use('/images', express.static('uploads/fullsize'));
app.use('/comments', express.static('uploads/comments'));

var port = 8000;

// Return image filenames
app.get('/uploads/names', mainPage.getFileNames);

// Return an image specific page (with the image)
app.get('/img/*', imagePage.getImagePage);

// Post a comment
app.post('/img/*', imagePage.postComment);

// Post a new image
app.post('/uploads', mainPage.postImage);

if (!module.parent)
{
  app.listen(port);
  console.log('Listening on port ' + port);
}
