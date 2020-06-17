const PI2 = 2*Math.PI;

function simplify(n) { return n.toPrecision(5); }

function createFace(p1, p2, p3) {
	return {
		vertices: [p1, p2, p3]
	};
}

export function computePoints(values, scale=1) {
	const X = values.length;
	const Y = values[0].length;

	const H = 100;
	const D = X/Y * H;
	const R = D/PI2;

	let points = [];


	for (let x=0;x<X;x++) {
		let column = [];
		points.push(column);

		for (let y=0;y<Y;y++) {
			let value = values[x][y];
			let r = R + value * scale;

			let angle = x/X * PI2;
			let point = [
				r * Math.sin(angle),
				(y/Y - .5) * -H,
				r * Math.cos(angle)
			];
			column.push(point);
		}
	}

	return points;
}

export function triangulate(points) {
	/*

    A -- B
	| \  |    T1: ACD
	|  \ |    T2: ADB
	C -- D

	*/

	let faces = [];

	for (let x=0; x<points.length; x++) {
		let column = points[x];
		let next = points[(x+1) % points.length];
		for (let y=0; y<column.length-1; y++) {
			let A = column[y];
			let C = column[y+1];
			let B = next[y];
			let D = next[y+1];
			faces.push(createFace(A, C, D));
			faces.push(createFace(A, D, B));
		}
	}

	// top/bottom
	let y = points[0].length-1;
	for (let x=1; x<points.length-1; x++) {
		let p0 = points[0][0];
		let p1 = points[x][0];
		let p2 = points[x+1][0];
		faces.push(createFace(p0, p1, p2));

		p0 = points[0][y];
		p1 = points[x][y];
		p2 = points[x+1][y];
		faces.push(createFace(p0, p2, p1));
	}

	return faces;
}

export function toSTLtext(faces, name) {
	let lines = [];
	lines.push(`solid ${name}`);

	faces.forEach(face => {
		let normal = "normal 0 0 0";
		lines.push(`facet ${normal}`);
		lines.push("outer loop");
		face.vertices.forEach(v => {
			lines.push(`vertex ${v.map(simplify).join(" ")}`);
		});
		lines.push("endloop");
		lines.push("endfacet");
	})

	lines.push(`endsolid ${name}`);
	return lines.join("\n");
}

export function toSTLbinary(faces) {
	let buffer = new ArrayBuffer(80 + 4 + faces.length * (12 * 4 + 2));
	let view = new DataView(buffer);
	let offset = 80;
	view.setUint32(offset, faces.length, true)
	offset += 4;

	function writeFloat32(number) {
		view.setFloat32(offset, number, true);
		offset += 4;
	}

	faces.forEach(face => {
		// normal
		writeFloat32(0);
		writeFloat32(0);
		writeFloat32(0);

		// faces
		face.vertices.forEach(v => {
			writeFloat32(v[0]);
			writeFloat32(v[1]);
			writeFloat32(v[2]);
		});

		view.setUint16(offset, 0);
		offset += 2;
	});

	return buffer;
}
