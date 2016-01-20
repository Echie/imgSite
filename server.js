var fs = require('fs');
var express = require('express');
var multiparty = require('multiparty');
var lwip = require('lwip');
var randomstring = require("randomstring");
var path = require('path');
var cheerio = require('cheerio');
var bodyParser = require('body-parser')
var validator = require('validator');
var app = module.exports = express();
app.use(bodyParser.urlencoded( { extended: true }));
app.use(express.static('static'));
var port = 8000;
var imgSizeLimitMB = 5;
var acceptedFileTypes = ['.png', '.jpg', '.jpeg'];

var acceptedHeaders =  acceptedFileTypes.slice();
acceptedHeaders.forEach(function(el, ind, arr)
{
    el = el.substr(1);
    acceptedHeaders[ind] = 'image/' + el;
});

app.get('/', function (req, res)
{
    console.log('GET: index.html')
    res.send(fs.readFileSync("index.html", "utf8"));
});

// Return all thumbnails
app.get('/uploads/thumbs', function(req, res, next)
{
    console.log('GET: thumbnails');
    var directory = __dirname + '/uploads/thumbs';
    getImages(directory, function (err, files)
    {
        var imageLists = '';
        for (var i=0; i<files.length; i++)
        {
            var fileName = files[i];
            var extension = fileName.split('.');
            extension = extension[extension.length - 1];

            var data = fs.readFileSync(directory + '/' + files[i]);

            imageLists += '<img filename="'+fileName+
                '" src="data:image/'+extension+';base64,';
            imageLists += new Buffer(data).toString('base64');
            imageLists += '"/>';

        }
        res.writeHead(200, {'Content-type':'text/html'});
        res.end(imageLists);
    });
});

// Return an image + comments
app.get('/img/*', function(req, res, next)
{
    var fileName = req.url.split("/");
    fileName = fileName[fileName.length - 1]

    console.log('GET image: ' + fileName);

    var imgPath = __dirname + '/uploads/fullsize/' + fileName;

    var data, extension;

    // Try to open image with all accepted file extensions
    acceptedFileTypes.every(function(el, ind, arr)
    {
        try { data = fs.readFileSync(imgPath + el); }
        catch (e)
        {
            // Continue if expected error, log otherwise
            if (e.code === 'ENOENT') return true;
            else console.log(e);
        }
        if (data != undefined)
        {
            extension = el;
            return false;
        }
    });

    // Form response
    var imgSrc = '';
    imgSrc += 'data:image/'+extension+';base64,';
    imgSrc += new Buffer(data).toString('base64');

    var $ = cheerio.load(fs.readFileSync(__dirname + '/img.html'));
    $('#img').attr('src', imgSrc);

    // Open §s JSON file
    var commentPath = __dirname + '/uploads/comments/' + fileName + '.json';
    var commentsJSON;
    try { commentsJSON = fs.readFileSync(commentPath); }
    catch (e)
    {
        // Create file if there's no comments
        if (e.code === 'ENOENT')
        {
            fs.writeFileSync(commentPath, '[]');
            console.log('Created comment file for: ' + fileName);
            commentsJSON = '[]';
        }
        else console.log(e);
    }

    var comments = JSON.parse(commentsJSON);

    for(var i = 0; i < comments.length; i++)
    {
        var comment = comments[i];

        $('#comments').append('<li class="list-group-item">' +
            '<p class="p-timestamp">' + comment['timestamp'] + '</p>' +
            '<p class="p-comment">' + comment['text'] + '</p>');
        $('#comments').append('</li>');

    }
    res.send($.html());
});

// Post a comment
app.post('/img/*', function(req, res, next)
{
    var fileName = req.url.split('/');
    fileName = fileName[fileName.length - 1];

    console.log('Comment posted on: ' + fileName + ': ' + req.body.comment);

    var commentPath = __dirname + '/uploads/comments/' + fileName + '.json';

    // Open and parse comments
    var commentsJSON;
    try { commentsJSON = fs.readFileSync(commentPath); }
    catch (e) { console.log(e); }

    var comments = JSON.parse(commentsJSON);

    // Form timestamp string
    var date = new Date(Date.now());

    var time = date.getDate() + '.' + (date.getMonth()+1) + '.' +
    date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() +
    ':'+ date.getSeconds();

    // Push new comments to array
    comments.push({
            "timestamp": time,
            "text": req.body.comment
        })

    // Update file
    fs.writeFile(commentPath, JSON.stringify(comments), function(err) {

        if(err) return console.log(err);
        console.log("Comment was saved.");
    });

    res.sendStatus(200);
    // res.redirect('back');
});


// Post a new image
app.post('/uploads', function(req, res, next)
{
    console.log('POST: /uploads');
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
	var img;
	try {
		img = files.imgFile[0];
	}
	catch (e) {
		console.log('Error while accessing image: ' + e);
		return res.status(403).send('Error while uploading image');
	}
        var size = img.size / 1000000;
        var type = img.headers['content-type'];
        var extension = '';
        console.log('size: ' + size);
        console.log('content-type: ' + type);

        // Check file size
        if ( size > imgSizeLimitMB )
            return res.status(403).send('Image size limited to 5MB');

        // Check extension
        if (!(acceptedHeaders.indexOf(type) > -1))
            return res.status(403).send('Only .png, .jpg and .jpeg allowed');
        else
        {
            extension = type.split('/')
            extension = extension[extension.length - 1];
        }

        // Rename the file
        var newFileName = randomstring.generate(10) + "." + extension;

        var tmp_path = img.path;
        var target_path = __dirname + '/uploads/fullsize/' + newFileName;
        var thumbPath = __dirname + '/uploads/thumbs/' + newFileName;
        console.log('Saving file to: ' + target_path);

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
        res.redirect('/');
        console.log('Upload completed!');
    });
});

if (!module.parent)
{
  app.listen(port);
  console.log('Listening on port ' + port);
}


function getImages(imageDir, callback)
{
    var files = [];
    var i;
    fs.readdir(imageDir, function (err, list)
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
