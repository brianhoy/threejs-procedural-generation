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
//# sourceMappingURL=Generator.js.map