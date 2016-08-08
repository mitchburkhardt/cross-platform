require('../AMnodeUtils.js');
global.fs = require('fs');
global.path = require('path');
global.projectConfig = JSON.parse(fs.readFileSync('./dev/project.json', 'utf-8'));
global.HomeSlide = projectConfig.slides[1];
global.modGrunt = {
    var: {
        fs: require('fs'),
        path: require('path'),
        taskDefs: {},
        taskArr: [],
        tasks: ['default', 'build', 'watchSass'],
        task: null,
        taskBuilders: {},
		devFolder: 'dev',
	    BuiltFolder: 'compiled',
	    bufferFolder: '_-_tmp_bld_flder'
    },
    util: {
        var: {
            that: null
        },
        getDirectories: function(dir) {
            var that = this;
            var results = [];
            var list = that.var.that.var.fs.readdirSync(dir);
            list.forEach(function(file) {
                file = dir + '/' + file;
                var stat = that.var.that.var.fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    results.push(file);
                }
            });
            return results;
        },
        getDirectoriesRecursive: function(dir) {
            var that = this;
            var results = [];
            var list = that.var.that.var.fs.readdirSync(dir);
            list.forEach(function(file) {
                file = dir + '/' + file;
                var stat = that.var.that.var.fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    results = results.concat(that.getDirectoriesRecursive(file));
                    results.push(file);
                }
            });
            return results;
        },
        findFileType: function(dir, ext) {
            var that = this;
            var results = [];
            var list = that.var.that.var.fs.readdirSync(dir);
            list.forEach(function(file) {
                file = dir + '/' + file;
                var stat = that.var.that.var.fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    results = results.concat(that.findFileType(file, ext));
                } else if (stat && file.substr(file.length - (ext.length + 1)) === '.' + ext) {
                    results.push(file);
                }
            });
            return results;
        },
    },
    init: function() {
        this.util.var.that = this;
        for (i = 0; i < this.var.tasks.length; i++) {
            if (process.argv.indexOf(this.var.tasks[i]) > -1) this.var.task = this.var.tasks[i];
        }
        if (!this.var.task) this.var.task = 'default';
    }
};
modGrunt.init();
switch (modGrunt.var.task) {
    case 'default':
        require('./default.js');
        break;
    case 'build':
        require('./build.js');
        break;
	case 'watchSass':
        require('./watchSass.js');
        break;
    default:
}
