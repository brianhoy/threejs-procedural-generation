/// <reference path="../../../typings/threejs/three.d.ts"/>
/// <reference path="../../../typings/physijs/physijs.d.ts"/>

declare var SimplexNoise;

export class Generator {
	private noiseGenerator: any;
	private mountainNoiseGenerator: any;
	private mountainMultiplierNoiseGenerator: any;
	private textureLoader: THREE.TextureLoader;
	private grassTexture: THREE.Texture;
	private ground_material: Physijs.Material;
	private shaders: any;

	constructor(textureLoader?: THREE.TextureLoader) {
		this.textureLoader = textureLoader || new THREE.TextureLoader();
		this.noiseGenerator = new SimplexNoise();
		this.mountainNoiseGenerator = new SimplexNoise(); 
		this.mountainMultiplierNoiseGenerator = new SimplexNoise();
		this.shaders =  { terrainLambert : THREE.ShaderLib[ 'lambert' ] };

		/*this.textureLoader.load('images/grass.png', (texture) => {this.grassTexture = texture});
		this.ground_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: this.grassTexture || THREE.ImageUtils.loadTexture( 'images/grass.png' ) }),
			.8, // high friction
			.4 // low restitution
		); 
		this.ground_material.map.wrapS = this.ground_material.map.wrapT = THREE.RepeatWrapping;
		this.ground_material.map.repeat.set( 100, 100 ); */


		let myProperties = {
			lights: true,
			fog: true,
			transparent: true,
			color: new THREE.Color(10, 150, 20),
			map: this.grassTexture || THREE.ImageUtils.loadTexture( 'images/grass.png' )
		};

		let myUniforms = {
			opacity: { type: "f", value: 0.4 },
			color: new THREE.Vector3(255, 100, 0),
			time: { value: 1.0 }
		};


		this.ground_material = Physijs.createMaterial(
			//new THREE.MeshLambertMaterial({ map: this.grassTexture || THREE.ImageUtils.loadTexture( 'images/grass.png' ) }),
			this.terrainLambertMaterial(myProperties, myUniforms),
			.8, // high friction
			.4 // low restitution
		)

		//this.ground_material.map.wrapS = this.ground_material.map.wrapT = THREE.RepeatWrapping;
		//this.ground_material.map.repeat.set( 100, 100 ); 

	}

	private terrainLambertMaterial(parameters, uniforms_) {
		var material = new THREE.ShaderMaterial( {
			/*vertexShader: `
				#define LAMBERT

				varying vec3 vLightFront;

				#ifdef DOUBLE_SIDED

					varying vec3 vLightBack;

				#endif

				#include <common>
				#include <uv_pars_vertex>
				#include <uv2_pars_vertex>
				#include <envmap_pars_vertex>
				#include <bsdfs>
				#include <lights_pars>
				#include <color_pars_vertex>
				#include <morphtarget_pars_vertex>
				#include <skinning_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				varying vec3 vertexColor;

				void main() {
					vertexColor = vec3(255, 100, 0);

					#include <uv_vertex>
					#include <uv2_vertex>
					#include <color_vertex>

					#include <beginnormal_vertex>
					#include <morphnormal_vertex>
					#include <skinbase_vertex>
					#include <skinnormal_vertex>
					#include <defaultnormal_vertex>

					#include <begin_vertex>
					#include <morphtarget_vertex>
					#include <skinning_vertex>
					#include <project_vertex>
					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>

					#include <worldpos_vertex>
					#include <envmap_vertex>
					#include <lights_lambert_vertex>
					#include <shadowmap_vertex>

				}			`,
			fragmentShader: `
				uniform vec3 diffuse;
				uniform vec3 emissive;
				uniform float opacity;

				varying vec3 vLightFront;

				#ifdef DOUBLE_SIDED

					varying vec3 vLightBack;

				#endif

				#include <common>
				#include <packing>
				#include <color_pars_fragment>
				#include <uv_pars_fragment>
				#include <uv2_pars_fragment>
				#include <map_pars_fragment>
				#include <alphamap_pars_fragment>
				#include <aomap_pars_fragment>
				#include <lightmap_pars_fragment>
				#include <emissivemap_pars_fragment>
				#include <envmap_pars_fragment>
				#include <bsdfs>
				#include <lights_pars>
				#include <fog_pars_fragment>
				#include <shadowmap_pars_fragment>
				#include <shadowmask_pars_fragment>
				#include <specularmap_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				varying vec3 vertexColor;

				void main() {
					#include <clipping_planes_fragment>


					vec4 diffuseColor = vec4(diffuse, opacity );
					ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
					vec3 totalEmissiveRadiance = emissive;

					#include <logdepthbuf_fragment>
					#include <map_fragment>
					#include <color_fragment>
					#include <alphamap_fragment>
					#include <alphatest_fragment>
					#include <specularmap_fragment>
					#include <emissivemap_fragment>

					// accumulation
					reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );

					#include <lightmap_fragment>

					reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );

					#ifdef DOUBLE_SIDED

						reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;

					#else

						reflectedLight.directDiffuse = vLightFront;

					#endif

					reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();

					// modulation
					#include <aomap_fragment>

					vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

					#include <normal_flip>
					#include <envmap_fragment>

					gl_FragColor = vec4( outgoingLight, diffuseColor.a );

					#include <premultiplied_alpha_fragment>
					#include <tonemapping_fragment>
					#include <encodings_fragment>
					#include <fog_fragment>
				}
			`,*/
			vertexShader: `
				varying vec2 vUv;
				varying vec4 worldPosition;
				void main() {
					vUv = uv;
					worldPosition = modelMatrix * vec4( position, 1.0 );
					gl_Position = projectionMatrix *
								modelViewMatrix *
								vec4(position,1.0);
				}
			`,
			fragmentShader: `
				uniform float time;
				varying vec2 vUv;

				vec4 permute( vec4 x ) {

					return mod( ( ( x * 34.0 ) + 1.0 ) * x, 289.0 );

				}

				vec4 taylorInvSqrt( vec4 r ) {

					return 1.79284291400159 - 0.85373472095314 * r;

				}

				float snoise( vec3 v ) {

					const vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );
					const vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );

					// First corner

					vec3 i  = floor( v + dot( v, C.yyy ) );
					vec3 x0 = v - i + dot( i, C.xxx );

					// Other corners

					vec3 g = step( x0.yzx, x0.xyz );
					vec3 l = 1.0 - g;
					vec3 i1 = min( g.xyz, l.zxy );
					vec3 i2 = max( g.xyz, l.zxy );

					vec3 x1 = x0 - i1 + 1.0 * C.xxx;
					vec3 x2 = x0 - i2 + 2.0 * C.xxx;
					vec3 x3 = x0 - 1. + 3.0 * C.xxx;

					// Permutations

					i = mod( i, 289.0 );
					vec4 p = permute( permute( permute(
							i.z + vec4( 0.0, i1.z, i2.z, 1.0 ) )
						+ i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) )
						+ i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );

					// Gradients
					// ( N*N points uniformly over a square, mapped onto an octahedron.)

					float n_ = 1.0 / 7.0; // N=7

					vec3 ns = n_ * D.wyz - D.xzx;

					vec4 j = p - 49.0 * floor( p * ns.z *ns.z );  //  mod(p,N*N)

					vec4 x_ = floor( j * ns.z );
					vec4 y_ = floor( j - 7.0 * x_ );    // mod(j,N)

					vec4 x = x_ *ns.x + ns.yyyy;
					vec4 y = y_ *ns.x + ns.yyyy;
					vec4 h = 1.0 - abs( x ) - abs( y );

					vec4 b0 = vec4( x.xy, y.xy );
					vec4 b1 = vec4( x.zw, y.zw );


					vec4 s0 = floor( b0 ) * 2.0 + 1.0;
					vec4 s1 = floor( b1 ) * 2.0 + 1.0;
					vec4 sh = -step( h, vec4( 0.0 ) );

					vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
					vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

					vec3 p0 = vec3( a0.xy, h.x );
					vec3 p1 = vec3( a0.zw, h.y );
					vec3 p2 = vec3( a1.xy, h.z );
					vec3 p3 = vec3( a1.zw, h.w );

					// Normalise gradients

					vec4 norm = taylorInvSqrt( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) );
					p0 *= norm.x;
					p1 *= norm.y;
					p2 *= norm.z;
					p3 *= norm.w;

					// Mix final noise value

					vec4 m = max( 0.6 - vec4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ), 0.0 );
					m = m * m;
					return 42.0 * dot( m*m, vec4( dot( p0, x0 ), dot( p1, x1 ),
												dot( p2, x2 ), dot( p3, x3 ) ) );

				}

				varying vec4 worldPosition;

				void main() {
					if(worldPosition.y > 300.0) { //snow
						float noise = snoise(vec3(worldPosition.x * 4.0, worldPosition.y * 4.0, worldPosition.z * 4.0))/20.0;
						gl_FragColor = vec4(1.0 - noise, 1.0 - noise, 1.0 - noise, 1);
					}
					else if (worldPosition.y > 100.0) { // dirt
						float scale = 0.5;
						float effectscale = 0.2;
						float noise = (snoise(vec3(worldPosition.x * scale, worldPosition.y * scale, worldPosition.z * scale)) - 0.2) * effectscale;
						gl_FragColor = vec4(0.54 + noise, 0.27 + noise, 0.07 + noise, 1.0);
					}
					else { // grass
						float scale = 0.5;
						float effectscale = 0.08;
						float noise = (snoise(vec3(worldPosition.x * scale, worldPosition.y * scale, worldPosition.z * scale)) - 0.2) * effectscale;
						gl_FragColor = vec4(0, 0.48 + noise, 0.05 + noise, 1.0);

					}
					//gl_FragColor = (worldPosition.y, 0, 0, 1);
				}
			`,
			uniforms: THREE.UniformsUtils.merge( [ 
				uniforms_, 
				THREE.ShaderLib[ 'lambert' ].uniforms ] ),
			lights: true
		} );

		material.setValues( parameters )

		return material;

	}

	private tempVertex: number;

	public createTerrain(x: number, y: number) {
		x *= 1000;
		y *= 1000;

		let ground_geometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);

		/*let ground_geometry = new THREE.PlaneBufferGeometry( 1000, 1000, 50, 50 );
			let vertices = ground_geometry.attributes.position.array;

			for ( var i = 0; i < vertices.length; i++ ) {
				var vertex = vertices[i];
				let vertx = vertex.x + x;
				let verty = vertex.y - y;

				vertices[i].z = 10 * this.noiseGenerator.noise(vertx / 1000, verty / 1000 ) + this.getMountainNoise(vertx, verty);
			} */
		for ( var i = 0; i < ground_geometry.vertices.length; i++ ) {
			var vertex = ground_geometry.vertices[i];
			let vertx = vertex.x + x;
			let verty = vertex.y - y;

			ground_geometry.vertices[i].z = 
				10 * this.noiseGenerator.noise(vertx / 1000, verty / 1000 ) 
				+ this.getMountainNoise(vertx, verty);
		}
		ground_geometry.computeFaceNormals();
		ground_geometry.computeVertexNormals();
		
		// If your plane is not square as far as face count then the HeightfieldMesh
		// takes two more arguments at the end: # of x faces and # of y faces that were passed to THREE.PlaneMaterial
		let ground = new Physijs.HeightfieldMesh(
			ground_geometry,
			this.ground_material,
			0, // mass
			50,
			50
		);
		ground.rotation.x = Math.PI / -2;
		ground.receiveShadow = true;
		ground.position.x = x;
		ground.position.z = y;

		return ground;
	}

	private fastSigmoid(x: number): number {
		return x / (1 + Math.abs(x));
	}

	private mountainNoise: number;
	private mountainMultiplierNoise: number;

	private getMountainNoise(x: number, y: number): number {
		this.mountainNoise = this.mountainNoiseGenerator.noise(x / 5000, y / 5000) * 1000;
		this.mountainMultiplierNoise = this.mountainMultiplierNoiseGenerator.noise(x / 100000, y / 100000);
		return 10 * this.fastSigmoid(this.mountainMultiplierNoise) * this.mountainNoise;
	}
}