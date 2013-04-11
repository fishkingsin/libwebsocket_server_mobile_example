#include "testApp.h"

//--------------------------------------------------------------
void testApp::setup(){
	ofSetLogLevel(OF_LOG_VERBOSE);
    // setup a server with default options on port 9092
    // - pass in true after port to set up with SSL
    bConnected = server.setup( 9093 );
    
    // Uncomment this to set up a server with a protocol
    // Right now, clients created via libwebsockets that are connecting to servers
    // made via libwebsockets seem to want a protocol. Hopefully this gets fixed,
    // but until now you have to do something like this:
	
    /*
	 ofxLibwebsockets::ServerOptions options = ofxLibwebsockets::defaultServerOptions();
	 options.port = 9092;
	 options.protocol = "of-protocol";
	 bConnected = server.setup( options );
	 */
    
    // this adds your app as a listener for the server
    server.addListener(this);
    
    ofBackground(0);
    ofSetFrameRate(60);
	numLED = row*col;
	led = new ofxLEDsLPD8806(numLED);
	
	if(	spi.connect())
	{
		ofLogNotice()<<"connected to SPI";
	}
	
}
void testApp::exit()
{
	led->clear(0);
	
	spi.send(led->txBuffer);
}
//--------------------------------------------------------------
void testApp::update(){
	
	led->renderBuffer.begin();
	ofPushStyle();
	if(colors.size()>0)
	{
		float div = numLED/colors.size();
		for(int i=0; i < colors.size(); i++)
		{
			ofSetColor(colors[i]);
			ofRect(div*i,0,div,led->renderBuffer.getHeight());
		}
	}
	ofPopStyle();
	led->renderBuffer.end();
	// led->encode();
	spi.send(led->txBuffer);
}

//--------------------------------------------------------------
void testApp::draw(){
    if ( bConnected ){
        ofDrawBitmapString("WebSocket server setup at "+ofToString( server.getPort() ) + ( server.usingSSL() ? " with SSL" : " without SSL"), 20, 20);
        
        ofSetColor(150);
        ofDrawBitmapString("Click anywhere to open up client example", 20, 40);
    } else {
        ofDrawBitmapString("WebSocket setup failed :(", 20,20);
    }
    
    int x = 20;
    int y = 100;
    
    ofSetColor(0,150,0);
    ofDrawBitmapString("Console", x, 80);
    
    ofSetColor(255);
    for (int i = messages.size() -1; i >= 0; i-- ){
        ofDrawBitmapString( messages[i], x, y );
        y += 20;
    }
    if (messages.size() > NUM_MESSAGES) messages.erase( messages.begin() );
    
    ofSetColor(150,0,0);
    ofDrawBitmapString("Type a message, hit [RETURN] to send:", x, ofGetHeight()-60);
    ofSetColor(255);
    ofDrawBitmapString(toSend, x, ofGetHeight() - 40);
	
	ofPushMatrix();
	ofScale(5, 5);
    led->renderBuffer.draw(20,10);
	led->encodedBuffer.draw(20,20);
	ofPopMatrix();
}

//--------------------------------------------------------------
void testApp::onConnect( ofxLibwebsockets::Event& args ){
    cout<<"on connected"<<endl;
}

//--------------------------------------------------------------
void testApp::onOpen( ofxLibwebsockets::Event& args ){
    cout<<"new connection open"<<endl;
    messages.push_back("New connection from " + args.conn.getClientIP() + ", " + args.conn.getClientName() );
}

//--------------------------------------------------------------
void testApp::onClose( ofxLibwebsockets::Event& args ){
    cout<<"on close"<<endl;
    messages.push_back("Connection closed");
}

//--------------------------------------------------------------
void testApp::onIdle( ofxLibwebsockets::Event& args ){
    cout<<"on idle"<<endl;
}

//--------------------------------------------------------------
void testApp::onMessage( ofxLibwebsockets::Event& args ){
    cout<<"got message "<<args.message<<endl;
	//    vector<string>sub = ofSplitString(args.message,",");
	
	//        if(sub.size()==3)
	//        {
	//            color.r = ofToInt(sub[0]);
	//            color.g = ofToInt(sub[1]);
	//            color.b = ofToInt(sub[2]);
	//             printf("got color %i %i %i \n",color.r,color.g,color.b);
	//             led->clear(color);
	//        }
    // trace out string messages or JSON messages!
    if ( !args.json.isNull() ){
        
		ofLogVerbose("toStyledString") << args.json.toStyledString();
        messages.push_back("New message: " + args.json.toStyledString() + " from " + args.conn.getClientName() );
		colors.clear();
		Json::Value v = args.json.get("colors", 0);
		for(int i = 0 ; i < v.size() ;i++)
		{
			//			ofLogVerbose()<< v.get(i, 0).get("color",0).asInt();
			
			ofColor color;
            color.r = v.get(i, 0).get("r",0).asInt();
            color.g = v.get(i, 0).get("g",0).asInt();
            color.b = v.get(i, 0).get("b",0).asInt();
			
			colors.push_back(color);
			
			
		}
    } else {
        messages.push_back("New message: " + args.message + " from " + args.conn.getClientName() );
		ofLogVerbose("PlainText") << args.message;
    }
	
    // echo server = send message right back!
    args.conn.send( args.message );
}

//--------------------------------------------------------------
void testApp::onBroadcast( ofxLibwebsockets::Event& args ){
    cout<<"got broadcast "<<args.message<<endl;
}

//--------------------------------------------------------------
void testApp::keyPressed(int key){
    // do some typing!
    if ( key != OF_KEY_RETURN ){
        if ( key == OF_KEY_BACKSPACE ){
            if ( toSend.length() > 0 ){
                toSend.erase(toSend.end()-1);
            }
        } else {
            toSend += key;
        }
    } else {
        // send to all clients
        server.send( toSend );
        messages.push_back("Sent: '" + toSend + "' to "+ ofToString(server.getConnections().size())+" websockets" );
        toSend = "";
    }
}

//--------------------------------------------------------------
void testApp::keyReleased(int key){
	
}

//--------------------------------------------------------------
void testApp::mouseMoved(int x, int y ){
	
}

//--------------------------------------------------------------
void testApp::mouseDragged(int x, int y, int button){
	
}

//--------------------------------------------------------------
void testApp::mousePressed(int x, int y, int button){
    string url = "http";
    if ( server.usingSSL() ){
        url += "s";
    }
    url += "://localhost:" + ofToString( server.getPort() );
    ofLaunchBrowser(url);
}

//--------------------------------------------------------------
void testApp::mouseReleased(int x, int y, int button){
	
}

//--------------------------------------------------------------
void testApp::windowResized(int w, int h){
	
}

//--------------------------------------------------------------
void testApp::gotMessage(ofMessage msg){
	
}

//--------------------------------------------------------------
void testApp::dragEvent(ofDragInfo dragInfo){
	
}