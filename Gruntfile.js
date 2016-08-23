require('./AMnodeUtils.js');
global.fs = require('fs');
global.path = require('path');
var tasksFolder = './gruntTasks';
var tasks = utils.findFileType(tasksFolder, 'js', function(){return true;});
global.taskDefs = {};
global.taskArr = [];
global.taskAtHand = null;
global.projectConfig = JSON.parse(fs.readFileSync('./dev/project.json', 'utf-8'));
global.HomeSlide = projectConfig.slides[0][0];
var params = process.argv;
var a;

for (i=0; i<tasks.length; i++) {
	tasks[i] = tasks[i].replace(tasksFolder+'/', '').replace('.js', '');
}
for (i=0; i<params.length; i++) {
	a = params[i].replace(/-/g, '');
	if(tasks.indexOf(a) > -1){
		taskAtHand = a;
	}
}
if(!taskAtHand) taskAtHand = 'default';
taskDefs[taskAtHand] = {};
require(tasksFolder+'/'+taskAtHand+'.js');


module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig(taskDefs);
    grunt.registerTask(taskAtHand, taskArr);
};
