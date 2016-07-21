"use strict";
var Generator_1 = require('./Generator');
var ChunkManager = (function () {
    function ChunkManager(player, scene, _debugger) {
        this._debugger = _debugger;
        this.tempObjects = [];
        this.generator = new Generator_1.Generator();
        this.renderDistance = 3;
        var arrlen = (2 * this.renderDistance) + 1;
        this.scene = scene;
        this.player = player;
        this.chunks = new Array(arrlen);
        this.playerChunkCoordinates = new THREE.Vector3(0, 0, 0);
        this.middleChunkCoordinates = new THREE.Vector3(0, 0, 0);
        this.deltaChunkCoordinates = new THREE.Vector3(0, 0, 0);
        for (var i = 0; i < this.chunks.length; i++) {
            this.chunks[i] = [];
            for (var j = 0; j < arrlen; j++) {
                this.chunks[i].push(null);
            }
        }
        this.fillNullChunks(0, 0);
    }
    ChunkManager.prototype.update = function () {
        this.updateChunkCoordinates();
        this.deltaChunkCoordinates.x = this.playerChunkCoordinates.x - this.middleChunkCoordinates.x;
        this.deltaChunkCoordinates.z = this.playerChunkCoordinates.z - this.middleChunkCoordinates.z;
        if (this.deltaChunkCoordinates.x != 0 || this.deltaChunkCoordinates.z != 0) {
            var mChunk = this.chunks[this.renderDistance][this.renderDistance];
            this.shift(-this.deltaChunkCoordinates.x, -this.deltaChunkCoordinates.z);
            this.fillNullChunks(this.playerChunkCoordinates.x, this.playerChunkCoordinates.z);
        }
    };
    ChunkManager.prototype.updateDebugInfo = function () {
        if (this._debugger) {
            this._debugger.updateChunksTable(this.chunks);
            this._debugger.updatePlayerChunkCoordinates(this.playerChunkCoordinates);
        }
    };
    ChunkManager.prototype.shift = function (x, y) {
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
            for (var i = 0; i < this.chunks.length; i++) {
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
    };
    ChunkManager.prototype.nullifyChunks = function () {
        for (var i = 0; i < this.chunks.length; i++) {
            for (var j = 0; j < this.chunks.length; j++) {
                this.unloadChunk(this.chunks[i][j], i, j);
                this.chunks[i][j] = null;
            }
        }
    };
    ChunkManager.prototype.unloadChunk = function (chunk, x, y) {
        this.scene.remove(chunk);
    };
    ChunkManager.prototype.fillNullChunks = function (middleChunkX, middleChunkY) {
        if (this.chunks[0].length % 2 != 1 || this.chunks.length % 2 != 1)
            throw new Error("Chunk render distance is not odd");
        var middleXY = this.renderDistance;
        for (var row = 0; row < this.chunks.length; row++) {
            for (var col = 0; col < this.chunks[0].length; col++) {
                if (this.chunks[row][col] == null) {
                    this.chunks[row][col] = this.generator.createTerrain((col) - middleXY + middleChunkX, -row + middleXY + middleChunkY);
                    this.scene.add(this.chunks[row][col]);
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
        this.middleChunkCoordinates.x = Math.floor(this.chunks[this.renderDistance][this.renderDistance].position.x / 1000);
        this.middleChunkCoordinates.z = Math.floor(this.chunks[this.renderDistance][this.renderDistance].position.z / 1000);
    };
    return ChunkManager;
}());
exports.ChunkManager = ChunkManager;
//# sourceMappingURL=ChunkManager.js.map