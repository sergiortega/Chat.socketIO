var socket = io(),
	lastCommentFrom = '',
	connected = false;

var scrollToBottom = function () {
	var main = $('div.main'),
    	height = main[0].scrollHeight;
    main.scrollTop(height);
};

var clearStorage = function () {
	localStorage.clear();
	window.location.reload();
}

socket.on('chat message', function (data){
	if (!connected) return false;

	var message = data.message;

	//check if the message coming from the server
	//welcome message will append a special message letting the users now which user just joined the chat room
	if (message === 'welcomeMsg') {
		message = data.username + ' has join the group.';
		$('#messages').append($('<li class="new_user">').text(message));
		scrollToBottom();
		localStorage.setItem("username", data.username);
        localStorage.setItem("room", data.room);
		return false;
	} else if (message === 'byeMsg') { //bye message will let the users now which user jus left the chat room
		message = data.username + ' has left the group.';
		$('#messages').append($('<li class="new_user bye">').text(message));
		scrollToBottom();
		return false;
	}

	//check if the comment comes from the same user that wrote the last time so we don't print out his name again
	if (lastCommentFrom !== data.userID) {
		$('#messages').append($('<li class="username" style="background: '+ data.color +';">').text(data.username));
	}
	$('#messages').append($('<li class="text" style="background: '+ data.color +';">').text(message));
	lastCommentFrom = data.userID;
	scrollToBottom();
});

socket.on('updateUserList', function (data){
	if (!connected) return false;

	if(data.clients.length > 0){
		$('#users').empty();
		for (var i = 0; i < data.clients.length; i++) {
			$('#users').append($('<li>').text(data.clients[i].username));
		}
	}
});

$(document).ready(function () {
	var usernameLocal = localStorage.getItem("username"),
		roomLocal = localStorage.getItem("room");

	if (usernameLocal != null && roomLocal != null) {
		socket.emit('adduser', usernameLocal, roomLocal);
		$('#welcome').hide();
		$('div.main').addClass('show');
		$('div.userList').addClass('show');
		$('div.compose').addClass('show');
		connected = true;
	}

	$('div.userList').click(function () {
		$(this).find('ul').toggle();
	});

	$('form#userInput').submit(function (){
		if ($('#username').val() !== '' && $('select').val()) {
			socket.emit('adduser', $('#username').val(), $('select').val());
			$('#username').val('');
			$('#welcome').hide();
			$('div.main').addClass('show');
			$('div.userList').addClass('show');
			$('div.compose').addClass('show');
			connected = true;
		}
		return false;
	});

	$('form#sendMessage').submit(function (){
		if ($('#message').val() !== '') {
			socket.emit('chat message', $('#message').val());
			$('#message').val('');
		}
		return false;
	});
});