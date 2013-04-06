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
// function get_random_color() {
//     var letters = '0123456789ABCDEF'.split('');
//     var color = '#';
//     for (var i = 0; i < 6; i++ ) {
//         color += letters[Math.round(Math.random() * 15)];
//     }
//     return color;
// }
// function decimalToHexString(number)
// {
//     if (number < 0)
//     {
//         number = 0xFFFFFFFF + number + 1;
//     }

//     return number.toString(16).toUpperCase();
// }
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
    var rgb = hsb2rgb([Math.random()*360,100,100]);
    var color = ((0 << 24) | (rgb[0] << 16) |  (rgb[1] << 8) | rgb[2]);
    myColor = "#"+color.toString(16);//RGB2HTML(rgb[0],rgb[1],rgb[2]);
    changeBGC(myColor);
});
function hsb2rgb(hsb) {
    var red, grn, blu, i, f, p, q, t;
    hsb[0]%=360;
    if(hsb[2]==0) {return(new Array(0,0,0));}
    hsb[1]/=100;
    hsb[2]/=100;
    hsb[0]/=60;
    i = Math.floor(hsb[0]);
    f = hsb[0]-i;
    p = hsb[2]*(1-hsb[1]);
    q = hsb[2]*(1-(hsb[1]*f));
    t = hsb[2]*(1-(hsb[1]*(1-f)));
    if (i==0) {red=hsb[2]; grn=t; blu=p;}
    else if (i==1) {red=q; grn=hsb[2]; blu=p;}
    else if (i==2) {red=p; grn=hsb[2]; blu=t;}
    else if (i==3) {red=p; grn=q; blu=hsb[2];}
    else if (i==4) {red=t; grn=p; blu=hsb[2];}
    else if (i==5) {red=hsb[2]; grn=p; blu=q;}
    red = Math.floor(red*255);
    grn = Math.floor(grn*255);
    blu = Math.floor(blu*255);
    return (new Array(red,grn,blu));
}

// send value from text input
function sendMessageForm(){
    var rgb = hsb2rgb([Math.random()*360,100,100]);
    
    // var color = ((rgb[0] ) |  (rgb[1] << 8) | (rgb[2] << 16) || (1<<24));
    // console.log("R: "+rgb[0] + " G: "+rgb[1] + " B: "+rgb[2]);
    
    myColor = "#"+  rgbToHex(rgb[0],rgb[1],rgb[2]);//RGB2HTML(rgb[0],rgb[1],rgb[2]);
    // console.log(rgb);
    
    // console.log("toHexx: "+myColor);
    // color = parseInt(rgbToHex(rgb[0],rgb[1],rgb[2]),16);
    
    // console.log("Int: "+color);
    socket.send(rgb);

    // message.value = "";
    
    changeBGC(myColor);
}
function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(n) {
   n = parseInt(n,10);
   if (isNaN(n)) return "00";
   n = Math.max(0,Math.min(n,255));
   return "0123456789ABCDEF".charAt((n-n%16)/16)
   + "0123456789ABCDEF".charAt(n%16);
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