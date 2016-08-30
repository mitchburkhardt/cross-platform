// TODO: Intergrate with auto-upload platform, (hopefully NODEjs)
	// TODO: generate slideName.ctl based on form input (for Veeva auto-uploads)
	// TODO grunt deploy taskDefs
		// TODO: SVN commit on deploy




require('./AMnodeUtils.js');
global.fs = require('fs');
global.path = require('path');
var tasksFolder = './gruntTasks';
var tasks = utils.findFileType(tasksFolder, 'js', function(){return true;});
global.taskDefs = {};
global.taskArr = [];
var taskAtHand = null;
global.projectConfig = JSON.parse(fs.readFileSync('./dev/project.json', 'utf-8')); //project specific
global.HomeSlide = projectConfig.slides[0].name; //project specific
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
