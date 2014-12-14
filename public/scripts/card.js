function GameCard(value, size, game) {
	// Create the HTML part of the card.
	var $element = $('<div class="cube cube-' + size + '"/>')
		.append('<div class="card card-front"></div><div class="card card-back"/>');
	var $textArea = $('<p/>');
	$element.children('.card-front').append($textArea);
	var _cardInstance = this;
	var flipped = false;
	var matched = false;
	var matchingValue = +value;

	this.flip = function() {
		flipped = true;
		$element.addClass('flipped');
		$textArea.html( value );
	}

	this.unflip = function() {
		flipped = false;
		$element.removeClass('flipped');
		setTimeout(function() {
			$textArea.html( '' );
		}, 300)
	}

	this.appendTo = function($target) {
		$element.appendTo($target);
	}

	this.compareTo = function(other) {
		if(typeof other === 'number') return other === matchingValue;

		return(other.compareTo(matchingValue));
	}

	this.matched = function() {
		$element.addClass('matched');
		matched = true;
	}

	// User Events
	$element.on('click tap', function() {
		if( matched || game.paused ) return;
		if( flipped ) {
			game.notify('player-unflip', {
				card: _cardInstance
			});
			return _cardInstance.unflip();
		}

		game.notify('player-flip', {
			card: _cardInstance
		});
		return _cardInstance.flip();
	});

	$element.on('mouseover', function() {
		$element.addClass('hover');
	});

	$element.on('mouseout', function() {
		$element.removeClass('hover');
	});
}