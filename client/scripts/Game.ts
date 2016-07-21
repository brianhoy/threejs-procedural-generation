/// <reference path="../../typings/threejs/three.d.ts"/>
/// <reference path="../../typings/physijs/physijs.d.ts"/>
import {Sky} from './sky/Sky';
import {Player} from './player/Player';
import {ChunkManager} from './procedural-generation/ChunkManager';
import {Debugger} from './debugger/Debugger';

var scene;

export class Game {
	private scene: Physijs.Scene;
	private sky: Sky;
	private player: Player;
	private renderer: THREE.Renderer;
	private SCREEN_WIDTH: number;
	private SCREEN_HEIGHT: number;
	private chunkManager: ChunkManager;
	private debugger: Debugger;
	private lastTime: number;

	constructor() {
		this.debugger = new Debugger();
		this.renderer = new THREE.WebGLRenderer();
		this.scene = new Physijs.Scene();
		scene = this.scene;

		this.initScene();
		this.initResizeControl();
		this.sky = new Sky(this.scene);

		this.scene.add(this.sky.mesh);
		this.scene.setGravity(new THREE.Vector3(0, -80, 0));
		this.lastTime = Date.now();

		document.body.appendChild(this.renderer.domElement);
		this.initPlayer();

		this.chunkManager = new ChunkManager(this.player, this.scene);
		this.render();
	}

	private initScene() {
		// Heightfield
		/*{
			console.log("Creating terrain");
			let generator = new Generator();
			let terrain = generator.createTerrain();
			terrain.position.y = -10;
			this.scene.add(terrain);
		} */

		// Cubes
		{
			let geometry = new THREE.CubeGeometry( 100, 100, 100 );
			let material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
			
			var cube = new Physijs.BoxMesh( geometry, material );
			cube.position.x = 1000;
			cube.position.y = 1000;
			cube.position.z = 1000;
			this.scene.add(cube);
		}

		// Light
		{
			let geometry = new THREE.CylinderGeometry(200, 200, 5, 32)
			let material = new THREE.MeshLambertMaterial( { color: 0xdddddd } );
			
			let cylinder = new Physijs.CylinderMesh(geometry, material, 0);
			cylinder.position.x = -60;
			cylinder.position.y = -60;
			cylinder.position.z = -60;
			this.scene.add(cylinder);
		}
		
		// Ambient light
		let light = new THREE.AmbientLight( 0x404040 ); 
		this.scene.add(light);
	}

	private initPlayer() {
		this.player = new Player(this.scene, this.debugger);
	}

	private initResizeControl() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		var scope = this;
		window.addEventListener('resize', function() {
			scope.SCREEN_WIDTH = window.innerWidth;
			scope.SCREEN_HEIGHT = window.innerHeight;
			scope.player.camera.aspect = window.innerWidth / window.innerHeight;
			scope.player.camera.updateProjectionMatrix();
			scope.renderer.setSize(window.innerWidth, window.innerHeight);
		}, false);
	};

	private render(s?: Game) {
		let scope = s || this;


		if(Date.now() - scope.lastTime > 1000) {
			scope.lastTime = Date.now();
			scope.softUpdate();
		}

		scope.player.update();
		scope.sky.update(1);
		scope.scene.simulate();

		scope.renderer.render(this.scene, this.player.camera);

		requestAnimationFrame(function() {
			scope.render(scope);
		});
	}

	private softUpdate() {
		this.chunkManager.update();
	}
}
