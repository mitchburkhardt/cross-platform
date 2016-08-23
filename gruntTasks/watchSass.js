var devFolder = './dev';
var prop;

function defineModules() {
    taskDefs.shell = {
        options: {
            stderr: false
        }
    };
}
defineModules();

function runCompiler() {
    taskDefs.shell.compile = {
        command: 'grunt compileSass'
    };
    taskArr.push('shell:compile');
}
runCompiler();

function watchChanges() {
    taskDefs.watch = {
        css: {
            files: ['**/*.scss'],
            tasks: ['shell:compile'],
            options: {
                spawn: false
            }
        }
    };
    taskArr.push('watch:css');
}
watchChanges();
