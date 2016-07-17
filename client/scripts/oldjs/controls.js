var Controls = (function () {
	var scope = this;

	function Controls() {
		Controls.moveForward = false;
		Controls.moveBackward = false;
		Controls.moveRight = false;
		Controls.moveLeft = false;

		this.initControls();
	}
	
	Controls.prototype.checkForPointerLock = function() {
		return 'pointerLockElement' in document || 
         'mozPointerLockElement' in document || 
         'webkitPointerLockElement' in document;
	}
	
	Controls.prototype.initPointerLock = function () {
		var element = document.body;
		var scope = this;

		if (this.havePointerLock) {
			var pointerlockchange = function (event) {
				if (document.pointerLockElement === element ||
					document.mozPointerLockElement === element ||
					document.webkitPointerLockElement === element) {
					scope.controlsEnabled = true;
					Controls.pointerLockEnabled = true;
				} else {
					scope.controlsEnabled = false;
					Controls.pointerLockEnabled = false;
				}
			};

			var pointerlockerror = function (event) {
				element.innerHTML = 'PointerLock Error';
			};

			document.addEventListener('pointerlockchange', pointerlockchange, false);
			document.addEventListener('mozpointerlockchange', pointerlockchange, false);
			document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

			document.addEventListener('pointerlockerror', pointerlockerror, false);
			document.addEventListener('mozpointerlockerror', pointerlockerror, false);
			document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

			var requestPointerLock = function(event) {
				element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
				element.requestPointerLock();
			};
			element.addEventListener('click', requestPointerLock, false);
		} else {
				element.innerHTML = 'Bad browser; No pointer lock';
		}
	};
	
	Controls.prototype.onKeyDown = function (e) {
		var scope = this;
		switch (e.keyCode) {
			case 38: // up
			case 87: // w
				Controls.moveForward = true;
				break;
			case 37: // left
			case 65: // a
				Controls.moveLeft = true;
				break;
			case 40: // down
			case 83: // s
				Controls.moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				Controls.moveRight = true;
				break;
			case 32: // space
				console.log("space pressed: ", Controls.canJump);
				if (Controls.canJump == true) {
					console.log("Jumping");
					Controls.jumpOnNext = true;
					Controls.canJump = false;
				}
				break;
		}
	};

	Controls.prototype.onKeyUp = function (e) {
		switch(e.keyCode) {
			case 38: // up
			case 87: // w
				Controls.moveForward = false;
				break;
			case 37: // left
			case 65: // a
				Controls.moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				Controls.moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				Controls.moveRight = false;
				break;
		}
	};
	
	Controls.prototype.initControls = function () {
		document.addEventListener('keydown', this.onKeyDown, false);
		document.addEventListener('keyup', this.onKeyUp, false);
		
		this.controlsEnabled = false;
		Controls.pointerLockEnabled = false;
		this.havePointerLock = this.checkForPointerLock();
		
		this.jumpOnNext = false;
		this.canJump = false;
		this.clock = new THREE.Clock();

		
		this.playerVelocity = new THREE.Vector3(0, 0, 0);
		this.cameraRotation = new THREE.Euler(0, 0, 0);
		
		this.initPointerLock();
	};

	Controls.prototype.updateControls = function (realPlayerVelocity) {
		if (this.controlsEnabled) {
			var velocity = new THREE.Vector3(0, realPlayerVelocity.y, 0);

			var delta = 1; //this.clock.getDelta();
			var walkingSpeed = 50.0;

			if (Controls.moveForward) {
				velocity.z -= walkingSpeed * delta;
			}
			if (Controls.moveBackward) {
				velocity.z += walkingSpeed * delta;
			}
			if (Controls.moveLeft) {
				velocity.x -= walkingSpeed * delta;
			}
			if (Controls.moveRight) {
				velocity.x += walkingSpeed * delta;
			}
			if(Controls.jumpOnNext) { 
				velocity.y += 50; 
				Controls.jumpOnNext = false; 
			}
			if (Math.abs(realPlayerVelocity.y) < 1) {
				console.log("y velocity low, canjump true");	
				Controls.canJump = true;
			}
			else {
				Controls.canJump = false;
			}
			this.playerVelocity = velocity;
		}
	};
	
	Controls.prototype.getVelocity = function () {
		return this.playerVelocity;
	};
	
	Controls.prototype.getRotation = function () {
		return this.cameraRotation;
	}
	
	return Controls;
}());

THREE.PointerLockControls = function (camera) {
	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( Controls.pointerLockEnabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		console.log("yawObject rotation: ", yawObject.rotation.y)
		pitchObject.rotation.x -= movementY * 0.002;
		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
	};

	this.dispose = function() {
		document.removeEventListener( 'mousemove', onMouseMove, false );
	};

	document.addEventListener( 'mousemove', onMouseMove, false );

	Controls.pointerLockEnabled = false;
	this.getObject = function () {

		return yawObject;

	};

	this.getDirection = function() {
		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, - 1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {
			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		};

	}();

};

