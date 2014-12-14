var STARTING_DIFFICULTY = 0;

// Catch resize and set max-width
$(document).ready(function() {
  $(window).resize(function(event) {
    $('#card-box').css('max-width', $('#game-area').css('height'));
  });

  $(window).resize();
});

// Create the game and start it.
$(document).ready(function() {
	(new GameEngine()).resetGame(STARTING_DIFFICULTY);
});