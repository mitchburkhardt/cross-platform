if (!modGrunt.var.taskDefs) modGrunt.var.taskDefs = {};
var HomeSlide = 'home';
var devFolder = './dev';
var compiledFolder = './releases';
var buildTypes = ['-all', '-native', '-veeva', '-mi'];
var willBuild = [];
var slides = utils.getDirectories(devFolder + '/slides');
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
	ds = ds.slice(1,4).join('-');
	timeStamp = ds+' '+ts+' '+tz;
})();
for (i = 0; i < buildTypes.length; i++) {
    if (process.argv.indexOf(buildTypes[i]) > -1) {
        willBuild.push(buildTypes[i].substr(1, buildTypes[i].length - 1));
    }
}
if (willBuild.indexOf('all') > -1 || !willBuild.length) willBuild.push('native', 'veeva', 'mi');
var flags = {
	delete: false
};
var prop;
for (prop in flags) {
	if(process.argv.indexOf('-'+prop) > -1) flags[prop] = true;
}
var mrCounter = 0;
function move_rename(config){
	console.log('sdfgsdfhgsdfh');
	mrCounter++;
	// src: compiledFolder.replace('./', '') + '/native' +' - '+timeStamp+'/index.html',
	// dest: compiledFolder.replace('./', '') + '/native' +' - '+timeStamp+'/index.html',
	// delete: compiledFolder.replace('./', '') + '/native' +' - '+timeStamp+'/wrapper/'
	modGrunt.var.taskDefs.copy['move_rename-'+mrCounter] = {
		files: [{
			cwd: './',
			src: config.src,
			dest: config.dest,
			expand: false
		}]
	};
	console.log(modGrunt.var.taskDefs.copy['move_rename-'+mrCounter]);
	modGrunt.var.taskArr.push('copy:move_rename-'+mrCounter);
	modGrunt.var.taskDefs.clean['move_rename-'+mrCounter] = [config.delete];
	modGrunt.var.taskArr.push('clean:move_rename-'+mrCounter);
}


modGrunt.var.taskBuilders.build = function() {
    var prop;
    function defineModules() {
        modGrunt.var.taskDefs.shell = {
            options: {
                stderr: false
            }
        };
        modGrunt.var.taskDefs.clean = {};
        modGrunt.var.taskDefs.ejs = {};
        modGrunt.var.taskDefs.copy = {};
        modGrunt.var.taskDefs.jsbeautifier = {};
        modGrunt.var.taskDefs['string-replace'] = {};
        modGrunt.var.taskDefs.sass = {};
        modGrunt.var.taskDefs.jsbeautifier = {};

    }
    defineModules();

	function deleteOld() {
		modGrunt.var.taskDefs.clean.buffer = [compiledFolder];
		modGrunt.var.taskArr.push('clean:buffer');
	}
	if(flags.delete) deleteOld();




    function showMSG() {
        modGrunt.var.taskDefs.shell.showMSG = {
            command: 'echo Running build task...'
        };
        modGrunt.var.taskArr.push('shell:showMSG');
    }
    showMSG();
    function CompileSASS() {
        var sassFiles = utils.findFileType(devFolder, 'scss', function(that) {
            var name = that.split('/')[that.split('/').length - 1];
            return name.substr(0, 1) !== '_'; // filter function to exclude files starting with "_"
        });
        var configObj = {};
        for (i = 0; i < sassFiles.length; i++) {
            configObj[sassFiles[i].replace('.scss', '.css')] = sassFiles[i];
        }
        modGrunt.var.taskDefs.sass[0] = {
            options: {
                style: 'compressed',
                sourcemap: 'auto'
            },
            files: configObj
        };
        modGrunt.var.taskArr.push('sass:0');
    }
    CompileSASS();

    function CopySource() {
        for (i = 0; i < willBuild.length; i++) {
            modGrunt.var.taskDefs.copy['source' + i] = {
                files: [{
                    cwd: devFolder + '/slides',
                    src: '**/*',
                    dest: compiledFolder + '/' + willBuild[i]+' - '+timeStamp,
                    expand: true
                }]
            };
            modGrunt.var.taskArr.push('copy:source' + i);
        }
    }
    CopySource();

    function CompileEJS() {

		var srcArr = utils.findFileType(devFolder+'/slides', 'ejs', function() {
			return true;
		});
		function BuildTask(config){
			modGrunt.var.taskDefs.ejs[config.id1+'-'+config.id2] = {
				cwd: config.cwd,
				src: config.src,
				dest: config.dest,
				expand: true,
				ext: '.html',
				options: {
					fullPage: config.fullPage
				}
			};
			modGrunt.var.taskArr.push('ejs:'+config.id1+'-'+config.id2);
		}
		var rel = devFolder+'/slides';
		var makeFull;
		for (i=0; i<srcArr.length; i++) {
			for (j=0; j<willBuild.length; j++) {
				makeFull = true;
				if(willBuild[j] === 'native') makeFull = false;
				BuildTask({
					id1: i,
					id2: j,
					cwd: rel,
					src: srcArr[i].replace(rel+'/', ''),
					dest: compiledFolder.replace('./', '') + '/' + willBuild[j] +' - '+timeStamp,
					fullPage: makeFull
				});
			}
		}
		if(willBuild.indexOf('native') > -1){
			BuildTask({
				id1: 'native',
				id2: 'wrapper',
				cwd: rel,
				src: `${HomeSlide}/index.ejs`.replace(rel+'/', ''),
				dest: compiledFolder.replace('./', '') + '/native' +' - '+timeStamp+'/wrapper',
				fullPage: makeFull
			});
			move_rename({
				src: compiledFolder.replace('./', '') + '/native' +' - '+timeStamp+`/wrapper/${HomeSlide}/index.html`,
				dest: compiledFolder.replace('./', '') + '/native' +' - '+timeStamp+'/index.html',
				delete: compiledFolder.replace('./', '') + '/native' +' - '+timeStamp+'/wrapper/'
			});
		}
    }
    CompileEJS();

    function fixPaths() {
        modGrunt.var.taskDefs['string-replace'].fixPaths1 = {
            files: [{
                expand: true,
                cwd: compiledFolder + '/' + 'veeva' +' - '+timeStamp,
                src: ['**/*.html', '**/*.css', '**/*.js'],
                dest: compiledFolder + '/' + 'veeva' +' - '+timeStamp
            }],
            options: {
                replacements: [{
                    pattern: /..\/..\/globalAssets/g,
                    replacement: 'globalAssets'
                }]
            }
        };
        modGrunt.var.taskArr.push('string-replace:fixPaths1');
		modGrunt.var.taskDefs['string-replace'].fixPaths2 = {
            files: [{
                expand: true,
                cwd: compiledFolder + '/' + 'mi' +' - '+timeStamp,
                src: ['**/*.html', '**/*.css', '**/*.js'],
                dest: compiledFolder + '/' + 'mi' +' - '+timeStamp
            }],
            options: {
                replacements: [{
                    pattern: /..\/..\/globalAssets/g,
                    replacement: 'globalAssets'
                }]
            }
        };
        modGrunt.var.taskArr.push('string-replace:fixPaths2');
		modGrunt.var.taskDefs['string-replace'].fixPaths3 = {
            files: [{
                expand: true,
                cwd: compiledFolder + '/' + 'native' +' - '+timeStamp,
                src: ['**/*.html', '**/*.css', '**/*.js'],
                dest: compiledFolder + '/' + 'native' +' - '+timeStamp
            }],
            options: {
                replacements: [{
                    pattern: /..\/globalAssets/g,
                    replacement: 'globalAssets'
                }]
            }
        };
        modGrunt.var.taskArr.push('string-replace:fixPaths3');
    }
    fixPaths();

    function CopyShared() {
        for (i = 0; i < slides.length; i++) {
            for (j = 0; j < willBuild.length; j++) {
				if(willBuild[j] === 'native'){
					if(!i){
						modGrunt.var.taskDefs.copy['shared-' + i + '-' + j] = {
		                    files: [{
		                        cwd: devFolder + '/globalAssets',
		                        src: '**/*',
		                        dest: compiledFolder + '/' + willBuild[j]+' - '+timeStamp + '/globalAssets',
		                        expand: true
		                    }]
		                };
		                modGrunt.var.taskArr.push('copy:shared-' + i + '-' + j);
					}
				}
				else{
					modGrunt.var.taskDefs.copy['shared-' + i + '-' + j] = {
	                    files: [{
	                        cwd: devFolder + '/globalAssets',
	                        src: '**/*',
	                        dest: compiledFolder + '/' + willBuild[j]+' - '+timeStamp + '/' + slides[i] + '/globalAssets',
	                        expand: true
	                    }]
	                };
	                modGrunt.var.taskArr.push('copy:shared-' + i + '-' + j);
				}

            }
        }
    }
    CopyShared();
	function setPlatform(){
		for (i=0; i<willBuild.length; i++) {
			 modGrunt.var.taskDefs['string-replace']['setPlatform-'+willBuild[i]] = {
	             files: [{
	                 expand: true,
	                 cwd: compiledFolder + '/' + willBuild[i]+' - '+timeStamp,
	                 src: ['**/*.html'],
	                 dest: compiledFolder + '/' + willBuild[i]+' - '+timeStamp
	             }],
	             options: {
	                 replacements: [{
	                     pattern: 'desktop.js',
	                     replacement: willBuild[i]+'.js'
	                 }]
	             }
	         };
	         modGrunt.var.taskArr.push('string-replace:setPlatform-'+willBuild[i]);
		}
	}
	setPlatform();
    function PrettifyHTML() {
        modGrunt.var.taskDefs.jsbeautifier.BuiltFiles = {
            src: [compiledFolder + '/**/*.html'],
            options: {
                js: {
                    indentSize: 1,
                    indent_char: '\t'
                }
            }
        };
        modGrunt.var.taskArr.push('jsbeautifier:BuiltFiles');
        modGrunt.var.taskDefs['string-replace'].emptyLines = {
            files: [{
                expand: true,
                cwd: compiledFolder,
                src: ['**/*.html'],
                dest: compiledFolder
            }],
            options: {
                replacements: [{
                    pattern: /^(?:[\t ]*(?:\r?\n|\r))+/gm,
                    replacement: ''
                }]
            }
        };
        modGrunt.var.taskArr.push('string-replace:emptyLines');
    }
    PrettifyHTML();

	function renameVeevaFiles() {
        var arr = [];
		var path;
		var slideName;
        for (i = 0; i < slides.length; i++) {
			path = compiledFolder + '/veeva'+' - '+timeStamp +'/' + slides[i] + '/';
			slideName = path.split('/');
			slideName = slideName[slideName.length-2];
			move_rename({
				src: path+'index.html',
				dest: path + slides[i] + '.html',
				delete: path+'index.html'
			});
			move_rename({
				src:path+'full.jpg',
				dest: path+slideName+'-full.jpg',
				delete: path+'full.jpg'
			});
			move_rename({
				src:path+'thumb.jpg',
				dest: path+slideName+'-thumb.jpg',
				delete: path+'thumb.jpg'
			});
		}
    }
    if (willBuild.indexOf('veeva') > -1) {
        renameVeevaFiles();
    }
	function removeSourceCode(){
		modGrunt.var.taskDefs.clean.sourceCode = [compiledFolder+'/**/*.ejs', compiledFolder+'/**/*.scss', compiledFolder+'/**/*.map'];
        modGrunt.var.taskArr.push('clean:sourceCode');
	}
	removeSourceCode();
};
