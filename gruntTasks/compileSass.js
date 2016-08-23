var devFolder = './dev';
var prop;

function defineModules() {
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
}
defineModules();

function showMSG() {
    taskDefs.shell.showMSG = {
        command: 'echo compiling SCSS files...'
    };
    // taskArr.push('shell:showMSG');
}
showMSG();

function CompileSASS() {
    var sassFiles = utils.findFileType(devFolder, 'scss', function(that) {
        var name = that.split('/')[that.split('/').length - 1];
        return name.substr(0, 1) !== '_'; // filter function to exclude files starting with "_"
    });
    console.log('\r\n\r\nattempting to compile:');
    var configObj = {};
    var delim = ',';
    for (i = 0; i < sassFiles.length; i++) {
        if (i === sassFiles.length - 2) delim = ',\r\n        and';
        else if (i === sassFiles.length - 1) delim = '';
        console.log('    ' + sassFiles[i] + delim);
        configObj[sassFiles[i].replace('.scss', '.css')] = sassFiles[i];
    }
    console.log('\r\n\r\n');
    taskDefs.sass[0] = {
        options: {
            style: 'expanded',
            sourcemap: 'auto'
        },
        files: configObj
    };
    taskArr.push('sass:0');
}
CompileSASS();
