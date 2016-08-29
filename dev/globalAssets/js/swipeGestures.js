(function() {
    var swiper = {
        var: {
            page: $('#container > div.view'),
			swipeUp: jQuery.Event("swipeUp"),
			swipeDown: jQuery.Event("swipeDown"),
			swipeLeft: jQuery.Event("swipeLeft"),
			swipeRight: jQuery.Event("swipeRight")
        },
		calcDirection: function(angle){
			var sliceWidth = 35; //max value: 40
			var outputs = {
				up: function(num){
					return num > (180 - sliceWidth) &&  num < (180 + sliceWidth);
				},
				right: function(num){
					return num > (90 - sliceWidth) &&  num < (90 + sliceWidth);
				},
				down: function(num){
					return num > (360 - sliceWidth) || num < sliceWidth;
				},
				left: function(num){
					return num > (270 - sliceWidth) &&  num < (270 + sliceWidth);
				},
			};
			var rtrn = null;
			switch (true) {
				case outputs.up(angle):
					rtrn = 'Up';
				break;
				case outputs.right(angle):
					rtrn = 'Right';
				break;
				case outputs.down(angle):
					rtrn = 'Down';
				break;
				case outputs.left(angle):
					rtrn = 'Left';
				break;
			}
			return rtrn;

		},
		calcSpecs: function(dx, dy) {
			var that =  this;
	        var angle;
	        if (dx >= 0) {
	            angle = Math.round((Math.atan2(dx, dy)) * 180 / Math.PI);
	        } else {
	            angle = Math.round(((Math.atan2(dx, dy * -1)) * -180 / Math.PI) + 180);
	        }
	        var distance = Math.sqrt((dx * dx) + (dy * dy));
	        var obj = {
				angle: angle,
				distance: distance,
				direction: that.calcDirection(angle)
			};
	        return obj;
	    },

        injestEvents: function() {
			var x1,x2,y1,y2,dx,dy,duration,direction,t1,t2, that = this, maxTime = 650, angle = 0, specs, minSwipe = 100, el;
            that.var.page.on('unified', function(e) {
                switch (e.phase) {
                    case 'down':
                            x1 = e.x;
                            y1 = e.y;
							t1 = new Date().getTime();
							el = $(this);
                    break;
                    case 'move':
                            x2 = e.x;
                            y2 = e.y;
                            dx = x2 - x1;
                            dy = y2 - y1;
                    break;
                    case 'up':
                        t2 = new Date().getTime();
						duration = t2 - t1;
						specs = that.calcSpecs(dx, dy);
						if(specs.distance > minSwipe){
								if(specs.direction !== null){
									if(((1/duration*1))*(specs.distance*1) > 1){
										el.trigger(that.var['swipe'+specs.direction]);
									}
								}
						}
                    break;
                }
            });
        },
        init: function() {
            unify.init(this.var.page);
			this.injestEvents();
        }
    };
	swiper.init();
})();
