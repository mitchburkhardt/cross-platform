app.nav.imgpreload = function(b, f) {
	var d = 0,
		c = [];
	b = "[object Array]" === Object.prototype.toString.apply(b) ? b : [b];
	for (var e = function() {
			d += 1;
			d === b.length && f && f(c)
		}, a = 0; a < b.length; a++) c[a] = new Image, c[a].onabort = e, c[a].onerror = e, c[a].onload = e, c[a].src = b[a]
};
app.pageScripts = {};

app.nav.icheckImages = function(element, callback) {
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
			if (type in prims) return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
			else return objs.indexOf(item) >= 0 ? false : objs.push(item);
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
app.load = function(url, direction){

};
