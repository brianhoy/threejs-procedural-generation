"use strict";
var Generator = (function () {
    function Generator(textureLoader) {
        this.textureLoader = textureLoader || new THREE.TextureLoader();
        this.noiseGenerator = new SimplexNoise();
        this.mountainMultiplierNoiseGenerator = new SimplexNoise();
        this.shaders = { terrainLambert: THREE.ShaderLib['lambert'] };
        var myProperties = {
            lights: true,
            fog: true,
            transparent: true,
            color: new THREE.Color(10, 150, 20),
            map: this.grassTexture || THREE.ImageUtils.loadTexture('images/grass.png')
        };
        var myUniforms = {
            opacity: { type: "f", value: 0.4 },
            color: new THREE.Vector3(255, 100, 0),
            time: { value: 1.0 }
        };
        this.ground_material = Physijs.createMaterial(this.terrainLambertMaterial(myProperties, myUniforms), .8, .4);
    }
    Generator.prototype.terrainLambertMaterial = function (parameters, uniforms_) {
        THREE.ShaderChunk["meshlambert_premain_fragment"] = "\n\t\t\t\tuniform vec3 diffuse;\n\t\t\t\tuniform vec3 emissive;\n\t\t\t\tuniform float opacity;\n\n\t\t\t\tvarying vec3 vLightFront;\n\n\t\t\t\t#ifdef DOUBLE_SIDED\n\n\t\t\t\t\tvarying vec3 vLightBack;\n\n\t\t\t\t#endif\n\n\t\t\t\t#include <common>\n\t\t\t\t#include <packing>\n\t\t\t\t#include <color_pars_fragment>\n\t\t\t\t#include <uv_pars_fragment>\n\t\t\t\t#include <uv2_pars_fragment>\n\t\t\t\t#include <map_pars_fragment>\n\t\t\t\t#include <alphamap_pars_fragment>\n\t\t\t\t#include <aomap_pars_fragment>\n\t\t\t\t#include <lightmap_pars_fragment>\n\t\t\t\t#include <emissivemap_pars_fragment>\n\t\t\t\t#include <envmap_pars_fragment>\n\t\t\t\t#include <bsdfs>\n\t\t\t\t#include <lights_pars>\n\t\t\t\t#include <fog_pars_fragment>\n\t\t\t\t#include <shadowmap_pars_fragment>\n\t\t\t\t#include <shadowmask_pars_fragment>\n\t\t\t\t#include <specularmap_pars_fragment>\n\t\t\t\t#include <logdepthbuf_pars_fragment>\n\t\t\t\t#include <clipping_planes_pars_fragment>\n\t\t";
        var material = new THREE.ShaderMaterial({
            vertexShader: "\n\t\t\t\t#define LAMBERT\n\n\t\t\t\tvarying vec3 vLightFront;\n\n\t\t\t\t#ifdef DOUBLE_SIDED\n\n\t\t\t\t\tvarying vec3 vLightBack;\n\n\t\t\t\t#endif\n\n\t\t\t\t#include <common>\n\t\t\t\t#include <uv_pars_vertex>\n\t\t\t\t#include <uv2_pars_vertex>\n\t\t\t\t#include <envmap_pars_vertex>\n\t\t\t\t#include <bsdfs>\n\t\t\t\t#include <lights_pars>\n\t\t\t\t#include <color_pars_vertex>\n\t\t\t\t#include <morphtarget_pars_vertex>\n\t\t\t\t#include <skinning_pars_vertex>\n\t\t\t\t#include <shadowmap_pars_vertex>\n\t\t\t\t#include <logdepthbuf_pars_vertex>\n\t\t\t\t#include <clipping_planes_pars_vertex>\n\n\t\t\t\tvarying vec3 vertexColor;\n\t\t\t\tvarying vec2 vUv;\n\t\t\t\tvarying vec4 worldPosition;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvertexColor = vec3(255, 100, 0);\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tworldPosition = modelMatrix * vec4( position, 1.0 );\n\n\t\t\t\t\t#include <uv_vertex>\n\t\t\t\t\t#include <uv2_vertex>\n\t\t\t\t\t#include <color_vertex>\n\n\t\t\t\t\t#include <beginnormal_vertex>\n\t\t\t\t\t#include <morphnormal_vertex>\n\t\t\t\t\t#include <skinbase_vertex>\n\t\t\t\t\t#include <skinnormal_vertex>\n\t\t\t\t\t#include <defaultnormal_vertex>\n\n\t\t\t\t\t#include <begin_vertex>\n\t\t\t\t\t#include <morphtarget_vertex>\n\t\t\t\t\t#include <skinning_vertex>\n\t\t\t\t\t#include <project_vertex>\n\t\t\t\t\t#include <logdepthbuf_vertex>\n\t\t\t\t\t#include <clipping_planes_vertex>\n\n\t\t\t\t\t#include <worldpos_vertex>\n\t\t\t\t\t#include <envmap_vertex>\n\t\t\t\t\t#include <lights_lambert_vertex>\n\t\t\t\t\t#include <shadowmap_vertex>\n\n\t\t\t\t}\t\t\t",
            fragmentShader: "\n\t\t\t\tuniform float time;\n\t\t\t\tvarying vec2 vUv;\n\n\t\t\t\tvec4 permute( vec4 x ) {\n\n\t\t\t\t\treturn mod( ( ( x * 34.0 ) + 1.0 ) * x, 289.0 );\n\n\t\t\t\t}\n\n\t\t\t\tvec4 taylorInvSqrt( vec4 r ) {\n\n\t\t\t\t\treturn 1.79284291400159 - 0.85373472095314 * r;\n\n\t\t\t\t}\n\n\t\t\t\tfloat snoise( vec3 v ) {\n\n\t\t\t\t\tconst vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );\n\t\t\t\t\tconst vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );\n\n\t\t\t\t\t// First corner\n\n\t\t\t\t\tvec3 i  = floor( v + dot( v, C.yyy ) );\n\t\t\t\t\tvec3 x0 = v - i + dot( i, C.xxx );\n\n\t\t\t\t\t// Other corners\n\n\t\t\t\t\tvec3 g = step( x0.yzx, x0.xyz );\n\t\t\t\t\tvec3 l = 1.0 - g;\n\t\t\t\t\tvec3 i1 = min( g.xyz, l.zxy );\n\t\t\t\t\tvec3 i2 = max( g.xyz, l.zxy );\n\n\t\t\t\t\tvec3 x1 = x0 - i1 + 1.0 * C.xxx;\n\t\t\t\t\tvec3 x2 = x0 - i2 + 2.0 * C.xxx;\n\t\t\t\t\tvec3 x3 = x0 - 1. + 3.0 * C.xxx;\n\n\t\t\t\t\t// Permutations\n\n\t\t\t\t\ti = mod( i, 289.0 );\n\t\t\t\t\tvec4 p = permute( permute( permute(\n\t\t\t\t\t\t\ti.z + vec4( 0.0, i1.z, i2.z, 1.0 ) )\n\t\t\t\t\t\t+ i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) )\n\t\t\t\t\t\t+ i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );\n\n\t\t\t\t\t// Gradients\n\t\t\t\t\t// ( N*N points uniformly over a square, mapped onto an octahedron.)\n\n\t\t\t\t\tfloat n_ = 1.0 / 7.0; // N=7\n\n\t\t\t\t\tvec3 ns = n_ * D.wyz - D.xzx;\n\n\t\t\t\t\tvec4 j = p - 49.0 * floor( p * ns.z *ns.z );  //  mod(p,N*N)\n\n\t\t\t\t\tvec4 x_ = floor( j * ns.z );\n\t\t\t\t\tvec4 y_ = floor( j - 7.0 * x_ );    // mod(j,N)\n\n\t\t\t\t\tvec4 x = x_ *ns.x + ns.yyyy;\n\t\t\t\t\tvec4 y = y_ *ns.x + ns.yyyy;\n\t\t\t\t\tvec4 h = 1.0 - abs( x ) - abs( y );\n\n\t\t\t\t\tvec4 b0 = vec4( x.xy, y.xy );\n\t\t\t\t\tvec4 b1 = vec4( x.zw, y.zw );\n\n\n\t\t\t\t\tvec4 s0 = floor( b0 ) * 2.0 + 1.0;\n\t\t\t\t\tvec4 s1 = floor( b1 ) * 2.0 + 1.0;\n\t\t\t\t\tvec4 sh = -step( h, vec4( 0.0 ) );\n\n\t\t\t\t\tvec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;\n\t\t\t\t\tvec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;\n\n\t\t\t\t\tvec3 p0 = vec3( a0.xy, h.x );\n\t\t\t\t\tvec3 p1 = vec3( a0.zw, h.y );\n\t\t\t\t\tvec3 p2 = vec3( a1.xy, h.z );\n\t\t\t\t\tvec3 p3 = vec3( a1.zw, h.w );\n\n\t\t\t\t\t// Normalise gradients\n\n\t\t\t\t\tvec4 norm = taylorInvSqrt( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) );\n\t\t\t\t\tp0 *= norm.x;\n\t\t\t\t\tp1 *= norm.y;\n\t\t\t\t\tp2 *= norm.z;\n\t\t\t\t\tp3 *= norm.w;\n\n\t\t\t\t\t// Mix final noise value\n\n\t\t\t\t\tvec4 m = max( 0.6 - vec4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ), 0.0 );\n\t\t\t\t\tm = m * m;\n\t\t\t\t\treturn 42.0 * dot( m*m, vec4( dot( p0, x0 ), dot( p1, x1 ),\n\t\t\t\t\t\t\t\t\t\t\t\tdot( p2, x2 ), dot( p3, x3 ) ) );\n\n\t\t\t\t}\n\n\t\t\t\tvarying vec4 worldPosition;\n\n\t\t\t\t#include <meshlambert_premain_fragment>\n\n\t\t\t\tfloat sigmoid(float x) {\n\t\t\t\t\treturn x / (1.0 + abs(x));\n\t\t\t\t}\n\n\t\t\t\tvarying vec3 vertexColor;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\t#include <clipping_planes_fragment>\n\n\n\t\t\t\t\tvec4 diffuseColor = vec4(diffuse, opacity );\n\t\t\t\t\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\t\t\t\t\tvec3 totalEmissiveRadiance = emissive;\n\n\t\t\t\t\t#include <logdepthbuf_fragment>\n\t\t\t\t\t#include <map_fragment>\n\t\t\t\t\tif(worldPosition.y > 300.0) { //snow\n\t\t\t\t\t\tfloat noise = snoise(vec3(worldPosition.x * 4.0, worldPosition.y * 4.0, worldPosition.z * 4.0))/20.0;\n\t\t\t\t\t\tdiffuseColor.rgb *= vec3(1.0 - noise, 1.0 - noise, 1.0 - noise);\n\t\t\t\t\t}\n\t\t\t\t\telse if (worldPosition.y > 100.0) { // dirt\n\t\t\t\t\t\tfloat scale = 5.0;\n\t\t\t\t\t\tfloat effectscale = 0.2;\n\t\t\t\t\t\tfloat noise = (snoise(vec3(worldPosition.x * scale, worldPosition.y * scale, worldPosition.z * scale)) - 0.2) * effectscale;\n\t\t\t\t\t\tnoise = sigmoid(noise);\n\t\t\t\t\t\tdiffuseColor.rgb *= vec3(0.54 + noise, 0.27 + noise, 0.07 + noise);\n\t\t\t\t\t}\n\t\t\t\t\telse { // grass\n\t\t\t\t\t\tfloat scale = 4.0;\n\t\t\t\t\t\tfloat effectscale = 0.08;\n\t\t\t\t\t\tfloat noise = (snoise(vec3(worldPosition.x * scale, worldPosition.y * scale, worldPosition.z * scale)) - 0.2) * effectscale;\n\t\t\t\t\t\tdiffuseColor.rgb *= vec3(0, 0.48 + noise, 0.05 + noise);\n\n\t\t\t\t\t}\n\n\t\t\t\t\t#include <color_fragment>\n\t\t\t\t\t#include <alphamap_fragment>\n\t\t\t\t\t#include <alphatest_fragment>\n\t\t\t\t\t#include <specularmap_fragment>\n\t\t\t\t\t#include <emissivemap_fragment>\n\n\t\t\t\t\t// accumulation\n\t\t\t\t\treflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );\n\n\t\t\t\t\t#include <lightmap_fragment>\n\n\t\t\t\t\treflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );\n\n\t\t\t\t\t#ifdef DOUBLE_SIDED\n\n\t\t\t\t\t\treflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;\n\n\t\t\t\t\t#else\n\n\t\t\t\t\t\treflectedLight.directDiffuse = vLightFront;\n\n\t\t\t\t\t#endif\n\n\t\t\t\t\treflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();\n\n\t\t\t\t\t// modulation\n\t\t\t\t\t#include <aomap_fragment>\n\n\t\t\t\t\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n\n\t\t\t\t\t#include <normal_flip>\n\t\t\t\t\t#include <envmap_fragment>\n\n\t\t\t\t\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\n\t\t\t\t\t#include <premultiplied_alpha_fragment>\n\t\t\t\t\t#include <tonemapping_fragment>\n\t\t\t\t\t#include <encodings_fragment>\n\t\t\t\t\t#include <fog_fragment>\n\t\t\t\t}\n\t\t\t",
            uniforms: THREE.UniformsUtils.merge([
                uniforms_,
                THREE.ShaderLib['lambert'].uniforms]),
            lights: true
        });
        material.setValues(parameters);
        return material;
    };
    Generator.prototype.createTerrain = function (x, y) {
        x *= 1000;
        y *= 1000;
        var ground_geometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
        for (var i = 0; i < ground_geometry.vertices.length; i++) {
            var vertex = ground_geometry.vertices[i];
            var vertx = vertex.x + x;
            var verty = vertex.y - y;
            ground_geometry.vertices[i].z =
                10 * this.noiseGenerator.noise(vertx / 1000, verty / 1000)
                    + this.getMountainNoise(vertx, verty);
        }
        ground_geometry.computeFaceNormals();
        ground_geometry.computeVertexNormals();
        var ground = new Physijs.HeightfieldMesh(ground_geometry, this.ground_material, 0, 50, 50);
        ground.rotation.x = Math.PI / -2;
        ground.receiveShadow = true;
        ground.position.x = x;
        ground.position.z = y;
        return ground;
    };
    Generator.prototype.fastSigmoid = function (x) {
        return x / (1 + Math.abs(x));
    };
    Generator.prototype.getMountainNoise = function (x, y) {
        this.mountainNoise = 100 + (this.worleyNoise(x / 5000, y / 5000, 0.1) * -100);
        this.mountainMultiplierNoise = this.mountainMultiplierNoiseGenerator.noise(x / 5000, y / 5000);
        return 10 * this.fastSigmoid(this.mountainMultiplierNoise) * this.mountainNoise;
    };
    Generator.prototype.worleyNoise = function (xCoordinate, yCoordinate, scale) {
        function cos(angle) {
            if (angle.length)
                return angle.map(cos);
            return Math.cos(angle);
        }
        function fract(x) {
            if (x.length)
                return x.map(fract);
            return x - Math.floor(x);
        }
        function floor(x) {
            if (x.length)
                return x.map(floor);
            return Math.floor(x);
        }
        function vec2(x, y) {
            if (x == null)
                x = 0;
            if (y == null)
                y = x;
            return [x, y];
        }
        vec2.add = function anonymous(out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            return out;
        };
        function length(x) {
            var sum = 0;
            for (var i = 0; i < x.length; i++) {
                sum += x[i] * x[i];
            }
            return Math.sqrt(sum);
        }
        function r(n) {
            return fract(cos(n * 89.42) * 343.42);
        }
        ;
        function r_vec2(n) {
            return [r(n[0] * 23.62 - 300.0 + n[1] * 34.35), r(n[0] * 45.13 + 256.0 + n[1] * 38.89)];
        }
        ;
        function worley(n, s) {
            var dis = 2.0;
            for (var x = -1; x <= 1; x++) {
                for (var y = -1; y <= 1; y++) {
                    var p = vec2.add([], floor([n[0] / s, n[1] / s]), [x, y]);
                    var d = length([r_vec2(p)[0] + x - fract([n[0] / s, n[1] / s])[0], r_vec2(p)[1] + y - fract([n[0] / s, n[1] / s])[1]]);
                    if (dis > d) {
                        dis = d;
                    }
                    ;
                }
                ;
            }
            ;
            return dis;
        }
        ;
        return worley([xCoordinate, yCoordinate], scale);
    };
    return Generator;
}());
exports.Generator = Generator;
//# sourceMappingURL=Generator.js.map