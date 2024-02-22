
// This variable holds the filename of the base QR code:
String data_image_filename = "qrcode_processing.png"; // QR code that leads to The Coding Train on YouTube

boolean showVideo = true;
boolean showNoise = false;
boolean showDither = true;
boolean showFullQR = false;

import processing.video.*;

// Size of each cell in the grid
int squareSize = 15;                // this should be a multiple of 3 so it is neatly dividble into 3x3 sub-squares.
int subsquareSize = squareSize / 3; // QR-code is 29x29 squares which we divide into 9 sub-squares (because a QR code only needs the middle one to be scannable).
int totalQRsize = squareSize * 29;  // length of the sides of the whole QR code, for use in translate()

// Variable for capture device
Capture video;

// base pattern for 29x29 QR code (this indicates which parts should appear as large solid squares)
int[] required = new int[841];
int[] data = new int[841]; // will hold the actual QR code

Dither d;
PImage p;

PFont f;
PImage arrow;

float xoff = 0.0;

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
  //size(1200, 1000);

  surface.setLocation(0, 0);
  d = new Dither();
  d.setCanvas(87,87);

  colorMode(RGB, 255, 255, 255, 100);
  rectMode(CORNER);
  noStroke();

  // video input
  String[] cameras = Capture.list();
  //print(cameras);

  // define which camera is chosen:
  String selectCam = "FaceTime-HD-camera (ingebouwd)";
  // the selected camera is the built-in one, unless the external one is connected
  String cam = selectCam;
  selectCam = "Trust Webcam";
  for (int i = 0; i < cameras.length; i++) {
    if (Capture.list()[i].equals(selectCam)) {
      cam = Capture.list()[i];
    }
  }
  println(cam);


  // video = new Capture(this, 480, 360, Capture.list()[0], 30);
  // https://en.wikipedia.org/wiki/16:9_aspect_ratio#Common_resolutions
  //video = new Capture(this, 640, 480, cam, 30);
  video = new Capture(this, 480, 480, cam, 30);
  video.start();

  frameRate(4);

  required = loadQRcode("blank_qr_code.png");  // required squares are stored as 0 (black), 255 (white) or 128 (grey, modules not required).
  data = loadQRcode(data_image_filename);    // this image only has black and white

  // Create font
  f = createFont("TrebuchetMS-Bold", 20);
  textFont(f);
  textAlign(CENTER);

  arrow = loadImage("arrow.png");
}


void draw() {

  background(255);

  translate(200, 100);

  scale(1.8); // 2 voor groot scherm, 1.4 voor kleiner; to do: autodetect resolutie

  float tempBrightness = 0;

  // 'scan me' with an arrow
  fill(0);
  text("Wat je scant\nben je zelf :-) \nScan jezelf!", totalQRsize + 110, 120);
  image(arrow, totalQRsize + 20, 170, arrow.width/2, arrow.height/2);


  if (video.available()) {
    video.read();
    //video.loadPixels();

    PImage frame = video.get(80, 0, 435, 435); //Get a portion of the loaded image with displaying it (435 is a multiple of 87 (29 squares x 3 subsquares) so that is easier to fit over the QR code)

    frame.resize(87, 87);

    if (showDither) {
      d.feed(frame);
      frame = d.floyd_steinberg();
    }




    image(frame, 0, 0);
    //filter(GRAY);
    //filter(POSTERIZE, 2);


    //image(frame, 440, 0, 435, 435); // show the video next to the QR code

    // SHOWING THE VIDEO
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

          // Each rect is black or white depending on video brightness
          color c = frame.pixels[loc];
          //int f = 0;

          //// find the pixel's brightness
          //float pixelBright = brightness(c);
          ////  and keep track of the frame's overall brightness.
          //tempBrightness += pixelBright;

          //if (brightness(c) > avgBrightness) {
          //  f = 255;
          //}
          fill(brightness(c));

          square(xv, yv, subsquareSize); // draw squares based on the video
        }
      }
    }

    // re-calculate the average brightness
    avgBrightness = tempBrightness / 13456; // 13456 because that's how many pixels we're considering



    // SHOWING THE QR CODE
    //// so while we look at the smaller resolution for the video, we have to use a more coarse grid for the QR code.

    int n = 0;

    for (int row = 0; row < 29; row++) {
      for (int col = 0; col < 29; col++) {

        // print(required[n] + ", ");

        // Where are we, pixel-wise?
        int x = row * squareSize; // rows are 12px high,
        int y = col * squareSize; // columns 12px wide.

        int loc = (row * 29) + col;

        // if this square is required to be bigger, then give the the whole larger square the color of the base pattern.
        if (required[n] != 128) {
          fill(color(required[n]));
          square(x, y, squareSize);
        } else {
          // otherwise, this is one of the smaller squares

          if (showNoise) {
            // random dots (with Perlin noise)
            xoff = xoff + .1;
            fill(round(noise(xoff))*255);
            square(x + int(random(0, 3))*subsquareSize, y + int(random(0, 3))*subsquareSize, subsquareSize);
          }

          // the data parts of the QR code only have to be 1/12th of the larger squares to still be scan-able.
          fill(data[loc]);
          if (!showFullQR) {
            square(x+subsquareSize, y+subsquareSize, subsquareSize); // margins on both the x and y because this is the center square of the larger 9x9 grid
          } else {
            square(x, y, squareSize); // margins on both the x and y because this is the center square of the larger 9x9 grid
          }
          
        }

        n++;
      }
    }
  }
}

void keyPressed() {
  print(key);
  if (key == '1') {
    showVideo = !showVideo;
  } else if (key == '2') {
    showNoise = !showNoise;
  } else if (key == '3') {
    showFullQR = !showFullQR;
    if (showFullQR == true) { showVideo = false; }
  } else if (key == '4') {
    showDither = !showDither;
  }
}
