function shuffle(array) {
	var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function GameEngine(params) {
	var MIN_DIFFICULTY = 0,
		MAX_DIFFICULTY = 7,
		DIFFICULTY_OFFSET = 2,
		POINTS_PER_FLIP = -1,
		CARDS_TO_MATCH = 2,
		POINTS_PER_FAIL = -1,
		POINTS_PER_SUCCESS = 2,
		MATCH_TIMEOUT_DURATION = 400,
		WON_FLIP_SPEED = 800;

	var _game = this;
	var $cardBox = $('#card-box'),
		$scoreCard = $('#score.score-item>span'),
		$difficultyCard = $('#difficulty.score-item>span'),
		$flipCard = $('#flips.score-item>span'),
		$attemptsCard = $('#attempts.score-item>span'),
		$overlay = $('#overlay'),
		$wonModal = $('#game-won-modal'),
		$finalScore = $('#won-score'),
		$wonDifficulty = $('#won-difficulty'),
		$wonCard = $('#wonCard'),
		$settingsModal = $('#settings-modal');
	var spinInterval;


	var difficulty, score, totalFlips, totalAttempts, setsLeft;

	// Event Handlers
	$scoreCard.parent().on('transitionend MSTransitionEnd webkitTransitionEnd oTransitionEnd', function() { $(this).removeClass('flashBad'); $(this).removeClass('flashGood'); });
	$('.easier-button').on('click', function() {
		_game.resetGame(difficulty - 1);
	});
	$('.harder-button').on('click', function() {
		_game.resetGame(difficulty + 1);
	});
	$('.start-button').on('click', function() {
		_game.resetGame(difficulty);
	});
	$('.close-button').on('click', function() {
		$settingsModal.addClass('hidden');
		$overlay.addClass('hidden');
	});
	$('.settingsButton').on('click', function() {
		$settingsModal.removeClass('hidden');
		$overlay.removeClass('hidden');
	});

	this.resetGame = function(newDifficulty) {
		$overlay.addClass('hidden');
		$wonModal.addClass('hidden');
		$settingsModal.addClass('hidden');
		if(spinInterval) {
			clearInterval(spinInterval);
		}
		_game.paused = false;

		$cardBox.children().remove();

		// Process difficulty.
		difficulty = (newDifficulty <= MAX_DIFFICULTY ? newDifficulty : MAX_DIFFICULTY);
		difficulty = (difficulty > MIN_DIFFICULTY ? difficulty : MIN_DIFFICULTY);
		$difficultyCard.html(difficulty);

		// Setup the value of things
		var tilesPerRow = difficulty + DIFFICULTY_OFFSET;
		var totalNumberOfTiles = Math.pow(tilesPerRow, 2);
		setsLeft = Math.floor(totalNumberOfTiles / CARDS_TO_MATCH);
		score = 0; modifyScore(Math.pow(tilesPerRow, 2));
		flips = 0; $flipCard.html(flips);
		attempts = 0; $attemptsCard.html(attempts);

		
		// Create the tiles.
		var createdTiles = [];
		var rubbishTiles = totalNumberOfTiles % CARDS_TO_MATCH;
		for(var i = 0; i < totalNumberOfTiles - rubbishTiles; i++ ) {
			createdTiles.push(new GameCard(Math.floor(i/CARDS_TO_MATCH), tilesPerRow, _game));
		}

		// Remove old tiles
		$cardBox.children().remove();

		// Shuffle and insert new tiles
		shuffle(createdTiles);

		var rubbishTilesArray = [Math.floor(createdTiles.length / 2), 0];
		for(var i = 0; i < rubbishTiles; i++) {
			rubbishTilesArray.push($('<div class="cube cube-' + tilesPerRow + '"/>'))
		}
		Array.prototype.splice.apply(createdTiles, rubbishTilesArray);
		for(var i = 0; i < createdTiles.length; i++) {
			createdTiles[i].appendTo($cardBox);
		}
	};

	this.getDifficulty = function() {
		return difficulty;
	};

	this.paused = false;

	var modifyScore = function(amount, animate) {
		// Modify scored score value.
		score += amount;
		if(score < 0) score = 0;

		// Set score value in HTML element.
		$scoreCard.html(score);

		// Add a flash class to the score element.
		if(animate) { $scoreCard.parent().toggleClass(amount >= 0 ? 'flashGood' : 'flashBad'); }
	};

	var incrementFlips = function() {
		// Modify scored score value.
		$flipCard.html(++flips);
	};

	var incrementAttempts = function() {
		// Modify scored score value.
		$attemptsCard.html(++attempts);
	};

	var gameOver = function() {
		$overlay.removeClass('hidden');
		$wonModal.removeClass('hidden');
		$finalScore.html(score);
		$wonDifficulty.html(difficulty);
		spinInterval = setInterval(function() {
			$wonCard.toggleClass('flipped');
		}, WON_FLIP_SPEED);
	};

	var flippedCards = [];
	var matchFailed = function() {
		modifyScore(POINTS_PER_FAIL, true);
		for(var i = 0; i < flippedCards.length; i++) {
			flippedCards[i].unflip();
		}
		flippedCards = [];
		_game.paused = false;
	};
	var matchSucceded = function() {
		modifyScore(POINTS_PER_SUCCESS, true);
		for(var i = 0; i < flippedCards.length; i++) {
			flippedCards[i].matched();
			flippedCards[i].unflip();
		}
		flippedCards = [];
		if(--setsLeft <= 0) return gameOver();
		_game.paused = false;
	};
	var handleFlip = function(card) {
		incrementFlips();
		flippedCards.push(card);
		if( flippedCards.length === CARDS_TO_MATCH ) {
			_game.paused = true;
			incrementAttempts();
			setTimeout(function() {
				var base = flippedCards[0];
				for(var i = 1; i < flippedCards.length; i++) {
					if(!base.compareTo(flippedCards[i])) return matchFailed();
				}
				matchSucceded();	
			}, MATCH_TIMEOUT_DURATION);
		} else {
			modifyScore(POINTS_PER_FLIP, true);
		}
	}

	this.notify = function(event, params) {
		switch(event) {
			case 'player-flip':
				handleFlip(params.card);
				break;
			case 'player-unflip':
				flippedCards.splice(flippedCards.indexOf(params.card), 1);
				break;
		}
	};
}