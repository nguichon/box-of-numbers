var CLICK_SCORE = -1;
var GOOD_MATCH_SCORE = 2;
var BAD_MATCH_SCORE = -1;
var MATCH_ATTEMPT_PAUSE_DURATION_MS = 800;
var HIDE_CARD_FACE_VALUE_DELAY_MS = 300;
var SCORE_PER_DIFFICULTY = 50;
var DIFFICULTY_SQUARE_MODIFIER = 2;
var FILL_TIME = 1000;
var MAX_DIFFICULTY = 4
var currentDifficulty = 2;
var VIEW_PORT_VALUE = 80;
var CARD_PORTION = 0.95

// This is the game itself. 
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

		var counter = $('#score' + title);
		if( counter.size() > 0) {
			this.value = startingValue;
			$('#score' + this.title).html(startingValue);
		} else {
			$('#score-board').append('<li class="score-item"><strong>' + title + ': </strong><span id="score' + title + '">' + this.value + '</span></li>');
		}
	}

	Counter.prototype.set = function( newValue ) {
		this.value = newValue;
		$('#score' + this.title).html(this.value);
	};

	Counter.prototype.modify = function( incrementValue ) {
		this.value += incrementValue;
		$('#score' + this.title).html(this.value);
	};

	function NumberedCard(matchingValue) {
		var $card;
		var isFlipped = false;
		var isMatched = false;
		var identifier = 'default'
		var _self = this;

		this.attach = function(id, size, margin) {
			identifier = id;

			var $cardBox = $('<div class="cardbox" />');
			$card = $('<div class="card" id=' + identifier + '><figure class="front"/><figure class="back"/></div>');

			$cardBox.css('width', size + 'vmin');
			$cardBox.css('height', size + 'vmin');
			$cardBox.css('margin', margin + 'vmin');
			
			$cardBox.append($card);

			$('#game-board').append($cardBox);
		
			$card.click(flip);
			$card.on('mouseover mouseout', function() { $card.toggleClass('hover'); });
		};

		function flip() {
			if( paused || isMatched) return;

			if( isFlipped ) { return _self.unflip(); }

			// Flip variables of various place and thangs
			isFlipped = true;
			$card.addClass('flipped');
			$card.children('.back').html('<p>' + matchingValue + '</p>');
			
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
			$card.removeClass('flipped');

			setTimeout(function() {
				if(!isFlipped) {
					$card.children('.back').html('');
				}
			}, HIDE_CARD_FACE_VALUE_DELAY_MS);
		};

		this.matchFound = function() {
			isMatched = true;
			$card.addClass('matched');
			_self.unflip();
		};

		this.doesNumberMatch = function( number ) {
			return matchingValue === number;
		};
	};

	this.start = function(callback) {
		if( started ) return;
		started = true;

		var numberOfCards = Math.pow(trueDifficulty, 2);
		var cards = [];
		for(var i = 0; i < numberOfCards - numberOfCards % 2; i++) {
			cards.push(new NumberedCard(Math.floor(i / 2.0)));
		}

		shuffle(cards);

		$('#game-board').empty();

		var cardIndex = 0;
		var isOdd = numberOfCards % 2;
		var $gameBoard = $("#game-board");
		var size = (VIEW_PORT_VALUE / trueDifficulty) * CARD_PORTION;
		var margin = (VIEW_PORT_VALUE / trueDifficulty) * (1-CARD_PORTION) / 2;
		for(var i = 0; i < numberOfCards; i++) {
			var freeSpace = (i === Math.floor(numberOfCards / 2));
			var identifier = i;

			if(isOdd && freeSpace) {
				var $freebie = $('<div class="cardbox"><div class="card matched"><figure class="front"/><figure class="back"><p>X</p></figure></div></div>')


				$freebie.css('width', size + 'vmin');
				$freebie.css('height', size + 'vmin');
				$freebie.css('margin', margin + 'vmin');

				$gameBoard.append($freebie);
			} else {
				cards[cardIndex++].attach(identifier, size, margin);
			}
		};

		return callback(); 
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

function initializeBoxOfNumbers() {
	var game = new BoxOfNumbersGame(currentDifficulty);
	var blocked = false;

	var callback = function() {
		blocked = false;
	}

	game.start(callback);

	$('#reset-game').click(function() {
		if( blocked ) return;
		game = new BoxOfNumbersGame(currentDifficulty);
		blocked = true;
		game.start(callback);
	});

	$('#higher-game').click(function() {
		if( blocked ) return;

		if( ++currentDifficulty > MAX_DIFFICULTY ) currentDifficulty = MAX_DIFFICULTY;

		game = new BoxOfNumbersGame(currentDifficulty);
		blocked = true;
		game.start(callback);
	});

	$('#lower-game').click(function() {
		if( blocked ) return;

		if( --currentDifficulty < 0 ) currentDifficulty = 0;

		game = new BoxOfNumbersGame(currentDifficulty);
		blocked = true;
		game.start(callback);
	});
};

$(document).ready(initializeBoxOfNumbers);