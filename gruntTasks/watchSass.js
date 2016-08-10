if (!modGrunt.var.taskDefs) modGrunt.var.taskDefs = {};
var devFolder = './dev';
modGrunt.var.taskBuilders.watchSass = function() {
    var prop;

    function defineModules() {
        modGrunt.var.taskDefs.shell = {
            options: {
                stderr: false
            }
        };
    }
    defineModules();

    function runCompiler() {
        modGrunt.var.taskDefs.shell.compile = {
            command: 'grunt compileSass'
        };
    }
    runCompiler();


    function watchChanges() {
        modGrunt.var.taskDefs.watch = {
            css: {
                files: ['**/*.scss'],
                tasks: ['shell:compile'],
                options: {
                    spawn: false
                }
            }
        };
		modGrunt.var.taskArr.push('watch:css');
    }
    watchChanges();
};
