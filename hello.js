var fs = require('fs');
var express = require('express');
var multiparty = require('multiparty');
var lwip = require('lwip');
var sqlite3 = require('sqlite3');

var port = 8000;
var app = module.exports = express();

app.get('/', function (req, res)
{
    console.log('GET: index.html')
    res.send(fs.readFileSync("index.html", "utf8"));
});

app.get('/myScript.js', function (req, res)
{
    console.log('GET: myScript.js');
    res.send(fs.readFileSync("myScript.js", "utf8"));
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
        img = files.imgFile[0];
        var fileName = img.originalFilename;
        var tmp_path = img.path;

        var target_path = __dirname + '/uploads/fullsize/' + fileName;
        var thumbPath = __dirname + '/uploads/thumbs/' + fileName;
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
