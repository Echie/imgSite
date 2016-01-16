var http = require('http');
var url = require("url");
var fs = require('fs');

var port = 8000

var fs = require('fs');

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
}).listen(port);

console.log('Server running.');
