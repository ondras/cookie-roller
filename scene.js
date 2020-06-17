const SIZE = [400, 400];


export default class Scene {
	constructor(stl) {
		this._disposables = [];

		let mesh = createMesh(stl);

		let renderer = new THREE.WebGLRenderer({antialias:true});
		renderer.setSize(...SIZE);
		renderer.setPixelRatio(window.devicePixelRatio);
		this._disposables.push(renderer);


		let scene = new THREE.Scene();
		scene.background = new THREE.Color(0xffffff);
		this._disposables.push(scene);

		lights(scene);

		scene.add(mesh);

		let ratio = SIZE[0]/SIZE[1];
		let w = 100;
		let h = w / ratio;

		let camera = new THREE.OrthographicCamera(w / - 2, w / 2, h / 2, h / - 2, 1, 1000 )
		camera.position.set(50, 20, 50);

		function render() { renderer.render(scene, camera); }

		let controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.addEventListener("change", render);
		this._disposables.push(controls);

		render();
		this.node = renderer.domElement;
	}

	dispose() {
		this._disposables.forEach(d => d.dispose());
	}
}

function createMesh(stl) {
	let geometry = new THREE.STLLoader().parse(stl);
	geometry.rotateY(180);
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	let material = new THREE.MeshLambertMaterial({color:0x1e90ff});
	return new THREE.Mesh( geometry, material );
}

function lights(scene) {
	let ambientLight = new THREE.AmbientLight(0x404040, 2);
	scene.add(ambientLight);

	let directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(-1, 4, 1);
	directionalLight.position.normalize();
	scene.add(directionalLight);


	directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(1, 4, -1);
	directionalLight.position.normalize();
	scene.add(directionalLight);
}
