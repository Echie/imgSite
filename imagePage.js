var fs = require('fs');
var cheerio = require('cheerio');
var validator = require('validator');

var debug = true;

// Return an image specific page (with the image)
module.exports.getImagePage = function(req, res, next) {
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
};

// Post a comment
module.exports.postComment = function(req, res, next) {
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
};

// Shorthand to access last element
if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
}
