app.pageScripts = {};
app.checkImages = function(element, callback) {
	var that = this;
	var arr = [];
	var LocalThis;
	function uniq(a) {
		var prims = {
				"boolean": {},
				"number": {},
				"string": {}
			},
			objs = [];
		return a.filter(function(item) {
			var type = typeof item;
			if (type in prims)
				return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
			else
				return objs.indexOf(item) >= 0 ? false : objs.push(item);
		});
	}
	setTimeout(function() {
		$.each(element.find('img'), function() {
			LocalThis = $(this);
			arr.push($(this).attr('src'));

		});
		$.each(element.find('*'), function() {
			LocalThis = $(this);
			a = $(this).css('background-image');

			if (a[0] == 'u') {
				arr.push(a.replace(/\'/g, '').replace(/\"/g, '').replace('url(', '').replace(')', ''));
			}
		});
		arr = uniq(arr);
		if (arr.length) {
			that.imgpreload(arr, function() {
				callback();
			});
		} else {
			callback();
		}
	}, 10);
};
app.nav.loadUtils = {
	var:{
		inTransition: 0
	},
	fadeIn: function(target, oldContainer, both){
		var that = this;
		var duration = 300;
		target[0].style.zIndex = 10;
		target[0].style.opacity = 0;
		both.addClass('gpu');
		setTimeout(function(){
			target[0].style.display = 'block';
			target[0].style.transition = 'all '+duration+'ms cubic-bezier(0.5,.5,.77,1)';
			target[0].style.webkitTransition = 'all '+duration+'ms cubic-bezier(0.5,.5,.77,1)';
			setTimeout(function(){
				target[0].style.opacity = 1;
				setTimeout(function(){
					target.addClass('active');
					target[0].style.zIndex = 1;
					setTimeout(function(){
						oldContainer[0].innerHTML = '';
						oldContainer[0].setAttribute("style", '');
						oldContainer[0].setAttribute("class", 'view');
						target[0].setAttribute("style", '');
						target[0].setAttribute("class", 'view active');
						that.var.inTransition = 0;
					},10);
				},duration+30);
			},10);
		},5);
	},
	slideIn: function(target, oldContainer, both, direction){
		var that = this;
		var duration = 650;
		var transition =  'all '+(duration)+'ms cubic-bezier(0,0,1,1';
		var transition2 =  'all '+(duration*1.5)+'ms cubic-bezier(0,0,1,1)';
		target[0].style.zIndex = 10;
		both.addClass('gpu');
		var numSwitch = 1;
		if(direction === 'left') numSwitch = -1;
		var initLeft = numSwitch*1024;
		target[0].style.transform = 'matrix(1,0,0,1,'+initLeft+',0)';
		target[0].style.webkitTransform = 'matrix(1,0,0,1,'+initLeft+',0)';
		target[0].style.display = 'block';
		setTimeout(function(){
			target[0].style.transition = transition;
			target[0].style.webkitTransition = transition;
			oldContainer[0].style.transition = transition2;
			oldContainer[0].style.webkitTransition = transition2;
			setTimeout(function(){
				target[0].style.transform = 'matrix(1,0,0,1,0,0)';
				target[0].style.webkitTransform = 'matrix(1,0,0,1,0,0)';
				oldContainer[0].style.transform = 'matrix(1,0,0,1,'+(initLeft*-1)+',0)';
				oldContainer[0].style.webkitTransform = 'matrix(1,0,0,1,'+(initLeft*-1)+',0)';
				setTimeout(function(){
					target.addClass('active');
					target[0].style.zIndex = 1;
					setTimeout(function(){
						oldContainer[0].innerHTML = '';
						oldContainer[0].setAttribute("style", '');
						oldContainer[0].setAttribute("class", 'view');
						target[0].setAttribute("style", '');
						target[0].setAttribute("class", 'view active');
						that.var.inTransition = 0;
					},10);
				},duration+30);
			},10);
		},5);
	}
};
app.nav.loadParent = function(slideName, direction) {
    // TODO: load parent function for Native
	var that = this;
	if(that.loadUtils.var.inTransition) return false;
	that.loadUtils.var.inTransition = 1;
	var enterFrom = 'center';
	if(direction) enterFrom = direction;
	var both = $('#container > .view');
	var target = $('#container > .view:not(.active)');
	var oldContainer = $('#container > .view.active');
	var child = $(target.find('.childslide')[localStorage.goToChild-1]);
	target.load(slideName+'/index.html', function(){
		app.checkImages(child, function(){
			switch (direction) {
				case 'right':
					app.nav.loadUtils.slideIn(target, oldContainer, both, 'right');
				break;
				case 'left':
					app.nav.loadUtils.slideIn(target, oldContainer, both, 'left');
				break;
				case 'center':
					app.nav.loadUtils.fadeIn(target, oldContainer, both);
				break;
				default:
			}
		});
	});
};
app.nav.trackChild = function(GUID, type) {
    // TODO: track child function for Veeva touch
    console.log('dummy tracking function:  -  ',GUID, '  -  ', type);
    return false;
};
app.platform = {
    init: function() {
        var type = 'parent';
        var current = $('.view.active .ParentSlide').attr('activechild') * 1;
        if (current > 1) type = 'child';
        app.nav.trackChild(app.nav.var.GUIDs[current - 1], type);
		app.afterPlatformLoad();
    }
};
