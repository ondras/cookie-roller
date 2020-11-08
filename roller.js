import * as lib from "./lib.js";


const defaultOptions = {
	invert: true,
	scale: 1,
	downsize: true
}

const SIZE = 512;

async function loadImage(src) {
	let img = new Image();
	img.crossOrigin = "anonymous";
	img.src = src;
	return new Promise((resolve, reject) => {
		img.onload = e => resolve(e.target);
		img.onerror = e => reject(new Error(`Cannot load ${src}`));
	});
}

function createFromCanvas(canvas, options) {
	options = Object.assign({}, defaultOptions, options);

	if (options.downsize && Math.min(canvas.width, canvas.height) > SIZE) {
		let scale = Math.max(SIZE/canvas.width, SIZE/canvas.height);
		let downsized = document.createElement("canvas");
		downsized.width = Math.round(canvas.width * scale);
		downsized.height = Math.round(canvas.height * scale);
		downsized.getContext("2d").drawImage(canvas, 0, 0, downsized.width, downsized.height);
		canvas = downsized;
	}

	let imageData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
	let values = [];
	for (let x=0;x<imageData.width;x++) {
		let column = [];
		values.push(column);
		for (let y=0;y<imageData.height;y++) {
			let o = 4*(x + y*imageData.width);
			let r = imageData.data[o+0];
			let g = imageData.data[o+1];
			let b = imageData.data[o+2];
			let a = imageData.data[o+3];

			let value = (0.299*r + 0.587*g + 0.114*b) / 255;
			if (options.invert) { value = 1-value; }
			if (!a) { value = 0; }

			column.push(value);
		}
	}

	let points = lib.computePoints(values, options.scale);
	let faces = lib.triangulate(points);
//	return lib.toSTL(faces, "roller");
	return lib.toSTLbinary(faces);
}

export async function createFromURL(url, options) {
	let image = await loadImage(url);
	let canvas = document.createElement("canvas");
	canvas.width = image.naturalWidth;
	canvas.height = image.naturalHeight;
	canvas.getContext("2d").drawImage(image, 0, 0);

	return createFromCanvas(canvas, options);
}

export async function createFromFile(file, options) {
	return createFromURL(URL.createObjectURL(file), options);
}

export function createDownload(stl) {
	const blob = new Blob([stl], {type : 'model/stl'});
	let link = document.createElement("a");
	let bytes = (typeof(stl) == "string" ? stl.length : stl.byteLength);
	let size = bytes / (1024 ** 2);
	link.textContent = `Download STL (${size.toFixed(1)} MB)`;
	link.href = URL.createObjectURL(blob);
	link.download = "roller.stl";
	return link;
}
