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
//# sourceMappingURL=Debugger.js.map