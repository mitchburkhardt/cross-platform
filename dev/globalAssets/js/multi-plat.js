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
		chachedConfigs:{},
		diffs:{},
		diffCounter:0,
		spawn: function(config) {
			var that = this;
			var el = $(config.location);
			var scrollEvent = {x:0,y:0};
			that.chachedConfigs[config.name] = config;
			that.scroller[config.name] = new IScroll(config.location+' .inner', {
				scrollbars: true,
				mouseWheel: true,
				interactiveScrollbars: true,
				shrinkScrollbars: 'scale',
				fadeScrollbars: true,
				probeType: 3,
				tap: true
			});
			that.diffCounter++;
			that.scroller[config.name].config = config;
			el.on('tap', function(e){
				if(!e.isTrigger){config.tap(e);}
			});
			that.scroller[config.name].on('scroll', function(){
				if(that.scroller[config.name] === null) return false;
				scrollEvent.x = that.scroller[config.name].x;
				scrollEvent.y = that.scroller[config.name].y;
				that.chachedConfigs[config.name].x = scrollEvent.x;
				that.chachedConfigs[config.name].y = scrollEvent.y;

				config.scroll(scrollEvent);
			});
			that.scroller[config.name].off('scroll');
			that.scroller[config.name].location = config.location;
			that.scroller[config.name].el = el;

		},
		kill: function(name) {
			var that = this;
			var selector = $(that.scroller[name].location);
			var html = selector.html();
			selector.html(html);
			selector.find('.iScrollVerticalScrollbar').remove();
			that.scroller[name].el.off('tap');
			that.scroller[name].destroy();
			$(that.scroller[name].location).attr('style', '');
			that.scroller[name] = null;
		},
		revive: function(name){
			this.spawn(this.chachedConfigs[name]);
			this.scroller[name].scrollTo(this.chachedConfigs[name].x, this.chachedConfigs[name].y);
		},
		reset: function(name){
			var that = this;
			var config = that.scroller[name].config;
			that.kill(name);
			setTimeout(function(){
				that.spawn(config);
			},0);
		},
		scrollTo: function(name, x, y){
			this.scroller[name].scrollTo(x, y);
		},
		get(name){
			return this.scroller[name];
		}

	},
	bottomScroller: function(){
		var that = this;
		that.iscroll.spawn(
			{
				name: 'bottomScroller',
				location: '#bottomScroller',
				tap: function(e){
					console.log('_____________________');
					console.log('binding for tapping bottom scroller goes here');
					console.log('tap event object:');
					console.log(e);
					console.log('_____________________');

				},
				scroll: function(e){
					console.log('_____________________');
					console.log('binding for scrolling bottom scroller goes here');
					console.log('scroll event object:');
					console.log(e);
					console.log('_____________________');
				}
			}
		);
		  // tests for iscroll abstraction
		setTimeout(function(){
			console.log('killing');
			that.iscroll.kill('bottomScroller');
			setTimeout(function(){
				console.log('reviving');
				that.iscroll.revive('bottomScroller');
				setTimeout(function(){
					console.log('resetting');
					that.iscroll.reset('bottomScroller');
					setTimeout(function(){
						that.iscroll.scrollTo('bottomScroller', 0, -500);
						setTimeout(function(){
							console.log(that.iscroll.get('bottomScroller'));
						},50);
					},2500);
				},2500);
			},2500);
		},2500);

	},
    init: function() {
		this.bottomScroller();
	}
};
app.init();
