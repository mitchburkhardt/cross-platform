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
	HomeSlide = projectConfig.slides[1],
	devServer;

	console.log(HomeSlide);


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
function restart(server){
	var timeStamp;
	(function(){
		var m = 'AM';
		var ds = new Date().toString().split(' ');
		var tz = ds[6].replace('(','').replace(')','');
		var ts = ds[4].split(':');
		if(ts[0]*1 > 12){
			m = 'PM';
			ts[0] = ts[0] - 12;
		}
		ts = ts.join('.')+'-'+m;
		timeStamp = ts+' '+tz;
	})();
	console.log('restarting... - '+timeStamp);
	server.close();
	// spinServers();
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
	if(dirExists('dev/slides')){
		app.set('view engine', 'ejs');
		app.set('views','./dev');
		var slides = getDirectories('dev/slides');
		slides.forEach(function(i){
		    app.use('/'+i, express.static(__dirname + '/dev/slides/'+i));
		});
		ejs.delimiter = '%';

		createRoute({
		    url: '/',
		    webRoot: './dev/slides/home',
		    file: './dev/router/foo/index.ejs',
		    ejs: true,
		    locals: {
				fullPage: false,
		        home: HomeSlide,
				buildType: 'native',
				firstRun: true,
				filename: 'dev/slides/'+HomeSlide+'/index.ejs',
		    }
		});
		createRoute({
		    url: '/',
		    webRoot: './dev/router/foo/'
		});
		createRoute({
		    url: '/globalAssets',
		    webRoot: './dev/globalAssets',
		    ejs: false
		});

		slides.forEach(function(e) {
			createRoute({
			    url: '/slides/'+e,
			    webRoot: './dev/slides/'+e,
			    file: './dev/slides/'+e+'/index.ejs',
			    ejs: true,
				locals:{
					fullPage: false,
					home: HomeSlide,
					buildType: 'native',
					filename: 'dev/slides/'+e+'/index.ejs',
					firstRun: false
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
}
spinServers();




var restarter = null;
watch('./', function(e) {
	if(restarter) clearTimeout(restarter);
	restarter = setTimeout(function(){
		restart(devServer);
	},550);
});
