function defineTasks(){
	taskDefs.shell = {options: {stderr: false}};
}
defineTasks();



function showMSG() {
    taskDefs.shell.showMSG = {
        command: 'echo This project has no default task'
    };
    taskArr.push('shell:showMSG');
}
showMSG();
