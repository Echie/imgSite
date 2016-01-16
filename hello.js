// var http = require('http');
// var url = require("url");
/*
var fs = require('fs');
var bodyParser = require('body-parser')
var express = require('express');

var app = express();
app.use(bodyParser.multipart());
*/


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
    var size = '';
    var fileName = '';
    form.on('part', function(part)
    {
        if(!part.filename) return;
        size = part.byteCount;
        fileName = part.filename;
    });
    form.on('file', function(name,file)
    {
        console.log('file path: ' + file.path);
        console.log('dirname: ' + __dirname);
        console.log('filename: ' + fileName);
        console.log('fileSize: '+ (size / 1024));
        var tmp_path = file.path
        var target_path = './uploads/fullsize/' + fileName;
        var thumbPath = __dirname + '/uploads/thumbs/';
        fs.renameSync(tmp_path, target_path, function(err)
        {
            if(err) console.error(err.stack);
        });
        res.redirect('/uploads/fullsize/' + fileName);
        console.log(target_path);
        /*
        gm(tmp_path)
            .resize(150, 150)
            .noProfile()
            .write(thumbPath + 'small.png', function(err) {
                if(err) console.error(err.stack);
            });
        */
    });
    // form.parse(req);

    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));
        console.log(files.imgFile);
    });
});

/*
app.post('/upload', function(req, res, next){
    // create a form to begin parsing
    var form = new multiparty.Form();
    console.log(form)
    var image;
    var title;

    // listen on field event for title
    form.on('field', function(name, val)
    {
        if (name !== 'title') return;
        title = val;
    });

    // listen on part event for image file
    form.on('part', function(part)
    {
        if (!part.filename) return;
        if (part.name !== 'image') return part.resume();
        image = {};
        image.filename = part.filename;
        image.size = 0;
        part.on('data', function(buf)
        {
            image.size += buf.length;
        });
    });

    form.on('error', next);
    form.on('close', function()
    {
        res.send(util.format('\nuploaded %s (%d Kb) as %s'
            , image.filename
            , image.size / 1024 | 0
            , title));
    });

    // parse the form
    form.parse(req);
});
*/
if (!module.parent) {
  app.listen(80);
  console.log('Express started on port 80');
}











// app.use( bodyParser.json() );       // to support JSON-encoded bodies
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//   extended: true
// }));


/*
app.post('/upload', function (req, res)
{
    console.log('');
    console.log('Image posted');
    console.log('---------------------------------------------');
    console.log(req.body);
    // console.log('req.files: ' + req.files);


    // Redirect back to main page
    res.redirect(200, 'back');

});
*/

/*
// Without express
http.createServer(function(request, response) {
    // console.log("Request:");
    // console.log(request);

    var pathname = url.parse(request.url).pathname;
    var method = request.method;
    // console.log(method);

    if (method == 'POST' && pathname !== "/")
    {
        console.log(request);
    }
    console.log("Request for " + pathname + " received.");

    response.writeHead(200);

    if(pathname == "/")
    {
        html = fs.readFileSync("index.html", "utf8");
        response.write(html);
    }
    else if (pathname == "/myScript.js")
    {
        script = fs.readFileSync("myScript.js", "utf8");
        response.write(script);
    }
    response.end();
}).listen(80);

console.log('Server running.');
*/
