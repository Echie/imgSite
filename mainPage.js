var fs = require('fs');
var express = require('express');
var multiparty = require('multiparty');
var lwip = require('lwip');
var randomstring = require("randomstring");
var path = require('path');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');

var debug = true;
var imgSizeLimitMB = 5;
var acceptedFileTypes = ['.png', '.jpg', '.jpeg'];

var acceptedHeaders =  acceptedFileTypes.slice();
acceptedHeaders.forEach(function(el, ind, arr)
{
    el = el.substr(1);
    acceptedHeaders[ind] = 'image/' + el;
});

// Return image filenames
module.exports.getFileNames = function(req, res, next) {
    if (debug) console.log('GET: file names');
    getFileNames(__dirname + '/uploads/thumbs', function (err, files)
    {
        res.writeHead(200, {'Content-type':'text/plain'});
        res.end(files.join());
    });
};

// Post a new image
module.exports.postImage = function(req, res, next) {
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
};

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
