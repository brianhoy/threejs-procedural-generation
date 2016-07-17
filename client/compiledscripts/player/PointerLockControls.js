"use strict";
var PointerLockControls = (function () {
    function PointerLockControls(camera) {
        this.camera = camera;
        PointerLockControls.scope = this;
        camera.rotation.set(0, 0, 0);
        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(camera);
        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 10;
        this.yawObject.add(this.pitchObject);
        this.PI_2 = Math.PI / 2;
        this.havePointerLock = this.checkPointerLock();
        this.initPointerLock();
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    }
    PointerLockControls.prototype.checkPointerLock = function () {
        return 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;
    };
    PointerLockControls.prototype.initPointerLock = function () {
        this.rootElement = document.body;
        if (this.havePointerLock) {
            document.addEventListener('pointerlockchange', this.pointerLockChange.bind(this), false);
            document.addEventListener('pointerlockerror', this.pointerLockError.bind(this), false);
            this.rootElement.addEventListener('click', this.requestPointerLock.bind(this), false);
        }
        else {
            this.rootElement.innerHTML = 'Bad browser; No pointer lock';
        }
    };
    PointerLockControls.prototype.pointerLockChange = function () {
        if (document.pointerLockElement === this.rootElement) {
            this.controlsEnabled = true;
            this.pointerLockEnabled = true;
        }
        else {
            this.controlsEnabled = false;
            this.pointerLockEnabled = false;
        }
    };
    PointerLockControls.prototype.pointerLockError = function () {
        this.rootElement.innerHTML = 'PointerLock Error';
    };
    PointerLockControls.prototype.requestPointerLock = function () {
        document.body.requestPointerLock();
    };
    PointerLockControls.prototype.onMouseMove = function (event) {
        if (this.pointerLockEnabled === false)
            return;
        var movementX = event.movementX || 0;
        var movementY = event.movementY || 0;
        this.yawObject.rotation.y -= movementX * 0.002;
        this.pitchObject.rotation.x -= movementY * 0.002;
        this.pitchObject.rotation.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.pitchObject.rotation.x));
    };
    PointerLockControls.prototype.getObject = function () {
        return this.yawObject;
    };
    PointerLockControls.prototype.getDirection = function () {
        var direction = new THREE.Vector3(0, 0, -1);
        var rotation = new THREE.Euler(0, 0, 0, "YXZ");
        return function (v) {
            rotation.set(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0);
            v.copy(direction).applyEuler(rotation);
            return v;
        };
    };
    PointerLockControls.prototype.dispose = function () {
        document.removeEventListener('mousemove', this.onMouseMove, false);
    };
    return PointerLockControls;
}());
exports.PointerLockControls = PointerLockControls;
//# sourceMappingURL=PointerLockControls.js.map