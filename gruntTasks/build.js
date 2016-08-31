var devFolder = './dev';
var compiledFolder = './releases';
var buildTypes = ['-all', '-native', '-veeva', '-mi'];
var willBuild = [];
var slides = utils.getDirectories(devFolder + '/slides');
var prop;
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
    taskDefs.copy['move_rename-' + mrCounter] = {
        files: [{
            cwd: './',
            src: config.src,
            dest: config.dest,
            expand: false
        }]
    };
    taskArr.push('copy:move_rename-' + mrCounter);
    if (config.delete) {
        taskDefs.clean['move_rename-' + mrCounter] = [config.delete];
        taskArr.push('clean:move_rename-' + mrCounter);
    }
}

function copyFolder(src, dst) {
    taskDefs.copy[dst] = {
        files: [{
            cwd: src,
            src: '**/*',
            dest: dst,
            expand: true
        }]
    };
    taskArr.push('copy:' + dst);
}

function zipFolder(dir, zip) {
    var zipName = zip.replace('.zip', '').split('/');
    zipName = zipName.pop();
    taskDefs.compress[zip] = {
        options: {
            archive: zip
        },
        expand: true,
        cwd: dir,
        src: ['**/*'],
        dest: zipName + '/'
    };
    taskArr.push('compress:' + zip);
}

function defineTasks() {
    taskDefs.shell = {
        options: {
            stderr: false
        }
    };
    taskDefs.clean = {};
    taskDefs.ejs = {};
    taskDefs.copy = {};
    taskDefs.jsbeautifier = {};
    taskDefs['string-replace'] = {};
    taskDefs.sass = {};
    taskDefs.jsbeautifier = {};
    taskDefs['file-creator'] = {};
    taskDefs.zip_directories = {};
    taskDefs.compress = {};
    taskDefs.cssmin = {};
    taskDefs.sharp = {};
}
defineTasks();

function deleteOld() {
    var arr = [];
    var obj = utils.getFolderContents(compiledFolder);
    for (prop in obj) {
        arr.push(compiledFolder + '/' + prop);
    }
    taskDefs.clean.buffer = arr;
    taskArr.push('clean:buffer');
}
if (flags.delete) deleteOld();

function showMSG() {
    taskDefs.shell.showMSG = {
        command: 'echo Running build task...'
    };
    taskArr.push('shell:showMSG');
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
    taskDefs.sass[0] = {
        options: {
            style: 'compressed',
            sourcemap: 'auto'
        },
        files: configObj
    };
    taskArr.push('sass:0');
}
CompileSASS();

function CopySource() {
    for (i = 0; i < willBuild.length; i++) {
        taskDefs.copy['source' + i] = {
            files: [{
                cwd: devFolder + '/slides',
                src: '**/*',
                dest: compiledFolder + '/' + timeStamp + '/' + willBuild[i],
                expand: true
            }]
        };
        taskArr.push('copy:source' + i);
    }
}
CopySource();

function CompileEJS() {
    var srcArr = utils.findFileType(devFolder + '/slides', 'ejs', function() {
        return true;
    });

    function BuildTask(config) {
        taskDefs.ejs[config.id1 + '-' + config.id2] = {
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
                home: config.home,
                compiled: true,
				slides: slides,
				bottomScrollerHeight: projectConfig.bottomScrollerHeight,
				projectConfig: projectConfig
            }
        };
        taskArr.push('ejs:' + config.id1 + '-' + config.id2);
    }
    var configObj;
    var rel = devFolder + '/slides';
    var makeFull;
    var nativeRoot;
    var FrameIndex;
    var slideID;
    for (i = 0; i < srcArr.length; i++) {
        for (j = 0; j < willBuild.length; j++) {
            if (srcArr[i] !== `${devFolder}/slides/index.ejs` || willBuild[j] === 'native') {
                FrameIndex = (srcArr[i] === `${devFolder}/slides/index.ejs`);
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

function PrettifyHTML() {
    taskDefs.jsbeautifier.BuiltFiles = {
        src: [compiledFolder + '/**/*.html'],
        options: {
            html: {
                indentSize: 1,
                indent_char: '\t',
                unformatted: ["a", "sub", "sup", "b", "i", "u", "style"],
            }
        }
    };
    taskArr.push('jsbeautifier:BuiltFiles');
    taskDefs['string-replace'].cleanUp = {
        files: [{
            expand: true,
            cwd: compiledFolder,
            src: ['**/*.html'],
            dest: compiledFolder
        }],
        options: {
            replacements: [{
                pattern: /(^(?:[\t ]*(?:\r?\n|\r))+)(?=[^>]*(<|$))/gm,
                replacement: ''
            }, {
                pattern: /\r\n\/\*# sourceMappingURL/gm,
                replacement: '/*# sourceMappingURL'
            }, {
                pattern: /\n\/\*# sourceMappingURL/gm,
                replacement: '/*# sourceMappingURL'
            }, {
                pattern: /\n<\/style>/gm,
                replacement: '</style>'
            }, {
                pattern: /\r\n<\/style>/gm,
                replacement: '</style>'
            }]
        }
    };
    taskArr.push('string-replace:cleanUp');
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
    }
}
if (willBuild.indexOf('veeva') > -1) {
    renameVeevaFiles();
}

function buildParametersXml() {
    function buildTask(slideIndex, endOfFile) {
        var slideName = projectConfig.slides[slideIndex].name;
        var guid = projectConfig.slides[slideIndex]['GUID'];
		console.log(guid);
        taskDefs['file-creator']['parameters-' + slideName] = {};
		// console.log(compiledFolder + '/' + timeStamp + '/mi/' + slideName + '/Parameters/Parameters.xml');
        taskDefs['file-creator']['parameters-' + slideName][compiledFolder + '/' + timeStamp + '/mi/' + projectConfig.slides[prop].name + '/Parameters/Parameters.xml'] = function(fs, fd, done) {
            fs.writeSync(fd, `<Sequence Id="${guid}" xmlns="urn:param-schema">\r\n${endOfFile}`);
            done();
        };
        taskArr.push('file-creator:parameters-' + slideName);
    }
    var bottomXML = '\t<Links>';
    for (prop in projectConfig.slides) {
        bottomXML += `\r\n\t\t<Link SequenceId="${projectConfig.slides[prop].GUID}" />`;
    }
    bottomXML += '\r\n\t</Links>\r\n</Sequence>';
    for (prop in projectConfig.slides) {
        buildTask(prop, bottomXML);
    }
}
if (willBuild.indexOf('mi') > -1) {
    buildParametersXml();
}

function MakeThumbnails() {
    var platforms = [];
    for (i = 0; i < willBuild.length; i++) {
        if (willBuild[i] !== 'native') platforms.push(willBuild[i]);
    }
    var folder;
    var veeva = platforms.indexOf('veeva') > -1;
	var mi = platforms.indexOf('mi') > -1;
	var obj;
    if (platforms.length) {
        fs.mkdirSync(compiledFolder + '/' + 'thumb - ' + timeStamp);
        if (veeva) fs.mkdirSync(compiledFolder + '/' + 'full - ' + timeStamp);
        for (i = 0; i < slides.length; i++) {
            fs.mkdirSync(compiledFolder + '/' + 'thumb - ' + timeStamp + '/' + slides[i]);
            if (veeva) {
                fs.mkdirSync(compiledFolder + '/' + 'full - ' + timeStamp + '/' + slides[i]);
            }
            taskDefs.sharp['thumb-' + slides[i]] = {
                files: [{
                    expand: true,
                    cwd: `${devFolder}/slides/${slides[i]}/`,
                    src: ['screen.jpg'],
                    dest: compiledFolder + '/' + 'thumb - ' + timeStamp + '/' + slides[i]
                }],
                options: {
                    flatten: true,
                    resize: [200, 150],
                    rotate: 0
                }
            };
            taskArr.push('sharp:thumb-' + slides[i]);
            if (veeva) {
                taskDefs.sharp['full-' + slides[i]] = {
                    files: [{
                        expand: true,
                        cwd: `${devFolder}/slides/${slides[i]}/`,
                        src: ['screen.jpg'],
                        dest: compiledFolder + '/' + 'full - ' + timeStamp + '/' + slides[i]
                    }],
                    options: {
                        flatten: true,
                        resize: [1024, 768],
                        rotate: 0
                    }
                };
                taskArr.push('sharp:full-' + slides[i]);
            }
			if(veeva){
				move_rename({
		            src: compiledFolder + '/' + 'thumb - ' + timeStamp + '/' + 'home' +'/screen.jpg',
		            dest: `${compiledFolder}/${timeStamp}/veeva/${slides[i]}/${slides[i]}-thumb.jpg`,
		            delete: false
		        });
				move_rename({
		            src: compiledFolder + '/' + 'full - ' + timeStamp + '/' + 'home' +'/screen.jpg',
		            dest: `${compiledFolder}/${timeStamp}/veeva/${slides[i]}/${slides[i]}-full.jpg`,
		            delete: false
		        });
			}
			if(mi){
				move_rename({
		            src: compiledFolder + '/' + 'thumb - ' + timeStamp + '/' + 'home' +'/screen.jpg',
		            dest: `${compiledFolder}/${timeStamp}/mi/${slides[i]}/media/images/thumbnails/200x150.jpg`,
		            delete: false
		        });
			}
        }
		var bufferFolders = [compiledFolder + '/' + 'thumb - ' + timeStamp, compiledFolder + '/' + 'full - ' + timeStamp];
		for (i=0; i<slides.length; i++) {
			for (j=0; j<willBuild.length; j++) {
				bufferFolders.push(`${compiledFolder}/${timeStamp}/${willBuild[j]}/${slides[i]}/screen.jpg`);
			}
		}
		taskDefs.clean.previewIMGS = bufferFolders;
	    taskArr.push('clean:previewIMGS');
    }
}
MakeThumbnails();

function removeSourceCode() {
	var arr = [compiledFolder + '/**/*.ejs', compiledFolder + '/**/*.scss', compiledFolder + '/**/*.map'];
    taskDefs.clean.sourceCode = arr;
    taskArr.push('clean:sourceCode');
}
removeSourceCode();

function archiveSource() {
    zipFolder(devFolder, compiledFolder + '/' + timeStamp + '/__sourceCode.zip');
}
archiveSource();

function zipSlides() {
    for (i = 0; i < slides.length; i++) {
        for (j = 0; j < willBuild.length; j++) {
            if (willBuild[j] !== 'native') {
                zipFolder(compiledFolder + '/' + timeStamp + '/' + willBuild[j] + '/' + slides[i], compiledFolder + '/' + timeStamp + '/' + willBuild[j] + '/__zipped/' + slides[i] + '.zip');
            }
        }
    }
}
zipSlides();
