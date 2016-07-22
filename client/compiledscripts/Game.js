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
        this.chunkManager = new ChunkManager_1.ChunkManager(this.player, this.scene);
        this.render();
    }
    Game.prototype.initScene = function () {
        {
            var geometry = new THREE.CubeGeometry(100, 100, 100);
            var material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
            var cube = new Physijs.BoxMesh(geometry, material);
            cube.position.x = 1000;
            cube.position.y = 1000;
            cube.position.z = 1000;
            this.scene.add(cube);
        }
        {
            var light_1 = new THREE.PointLight(0xff0000, 1, 100);
            light_1.position.set(0, 0, 0);
            this.scene.add(light_1);
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
        if (Date.now() - scope.lastTime > 1000) {
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
//# sourceMappingURL=Game.js.map