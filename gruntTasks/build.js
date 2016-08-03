if (!modGrunt.var.taskDefs) modGrunt.var.taskDefs = {};
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
        for (i = 0; i < slides.length; i++) {
            modGrunt.var.taskDefs.ejs[i + 1] = {
                cwd: modGrunt.var.devFolder,
                src: ['slides/' + slides[i] + '/index.ejs'],
                dest: compiledFolder.replace('./', '') + '/ejs',
                expand: true,
                ext: '.html',
                options: {
                    pages: slides,
                    Built: true
                }
            };
            modGrunt.var.taskArr.push('ejs:' + (i + 1));
        }
        for (i = 0; i < willBuild.length; i++) {
            modGrunt.var.taskDefs.copy['ejs' + '-' + willBuild[i]] = {
                files: [{
                    cwd: compiledFolder + '/ejs/slides',
                    src: '**/*',
                    dest: compiledFolder + '/' + willBuild[i]+' - '+timeStamp,
                    expand: true
                }]
            };
            modGrunt.var.taskArr.push('copy:ejs' + '-' + willBuild[i]);
        }
        var arr = [compiledFolder + '/ejs'];

        function addToArr(extension, callback) {
            var srcArr = utils.findFileType(devFolder, extension, function() {
                return true;
            });
            for (i = 0; i < srcArr.length; i++) {
                for (j = 0; j < willBuild.length; j++) {
                    arr.push(compiledFolder + '/' + willBuild[j]+' - '+timeStamp + srcArr[i].split('/slides')[1]);
                    if (i === srcArr.length - 1 && j === willBuild.length - 1) callback();
                }
            }
        }
        addToArr('ejs', function() {
            addToArr('scss', function() {
                addToArr('map', function() {
                    modGrunt.var.taskDefs.clean.ejs = arr;
                    modGrunt.var.taskArr.push('clean:ejs');
                });
            });
        });
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
						console.log('foo');
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

	function renameVeevaIndexes() {
        var arr = [];
        for (i = 0; i < slides.length; i++) {
            arr.push(compiledFolder + '/veeva'+' - '+timeStamp +'/' + slides[i] + '/index.html');
            modGrunt.var.taskDefs.copy['renameVeeva-' + i] = {
                files: [{
                    cwd: './',
                    src: compiledFolder + '/veeva'+' - '+timeStamp +'/' + slides[i] + '/index.html',
                    dest: compiledFolder + '/veeva'+' - '+timeStamp + '/' + slides[i] + '/' + slides[i] + '.html',
                    expand: false
                }]
            };
            modGrunt.var.taskArr.push('copy:renameVeeva-' + i);
        }
        modGrunt.var.taskDefs.clean.renameVeeva = [arr];
        modGrunt.var.taskArr.push('clean:renameVeeva');
    }
    if (willBuild.indexOf('veeva') > -1) {
        renameVeevaIndexes();
    }
};
