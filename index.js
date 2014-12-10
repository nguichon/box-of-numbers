var express = require('express');
var app = express();

if(process.env.NODE_ENV === undefined) {
	app.use('/box-of-numbers.min.js', function(req, res) {
		res.sendFile(__dirname + '/src/box-of-numbers.js');
	});
}

app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 3000);