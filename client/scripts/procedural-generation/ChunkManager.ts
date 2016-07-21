import {Generator} from './Generator';
import {Player} from '../player/Player';
import {Debugger} from '../debugger/Debugger';

// Chunks are 1000 by 1000 units
export class ChunkManager {
	private generator: Generator;
	private player: Player;
	private chunks: Physijs.HeightfieldMesh[][];
	private scene: Physijs.Scene;
	private tempObjects;
	private renderDistance: number;

	private playerChunkCoordinates: THREE.Vector3;
	private middleChunkCoordinates: THREE.Vector3;
	private deltaChunkCoordinates: THREE.Vector3;

	constructor(player: Player, scene: Physijs.Scene, private _debugger?: Debugger) {
		this.tempObjects = [];
		this.generator = new Generator();
		this.renderDistance = 3;
		let arrlen = (2 * this.renderDistance) + 1;
		this.scene = scene;
		this.player = player;
		this.chunks = new Array<Physijs.HeightfieldMesh[]>(arrlen);
		this.playerChunkCoordinates = new THREE.Vector3(0, 0, 0);
		this.middleChunkCoordinates = new THREE.Vector3(0, 0, 0);
		this.deltaChunkCoordinates = new THREE.Vector3(0, 0, 0);

		for(let i = 0; i < this.chunks.length; i++) {
			this.chunks[i] = [];
			for(let j = 0; j < arrlen; j++) {
				this.chunks[i].push(null);
			}
		}

		this.fillNullChunks(0, 0);
	}

	public update() {
		this.updateChunkCoordinates();

		this.deltaChunkCoordinates.x = this.playerChunkCoordinates.x - this.middleChunkCoordinates.x;
		this.deltaChunkCoordinates.z = this.playerChunkCoordinates.z - this.middleChunkCoordinates.z;

		if(this.deltaChunkCoordinates.x != 0 || this.deltaChunkCoordinates.z != 0)
		{
			let mChunk = this.chunks[this.renderDistance][this.renderDistance];
			this.shift(-this.deltaChunkCoordinates.x , -this.deltaChunkCoordinates.z); // negative the difference you want to shift the chunks
			this.fillNullChunks(this.playerChunkCoordinates.x, this.playerChunkCoordinates.z);
		}

	}

	private updateDebugInfo() {
		if(this._debugger) {
			this._debugger.updateChunksTable(this.chunks);
			this._debugger.updatePlayerChunkCoordinates(this.playerChunkCoordinates);
		}
	}

	private shift(x: number, y: number) {
		if(x > 0) {
			for(let i = 0; i < this.chunks.length; i++) {
				for(let j = this.chunks[i].length - 1; j >= 0; j--) {
					if(j + x > this.chunks[i].length - 1 && this.chunks[i][j]) {
                  		this.unloadChunk(this.chunks[i][j], x, y);
                	} 

					if(j < x) {
						this.chunks[i][j] = null;
					}
					else {
						this.chunks[i][j] = this.chunks[i][j - x];
					}
				}
			}
		}
		else if(x < 0) {
			for(let i = 0; i < this.chunks.length; i++) {
				for(let j = 0; j < this.chunks[i].length; j++) {
					if(j + x  < 0 && this.chunks[i][j]) {
                  		this.unloadChunk(this.chunks[i][j], x, y);
					} 

					if(j - x >= this.chunks[i].length) {
						this.chunks[i][j] = null;
					}
					else {
						this.chunks[i][j] = this.chunks[i][j - x];
					}
				}
			}
		}
		if(y > 0) {
			for(let i = 0; i < this.chunks.length; i++) {
				if(i + y >= this.chunks.length) {
					for(let j = 0; j < this.chunks.length; j++) {
						if(i - y < 0 && this.chunks[i][j]) {
                  			this.unloadChunk(this.chunks[i][j], x, y);
						}
						this.chunks[i][j] = null;
					}
				}
				else {
					for(let j = 0; j < this.chunks.length; j++) {
						if(i - y < 0 && this.chunks[i][j]) {
                  			this.unloadChunk(this.chunks[i][j], x, y);
						}
						this.chunks[i][j] = this.chunks[i + y][j];
					}
				}
			}
		}
		else if(y < 0) {
			for(let i = this.chunks.length - 1; i >= 0 ; i--) {
				if(i + y < 0) {
					for(let j = 0; j < this.chunks.length; j++) {
						if(i - y > this.chunks.length - 1 && this.chunks[i][j]) {
                  			this.unloadChunk(this.chunks[i][j], x, y);
						}
						this.chunks[i][j] = null;
					}
				}
				else {
					for(let j = 0; j < this.chunks.length; j++) {
						if(i - y > this.chunks.length - 1 && this.chunks[i][j]) {
                  			this.unloadChunk(this.chunks[i][j], x, y);
						}
						this.chunks[i][j] = this.chunks[i + y][j];
					}
				}
			}
		}
	}

	private nullifyChunks () {
		for(let i = 0; i < this.chunks.length; i++) {
			for(let j = 0; j < this.chunks.length; j++) {
				this.unloadChunk(this.chunks[i][j], i, j);
				this.chunks[i][j] = null;
			}
		}
	}

	private unloadChunk(chunk, x: number, y: number) {
		this.scene.remove(chunk);
	}

	private fillNullChunks(middleChunkX: number, middleChunkY: number) {

		if(this.chunks[0].length % 2 != 1 || this.chunks.length % 2 != 1)
			throw new Error("Chunk render distance is not odd");

		let middleXY = this.renderDistance;

		for(let row = 0; row < this.chunks.length; row++) {
			for(let col = 0; col < this.chunks[0].length; col++) {
				if(this.chunks[row][col] == null) {
					this.chunks[row][col] = this.generator.createTerrain((col) - middleXY + middleChunkX, -row + middleXY + middleChunkY);
					//this.chunks[row][col] = this.generator.createTerrain(col - middleXY + middleChunkY, -row + middleXY + middleChunkX);
					this.scene.add(this.chunks[row][col]);
				}
			}
		}
	}

	private getChunkCoordinates(vec: THREE.Vector3): THREE.Vector3 {
		vec.x = Math.floor(vec.x/1000);
		vec.z = Math.floor(vec.z/1000);
		return vec;
	}

	private updateChunkCoordinates() {
		this.playerChunkCoordinates.x = Math.floor(this.player.mesh.position.x/1000);
		this.playerChunkCoordinates.z = Math.floor(this.player.mesh.position.z/1000);

		this.middleChunkCoordinates.x = Math.floor(this.chunks[this.renderDistance][this.renderDistance].position.x/1000);
		this.middleChunkCoordinates.z = Math.floor(this.chunks[this.renderDistance][this.renderDistance].position.z/1000); 
	}
}