var fs = require('fs');
var express = require('express');
var multiparty = require('multiparty');
var lwip = require('lwip');
var randomstring = require("randomstring");
var path = require('path');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = module.exports = express();
app.use(bodyParser.urlencoded( { extended: true }));
app.use(express.static('static'));
app.use('/thumbs', express.static('uploads/thumbs'));
app.use('/images', express.static('uploads/fullsize'));
app.use('/comments', express.static('uploads/comments'));

var debug = true;
var port = 8000;
var imgSizeLimitMB = 5;
var acceptedFileTypes = ['.png', '.jpg', '.jpeg'];

var acceptedHeaders =  acceptedFileTypes.slice();
acceptedHeaders.forEach(function(el, ind, arr)
{
    el = el.substr(1);
    acceptedHeaders[ind] = 'image/' + el;
});

// Return image filenames
app.get('/uploads/names', function(req, res, next)
{
    if (debug) console.log('GET: file names');
    getFileNames(__dirname + '/uploads/thumbs', function (err, files)
    {
        res.writeHead(200, {'Content-type':'text/plain'});
        res.end(files.join());
    });
});

// Return an image specific page (with the image)
app.get('/img/*', function(req, res, next)
{
    var fileName = req.url.split("/").last();
    if (debug) console.log('GET image: ' + fileName);

    // Find out the extension (it's not in the url)
    var extension;
    var files = fs.readdirSync(__dirname + '/uploads/thumbs');
    files.forEach(function(name, ind, arr)
    {
        if (typeof name == 'string' && fileName == name.split('.')[0])
            extension = '.'.concat(name.split('.')[1]);
    });

    var $ = cheerio.load(fs.readFileSync(__dirname + '/img.html'));
    console.log('src url: ' + '/images/' + fileName + extension);
    $('#img').attr('src', '/images/' + fileName + extension);
    return res.send($.html());
});

// Post a comment
app.post('/img/*', function(req, res, next)
{
    var fileName = req.url.split('/').last();
    var text = validator.escape(req.body.text); // Sanitize Comment
    var time = req.body.timestamp;

    if (debug) console.log('Comment posted on: ' + fileName + ': ' + text);

    // Open and parse comments from JSON file
    var commentsJSON;
    try {
        commentsJSON = JSON.parse(fs.readFileSync(__dirname +
            '/uploads/comments/' + fileName + '.json'));
    }
    catch (e)
    {
        console.error(e);
        return res.status(404).end('Error while opening comment file.');
    }

    // Push new comment to array
    commentsJSON.push({
            "timestamp": time,
            "text": text
        });

    // Update file
    fs.writeFile(__dirname + '/uploads/comments/' + fileName + '.json',
        JSON.stringify(commentsJSON), function(err) {

            if(err)
            {
                console.error(err);
                return res.status(403).end('Error while saving comment');
            }
            console.log("Comment was saved.");
    });

    res.sendStatus(200);
});


// Post a new image
app.post('/uploads', function(req, res, next)
{
    if (debug) console.log('POST: /uploads');
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
	var img;
	try {
		img = files.imgFile[0];
	}
	catch (e) {
		console.error('Error while uploading image: ' + e);
		return res.status(403).send('Error while uploading image');
	}
        var size = img.size / 1000000;
        var type = img.headers['content-type'];
        var extension = '';

        // Check file size
        if ( size > imgSizeLimitMB )
            return res.status(403).send('Image size limited to '+
            imgSizeLimitMB + 'MB');

        // Check extension
        if (acceptedHeaders.indexOf(type) < 0)
            return res.status(403).send('Only .png, .jpg and .jpeg allowed');
        else
            extension = type.split('/').last();

        // Rename the file
        var newFileName = randomstring.generate(10) + "." + extension;

        var tmp_path = img.path;
        var target_path = __dirname + '/uploads/fullsize/' + newFileName;
        var thumbPath = __dirname + '/uploads/thumbs/' + newFileName;
        if (debug) console.log('Saving file to: ' + target_path);

        // Save the image
        fs.renameSync(tmp_path, target_path, function(err)
        {
            if(err)
                console.error('Error while saving file: ' + err.stack);
        });

        // Save the 200x200 thumbnail
        console.log('Saving thumbnail to: ' + target_path);
        lwip.open(target_path, function(err, image)
        {
            if (err)
                console.error('Error while opening image: ' + err.stack);

            image.resize(200, 200, function(err, image) {
                if (err)
                    console.error('Error while saving thumbnail: ' +
                        err.stack);
                else
                    image.writeFile(thumbPath, function(err)
                    {
                        if (err)
                            console.error('Error while saving thumbnail: ' +
                                err.stack);
                    });
            });
        });

        // Initialize comments file
        fs.writeFile(__dirname + '/uploads/comments/' +
            newFileName.split('.')[0] + '.json',
            JSON.stringify('[]'), function(err) {
                if(err)
                {
                    console.error(err);
                    return res.status(403).end('Error while initializing ' +
                        'comments file');
                }
        });
        console.log("Created comments file.");

        res.redirect('/');
        if (debug) console.log('Upload completed!');
    });
});

if (!module.parent)
{
  app.listen(port);
  console.log('Listening on port ' + port);
}

// Shorthand to access last element
if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
}

function getFileNames(dir, callback)
{
    var files = [];
    var i;
    fs.readdir(dir, function (err, list)
    {
    	if (typeof list != 'undefined')
    	{
            for(i=0; i<list.length; i++)
        	{
                // Store the file name into the array files
                if (acceptedFileTypes.indexOf(path.extname(list[i])) > -1)
                    files.push(list[i]);
            }
    	}
    callback(err, files);
    });
}
