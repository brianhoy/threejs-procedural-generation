"use strict";
var PointerLockControls_1 = require('./PointerLockControls');
var Player = (function () {
    function Player(scene, _debugger) {
        this.scene = scene;
        this._debugger = _debugger;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveRight = false;
        this.moveLeft = false;
        this.moveUp = false;
        this.moveDown = false;
        this.canJump = true;
        this.jumpOnNext = false;
        this.flyMode = false;
        Player.scope = this;
        this.mesh = new Physijs.CapsuleMesh(new THREE.CylinderGeometry(2, 2, 20), new THREE.MeshLambertMaterial({ color: 0xff00ff }), 100);
        this.mesh.visible = false;
        this.mesh.position.set(0, 500, 0);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 450000);
        this.pointerLockEnabled = false;
        this.pointerLockControls = new PointerLockControls_1.PointerLockControls(this.camera);
        this.mesh.add(this.pointerLockControls.getObject());
        this.scene.add(this.mesh);
        this.initControls();
    }
    Player.prototype.initControls = function () {
        document.addEventListener('keydown', this.onKeyDown, false);
        document.addEventListener('keyup', this.onKeyUp, false);
        this.jumpOnNext = false;
        this.canJump = false;
        this.clock = new THREE.Clock();
        this.playerVelocity = new THREE.Vector3(0, 0, 0);
        this.cameraRotation = new THREE.Euler(0, 0, 0);
    };
    Player.prototype.onKeyDown = function (ev) {
        var scope = Player.scope;
        switch (ev.keyCode) {
            case 38:
            case 87:
                scope.moveForward = true;
                break;
            case 37:
            case 65:
                scope.moveLeft = true;
                break;
            case 40:
            case 83:
                scope.moveBackward = true;
                break;
            case 39:
            case 68:
                scope.moveRight = true;
                break;
            case 32:
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
    };
    Player.prototype.onKeyUp = function (ev) {
        var scope = Player.scope;
        switch (ev.keyCode) {
            case 38:
            case 87:
                scope.moveForward = false;
                break;
            case 37:
            case 65:
                scope.moveLeft = false;
                break;
            case 40:
            case 83:
                scope.moveBackward = false;
                break;
            case 39:
            case 67:
                scope.flyMode = !scope.flyMode;
            case 68:
                scope.moveRight = false;
                break;
            case 32:
                scope.moveUp = false;
            case 16:
                scope.moveDown = false;
        }
    };
    Player.prototype.calculateNewVelocity = function (currentVelocity) {
        if (this.pointerLockControls.controlsEnabled) {
            var velocity = new THREE.Vector3(0, currentVelocity.y, 0);
            var delta = 1;
            var walkingSpeed = 50.0;
            if (this.flyMode) {
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
            if (this.flyMode) {
                if (this.moveDown) {
                    velocity.y -= 5;
                }
                if (this.moveUp) {
                    velocity.y += 5;
                }
            }
            else {
                if (this.jumpOnNext) {
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
    };
    Player.prototype.update = function () {
        if (this.pointerLockControls.controlsEnabled) {
            var newVelocity = this.calculateNewVelocity(this.mesh.getLinearVelocity());
            var cameraRotationY = this.pointerLockControls.getObject().rotation.y;
            var axis = new THREE.Vector3(0, 1, 0);
            newVelocity.applyAxisAngle(axis, cameraRotationY);
            this.mesh.setLinearVelocity(newVelocity);
        }
        if (this._debugger) {
            this._debugger.updatePlayerCoordinates(this.mesh.getWorldPosition());
        }
        this.mesh.setAngularFactor(new THREE.Vector3(0, 0, 0));
    };
    return Player;
}());
exports.Player = Player;
//# sourceMappingURL=Player.js.map