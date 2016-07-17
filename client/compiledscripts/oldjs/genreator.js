"use strict";
var Generator = (function () {
    function Generator(scene, w, h) {
        this.mlib = {};
        this.scene = scene;
        this.SCREEN_WIDTH = w;
        this.SCREEN_HEIGHT = h;
        this.clock = new THREE.Clock();
        this.lightVal = 0;
        this.lightDir = 1;
        this.animDelta = 0;
        this.animDeltaDir = -1;
    }
    Generator.prototype.initHeightMaps = function () {
        var normalShader = THREE.NormalMapShader;
        var rx = 256, ry = 256;
        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
        var heightMap = new THREE.WebGLRenderTarget(rx, ry, pars);
        heightMap.texture.generateMipmaps = false;
        var normalMap = new THREE.WebGLRenderTarget(rx, ry, pars);
        normalMap.texture.generateMipmaps = false;
        var uniformsNoise = {
            time: { value: 1.0 },
            scale: { value: new THREE.Vector2(1.5, 1.5) },
            offset: { value: new THREE.Vector2(0, 0) }
        };
        var uniformsNormal = THREE.UniformsUtils.clone(normalShader.uniforms);
        uniformsNormal.height.value = 0.05;
        uniformsNormal.resolution.value.set(rx, ry);
        uniformsNormal.heightMap.value = heightMap.texture;
        var vertexShader = document.getElementById('vertexShader').textContent;
    };
    Generator.prototype.initTerrain = function () {
        var geometryTerrain = new THREE.PlaneBufferGeometry(6000, 6000, 256, 256);
        THREE.BufferGeometryUtils.computeTangents(geometryTerrain);
        this.terrain = new THREE.Mesh(geometryTerrain, this.mlib['terrain']);
        this.terrain.position.set(0, -125, 0);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.visible = false;
    };
    Generator.prototype.initTerrainShader = function () {
        var terrainShader = THREE.ShaderTerrain["terrain"];
        this.uniformsTerrain = THREE.UniformsUtils.clone(terrainShader.uniforms);
        this.uniformsTerrain['tNormal'].value = this.normalMap.texture;
        this.uniformsTerrain['uNormalScale'].value = 3.5;
        this.uniformsTerrain['tDisplacement'].value = this.heightMap.texture;
        this.uniformsTerrain['tDiffuse1'].value = this.diffuseTexture1;
        this.uniformsTerrain['tDiffuse2'].value = this.diffuseTexture2;
        this.uniformsTerrain['tSpecular'].value = this.specularMap.texture;
        this.uniformsTerrain['tDetail'].value = this.detailTexture;
        this.uniformsTerrain['enableDiffuse1'].value = true;
        this.uniformsTerrain['enableDiffuse2'].value = true;
        this.uniformsTerrain['enableSpecular'].value = true;
        this.uniformsTerrain['diffuse'].value.setHex(0xffffff);
        this.uniformsTerrain['specular'].value.setHex(0xffffff);
        this.uniformsTerrain['shininess'].value = 30;
        this.uniformsTerrain['uDisplacementScale'].value = 375;
        this.uniformsTerrain['uRepeatOverlay'].value.set(6, 6);
        var params = [
            ['heightmap', document.getElementById('fragmentShaderNoise').textContent, this.vertexShader, this.uniformsNoise, false],
            ['normal', this.normalShader.fragmentShader, this.normalShader.vertexShader, this.uniformsNormal, false],
            ['terrain', this.terrainShader.fragmentShader, this.terrainShader.vertexShader, this.uniformsTerrain, true]
        ];
        var material;
        for (var i = 0; i < params.length; i++) {
            material = new THREE.ShaderMaterial({
                uniforms: params[i][3],
                vertexShader: params[i][2],
                fragmentShader: params[i][1],
                lights: params[i][4],
                fog: true
            });
            this.mlib[params[i][0]] = material;
        }
        var plane = new THREE.PlaneBufferGeometry(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        var quadTarget = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: 0x000000 }));
        quadTarget.position.z = -500;
        this.scene.add(quadTarget);
    };
    Generator.prototype.initTextures = function () {
        var loadingManager = new THREE.LoadingManager(function () {
            this.terrain.visible = true;
        });
        var textureLoader = new THREE.TextureLoader(loadingManager);
        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
        this.specularMap = new THREE.WebGLRenderTarget(2048, 2048, pars);
        this.specularMap.texture.generateMipmaps = false;
        this.diffuseTexture1 = textureLoader.load("textures/terrain/grasslight-big.jpg");
        this.diffuseTexture2 = textureLoader.load("textures/terrain/backgrounddetailed6.jpg");
        this.detailTexture = textureLoader.load("textures/terrain/grasslight-big-nm.jpg");
        this.diffuseTexture1.wrapS = this.diffuseTexture1.wrapT = THREE.RepeatWrapping;
        this.diffuseTexture2.wrapS = this.diffuseTexture2.wrapT = THREE.RepeatWrapping;
        this.detailTexture.wrapS = this.detailTexture.wrapT = THREE.RepeatWrapping;
        this.specularMap.texture.wrapS = this.specularMap.texture.wrapT = THREE.RepeatWrapping;
    };
    Generator.prototype.update = function () {
        var delta = this.clock.getDelta();
        if (this.terrain.visible) {
            var time = Date.now() * 0.001;
            var fLow = 0.1, fHigh = 0.8;
            this.lightVal = THREE.Math.clamp(this.lightVal + 0.5 * delta * lightDir, fLow, fHigh);
            var valNorm = (this.lightVal - fLow) / (fHigh - fLow);
            this.scene.fog.color.setHSL(0.1, 0.5, this.lightVal);
            this.uniformsTerrain['uNormalScale'].value = THREE.Math.mapLinear(valNorm, 0, 1, 0.6, 3.5);
            if (this.updateNoise) {
                animDelta = THREE.Math.clamp(animDelta + 0.00075 * animDeltaDir, 0, 0.05);
                uniformsNoise['time'].value += delta * animDelta;
                uniformsNoise['offset'].value.x += delta * 0.05;
                uniformsTerrain['uOffset'].value.x = 4 * uniformsNoise['offset'].value.x;
                quadTarget.material = mlib['heightmap'];
                renderer.render(sceneRenderTarget, cameraOrtho, heightMap, true);
                quadTarget.material = mlib['normal'];
                renderer.render(sceneRenderTarget, cameraOrtho, normalMap, true);
            }
        }
    };
    return Generator;
}());
exports.Generator = Generator;
//# sourceMappingURL=genreator.js.map