var fs = require('fs');
var express = require('express');
var multiparty = require('multiparty');
var lwip = require('lwip');
var sqlite3 = require('sqlite3');
var randomstring = require("randomstring");
var path = require('path');
var cheerio = require('cheerio');
// var parser = require('exif-parser')

var port = 8000;
var imgSizeLimitMB = 5;
var acceptedFileTypes = ['.png', '.jpg', '.jpeg'];

var acceptedHeaders =  acceptedFileTypes.slice();
acceptedHeaders.forEach(function(el, ind, arr)
{
    el = el.substr(1);
    acceptedHeaders[ind] = 'image/' + el;
});

var app = module.exports = express();

app.get('/', function (req, res)
{
    console.log('GET: index.html')
    res.send(fs.readFileSync("index.html", "utf8"));
});

app.get('/client.js', function (req, res)
{
    console.log('GET: client.js');
    res.send(fs.readFileSync("client.js", "utf8"));
});

app.get('/uploads/*.*', function (req, res)
{
    console.log('GET: ' + req.url);
    fs.readFile(__dirname + req.url, function(err, data) {
        if (err)
        {
            console.log('404 not found');
            res.status(404).send('Not found');
        }
        else
        {
            var type = req.url.split(".");
            type = type[type.length - 1];

            res.writeHead(200, {'Content-Type': 'image/'+ type});
            res.end(data);
        }
    });
});

app.get('/img/*.*', function(req, res, next)
{
    var fileName = req.url.split("/");
    fileName = fileName[fileName.length - 1]
    var extension = fileName.split('.');
    extension = extension[extension.length - 1];

    console.log('GET: ' + fileName);

    var imgPath = __dirname + '/uploads/fullsize/' + fileName;
    var data = fs.readFileSync(imgPath);


    var img = '';
    img += 'data:image/'+extension+';base64,';
    img += new Buffer(data).toString('base64');

    var $ = cheerio.load(fs.readFileSync(__dirname + '/img.html'));
    $('#img').attr('src', img);

    res.send($.html());
});

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

            imageLists += '<img filename="'+fileName+'" src="data:image/'+extension+';base64,';
            imageLists += new Buffer(data).toString('base64');
            imageLists += '"/>';

        }
        res.writeHead(200, {'Content-type':'text/html'});
        res.end(imageLists);
    });
});

app.post('/uploads', function(req, res, next)
{
    console.log('POST: /uploads');
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
        var img = files.imgFile[0];
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

        // Save the 50x50 thumbnail
        console.log('Saving thumbnail to: ' + target_path);
        lwip.open(target_path, function(err, image)
        {
            if (err)
                console.error('Error while opening image: ' + err.stack);

            image.resize(50, 50, function(err, image) {
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
        for(i=0; i<list.length; i++)
        {
            // Store the file name into the array files
            if (acceptedFileTypes.indexOf(path.extname(list[i])) > -1)
                files.push(list[i]);
        }
    callback(err, files);
    });
}
