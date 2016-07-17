/// <reference path="../../../typings/threejs/three.d.ts"/>
/// <reference path="../../../typings/physijs/physijs.d.ts"/>

import {PointerLockControls} from './PointerLockControls';
import {Debugger} from '../debugger/Debugger';

export class Player {
	private static scope: Player;

	public mesh: Physijs.CapsuleMesh;
	public camera: THREE.PerspectiveCamera;

	private moveForward: boolean = false;
	private moveBackward: boolean = false;
	private moveRight: boolean = false;
	private moveLeft: boolean = false;
	private moveUp: boolean = false;
	private moveDown: boolean = false;

	private canJump: boolean = true;
	private jumpOnNext: boolean = false;
	private flyMode: boolean = false;

	private clock: THREE.Clock;

	private pointerLockEnabled: boolean;
	private pointerLockControls: PointerLockControls;

	private playerVelocity: THREE.Vector3;
	private cameraRotation: THREE.Euler;

	constructor(private scene: THREE.Scene, private _debugger?: Debugger) {
		Player.scope = this;

		this.mesh = new Physijs.CapsuleMesh(
			new THREE.CylinderGeometry(2, 2, 20),
			new THREE.MeshLambertMaterial({ color: 0xff00ff }),
			100
		);
		this.mesh.visible = false;
		this.mesh.position.set(0, 500, 0);
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 450000);
		this.pointerLockEnabled = false;
		this.pointerLockControls = new PointerLockControls(this.camera);
		//this.scene.add(this.pLockControls.getObject());
		this.mesh.add(this.pointerLockControls.getObject());
		this.scene.add(this.mesh);

		this.initControls();
	}

	private initControls() {
		document.addEventListener('keydown', this.onKeyDown, false);
		document.addEventListener('keyup', this.onKeyUp, false);
				
		this.jumpOnNext = false;
		this.canJump = false;
		this.clock = new THREE.Clock();

		this.playerVelocity = new THREE.Vector3(0, 0, 0);
		this.cameraRotation = new THREE.Euler(0, 0, 0);
	}

	private onKeyDown(ev: KeyboardEvent): void {
		let scope = Player.scope;
		switch (ev.keyCode) {
			case 38: // up
			case 87: // w
				scope.moveForward = true;
				break;
			case 37: // left
			case 65: // a
				scope.moveLeft = true;
				break;
			case 40: // down
			case 83: // s
				scope.moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				scope.moveRight = true;
				break;
			case 32: // space
				scope.moveUp = true;
				if (scope.canJump == true) {
					console.log("Jumping");
					scope.jumpOnNext = true;
					scope.canJump = false;
				}
				break;
			case 16:
				scope.moveDown = true;
		}
	}

	private onKeyUp(ev: KeyboardEvent): void {
		let scope = Player.scope;

		switch(ev.keyCode) {
			case 38: // up
			case 87: // w
				scope.moveForward = false;
				break;
			case 37: // left
			case 65: // a
				scope.moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				scope.moveBackward = false;
				break;
			case 39: // right
			case 67:
				scope.flyMode = !scope.flyMode;
			case 68: // d
				scope.moveRight = false;
				break;
			case 32:
				scope.moveUp = false;
			case 16:
				scope.moveDown = false;
		}
	}

	private calculateNewVelocity(currentVelocity: THREE.Vector3): THREE.Vector3 {
		if (this.pointerLockControls.controlsEnabled) {
			let velocity = new THREE.Vector3(0, currentVelocity.y, 0);

			let delta = 1; //this.clock.getDelta();
			let walkingSpeed = 50.0;

			if(this.flyMode) {
				walkingSpeed *= 10;
			}

			if (this.moveForward) {
				velocity.z -= walkingSpeed * delta;
			}
			if (this.moveBackward) {
				velocity.z += walkingSpeed * delta;
			}
			if (this.moveLeft) {
				velocity.x -= walkingSpeed * delta;
			}
			if (this.moveRight) {
				velocity.x += walkingSpeed * delta;
			}
			if(this.flyMode) {
				if(this.moveDown) {
					velocity.y -= 5;
				}
				if(this.moveUp) {
					velocity.y += 5;
				}
			}
			else {
				if(this.jumpOnNext) { 
					velocity.y += 50; 
					this.jumpOnNext = false; 
				}
				if (Math.abs(currentVelocity.y) < 0.2) {
					this.canJump = true;
				}
				else {
					this.canJump = false;
				}

			}
			return velocity;
		}
		else {
			return null;
		}
	}

	public update() {
		if(this.pointerLockControls.controlsEnabled) {
			let newVelocity = this.calculateNewVelocity(this.mesh.getLinearVelocity());
			//let newVelocity = this.mesh.getLinearVelocity();

			var cameraRotationY = this.pointerLockControls.getObject().rotation.y;
			//this.pLockControls.getDirection(cameraRotationX);
			//cameraRotationX = cameraRotationX.x;
			var axis = new THREE.Vector3(0, 1, 0);
			newVelocity.applyAxisAngle(axis, cameraRotationY);
			this.mesh.setLinearVelocity(newVelocity);		
		}
		if(this._debugger) {
			this._debugger.updatePlayerCoordinates(this.mesh.getWorldPosition());
		}
		this.mesh.setAngularFactor(new THREE.Vector3(0,0,0));		
	}
}