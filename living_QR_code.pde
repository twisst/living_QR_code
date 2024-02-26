
// This variable holds the filename of the base QR code:
String data_image_filename = "qrcode_processing.png"; // QR code that leads to The Coding Train on YouTube

boolean showVideo = true;
boolean showNoise = false;
boolean showDither = true;
boolean showFullQR = false;

import processing.video.*;

// Size of each cell in the grid
int squareSize = 15;                // this should be a multiple of 3 so it is neatly dividble into 3x3 sub-squares.
int subsquareSize = squareSize / 3; // QR code is 29x29 squares which we divide into 9 sub-squares (because a QR code only needs the middle one to be scannable).
int totalQRsize = squareSize * 29;  // length of the sides of the whole QR code, for use in translate()

// Variable for capture device
Capture video;

// base pattern for 29x29 QR code (this indicates which parts should appear as large solid squares)
int[] required = new int[841];
int[] data = new int[841]; // will hold the actual QR code

Dither d;
int mode = 0;
PImage p;

PFont f;
PImage arrow;

float avgBrightness = 120;


// loading QR module colors from a PNG
int[] loadQRcode(String png) {
  PImage img;
  int[] modules = new int[841];
  img = loadImage(png); // only has black and white
  img.loadPixels();
  for (int y = 0; y < img.height; y++) {
    for (int x = 0; x < img.width; x++) {
      int loc = x + y*img.width;
      modules[loc] = int(brightness(img.pixels[loc]));
    }
  }
  return modules;
}


void setup() {

  fullScreen(2); // use second screen if available

  //surface.setLocation(0, 0);
  d = new Dither();
  d.setCanvas(87,87);

  colorMode(RGB, 255, 255, 255, 100);
  rectMode(CORNER);
  noStroke();
  noCursor();

  // video input select
  // the selected camera is the first one in the list (the built-in one), 
  // unless the specified external camera is connected.
  String[] cameras = Capture.list();
  String cam = Capture.list()[0];
  String externalCamera = "Trust Webcam";
  for (int i = 0; i < cameras.length; i++) {
    if (Capture.list()[i].equals(externalCamera)) {
      cam = Capture.list()[i];
    }
  }
  println("Using this camera: ", cam);

  video = new Capture(this, 640, 360, cam, 30); // lowest possible resolution for 16:9 video
  video.start();

  frameRate(4);

  required = loadQRcode("blank_qr_code.png");  // image with just the required squares, stored as 0 (black), 255 (white) or 128 (grey, modules not required).
  data = loadQRcode(data_image_filename);      // image with the working QR code, only black and white

  // Create font
  f = createFont("TrebuchetMS-Bold", 20);
  textFont(f);
  textAlign(CENTER);

  arrow = loadImage("arrow.png");
}


void draw() {

  background(255);

  translate(200, 100);

  scale(1.8); // 2 for large screen, 1.4 for smaller one; TODO: autodetect resolution

  // Text with an arrow
  fill(0);
  text("You are what\nyou scan.\nScan yourself!", totalQRsize + 110, 120);
  image(arrow, totalQRsize + 20, 170, arrow.width/2, arrow.height/2);


  if (video.available()) {
    
    // CAPTURE VIDEO
    
    video.read();

    // Get a portion of the loaded image
    // videosize needs to be a multiple of 87 (29 squares x 3 subsquares) so that is easier to fit over the QR code.
    int videoSize = 348; // 435
    PImage frame = video.get(146, 0, videoSize, videoSize); // the crop starts with a left margin to center the video

    frame.resize(87, 87);

    // SHOW VIDEO

    if (showDither) {   // dither the video
      d.feed(frame);
      frame = d.dither(mode); 
    }
    
    if (showVideo) {
      // Begin loop for rows
      for (int j = 0; j < 87; j++) {  // 87 because that's how many columns and rows of subsquares there are
        // Begin loop for columns
        for (int i = 0; i < 87; i++) {

          // Where are we, pixel-wise, on the video frame?
          int xv = i * subsquareSize; // each square consists of 3x3 smaller squares of 4x4 pixels
          int yv = j * subsquareSize;

          // find the video pixel for the current square (while reversing x to mirror the image)
          int loc = (86 - i) + j * 87;

          // Each square is a shade of grey value depending on video brightness
          color c = frame.pixels[loc];
          fill(brightness(c));

          square(xv, yv, subsquareSize); // draw squares based on the video
        }
      }
    }

    // SHOW QR CODE

    // no need to consider the subsquares here, so just 29x29 (instead of 87x87 for the video)
    for (int row = 0; row < 29; row++) {
      for (int col = 0; col < 29; col++) {

        // Where are we, pixel-wise?
        int x = row * squareSize; // rows are 12px high,
        int y = col * squareSize; // columns 12px wide.

        int loc = (row * 29) + col;

        // if this square is required to be bigger, then give the the whole larger square the color of the base pattern.
        if (required[loc] != 128) {
          fill(color(required[loc]));
          square(x, y, squareSize);
        } else {
          // otherwise, this is one of the smaller squares

          if (showNoise) {
            // random dots
            fill(round(random(1))*255); // black or white
            // choose one random square to fill (might be the center one, but that will be overwritten below)
            square(x + int(random(0, 3))*subsquareSize, y + int(random(0, 3))*subsquareSize, subsquareSize);  
          }

          fill(data[loc]);
          if (!showFullQR) {
            // the data parts of the QR code only have to be 1/12th of the larger squares to still be scan-able.
              square(x+subsquareSize, y+subsquareSize, subsquareSize); // margins on both the x and y because this is the center square of the larger 9x9 grid
          } else {
            square(x, y, squareSize); // no margins, just show the full square
          }
          
        }
      }
    }
  }
}

void keyPressed() {  // 1 toggle video, 2 toggle noise, 3 toggle full QR code, 4 switch dithering modes
  if (key == '1') { 
    showVideo = !showVideo;
  } else if (key == '2') {
    showNoise = !showNoise;
  } else if (key == '3') {
    showFullQR = !showFullQR;
  } else if (key == '4') {
    mode = (mode + 1 ) % 5;      // 0 floyd_steinberg, 1 bayer, 2 atkinson, 3 random, 4 no dithering
    if (mode == 4) { showDither = false; } else { showDither = true; showVideo = true; } // last option is turn dithering off
  }
}
