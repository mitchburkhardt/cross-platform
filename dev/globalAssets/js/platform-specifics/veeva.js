app.nav.loadParent = function(slideName, direction) {
	console.log('dummy function to navigate to parent slide:  -  ',slideName,direction);
    // TODO: load parent function for MI touch
};
app.nav.trackChild = function(GUID, type) {
    console.log('dummy tracking function:  -  ',GUID, '  -  ', type);
    // TODO: track child function for Veeva touch
};
app.platform = {
    init: function() {
        var type = 'parent';
        var current = $('.view.active .ParentSlide').attr('activechild') * 1;
        if (current > 1) type = 'child';
        app.nav.trackChild(app.nav.var.GUIDs[current - 1], type);
    }
};
