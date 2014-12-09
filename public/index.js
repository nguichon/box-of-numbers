var CLICK_SCORE = -1;
var GOOD_MATCH_SCORE = 2;
var BAD_MATCH_SCORE = -1;
var MATCH_ATTEMPT_PAUSE_DURATION_MS = 800;
var HIDE_CARD_FACE_VALUE_DELAY_MS = 300;
var SCORE_PER_DIFFICULTY = 50;
var DIFFICULTY_SQUARE_MODIFIER = 2;

function BoxOfNumbersGame(difficulty) {
	var trueDifficulty = difficulty + DIFFICULTY_SQUARE_MODIFIER;
	var playerScore = new Counter('Score', SCORE_PER_DIFFICULTY * trueDifficulty);
	var matchAttempts = new Counter('Attempts', 0);
	var cardsFlipped = new Counter('Flips', 0);
	var gameDifficulty = new Counter('Difficulty', difficulty);
	var currentlyFlippedCard = null;
	var paused = false;
	var started = false;
	var _game = this;

	function Counter(title, startingValue) {
		this.value = startingValue;
		this.title = title;
		$('#score-board').append('<li class="score-item"><strong>' + title + ': </strong><span id="score' + title + '">' + this.value + '</span></li>');
	}

	Counter.prototype.set = function( newValue ) {
		this.value = newValue;
		$('#score' + this.title).html(this.value);
	};

	Counter.prototype.modify = function( incrementValue ) {
		this.value += incrementValue;
		$('#score' + this.title).html(this.value);
	};

	function NumberedCard(identifier, matchingValue) {
		var isFlipped = false;
		var isMatched = false;
		var _self = this;

		this.attach = function() {
			$('#game-board').append('<div class="container"><div class="card" id=' + identifier + '><figure class="front"></figure><figure class="back"></figure></div></div>');
		
			$('#' + identifier).click(flip);
		};

		function flip() {
			if( paused || isMatched) return;

			if( isFlipped ) { return _self.unflip(); }

			// Flip variables of various place and thangs
			isFlipped = true;
			$('#' + identifier).addClass('flipped');
			$('#' + identifier + '>.back').html(matchingValue);
			
			// Increment counters;
			cardsFlipped.modify(1);
			playerScore.modify(CLICK_SCORE);

			if( !currentlyFlippedCard || currentlyFlippedCard === _self ) { return currentlyFlippedCard = _self; }

			paused = true;
			setTimeout(function() {
				paused = false;

				// Increment attempt counter.
				matchAttempts.modify(1);

				if(currentlyFlippedCard.doesNumberMatch(matchingValue)) {
					// Increment player's score to offset flipping cards.
					playerScore.modify(GOOD_MATCH_SCORE);

					// Tell the cards that their matches have been found!
					_self.matchFound();
					currentlyFlippedCard.matchFound();
				} else {
					// Decrement player's score if they failed to get a match.
					playerScore.modify(BAD_MATCH_SCORE);

					// Hide the cards that failed to be matched.
					_self.unflip();
					currentlyFlippedCard.unflip();
				}
			}, MATCH_ATTEMPT_PAUSE_DURATION_MS);
		};

		this.unflip = function() {
			if( paused ) return;
			if( currentlyFlippedCard === _self ) {
				currentlyFlippedCard = null;
			}

			isFlipped = false;
			$('#' + identifier).removeClass('flipped');

			setTimeout(function() {
				if(!isFlipped) {
					$('#'+identifier+'>.back').html('');
				}
			}, HIDE_CARD_FACE_VALUE_DELAY_MS);
		};

		this.matchFound = function() {
			isMatched = true;
			$('#' + identifier).addClass('matched');
			_self.unflip();
		};

		this.doesNumberMatch = function( number ) {
			return matchingValue === number;
		};
	};

	this.start = function() {
		if( started ) return;
		started = true;

		var numberOfCards = Math.pow(trueDifficulty, 2);
		var cards = [];
		for(var i = 0; i < numberOfCards - numberOfCards % 2; i++) {
			cards.push(new NumberedCard(i, Math.floor(i / 2.0)));
		}

		shuffle(cards);

		$('#game-board').css('width', trueDifficulty * 120);

		var cardIndex = 0;
		var isOdd = numberOfCards % 2;
		for(var i = 0; i < numberOfCards; i++) {
			if(!isOdd || i !== Math.floor(numberOfCards / 2)) {
				cards[cardIndex++].attach();
			} else {
				$("#game-board").append('<div class="container"><div class="card matched"><figure class="front"></figure><figure class="back">X</figure></div></div>');
			}
		};
	};

	this.changeDifficulty = function(newDifficulty) {
		if( started ) return;

		this.trueDifficulty = difficulty + DIFFICULTY_SQUARE_MODIFIER;
		playerScore.set(trueDifficulty * SCORE_PER_DIFFICULTY);
		gameDifficulty.set(difficulty);
	};
};

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

function startGame() {
	var game = new BoxOfNumbersGame(1);

	game.start();
};

$(document).ready(startGame);