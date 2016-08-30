var express = require('express'),
    app = express(),
    SourcePort = 3000,
    BuiltPort = 3001,
	OptimizedPort = 3002,
    ejs = require('ejs'),
    fs = require('fs'),
    path = require('path'),
	spawn = require('child_process').spawn,
	watch = require('node-watch'),
	watcher = false,
	projectConfig = JSON.parse(fs.readFileSync('./dev/project.json', 'utf-8')),
	HomeSlide = projectConfig.slides[0].name,
	devServer;
	// TODO: electron interface
	// TODO: new slide button, fill out form to generate slide in source code.
	// TODO: modify/new form, to guide user to correct file/location.
	// TODO: buttons to open command prompt, and throw commands so there's no memory needed.
function createRoute(obj) {
    var file, html;
    app.use(obj.url, express.static(obj.webRoot));
    if (obj.file) {
        app.get(obj.url, function(req, res) {
            file = fs.readFileSync(obj.file, 'utf-8');
            if (obj.ejs) {
                ejs.renderFile(obj.file, obj.locals, function(err, result) {
                    if (!err) {
                        html = result;
                    } else {
                        html = err.toString();
                    }
                });
            } else html = file;
            res.send(html);
        });
    }
}
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
function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function(val) {
		return fs.statSync(srcpath + '/' + val).isDirectory();
	});
}

function spinServers(){
	fs.writeFile("./dev/includes/_core/_bottomScrollerHeight.scss", `$bottomscrollerHeight: ${projectConfig.bottomScrollerHeight};`, function(err) {
    if(err) {
        return console.log(err);
    }

    if(dirExists('dev/slides')){
		app.set('view engine', 'ejs');
		app.set('views','./dev');
		var slides = getDirectories('dev/slides');
		console.log(slides);
		// slides.forEach(function(i){
		//     app.use('/'+i, express.static(__dirname + '/dev/slides/'+i));
		// });
		ejs.delimiter = '%';

		createRoute({
		    url: '/',
		    webRoot: './dev/slides',
		    file: './dev/slides/index.ejs',
		    ejs: true,
		    locals: {
				fullPage: true,
		        home: HomeSlide,
				buildType: 'native',
				filename: 'dev/slides/index.ejs',
				nativeRoot: true,
				compiled: false,
				slides: slides,
				bottomScrollerHeight: projectConfig.bottomScrollerHeight,
				projectConfig: projectConfig
		    }
		});
		createRoute({
		    url: '/globalAssets',
		    webRoot: './dev/globalAssets',
		    ejs: false,
			nativeRoot: false,
			home: HomeSlide
		});
		createRoute({
			url: '/dev/includes/',
			webRoot: './dev/includes',
			ejs: false,
			nativeRoot: false,
			home: HomeSlide
		});
		slides.forEach(function(e) {
			createRoute({
			    url: '/'+e,
			    webRoot: './dev/slides/'+e,
			    file: './dev/slides/'+e+'/index.ejs',
			    ejs: true,
				locals:{
					slide: e,
					fullPage: false,
					home: HomeSlide,
					buildType: 'native',
					filename: 'dev/slides/'+e+'/index.ejs',
					compiled: false
				}
			});
		});

		devServer = app.listen(SourcePort, function() {
		    console.log('Source code running on http://localhost:' + SourcePort);
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
});

}
spinServers();
