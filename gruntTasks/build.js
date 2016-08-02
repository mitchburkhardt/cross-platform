if(!modGrunt.var.taskDefs) modGrunt.var.taskDefs = {};
var devFolder = './dev';
var bufferFolder = './---__---buffer---__---';
var buildTypes = ['-all', '-native', '-veeva', '-mi'];
var willBuild = [];
var slides = utils.getDirectories(devFolder+'/slides');
for (i=0; i<buildTypes.length; i++) {
	if(process.argv.indexOf(buildTypes[i]) > -1){
		willBuild.push(buildTypes[i].substr(1,buildTypes[i].length-1));
	}
}
if(willBuild.indexOf('all') > -1 || !willBuild.length) willBuild.push('native', 'veeva', 'mi');


modGrunt.var.taskBuilders.build = function() {
	var prop;
	function defineModules(){
		modGrunt.var.taskDefs.shell = {options: {stderr: false}};
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
		modGrunt.var.taskDefs.shell.showMSG = {command: 'echo Running build task...'};
        modGrunt.var.taskArr.push('shell:showMSG');
    }
    showMSG();
	function deleteOld() {
        modGrunt.var.taskDefs.clean.buffer = [bufferFolder];
        modGrunt.var.taskArr.push('clean:buffer');
    }
    deleteOld();
	function CompileSASS() {
		var sassFiles = utils.findFileType(devFolder, 'scss', function(that) {
			var name = that.split('/')[that.split('/').length - 1];
			return name.substr(0, 1) !== '_'; // filter function to exclude files starting with "_"
		});
		var configObj = {};
		for (i=0; i<sassFiles.length; i++) {
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
	function CopySource(){
		for (i=0; i<willBuild.length; i++) {
			modGrunt.var.taskDefs.copy['source'+i] = {
	            files: [{
	                cwd: devFolder+'/slides',
	                src: '**/*',
	                dest: bufferFolder+'/'+willBuild[i],
	                expand: true
	            }]
	        };
			modGrunt.var.taskArr.push('copy:source'+i);
			// console.log(modGrunt.var.taskDefs.copy['source'+i]);
		}
    }
    CopySource();
	function CompileEJS() {
        for (i=0; i<slides.length; i++) {
            modGrunt.var.taskDefs.ejs[i+1] = {
                cwd: modGrunt.var.devFolder,
                src: ['slides/'+slides[i]+'/index.ejs'],
                dest: bufferFolder.replace('./', '')+'/ejs',
                expand: true,
                ext: '.html',
                options: {
                    pages: slides,
                    Built: true
                }
            };
            modGrunt.var.taskArr.push('ejs:'+(i+1));
        }
		for (i=0; i<willBuild.length; i++) {
			modGrunt.var.taskDefs.copy['ejs'+'-'+willBuild[i]] = {
	            files: [{
	                cwd: bufferFolder+'/ejs/slides',
	                src: '**/*',
	                dest: bufferFolder+'/'+willBuild[i],
	                expand: true
	            }]
	        };
			modGrunt.var.taskArr.push('copy:ejs'+'-'+willBuild[i]);
			// console.log(modGrunt.var.taskDefs.copy['source'+i]);
		}
		var arr = [bufferFolder+'/ejs'];
		arr = arr.concat(utils.findFileType(bufferFolder, 'ejs', function(){return true;}));
		arr = arr.concat(utils.findFileType(bufferFolder, 'map', function(){return true;}));
		arr = arr.concat(utils.findFileType(bufferFolder, 'scss', function(){return true;}));
		modGrunt.var.taskDefs.clean.ejs = arr;
		modGrunt.var.taskArr.push('clean:ejs');
    }
    CompileEJS();
	function fixPaths(){
        modGrunt.var.taskDefs['string-replace'].fixPaths = {
            files: [{
                expand: true,
                cwd: bufferFolder,
                src: ['**/*.html', '**/*.css', '**/*.js'],
                dest: bufferFolder
            }],
            options: {
                replacements: [
                    {
                        pattern: /..\/..\/globalAssets/g,
                        replacement: './globalAssets'
                    }
                ]
            }
        };
        modGrunt.var.taskArr.push('string-replace:fixPaths');
    }
    fixPaths();
	function CopyShared(){
		for (i=0; i<slides.length; i++) {
			for (j=0; j<willBuild.length; j++) {
	            modGrunt.var.taskDefs.copy['shared-'+i+'-'+j] = {
	                files: [{
	                    cwd: devFolder+'/globalAssets',
	                    src: '**/*',
	                    dest: bufferFolder+'/'+willBuild[j]+'/'+slides[i]+'/globalAssets',
	                    expand: true
	                }]
	            };
	            modGrunt.var.taskArr.push('copy:shared-'+i+'-'+j);
			}
		}

    }
    CopyShared();
	function renameVeevaIndexes(){
		var arr = [];
		for (i=0; i<slides.length; i++) {
			arr.push(bufferFolder+'/veeva/'+slides[i]+'/index.html');
			modGrunt.var.taskDefs.copy['renameVeeva-'+i] = {
				files: [{
					cwd: './',
					src: bufferFolder+'/veeva/'+slides[i]+'/index.html',
					dest: bufferFolder+'/veeva/'+slides[i]+'/'+slides[i]+'.html',
					expand: false
				}]
			};
			modGrunt.var.taskArr.push('copy:renameVeeva-'+i);
		}
		modGrunt.var.taskDefs.clean.renameVeeva = [arr];
		modGrunt.var.taskArr.push('clean:renameVeeva');
	}
	if(willBuild.indexOf('veeva') > -1){
		renameVeevaIndexes();
	}
	function PrettyfyHTML(){
		modGrunt.var.taskDefs.jsbeautifier.BuiltFiles = {
                src: [bufferFolder+'/**/*.html'],
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
                cwd: bufferFolder,
                src: ['**/*.html'],
                dest: bufferFolder
            }],
            options: {
                replacements: [
                    {
                        pattern: /^(?:[\t ]*(?:\r?\n|\r))+/gm,
                        replacement: ''
                    }
                ]
            }
        };
        modGrunt.var.taskArr.push('string-replace:emptyLines');
	}
	PrettyfyHTML();
};
