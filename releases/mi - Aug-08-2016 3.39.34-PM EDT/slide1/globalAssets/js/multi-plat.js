var app = {
    pageScripts: {},
    nav: {
        var: {
            view: {},
            MainButtons: {},
            RunFlag: 0,
            lastURL: '',
            currentURL: 'views/home/index.html'
        },
        load: function(url, direction){
			// platform specific definitions are defined in the "platform-specifics" folder
		},
        init: function() {
            $.extend($.expr[':'], {
                scolling: function(el) {
                    return $(el).css('overflow-y') === 'scroll';
                }
            });
        }
    },
    init: function() {

	}
};
app.init();