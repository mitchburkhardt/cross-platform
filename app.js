var express = require('express'),
    app = express(),
    SourcePort = 3000,
    BuiltPort = 3001,
	OptimizedPort = 3002,
    ejs = require('ejs'),
    fs = require('fs'),
    path = require('path'),
	spawn = require('child_process').spawn,
	HomeSlide = 'home';

function dirExists(dir){
	var stats;
	try {
		stats = fs.lstatSync(dir);
		if (stats.isDirectory()) return true;
		else return false;
	} catch (e) {
		return false;
	}
}

if(dirExists('dev/slides')){
	app.set('view engine', 'ejs');
	app.set('views','./dev');
	function getDirectories(srcpath) {
	    return fs.readdirSync(srcpath).filter(function(val) {
	        return fs.statSync(srcpath + '/' + val).isDirectory();
	    });
	}
	var slides = getDirectories('dev/slides');
	app.use(express.static(__dirname + '/dev/'));
	slides.forEach(function(i){
	    app.use('/'+i, express.static(__dirname + '/dev/slides/'+i));
	});
	ejs.delimiter = '%';
	app.get('/', function(req, res) {
	    res.render(`slides/${HomeSlide}/index`, {
	        pages: slides,
			Built: false
	    });
	});
	slides.forEach(function(e) {
	    app.get('/' + e, function(req, res) {
	        res.render('slides/' + e + '/' + e);
	    });
	});
	// spins up server for source code
	app.listen(SourcePort, function() {
	    console.log('Source code running on http://localhost:' + SourcePort);
		// spawn('open', ['http://localhost:'+SourcePort]);
	});
}
else{
	console.log('source code does not exist in: ./dev');
}


var static = require('node-static');
var http = require('http');

if(dirExists('compiled')){
	// spins up server for Built code
	var Builtserver = new static.Server('./compiled');
	http.createServer(function (request, response) {
	    request.addListener('end', function () {
	        Builtserver.serve(request, response);
	    }).resume();
	}).listen(BuiltPort, function(){
	    // console.log('Compiled code running on http://localhost:' + BuiltPort);
		// spawn('open', ['http://localhost:'+BuiltPort]);
	});
}
else{
	// console.log('source code has not been compiled.  Run "grunt build"');
}

// var spawn = require('child_process').spawn
// spawn('open', ['http://www.stackoverflow.com', 'http://google.com']);
