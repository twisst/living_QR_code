/*
 * Living QR code
 * Video from the user’s built-in webcam is showing in this QR code!
 * A QR code that appears to be entirely composed of your webcam video — and yet remains scannable!
 * Read more on this project (including how to do this in Processing) on Github: https://github.com/twisst/living_QR_code
 */

// const a = performance.now();
// console.log('start');

// These hold the QR code
let blank, dataImageFile;

// QR code image, in this case one that leads to the Github page for this project.
let dataImageFilename = "qrcode_github-livingQR-repo.png";

let video;
let showVideo = true;
let showNoise = true;
let showDither = true;
let showFullQR = false;

let squareSize;
let subsquareSize;
let totalQRsize = 0;
let vmargin;
let hmargin;

// set noiseLevel:
// there will be a 1 in noiseLevel chance that an extra subsquare is drawn around the module center subsquare.
let noiseLevel = 3;

let required = new Array(841); // required parts of the 29x29 QR code (that should appear as large solid squares)
let data = new Array(841); // will hold the actual QR code

let d;
let mode = 1;
let p;

let f, s;
// let arrow;

// loading QR module colors from a PNG
function loadQRcode(png) {
  let modules = new Array(841);
  png.loadPixels(); // only has black and white
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      let loc = x + y * png.width;
      let c = png.get(x, y); // krijg de kleur van de pixel op (x, y)
      let brightnessValue = brightness(c); // krijg de helderheid van de kleur
      modules[loc] = brightnessValue;
    }
  }
  return modules;
}

function preload() {
  blank = loadImage("blank_qr_code.png");
  dataImageFile = loadImage(dataImageFilename);
  // arrow = loadImage("arrow.png");
  // f = "Verdana";
  s = loadFont("ka1.ttf"); // font: Karmatic arcade by Vic Fieger
}

function setup() {
	
  createCanvas(windowWidth, windowHeight);

  colorMode(HSB, 255);

  d = new Dither();

  // Size of each 'module' in the grid
  squareSize = 3;
  // squareSize should be a multiple of 3 so it is neatly dividble into 3x3 sub-squares.
  // Since this number is the basis for the rest of the dimensions, it determines the scale of the QR code.
  // We should use this instead of scale(), because that function gives rational pixel numbers and that
  // creates unwanted white lines between squares.

  // Now we know the value of width and height, so we can scale the QR code to the size of the screen.
  // here we use 29 + 8 in order to have a margin around the QR code (the poetically named 'quiet zone')
  while ((squareSize + 3) * 37 < height && (squareSize + 3) * 37 < width) {
    squareSize += 3;
  }
  // console.log("squareSize is ", squareSize);

  totalQRsize = squareSize * 29; // length of the sides of the whole QR code
  subsquareSize = squareSize / 3; // we divide the modules of the QR code into 9 sub-squares that have sides 1/3 of the larger square.
  vmargin = (height - totalQRsize) / 2; // vertical margin
  hmargin = (width - totalQRsize) / 2; // horizontal margin

  required = loadQRcode(blank); // image with just the required squares
  data = loadQRcode(dataImageFile); // image with the working QR code

  // take in webcam video
  video = createCapture(VIDEO,{ flipped:true });
  video.size(640, 360);
  video.hide();

  frameRate(4);

  noStroke();
  
  // const b = performance.now();
  // console.log('Setup done; it took ' + (b - a) + ' ms.');
  
}

function draw() {
  background(255);
  translate(hmargin - 50, vmargin);
  
  // const k = performance.now();
  // console.log('Start draw');

  // Text
  fill(0);
  textFont(s, 28);
  text("You\nare\nwhat\nyou\nscan.", totalQRsize * 1.1, totalQRsize * 0.05);
  // textFont(f, 28);
  // text("Scan yourself!", totalQRsize * 1.1, totalQRsize * 0.7);
  // image(
  //   arrow,
  //   totalQRsize * 1.1,
  //   totalQRsize * 0.7,
  //   arrow.width / 2,
  //   arrow.height / 2
  // );


  // CAPTURE VIDEO

  if (video.loadedmetadata) {

    // Get a portion of the loaded image
    let videoSize = 348; // needs to be a multiple of 87 (29 squares x 3 subsquares) so that is easier to fit over the QR code.
    let frame = video.get(146, 0, videoSize, videoSize); // the crop starts with a 146 left margin to center the video
    frame.loadPixels();
    frame.resize(87, 87);

    // SHOW VIDEO

    if (showDither) {  // dither the video
      d.feed(frame);
      frame = d.dither(mode);
    }

    if (showVideo) { // Draw video frame (either dithered or not)
      // Begin loop for rows
      for (let i = 0; i < 87; i++) { // 87 because that's how many columns and rows of subsquares there are
        // Begin loop for columns
        for (let j = 0; j < 87; j++) {
          
          // Where are we, pixel-wise, on the video frame?
          let xv = i * subsquareSize; // each square consists of 3x3 smaller squares of 4x4 pixels
          let yv = j * subsquareSize;
          
          // find the video pixel for the current square
          let loc = i + j * 87;
          
          // Each square is a shade of grey value depending on video brightness
          if (showDither) {
            let c = frame[loc];
            fill(c);
          } else {
            let c = frame.get(i, j); // get color
            fill(brightness(c));
          }
          square(xv, yv, subsquareSize); // draw squares based on the video
        }
      }
    }

    // SHOW QR CODE

    // no need to consider the subsquares here, so just 29x29 (instead of 87x87 for the video)
    for (let row = 0; row < 29; row++) {
      for (let col = 0; col < 29; col++) {

        // Where are we, pixel-wise?
        let x = row * squareSize;
        let y = col * squareSize;
        let loc = row * 29 + col;

        if (required[loc] != 128) {
          // if this square is part of the required base pattern, it needs to be bigger.

          fill(color(required[loc]));
          square(x, y, squareSize);

        } else {
          // otherwise, this is one of the smaller squares

          if (showNoise) {
            
            // random dots
            if (round(random(noiseLevel)) == 1) { // determines how often we draw an extra square
              fill(round(random(1)) * 255); // black or white
              // choose one random square to fill (might be the center one, but that will be overwritten below)
              square(
                x + round(random(0, 2)) * subsquareSize,
                y + round(random(0, 2)) * subsquareSize,
                subsquareSize
              );
            }
            
          }
          
          fill(data[loc]);
          // the data parts of the QR code only have to be 1/12th of the larger squares to still be scan-able.
          if (!showFullQR) {
            // margins on both the x and y because this is the center square of the larger 9x9 grid
            square(x + subsquareSize, y + subsquareSize, subsquareSize);
          } else {
            // no margins, just show the full square
            square(x, y, squareSize);
          }
        }
      }
    } // end of showing QR code
  }

  // const l = performance.now();
  // console.log('Drawing took ' + (l - k) + ' ms.');
  
} // end of draw()

function keyPressed() {  // 1 toggle video, 2 toggle noise, 3 toggle full QR code, 4 switch dithering modes
  if (key == "1") {
    showVideo = !showVideo;
  } else if (key == "2") {
    showNoise = !showNoise;
  } else if (key == "3") {
    showFullQR = !showFullQR;
  } else if (key == "4") {
    mode = (mode + 1) % 5; // 0 floyd_steinberg, 1 bayer, 2 atkinson, 3 random, 4 no dithering
    // console.log("Dither mode", mode);
    if (mode == 4) {
      showDither = false; // last option is turn dithering off
    } else {
      showDither = true;
      showVideo = true;
    }
  }
}
