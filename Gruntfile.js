require('./gruntTasks/main.js');
modGrunt.var.taskBuilders[modGrunt.var.task]();
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig(modGrunt.var.taskDefs);
    grunt.registerTask(modGrunt.var.task, modGrunt.var.taskArr);
};
