if (!modGrunt.var.taskDefs) modGrunt.var.taskDefs = {};
var devFolder = './dev';
var compiledFolder = './releases';
var buildTypes = ['-all', '-native', '-veeva', '-mi'];
var willBuild = [];
var slides = utils.getDirectories(devFolder + '/slides');
var timeStamp;
(function() {
    var m = 'AM';
    var ds = new Date().toString().split(' ');
    var tz = ds[6].replace('(', '').replace(')', '');
    var ts = ds[4].split(':');
    if (ts[0] * 1 > 12) {
        m = 'PM';
        ts[0] = ts[0] - 12;
    }
    ts = ts.join('.') + '-' + m;
    ds = ds.slice(1, 4).join('-');
    timeStamp = ds + ' ' + ts + ' ' + tz;
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
    if (process.argv.indexOf('-' + prop) > -1) flags[prop] = true;
}
var mrCounter = 0;

function move_rename(config) {
    mrCounter++;
    modGrunt.var.taskDefs.copy['move_rename-' + mrCounter] = {
        files: [{
            cwd: './',
            src: config.src,
            dest: config.dest,
            expand: false
        }]
    };
    modGrunt.var.taskArr.push('copy:move_rename-' + mrCounter);
    modGrunt.var.taskDefs.clean['move_rename-' + mrCounter] = [config.delete];
    modGrunt.var.taskArr.push('clean:move_rename-' + mrCounter);
}
function copyFolder(src, dst) {
	modGrunt.var.taskDefs.copy[dst] = {
		files: [{
			cwd: src,
			src: '**/*',
			dest: dst,
			expand: true
		}]
	};
	modGrunt.var.taskArr.push('copy:' + dst);
}
function zipFolder(dir, zip){
	var zipName = zip.replace('.zip', '').split('/');
	zipName = zipName.pop();
	modGrunt.var.taskDefs.compress[zip] = {
		options: {
			archive: zip
		},
		expand: true,
		cwd: dir,
		src: ['**/*'],
		dest: zipName+'/'
	};
	modGrunt.var.taskArr.push('compress:'+zip);
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
        modGrunt.var.taskDefs['file-creator'] = {};
        modGrunt.var.taskDefs.zip_directories = {};
        modGrunt.var.taskDefs.compress = {};
        modGrunt.var.taskDefs.cssmin = {};
    }
    defineModules();

    function deleteOld() {
        modGrunt.var.taskDefs.clean.buffer = [compiledFolder];
        modGrunt.var.taskArr.push('clean:buffer');
    }
    if (flags.delete) deleteOld();

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
                    dest: compiledFolder + '/' + timeStamp + '/' + willBuild[i],
                    expand: true
                }]
            };
            modGrunt.var.taskArr.push('copy:source' + i);
        }
    }
    CopySource();

    function CompileEJS() {
        var srcArr = utils.findFileType(devFolder + '/slides', 'ejs', function() {
            return true;
        });

        function BuildTask(config) {
            modGrunt.var.taskDefs.ejs[config.id1 + '-' + config.id2] = {
                cwd: config.cwd,
                src: config.src,
                dest: config.dest,
                expand: true,
                ext: '.html',
                options: {
                    slide: config.slide,
                    fullPage: config.fullPage,
                    buildType: config.buildType,
                    nativeRoot: config.nativeRoot,
                    home: config.home
                }
            };
            modGrunt.var.taskArr.push('ejs:' + config.id1 + '-' + config.id2);
        }
        var configObj;
        var rel = devFolder + '/slides';
        var makeFull;
        var nativeRoot;
        var FrameIndex;
        var slideID;
        for (i = 0; i < srcArr.length; i++) {
            for (j = 0; j < willBuild.length; j++) {
                if (srcArr[i] !== './dev/slides/index.ejs' || willBuild[j] === 'native') {
                    FrameIndex = (srcArr[i] === './dev/slides/index.ejs');
                    nativeRoot = (FrameIndex && willBuild[j] === 'native');
                    makeFull = (willBuild[j] !== 'native' || FrameIndex);
                    slideID = srcArr[i].split('/')[3];
                    configObj = {
                        id1: i,
                        id2: j,
                        cwd: rel,
                        src: srcArr[i].replace(rel + '/', ''),
                        dest: compiledFolder.replace('./', '') + '/' + timeStamp + '/' + willBuild[j],
                        fullPage: makeFull,
                        buildType: willBuild[j],
                        nativeRoot: FrameIndex,
                        home: HomeSlide,
                        slide: slideID
                    };
                    BuildTask(configObj);
                }
            }
        }
    }
    CompileEJS();

    function CopyShared() {

        for (i = 0; i < slides.length; i++) {
            for (j = 0; j < willBuild.length; j++) {
                if (willBuild[j] === 'native') {
                    if (!i) {
                        copyFolder(devFolder + '/globalAssets', compiledFolder + '/' + timeStamp + '/' + willBuild[i] + '/globalAssets');
                    }
                } else {
                    copyFolder(devFolder + '/globalAssets', compiledFolder + '/' + timeStamp + '/' + willBuild[j] + '/' + slides[i] + '/globalAssets');
                }
            }
        }
    }
    CopyShared();

    function setPlatform() {
        for (i = 0; i < willBuild.length; i++) {
            modGrunt.var.taskDefs['string-replace']['setPlatform-' + willBuild[i]] = {
                files: [{
                    expand: true,
                    cwd: compiledFolder + '/' + timeStamp + '/' + willBuild[i],
                    src: ['**/*.html'],
                    dest: compiledFolder + '/' + timeStamp + '/' + willBuild[i]
                }],
                options: {
                    replacements: [{
                        pattern: 'desktop.js',
                        replacement: willBuild[i] + '.js'
                    }]
                }
            };
            modGrunt.var.taskArr.push('string-replace:setPlatform-' + willBuild[i]);
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
            path = compiledFolder + '/' + timeStamp + '/veeva/' + slides[i] + '/';
            slideName = path.split('/');
            slideName = slideName[slideName.length - 2];
            move_rename({
                src: path + 'index.html',
                dest: path + slides[i] + '.html',
                delete: path + 'index.html'
            });
            move_rename({
                src: path + 'full.jpg',
                dest: path + slideName + '-full.jpg',
                delete: path + 'full.jpg'
            });
            move_rename({
                src: path + 'thumb.jpg',
                dest: path + slideName + '-thumb.jpg',
                delete: path + 'thumb.jpg'
            });
        }
    }
    if (willBuild.indexOf('veeva') > -1) {
        renameVeevaFiles();
    }

    function buildParametersXml() {
        function buildTask(slideIndex, endOfFile) {
            var slideName = projectConfig.slides[slideIndex][0];
            var guid = projectConfig.slides[slideIndex][1];
            modGrunt.var.taskDefs['file-creator']['parameters-' + slideName] = {};
            modGrunt.var.taskDefs['file-creator']['parameters-' + slideName][compiledFolder + '/' + timeStamp + '/mi/' + projectConfig.slides[prop][0] + '/Parameters/Parameters.xml'] = function(fs, fd, done) {
                fs.writeSync(fd, `<Sequence Id="${guid}" xmlns="urn:param-schema">\r\n${endOfFile}`);
                done();
            };
            modGrunt.var.taskArr.push('file-creator:parameters-' + slideName);
        }
        var bottomXML = '<Links>';
        for (prop in projectConfig.slides) {
            bottomXML += `\r\n\t<Link SequenceId="${projectConfig.slides[prop][1]}" />`;
        }
        bottomXML += '\r\n</Links>\r\n</Sequence>';
        for (prop in projectConfig.slides) {
            buildTask(prop, bottomXML);
        }
    }
    if (willBuild.indexOf('mi') > -1) {
        buildParametersXml();
    }

    function removeSourceCode() {
        modGrunt.var.taskDefs.clean.sourceCode = [compiledFolder + '/**/*.ejs', compiledFolder + '/**/*.scss', compiledFolder + '/**/*.map'];
        modGrunt.var.taskArr.push('clean:sourceCode');
    }
    removeSourceCode();

    function MinCss() {
		modGrunt.var.taskDefs.cssmin.output = {
            files: [{
                expand: true,
                cwd: compiledFolder,
                src: ['**/*.css'],
                dest: compiledFolder,
                ext: '.css'
            }]
        };
		modGrunt.var.taskArr.push('cssmin:output');

	}
    MinCss();

	function archiveSource() {
		zipFolder(devFolder, compiledFolder + '/' + timeStamp + '/sourceCode.zip');
    }
    archiveSource();

	function zipSlides(){
		for (i=0; i<slides.length; i++) {
			for (j=0; j<willBuild.length; j++) {
				if(willBuild[j] !== 'native'){
					zipFolder(compiledFolder + '/' + timeStamp+'/'+willBuild[j]+'/'+slides[i], compiledFolder + '/' + timeStamp+'/'+willBuild[j]+'/zipped/'+slides[i]+'.zip');
				}
			}
		}
	}
	zipSlides();
};
