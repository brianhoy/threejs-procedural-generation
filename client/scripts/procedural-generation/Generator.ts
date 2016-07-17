/// <reference path="../../../typings/threejs/three.d.ts"/>
/// <reference path="../../../typings/physijs/physijs.d.ts"/>

declare var SimplexNoise;

export class Generator {
	private noiseGenerator: any;
	private mountainNoiseGenerator: any;
	private mountainMultiplierNoiseGenerator: any;
	private textureLoader: THREE.TextureLoader;
	private grassTexture: THREE.Texture;

	constructor(textureLoader?: THREE.TextureLoader) {
		this.textureLoader = textureLoader || new THREE.TextureLoader();
		this.noiseGenerator = new SimplexNoise();
		this.mountainNoiseGenerator = new SimplexNoise(); 
		this.mountainMultiplierNoiseGenerator = new SimplexNoise();

		this.textureLoader.load('images/grass.png', (texture) => {this.grassTexture = texture});
	}

	public createTerrain(x: number, y: number) {
		x *= 1000;
		y *= 1000;

		let ground_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: this.grassTexture || THREE.ImageUtils.loadTexture( 'images/grass.png' ) }),
			.8, // high friction
			.4 // low restitution
		);
		ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
		ground_material.map.repeat.set( 100, 100 );


		let ground_geometry = new THREE.PlaneGeometry( 1000, 1000, 50, 50 );

		for ( var i = 0; i < ground_geometry.vertices.length; i++ ) {
			var vertex = ground_geometry.vertices[i];
			let mountainNoise = this.mountainNoiseGenerator.noise((vertex.x + x) / 2000, (vertex.y - y) / 2000) * 10000;
			let mountainMultiplierNoise = this.mountainMultiplierNoiseGenerator.noise( (vertex.x + x)/ 50000, (vertex.y - y) / 50000);
			//console.log("Before power function", mountainMultiplierNoise);
			//mountainMultiplierNoise = Math.pow(mountainMultiplierNoise, 3);
			//console.log("After power function", mountainMultiplierNoise);
			vertex.z = this.noiseGenerator.noise( (vertex.x + x) / 1000, (vertex.y - y) / 1000 ) * (mountainMultiplierNoise * mountainNoise);
		}
		ground_geometry.computeFaceNormals();
		ground_geometry.computeVertexNormals();
		
		// If your plane is not square as far as face count then the HeightfieldMesh
		// takes two more arguments at the end: # of x faces and # of y faces that were passed to THREE.PlaneMaterial
		let ground = new Physijs.HeightfieldMesh(
			ground_geometry,
			ground_material,
			0, // mass
			50,
			50
		);
		ground.rotation.x = Math.PI / -2;
		ground.receiveShadow = true;
		ground.position.x += x;
		ground.position.z += y;

		return ground;
	}
}