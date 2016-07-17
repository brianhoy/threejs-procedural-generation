export class Debugger {
	private playerCoordinatesElement: HTMLElement;
	private playerChunkCoordinatesElement: HTMLElement;
	private chunksTableElement: HTMLTableElement;

	constructor() {
		this.playerCoordinatesElement = document.getElementById("debugPosition");
		this.playerChunkCoordinatesElement = document.getElementById("debugChunkCoordinates");
		this.chunksTableElement = <HTMLTableElement> document.getElementById("debugChunks");
	}

	public updateChunksTable(chunks: any) {
		for(let i = 0; i < chunks.length; i++) {
			let row = <HTMLTableRowElement> this.chunksTableElement.rows[i];
			for(let j = 0; j < chunks.length; j++) {
				if(chunks[i][j]) {
					row.cells[j].innerHTML = "x: "+Math.floor(chunks[i][j].position.x /1000)+", z: "+Math.floor(chunks[i][j].position.z/1000);
				}
				else {
					row.cells[j].innerHTML = "null";

				}
			}
		}
	}

	public updatePlayerCoordinates(coordinates: any) {
		this.playerCoordinatesElement.innerHTML = "x: " + coordinates.x + "<br>y: " + coordinates.y + "<br>z: " + coordinates.z;
	}

	public updatePlayerChunkCoordinates(coordinates: any) {
		this.playerChunkCoordinatesElement.innerHTML = "x: " + coordinates.x + ", y: " + coordinates.y + ", z: " + coordinates.z;
	}
}