var fs = require('fs');
var express = require('express');
var multiparty = require('multiparty');
var lwip = require('lwip');
var sqlite3 = require('sqlite3');
var randomstring = require("randomstring");

var port = 8000;
var imgSizeLimitMB = 5;
var acceptedFileTypes = ['.png', '.jpg'];

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
/*
app.get('/uploads/thumbs', function(req, res, next)
{
    console.log('GET: /uploads/thumbs');
    // var db = new sqlite3.Database('imgSite.db');

    res.status(501).redirect('/');
});
*/

app.get('/uploads/fullsize', function(req, res, next)
{

});

/* OLD GET OF IMAGES
app.get('/uploads/fullsize', function(req, res, next)
{
    console.log('GET: /uploads/fullsize');
    var db = new sqlite3.Database('imgSite.db');
    console.log("imgSite.db: " + db);
    db.all("SELECT fileName FROM Image", function(err, rows)
    {
        // Iterate through file names
        res.write('<html><body>');
        rows.forEach(function(el, ind, arr)
        {
            var type = el.fileName.split(".");
            type = type[type.length - 1];

            var path = __dirname + '/uploads/fullsize/' + el.fileName;
            console.log('path: ' + path);

            fs.readFile(path, function(err, data)
            {
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                res.end(data); // Send the file data to the browser
            });
        });
    });
    // res.status(501).redirect('/');
});
*/
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
        if ( (img.size / 1000000) > imgSizeLimitMB )
        {
            return res.status(403).send('Image size limited to 5MB');

        }

        // Check extension
        if (!(acceptedHeaders.indexOf(type) > -1))
        {
            return res.status(403).send('Only png and jpg allowed');
        }
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
    var fileType = '.jpg';
    var files = []
    var i;
    fs.readdir(imageDir, function (err, list)
    {
        for(i=0; i<list.length; i++)
        {
            // Store the file name into the array files

            if (acceptedHeaders.indexOf(type) > -1)
                files.push(list[i]);
        }
    callback(err, files);
    });
}
