(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var Sky_1 = require('./sky/Sky');
var Player_1 = require('./player/Player');
var ChunkManager_1 = require('./procedural-generation/ChunkManager');
var Debugger_1 = require('./debugger/Debugger');
var scene;
var Game = (function () {
    function Game() {
        this.debugger = new Debugger_1.Debugger();
        this.renderer = new THREE.WebGLRenderer();
        this.scene = new Physijs.Scene();
        scene = this.scene;
        this.initScene();
        this.initResizeControl();
        this.sky = new Sky_1.Sky(this.scene);
        this.scene.add(this.sky.mesh);
        this.scene.setGravity(new THREE.Vector3(0, -80, 0));
        this.lastTime = Date.now();
        document.body.appendChild(this.renderer.domElement);
        this.initPlayer();
        this.chunkManager = new ChunkManager_1.ChunkManager(this.player, this.scene, this.debugger);
        this.render();
    }
    Game.prototype.initScene = function () {
        {
            var geometry = new THREE.CubeGeometry(10, 10, 10);
            var material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
            for (var i = 0; i <= 5; i++) {
                var cube = new Physijs.BoxMesh(geometry, material);
                cube.position.x = (Math.random() - 0.5) * 200;
                cube.position.y = (Math.random() - 0.5) * 200;
                cube.position.z = (Math.random() - 0.5) * 200;
                this.scene.add(cube);
            }
        }
        {
            var geometry = new THREE.CylinderGeometry(200, 200, 5, 32);
            var material = new THREE.MeshLambertMaterial({ color: 0xdddddd });
            var cylinder = new Physijs.CylinderMesh(geometry, material, 0);
            cylinder.position.x = -60;
            cylinder.position.y = -60;
            cylinder.position.z = -60;
            this.scene.add(cylinder);
        }
        var light = new THREE.AmbientLight(0x404040);
        this.scene.add(light);
    };
    Game.prototype.initPlayer = function () {
        this.player = new Player_1.Player(this.scene, this.debugger);
    };
    Game.prototype.initResizeControl = function () {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        var scope = this;
        window.addEventListener('resize', function () {
            scope.SCREEN_WIDTH = window.innerWidth;
            scope.SCREEN_HEIGHT = window.innerHeight;
            scope.player.camera.aspect = window.innerWidth / window.innerHeight;
            scope.player.camera.updateProjectionMatrix();
            scope.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    };
    ;
    Game.prototype.render = function (s) {
        var scope = s || this;
        if (Date.now() - scope.lastTime > 2000) {
            scope.lastTime = Date.now();
            scope.softUpdate();
        }
        scope.player.update();
        scope.sky.update(1);
        scope.scene.simulate();
        scope.renderer.render(this.scene, this.player.camera);
        requestAnimationFrame(function () {
            scope.render(scope);
        });
    };
    Game.prototype.softUpdate = function () {
        this.chunkManager.update();
    };
    return Game;
}());
exports.Game = Game;

},{"./debugger/Debugger":3,"./player/Player":4,"./procedural-generation/ChunkManager":6,"./sky/Sky":8}],2:[function(require,module,exports){
"use strict";
var Game_1 = require('./Game');
window.onload = function () {
    var game = new Game_1.Game();
};

},{"./Game":1}],3:[function(require,module,exports){
"use strict";
var Debugger = (function () {
    function Debugger() {
        this.playerCoordinatesElement = document.getElementById("debugPosition");
        this.playerChunkCoordinatesElement = document.getElementById("debugChunkCoordinates");
        this.chunksTableElement = document.getElementById("debugChunks");
    }
    Debugger.prototype.updateChunksTable = function (chunks) {
        for (var i = 0; i < chunks.length; i++) {
            var row = this.chunksTableElement.rows[i];
            for (var j = 0; j < chunks.length; j++) {
                if (chunks[i][j]) {
                    row.cells[j].innerHTML = "x: " + Math.floor(chunks[i][j].position.x / 1000) + ", z: " + Math.floor(chunks[i][j].position.z / 1000);
                }
                else {
                    row.cells[j].innerHTML = "null";
                }
            }
        }
    };
    Debugger.prototype.updatePlayerCoordinates = function (coordinates) {
        this.playerCoordinatesElement.innerHTML = "x: " + coordinates.x + "<br>y: " + coordinates.y + "<br>z: " + coordinates.z;
    };
    Debugger.prototype.updatePlayerChunkCoordinates = function (coordinates) {
        this.playerChunkCoordinatesElement.innerHTML = "x: " + coordinates.x + ", y: " + coordinates.y + ", z: " + coordinates.z;
    };
    return Debugger;
}());
exports.Debugger = Debugger;

},{}],4:[function(require,module,exports){
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

},{"./PointerLockControls":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";
var Generator_1 = require('./Generator');
var ChunkManager = (function () {
    function ChunkManager(player, scene, _debugger) {
        this._debugger = _debugger;
        this.tempObjects = [];
        this.generator = new Generator_1.Generator();
        this.renderDistance = 1;
        this.scene = scene;
        this.player = player;
        this.chunks = new Array(3);
        this.playerChunkCoordinates = new THREE.Vector3(0, 0, 0);
        this.middleChunkCoordinates = new THREE.Vector3(0, 0, 0);
        this.deltaChunkCoordinates = new THREE.Vector3(0, 0, 0);
        for (var i = 0; i < this.chunks.length; i++) {
            this.chunks[i] = [null, null, null];
        }
        this.fillNullChunks(0, 0);
    }
    ChunkManager.prototype.update = function () {
        this.updateChunkCoordinates();
        this.deltaChunkCoordinates.x = this.playerChunkCoordinates.x - this.middleChunkCoordinates.x;
        this.deltaChunkCoordinates.z = this.playerChunkCoordinates.z - this.middleChunkCoordinates.z;
        if (this.deltaChunkCoordinates.x != 0 || this.deltaChunkCoordinates.z != 0) {
            var mChunk = this.chunks[this.renderDistance][this.renderDistance];
            console.log("shift delta x:", -this.deltaChunkCoordinates.x, "z:", this.deltaChunkCoordinates.z);
            this.shift(-this.deltaChunkCoordinates.x, this.deltaChunkCoordinates.z);
            this.updateDebugInfo();
            console.log("calling fillNullChunks: ", this.playerChunkCoordinates);
            this.fillNullChunks(this.playerChunkCoordinates.x, this.playerChunkCoordinates.z);
            setTimeout(this.updateDebugInfo.bind(this), 500);
        }
    };
    ChunkManager.prototype.updateDebugInfo = function () {
        if (this._debugger) {
            this._debugger.updateChunksTable(this.chunks);
            this._debugger.updatePlayerChunkCoordinates(this.playerChunkCoordinates);
        }
    };
    ChunkManager.prototype.shift = function (x, y) {
        console.log("Shifting x: ", x, ", z: ", y + ", chunks: ", this.chunks);
        if (x > 0) {
            for (var i = 0; i < this.chunks.length; i++) {
                for (var j = this.chunks[i].length - 1; j >= 0; j--) {
                    if (j + x > this.chunks[i].length - 1 && this.chunks[i][j]) {
                        this.unloadChunk(this.chunks[i][j], x, y);
                    }
                    if (j < x) {
                        this.chunks[i][j] = null;
                    }
                    else {
                        this.chunks[i][j] = this.chunks[i][j - x];
                    }
                }
            }
        }
        else if (x < 0) {
            for (var i = 0; i < this.chunks.length; i++) {
                for (var j = 0; j < this.chunks[i].length; j++) {
                    if (j + x < 0 && this.chunks[i][j]) {
                        this.unloadChunk(this.chunks[i][j], x, y);
                    }
                    if (j - x >= this.chunks[i].length) {
                        this.chunks[i][j] = null;
                    }
                    else {
                        this.chunks[i][j] = this.chunks[i][j - x];
                    }
                }
            }
        }
        if (y > 0) {
            for (var i = 0; i + y < this.chunks.length; i++) {
                if (i + y >= this.chunks.length) {
                    for (var j = 0; j < this.chunks.length; j++) {
                        if (i - y < 0 && this.chunks[i][j]) {
                            this.unloadChunk(this.chunks[i][j], x, y);
                        }
                        this.chunks[i][j] = null;
                    }
                }
                else {
                    for (var j = 0; j < this.chunks.length; j++) {
                        if (i - y < 0 && this.chunks[i][j]) {
                            this.unloadChunk(this.chunks[i][j], x, y);
                        }
                        this.chunks[i][j] = this.chunks[i + y][j];
                    }
                }
            }
        }
        else if (y < 0) {
            for (var i = this.chunks.length - 1; i >= 0; i--) {
                if (i + y < 0) {
                    for (var j = 0; j < this.chunks.length; j++) {
                        if (i - y > this.chunks.length - 1 && this.chunks[i][j]) {
                            this.unloadChunk(this.chunks[i][j], x, y);
                        }
                        this.chunks[i][j] = null;
                    }
                }
                else {
                    for (var j = 0; j < this.chunks.length; j++) {
                        if (i - y > this.chunks.length - 1 && this.chunks[i][j]) {
                            this.unloadChunk(this.chunks[i][j], x, y);
                        }
                        this.chunks[i][j] = this.chunks[i + y][j];
                    }
                }
            }
        }
        console.log("After shfting, chunks = ", this.chunks);
    };
    ChunkManager.prototype.unloadChunk = function (chunk, x, y) {
        this.scene.remove(chunk);
    };
    ChunkManager.prototype.fillNullChunks = function (middleChunkX, middleChunkY) {
        if (this.chunks[0].length % 2 != 1 || this.chunks.length % 2 != 1)
            throw new Error("Chunk render distance is not odd");
        var middleXY = this.renderDistance;
        for (var i = 0; i < this.chunks.length; i++) {
            for (var j = 0; j < this.chunks[0].length; j++) {
                if (this.chunks[i][j] == null) {
                    this.chunks[i][j] = this.generator.createTerrain(j - middleXY + middleChunkY, -i + middleXY + middleChunkX);
                    this.scene.add(this.chunks[i][j]);
                }
            }
        }
    };
    ChunkManager.prototype.getChunkCoordinates = function (vec) {
        vec.x = Math.floor(vec.x / 1000);
        vec.z = Math.floor(vec.z / 1000);
        return vec;
    };
    ChunkManager.prototype.updateChunkCoordinates = function () {
        this.playerChunkCoordinates.x = Math.floor(this.player.mesh.position.x / 1000);
        this.playerChunkCoordinates.z = Math.floor(this.player.mesh.position.z / 1000);
        this.middleChunkCoordinates.x = Math.floor(this.chunks[1][1].position.x / 1000);
        this.middleChunkCoordinates.z = Math.floor(this.chunks[1][1].position.z / 1000);
    };
    return ChunkManager;
}());
exports.ChunkManager = ChunkManager;

},{"./Generator":7}],7:[function(require,module,exports){
"use strict";
var Generator = (function () {
    function Generator(textureLoader) {
        var _this = this;
        this.textureLoader = textureLoader || new THREE.TextureLoader();
        this.noiseGenerator = new SimplexNoise();
        this.mountainNoiseGenerator = new SimplexNoise();
        this.mountainMultiplierNoiseGenerator = new SimplexNoise();
        this.textureLoader.load('images/grass.png', function (texture) { _this.grassTexture = texture; });
    }
    Generator.prototype.createTerrain = function (x, y) {
        x *= 1000;
        y *= 1000;
        var ground_material = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: this.grassTexture || THREE.ImageUtils.loadTexture('images/grass.png') }), .8, .4);
        ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
        ground_material.map.repeat.set(100, 100);
        var ground_geometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
        for (var i = 0; i < ground_geometry.vertices.length; i++) {
            var vertex = ground_geometry.vertices[i];
            var mountainNoise = this.mountainNoiseGenerator.noise((vertex.x + x) / 2000, (vertex.y - y) / 2000) * 10000;
            var mountainMultiplierNoise = this.mountainMultiplierNoiseGenerator.noise((vertex.x + x) / 50000, (vertex.y - y) / 50000);
            vertex.z = this.noiseGenerator.noise((vertex.x + x) / 1000, (vertex.y - y) / 1000) * (mountainMultiplierNoise * mountainNoise);
        }
        ground_geometry.computeFaceNormals();
        ground_geometry.computeVertexNormals();
        var ground = new Physijs.HeightfieldMesh(ground_geometry, ground_material, 0, 50, 50);
        ground.rotation.x = Math.PI / -2;
        ground.receiveShadow = true;
        ground.position.x += x;
        ground.position.z += y;
        return ground;
    };
    return Generator;
}());
exports.Generator = Generator;

},{}],8:[function(require,module,exports){
"use strict";
THREE.ShaderLib['sky'] = {
    uniforms: {
        luminance: { value: 1 },
        turbidity: { value: 2 },
        reileigh: { value: 1 },
        mieCoefficient: { value: 0.005 },
        mieDirectionalG: { value: 0.8 },
        sunPosition: { value: new THREE.Vector3() }
    },
    vertexShader: [
        "varying vec3 vWorldPosition;",
        "void main() {",
        "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
        "vWorldPosition = worldPosition.xyz;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}",
    ].join("\n"),
    fragmentShader: [
        "uniform sampler2D skySampler;",
        "uniform vec3 sunPosition;",
        "varying vec3 vWorldPosition;",
        "vec3 cameraPos = vec3(0., 0., 0.);",
        "// uniform sampler2D sDiffuse;",
        "// const float turbidity = 10.0; //",
        "// const float reileigh = 2.; //",
        "// const float luminance = 1.0; //",
        "// const float mieCoefficient = 0.005;",
        "// const float mieDirectionalG = 0.8;",
        "uniform float luminance;",
        "uniform float turbidity;",
        "uniform float reileigh;",
        "uniform float mieCoefficient;",
        "uniform float mieDirectionalG;",
        "// constants for atmospheric scattering",
        "const float e = 2.71828182845904523536028747135266249775724709369995957;",
        "const float pi = 3.141592653589793238462643383279502884197169;",
        "const float n = 1.0003; // refractive index of air",
        "const float N = 2.545E25; // number of molecules per unit volume for air at",
        "// 288.15K and 1013mb (sea level -45 celsius)",
        "const float pn = 0.035;	// depolatization factor for standard air",
        "// wavelength of used primaries, according to preetham",
        "const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);",
        "// mie stuff",
        "// K coefficient for the primaries",
        "const vec3 K = vec3(0.686, 0.678, 0.666);",
        "const float v = 4.0;",
        "// optical length at zenith for molecules",
        "const float rayleighZenithLength = 8.4E3;",
        "const float mieZenithLength = 1.25E3;",
        "const vec3 up = vec3(0.0, 1.0, 0.0);",
        "const float EE = 1000.0;",
        "const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;",
        "// 66 arc seconds -> degrees, and the cosine of that",
        "// earth shadow hack",
        "const float cutoffAngle = pi/1.95;",
        "const float steepness = 1.5;",
        "vec3 totalRayleigh(vec3 lambda)",
        "{",
        "return (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn));",
        "}",
        "// A simplied version of the total Reayleigh scattering to works on browsers that use ANGLE",
        "vec3 simplifiedRayleigh()",
        "{",
        "return 0.0005 / vec3(94, 40, 18);",
        "}",
        "float rayleighPhase(float cosTheta)",
        "{	 ",
        "return (3.0 / (16.0*pi)) * (1.0 + pow(cosTheta, 2.0));",
        "//	return (1.0 / (3.0*pi)) * (1.0 + pow(cosTheta, 2.0));",
        "//	return (3.0 / 4.0) * (1.0 + pow(cosTheta, 2.0));",
        "}",
        "vec3 totalMie(vec3 lambda, vec3 K, float T)",
        "{",
        "float c = (0.2 * T ) * 10E-18;",
        "return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;",
        "}",
        "float hgPhase(float cosTheta, float g)",
        "{",
        "return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));",
        "}",
        "float sunIntensity(float zenithAngleCos)",
        "{",
        "return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos))/steepness)));",
        "}",
        "// float logLuminance(vec3 c)",
        "// {",
        "// 	return log(c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722);",
        "// }",
        "// Filmic ToneMapping http://filmicgames.com/archives/75",
        "float A = 0.15;",
        "float B = 0.50;",
        "float C = 0.10;",
        "float D = 0.20;",
        "float E = 0.02;",
        "float F = 0.30;",
        "float W = 1000.0;",
        "vec3 Uncharted2Tonemap(vec3 x)",
        "{",
        "return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;",
        "}",
        "void main() ",
        "{",
        "float sunfade = 1.0-clamp(1.0-exp((sunPosition.y/450000.0)),0.0,1.0);",
        "// luminance =  1.0 ;// vWorldPosition.y / 450000. + 0.5; //sunPosition.y / 450000. * 1. + 0.5;",
        "// gl_FragColor = vec4(sunfade, sunfade, sunfade, 1.0);",
        "float reileighCoefficient = reileigh - (1.0* (1.0-sunfade));",
        "vec3 sunDirection = normalize(sunPosition);",
        "float sunE = sunIntensity(dot(sunDirection, up));",
        "// extinction (absorbtion + out scattering) ",
        "// rayleigh coefficients",
        "vec3 betaR = simplifiedRayleigh() * reileighCoefficient;",
        "// mie coefficients",
        "vec3 betaM = totalMie(lambda, K, turbidity) * mieCoefficient;",
        "// optical length",
        "// cutoff angle at 90 to avoid singularity in next formula.",
        "float zenithAngle = acos(max(0.0, dot(up, normalize(vWorldPosition - cameraPos))));",
        "float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));",
        "float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));",
        "// combined extinction factor	",
        "vec3 Fex = exp(-(betaR * sR + betaM * sM));",
        "// in scattering",
        "float cosTheta = dot(normalize(vWorldPosition - cameraPos), sunDirection);",
        "float rPhase = rayleighPhase(cosTheta*0.5+0.5);",
        "vec3 betaRTheta = betaR * rPhase;",
        "float mPhase = hgPhase(cosTheta, mieDirectionalG);",
        "vec3 betaMTheta = betaM * mPhase;",
        "vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex),vec3(1.5));",
        "Lin *= mix(vec3(1.0),pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex,vec3(1.0/2.0)),clamp(pow(1.0-dot(up, sunDirection),5.0),0.0,1.0));",
        "//nightsky",
        "vec3 direction = normalize(vWorldPosition - cameraPos);",
        "float theta = acos(direction.y); // elevation --> y-axis, [-pi/2, pi/2]",
        "float phi = atan(direction.z, direction.x); // azimuth --> x-axis [-pi/2, pi/2]",
        "vec2 uv = vec2(phi, theta) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);",
        "// vec3 L0 = texture2D(skySampler, uv).rgb+0.1 * Fex;",
        "vec3 L0 = vec3(0.1) * Fex;",
        "// composition + solar disc",
        "//if (cosTheta > sunAngularDiameterCos)",
        "float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);",
        "// if (normalize(vWorldPosition - cameraPos).y>0.0)",
        "L0 += (sunE * 19000.0 * Fex)*sundisk;",
        "vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));",
        "vec3 texColor = (Lin+L0);   ",
        "texColor *= 0.04 ;",
        "texColor += vec3(0.0,0.001,0.0025)*0.3;",
        "float g_fMaxLuminance = 1.0;",
        "float fLumScaled = 0.1 / luminance;     ",
        "float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled); ",
        "float ExposureBias = fLumCompressed;",
        "vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*texColor);",
        "vec3 color = curr*whiteScale;",
        "vec3 retColor = pow(color,vec3(1.0/(1.2+(1.2*sunfade))));",
        "gl_FragColor.rgb = retColor;",
        "gl_FragColor.a = 1.0;",
        "}",
    ].join("\n")
};
var Sky = (function () {
    function Sky(scene) {
        this.distance = 400000;
        this.scene = scene;
        this.initializeSettings();
        this.createMesh();
        this.createSun();
        this.createSunDirectionalLight();
    }
    Sky.prototype.createMesh = function () {
        var skyShader = THREE.ShaderLib["sky"];
        this.uniforms = THREE.UniformsUtils.clone(skyShader.uniforms);
        var skyMat = new THREE.ShaderMaterial({
            fragmentShader: skyShader.fragmentShader,
            vertexShader: skyShader.vertexShader,
            uniforms: this.uniforms,
            side: THREE.BackSide
        });
        var skyGeo = new THREE.SphereBufferGeometry(45000, 32, 15);
        this.mesh = new THREE.Mesh(skyGeo, skyMat);
    };
    Sky.prototype.createSun = function () {
        this.sunSphere = new THREE.Mesh(new THREE.SphereBufferGeometry(20000, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        this.sunSphere.position.y = -700000;
        this.sunSphere.visible = false;
        this.scene.add(this.sunSphere);
    };
    Sky.prototype.createSunDirectionalLight = function () {
        this.sunDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.sunDirectionalLight.position.set(0, 1, 0);
        this.scene.add(this.sunDirectionalLight);
    };
    Sky.prototype.initializeSettings = function () {
        this.settings = {
            turbidity: 10,
            reileigh: 2,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.8,
            luminance: 1,
            inclination: 0.00,
            azimuth: 0.25,
            sun: !true
        };
    };
    Sky.prototype.updateSettings = function () {
        this.uniforms.turbidity.value = this.settings.turbidity;
        this.uniforms.reileigh.value = this.settings.reileigh;
        this.uniforms.luminance.value = this.settings.luminance;
        this.uniforms.mieCoefficient.value = this.settings.mieCoefficient;
        this.uniforms.mieDirectionalG.value = this.settings.mieDirectionalG;
        var theta = Math.PI * (this.settings.inclination - 0.5);
        var phi = 2 * Math.PI * (this.settings.azimuth - 0.5);
        this.sunSphere.position.x = this.distance * Math.cos(phi);
        this.sunSphere.position.y = this.distance * Math.sin(phi) * Math.sin(theta);
        this.sunSphere.position.z = this.distance * Math.sin(phi) * Math.cos(theta);
        this.sunSphere.visible = this.settings.sun;
        this.uniforms.sunPosition.value.copy(this.sunSphere.position);
    };
    Sky.prototype.update = function (delta) {
        delta = delta || 1;
        while (this.settings.inclination > 2) {
            this.settings.inclination -= 2;
        }
        this.sunDirectionalLight.position.set(this.sunSphere.position.x, this.sunSphere.position.y, this.sunSphere.position.z);
        this.settings.inclination += delta * 0.00001;
        this.updateSettings();
    };
    return Sky;
}());
exports.Sky = Sky;
;

},{}]},{},[2]);