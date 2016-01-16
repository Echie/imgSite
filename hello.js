var port = 8000;

var fs = require('fs');
var express = require('express');
var multiparty = require('multiparty');
var util = require('util');
var app = module.exports = express();


app.get('/', function (req, res)
{
    console.log('Returning index.html (get)')
    res.send(fs.readFileSync("index.html", "utf8"));
});

app.get('/myScript.js', function (req, res)
{
    console.log('Returning myScript.js');
    res.send(fs.readFileSync("myScript.js", "utf8"));
});

app.post('/upload', function(req, res, next)
{
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
        img = files.imgFile[0];

        // var type = img.headers['content-type'];
        var fileName = img.originalFilename;
        var tmp_path = img.path;

        var target_path = __dirname + '/uploads/fullsize/' + fileName;
        var thumbPath = __dirname + '/uploads/thumbs/';
        console.log('Saving file to: ' + target_path);
        fs.renameSync(tmp_path, target_path, function(err)
        {
            if(err) console.error(err.stack);
        });
        res.redirect('/');

        console.log('Upload completed!');
    });

});

if (!module.parent)
{
  app.listen(port);
  console.log('Express started on port ' + port);
}
