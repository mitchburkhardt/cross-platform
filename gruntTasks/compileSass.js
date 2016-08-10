if (!modGrunt.var.taskDefs) modGrunt.var.taskDefs = {};
var devFolder = './dev';
modGrunt.var.taskBuilders.compileSass = function() {
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
            command: 'echo compiling SCSS files...'
        };
        // modGrunt.var.taskArr.push('shell:showMSG');
    }
    showMSG();

	function CompileSASS() {
        var sassFiles = utils.findFileType(devFolder, 'scss', function(that) {
            var name = that.split('/')[that.split('/').length - 1];
            return name.substr(0, 1) !== '_'; // filter function to exclude files starting with "_"
        });
		console.log(sassFiles);
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


};
