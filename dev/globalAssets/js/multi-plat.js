// TODO: scrolling ISI feature
// TODO: framework navigation (all 3)
var app = {
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
	iscroll: {
		scroller: {},
		spawn: function(config) {
			console.log('foo');
			var that = this;
			var el = $(config.location);
			that.scroller[config.name] = new IScroll(config.location+' .inner', {
				scrollbars: true,
				mouseWheel: true,
				interactiveScrollbars: true,
				shrinkScrollbars: 'scale',
				fadeScrollbars: true,
				probeType: 3,
				tap: true
			});
			that.scroller[config.name].config = config;
			el.on('tap', config.tap);
			that.scroller[config.name].on('scroll', config.scroll);
			that.scroller[config.name].off('scroll');
			that.scroller[config.name].location = config.location;
			that.scroller[config.name].el = el;

		},
		kill: function(name) {
			var that = this;
			that.scroller[name].el.off('tap');
			that.scroller[name].destroy();
			$(that.scroller[name].location).attr('style', '');
			that.scroller[name] = null;
		},
		reset: function(name){
			var that = this;
			var config = that.scroller[name].config;
			that.kill(name);
			setTimeout(function(){
				that.spawn(config);
			},0);
		}
	},
	bottomScroller: function(){
		var that = this;
		that.iscroll.spawn(
			{
				name: 'bottomScroller',
				location: '#bottomScroller',
				tap: function(e){
					console.log('tap');
				},
				scroll: function(e){
					console.log('scroll');
				}
			}
		);
		setTimeout(function(){
			that.iscroll.reset('bottomScroller');
		},5000);
	},
    init: function() {
		this.bottomScroller();
	}
};
app.init();
