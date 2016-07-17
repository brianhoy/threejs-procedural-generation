/* var Game = (function () {
	function Game() {

	}

	Game.prototype.initSky = function () {

	};

	Game.prototype.updateSky = function update(delta) {
		delta = delta || 1;
		while(this.sky.effectController.inclination > 2) {
			this.sky.effectController.inclination -= 2;
		}
		this.sky.sunDirectionalLight.position.set(this.sky.sunSphere.position.x, 
			this.sky.sunSphere.position.y, this.sky.sunSphere.position.z);
		this.sky.effectController.inclination += delta * 0.00001;
		this.sky.guiChanged();
	};

	Game.prototype.initPlayer = function () {
		this.player = new Physijs.CapsuleMesh(
			new THREE.CylinderGeometry(2, 2, 20),
			new THREE.MeshLambertMaterial({ color: 0xff00ff }),
			100
		);
		this.player.visible = false;
		this.player.geometry.dynamic = false;
		
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 450000);
		this.controls = new Controls();
		this.pLockControls = new THREE.PointerLockControls(this.camera);
		//this.scene.add(this.pLockControls.getObject());
		this.player.add(this.pLockControls.getObject());
		this.scene.add(this.player);
	};

	Game.prototype.updatePlayer = function () {
		this.controls.updateControls(this.player.getLinearVelocity());
		var newVelocity = this.controls.getVelocity();
		var cameraRotationY = this.pLockControls.getObject().rotation.y;
		//this.pLockControls.getDirection(cameraRotationX);
		//cameraRotationX = cameraRotationX.x;
		var axis = new THREE.Vector3(0, 1, 0);
		newVelocity.applyAxisAngle(axis, cameraRotationY);


		this.player.setLinearVelocity(newVelocity);		
		this.player.setAngularFactor(new THREE.Vector3(0,0,0));		
	};


	Game.prototype.render = function () {
		this.updatePlayer();
		this.updateSky(1);
		this.scene.simulate();
		this.renderer.render(this.scene, this.camera);
	};

	Game.prototype.init = function () {
		this.clock = new THREE.Clock();
		this.scene = new Physijs.Scene();
		this.scene.setGravity(new THREE.Vector3(0, -80, 0));
		this.renderer = new THREE.WebGLRenderer();
		
		this.initSky();
		document.body.appendChild(this.renderer.domElement);
		this.initScene();
		this.initResizeControl();
		this.initPlayer();
		this.render();
	};

	return Game;
}());
*/