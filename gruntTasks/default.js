if(!modGrunt.var.taskDefs) modGrunt.var.taskDefs = {};

modGrunt.var.taskBuilders.default = function() {
    function showMSG() {
        global.modGrunt.var.taskDefs.shell = {
            options: {
                stderr: false
            },
            showMSG: {
                command: 'echo This project has no default task'
            }
        };
        global.modGrunt.var.taskArr.push('shell:showMSG');
    }
    showMSG();
};
