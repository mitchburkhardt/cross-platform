app.nav.loadParent = function(slideName, direction) {
	console.log('dummy function to navigate to parent slide:  -  ',slideName,direction);
    // TODO: load parent function for MI touch
};
app.nav.trackChild = function(GUID, type) {
    console.log('dummy tracking function:  -  ',GUID, '  -  ', type);
    return false;
};
app.platform = {
    init: function() {}
};
