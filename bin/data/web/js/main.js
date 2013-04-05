var socket;

var messageDiv;
var statusDiv;
var button;
var textField;
// Shake sensitivity (a lower number is more)
var sensitivity = 20;
// Position variables
var x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0;
   
  var delay = 10;
  var vMultiplier = 0.01;
  var myColor;
function changeBGC(color){
	document.body.style.backgroundColor=color;
	
}
function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}
$(document).ready( function() {
	
	setupSocket();
	setupDevice();
	document.getElementById("brow").textContent = " " + BrowserDetect.browser + " "
		+ BrowserDetect.version +" " + BrowserDetect.OS +" ";

	messageDiv = document.getElementById("messages");
	statusDiv = document.getElementById("status");

	//setup message sending button
	message = document.getElementById("message");
	button = document.getElementById("button");

	// send the form when you press enter 
	// or when you press the button
	button.onclick = function(e){
		sendMessageForm();
	};
	$("#message").keyup(function(event){
    	if(event.keyCode == 13){
    		sendMessageForm()
    	}
    })
    myColor = get_random_color()
    changeBGC(myColor);
    // socket.send(myColor);
});

// send value from text input
function sendMessageForm(){
    myColor = get_random_color();
    var c = hexToRgb(myColor);
    console.log("Hex: "+myColor);
    var color = ((1 << 24) | (c.r << 16) | (c.g << 8) | c.b);
    console.log("Int: "+color);
	
	socket.send(color);
	// socket.send(message.value);
	message.value = "";
	
    changeBGC(myColor);
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


// setup web socket
function setupSocket(){

	// setup websocket
	// get_appropriate_ws_url is a nifty function by the libwebsockets people
	// it decides what the websocket url is based on the broswer url
	// e.g. https://mygreathost:9099 = wss://mygreathost:9099

	if (BrowserDetect.browser == "Firefox") {
		socket = new MozWebSocket(get_appropriate_ws_url());
	} else {
		socket = new WebSocket(get_appropriate_ws_url());
	}
	
	// open
	try {
		socket.onopen = function() {
			statusDiv.style.backgroundColor = "#40ff40";
			statusDiv.textContent = " websocket connection opened ";
			// socket.send(myColor);
		} 

		// received message
		socket.onmessage =function got_packet(msg) {
			messageDiv.innerHTML = msg.data + "<br />" + messageDiv.innerHTML;
		}

		socket.onclose = function(){
			statusDiv.style.backgroundColor = "#ff4040";
			statusDiv.textContent = " websocket connection CLOSED ";
		}
	} catch(exception) {
		alert('<p>Error' + exception);  
	}
}

function setupDevice()
{
	if (window.DeviceMotionEvent==undefined) {
    	// document.getElementById("no").style.display="block";
    	// document.getElementById("yes").style.display="none";
     
    } else {
        window.addEventListener('devicemotion', function (e) {
        x1 = e.accelerationIncludingGravity.x;
        y1 = e.accelerationIncludingGravity.y;
        z1 = e.accelerationIncludingGravity.z;
    }, false);
    	// window.ondevicemotion = function(event) {
    	 
    	// 	x1 = e.accelerationIncludingGravity.x;
     //        y1 = e.accelerationIncludingGravity.y;
     //        z1 = e.accelerationIncludingGravity.z;
    	// }
     
    	setInterval(function() {
                
               
                var change = Math.abs(x1-x2+y1-y2+z1-z2);

                if (change > sensitivity) {
                     sendMessageForm();
                }

                // Update new position
                x2 = x1;
                y2 = y1;
                z2 = z1;
    	}, delay);
    } 
}