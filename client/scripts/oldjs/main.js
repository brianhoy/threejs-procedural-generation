
(function () {
	var game = new Game();
	game.init();
	function renderLoop () {
		game.render();
		requestAnimationFrame(renderLoop);
	}
	renderLoop();
})();

