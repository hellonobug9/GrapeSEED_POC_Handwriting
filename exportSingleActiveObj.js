fabric.Object.prototype.exportPNG = function() {
	function trimCanvas(canvas)
	{
		var ctx = canvas.getContext('2d'),
			w = canvas.width,
			h = canvas.height,
			pix = {x:[], y:[]}, n,
			imageData = ctx.getImageData(0,0,w,h),
			fn = function(a,b) { return a-b };

		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				if (imageData.data[((y * w + x) * 4)+3] > 0) {
					pix.x.push(x);
					pix.y.push(y);
				}
			}
		}
		pix.x.sort(fn);
		pix.y.sort(fn);
		n = pix.x.length-1;

		w = pix.x[n] - pix.x[0];
		h = pix.y[n] - pix.y[0];
		var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

		canvas.width = w;
		canvas.height = h;
		ctx.putImageData(cut, 0, 0);
	};

	var bound = this.getBoundingRect(),
		json = JSON.stringify(this),
		canvas = fabric.util.createCanvasElement();
	canvas.width = bound.width;
	canvas.height = bound.height;
	var fcanvas = new fabric.Canvas(canvas, {enableRetinaScaling:false});

	fabric.util.enlivenObjects([JSON.parse(json)], function(objects) {
		objects.forEach(function(o) {
			o.top -= bound.top;
			o.left -= bound.left;
			fcanvas.add(o);
		});
		fcanvas.renderAll();

		var canvas = fcanvas.getElement();
		trimCanvas(canvas);

		/*
		var url = canvas.toDataURL('image/png'),
			  img = new Image();
		img.width = canvas.width;
		img.height = canvas.height;
		img.src = url;
		document.body.appendChild(img);
		*/

		canvas.toBlob(function(blob) {
    	$('<a>', {href:URL.createObjectURL(blob), download:'element.png'})[0].click();
		}, 'image/png');
	});
};

function obj2png() {
		var obj = fcanvas.getActiveObject();
		if (!obj) { return; }
		obj.exportPNG();
}

// Create fabric canvas
var fcanvas = new fabric.Canvas('c');

// Add some objects
fcanvas.add(new fabric.Circle({
 	radius: 100, fill: 'green', left: 10, top: 10
}));
fcanvas.add(new fabric.Triangle({
 	width: 130, height: 130, fill: 'blue', left: 220, top: 250, angle: -30
}));