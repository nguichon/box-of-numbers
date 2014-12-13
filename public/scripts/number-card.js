var $cardHtmlTemplate = $('<div class="cardbox"/>')
	.append('<div class="card"/>')
	.children('div')
		.append('<figure class="front"/>')
		.append('<figure class="back"/>')
	.end()
	.on('vmouseover', function() { this.addClass('hover'); })
	.on('vmouseout', function() { this.removeClass('hover'); })

function NumberedCard(game, value) {
	var $element = $cardHtmlTemplate.clone(true);
	$element.on('click taphold', toggleCard);

	var matched = false;

	this.toggleCard = function() {
		if(game.isPaused() || matched) return;
	};

	this.attachTo = function($parent) {
		this.$element.appendTo($parent);
	};
};


function NumberedCard(matchingValue) {
function flip() {
if( paused || isMatched) return;

if( isFlipped ) { return _self.unflip(); }

// Flip variables of various place and thangs
isFlipped = true;
$card.addClass('flipped');
$card.children('.back').html('<p>' + matchingValue + '</p>');

// Increment counters;
cardsFlipped.modify(1);

if( !currentlyFlippedCard || currentlyFlippedCard === _self ) { 
playerScore.modify(CLICK_SCORE);
return currentlyFlippedCard = _self; 
}

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

// TODO: Check if any matchs are left, if not: A WINNER IS YOU
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