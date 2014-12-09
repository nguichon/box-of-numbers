function modScore(increment) {
	score += increment;

	if( score < 0 ) {
		score = 0;
	}

	$('#score').html(score);
}

function Card(i, value) {
	flipped = false;
	this.value = value;
	this.found = false;

	this.unflip = function() {
		$( "#" + i ).removeClass('flipped');
		flipped = false;

		if(flippedCard === this) { flippedCard = null; }
	};

	this.find = function() {
		$( "#" + i ).addClass('found');
		this.found = true;
	};

	this.flip = function() {
		if(paused || this.found) {
			return;
		}

		if(flipped) {
			this.unflip();
		} else {
			$('#flips').html(++flips);
			modScore(-1);
			if( flippedCard && flippedCard !== this) {
				paused = true;
				$( "#" + i ).addClass('flipped');
				flipped = true;
				var _self = this;
				setTimeout(function() {
					paused = false;
					$('#attempts').html(++attempts);
					if(_self.value === flippedCard.value) {
						_self.find();
						flippedCard.find();
					} else {
						modScore(penalty * (7-difficulty));
					}

					_self.unflip();
					flippedCard.unflip();
				}, 1000);
			} else {
				$( "#" + i ).addClass('flipped');
				flippedCard = this;
				flipped = true;
			}
		}
	};

	this.createHtmlObject = function() {
		if(!this.html) {
			this.html = $(".game").append('<div class="container"><div class="card" id=' + i + '><figure class="front"></figure><figure class="back">' + value + '</figure></div></div>');
		
			var _self = this;
			$( "#" + i ).click(function() {
			  	_self.flip();
			});
		}
	};
}

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

var cards = [];
var difficulty = Math.floor(Math.random() * 5) + 2;
var numCards = Math.pow(difficulty, 2);
var flippedCard = null;
var paused = false;
var attempts = 0;
var flips = 0;
var score = 100;
var penalty = -1;


$(document).ready(function() {
	for(var i = 0; i < numCards - numCards % 2; i++) {
		cards.push(new Card( i, Math.floor(i / 2.0) ));
	}

	shuffle(cards);
	$('#difficulty').html(difficulty);

	var odd = numCards % 2;
	var z = 0;
	for(var i = 0; i < numCards; i++) {
		if( odd && i == Math.floor(numCards / 2.0) ) {
			$(".game").append('<div class="container"><div class="card found"><figure class="front"></figure><figure class="back">X</figure></div></div>');
		} else {
			cards[z++].createHtmlObject();
		}
	}

	$('#wholething').css('width', difficulty * 120);
});