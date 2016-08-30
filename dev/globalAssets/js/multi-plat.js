// TODO: framework navigation (all 3)
var app = {
    nav: {
        var: {
            view: {},
            MainButtons: {},
            RunFlag: 0,
            lastURL: '',
            currentURL: 'views/home/index.html',
            childrenMoving: 0
        },
        loadParent: function(url, direction) {
            // platform specific definitions are defined in the "platform-specifics" folder
        },
        loadChild: function(config) {
            var that = this;
            if (that.var.childrenMoving) return false;
            if (config.number < 1) return false;
            var activeParent = $('.view.active .ParentSlide');
            var CurrentSlide = activeParent.attr('activechild') * 1;
            var requestedSlide = config.number;
            if (CurrentSlide === requestedSlide) return false;
            var children = activeParent.find('.childSlide');
            if (config.number > children.length) return false;
            that.var.childrenMoving = 1;
            var celing;
            var floor;
            var removeNew;
            if (requestedSlide > CurrentSlide) {
                floor = CurrentSlide;
                ceiling = requestedSlide;
                removeNew = function(arr) {
                    arr.pop();
                };
            } else {
                floor = requestedSlide;
                ceiling = CurrentSlide;
                removeNew = function(arr) {
                    arr.shift();
                };
            }

            function range(start, end) {
                var buffer = [start];
                var loops = end - start;
                for (i = 0; i < loops; i++) {
                    buffer.push(start + (i + 1));
                }
                return buffer;
            }
            if (config.animated) {
                var needViz = range(floor, ceiling);
                easing = '450ms cubic-bezier(.51,1.06,.9,.99)';
                activeParent.addClass('gpu');
                activeParent[0].style.WebkitTransition = easing;
                activeParent[0].style.transition = easing;
                for (i = 0; i < needViz.length; i++) {
                    $(children[needViz[i] - 1]).addClass('viz');
                }
                setTimeout(function() {
                    activeParent.removeClass('gpu');
                    that.var.childrenMoving = 0;
                    removeNew(needViz);
                    for (i = 0; i < needViz.length; i++) {
                        $(children[needViz[i] - 1]).removeClass('viz');
                    }
                }, 480);
            } else {
				$(children[CurrentSlide-1]).removeClass('viz');
				$(children[requestedSlide-1]).addClass('viz');
				that.var.childrenMoving = 0;
			}
            activeParent.attr('activechild', config.number);
        },
        verticalSwipes: function() {
            var activeParent,
            	CurrentSlide,
				that = this;
            function setVars() {
                activeParent = $('.view.active .ParentSlide');
                CurrentSlide = activeParent.attr('activechild') * 1;
            }
            $('#container > div.view').on('swipeUp', function(e) {
                setVars();
				that.loadChild({number: CurrentSlide+1, animated: true});

            });
            $('#container > div.view').on('swipeDown', function(e) {
                setVars();
				that.loadChild({number: CurrentSlide-1, animated: true});
            });
        },
        init: function() {
            $.extend($.expr[':'], {
                scolling: function(el) {
                    return $(el).css('overflow-y') === 'scroll';
                }
            });
			this.verticalSwipes();
        }
    },
    iscroll: {
        scroller: {},
        chachedConfigs: {},
        diffs: {},
        diffCounter: 0,
        spawn: function(config) {
            var that = this;
            var el = $(config.location);
            var scrollEvent = {
                x: 0,
                y: 0
            };
            that.chachedConfigs[config.name] = config;
            that.scroller[config.name] = new IScroll(config.location + ' .inner', {
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
            el.on('tap', function(e) {
                if (!e.isTrigger) {
                    config.tap(e);
                }
            });
            that.scroller[config.name].on('scroll', function() {
                if (that.scroller[config.name] === null) return false;
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
        revive: function(name) {
            this.spawn(this.chachedConfigs[name]);
            this.scroller[name].scrollTo(this.chachedConfigs[name].x, this.chachedConfigs[name].y);
        },
        reset: function(name) {
            var that = this;
            var config = that.scroller[name].config;
            that.kill(name);
            setTimeout(function() {
                that.spawn(config);
            }, 0);
        },
        scrollTo: function(name, x, y) {
            this.scroller[name].scrollTo(x, y);
        },
        get(name) {
            return this.scroller[name];
        }
    },
    bottomScroller: function() {
        var that = this;
        that.iscroll.spawn({
            name: 'bottomScroller',
            location: '#bottomScroller',
            tap: function(e) {
                console.log('_____________________');
                console.log('binding for tapping bottom scroller goes here');
                console.log('tap event object:');
                console.log(e);
                console.log('_____________________');
            },
            scroll: function(e) {
                console.log('_____________________');
                console.log('binding for scrolling bottom scroller goes here');
                console.log('scroll event object:');
                console.log(e);
                console.log('_____________________');
            }
        });
    },
    init: function() {
        document.addEventListener('touchmove', function(e) {
            e.preventDefault();
        });
        document.addEventListener('touchstart', function(e) {
            e.preventDefault();
        });
        document.addEventListener('touchcancel', function(e) {
            e.preventDefault();
        });
        document.addEventListener('touchend', function(e) {
            e.preventDefault();
        });
        this.bottomScroller();
		this.nav.init();
    }
};
app.init();

function lazyTests() {
    $('#container > div.view').on('swipeUp swipeDown swipeLeft swipeRight', function(e) {
        console.log(e.type);
    });
    // tests for iscroll abstraction
    // setTimeout(function(){
    // 	console.log('killing');
    // 	that.iscroll.kill('bottomScroller');
    // 	setTimeout(function(){
    // 		console.log('reviving');
    // 		that.iscroll.revive('bottomScroller');
    // 		setTimeout(function(){
    // 			console.log('resetting');
    // 			that.iscroll.reset('bottomScroller');
    // 			setTimeout(function(){
    // 				that.iscroll.scrollTo('bottomScroller', 0, -500);
    // 				setTimeout(function(){
    // 					console.log(that.iscroll.get('bottomScroller'));
    // 				},50);
    // 			},2500);
    // 		},2500);
    // 	},2500);
    // },2500);
}
lazyTests();

//TODO: trackChild functions
//TODO: slide lvl buttons for child slides
