class Dither {
  constructor() {
    
    colorMode(HSB, 255);
    this.temp = null;
    this.result = null;
    this.src = null;
    this.p = null;
    this.mode = 0; // 0 floyd, 1 bayer, 2 atkinson, 3 random

    // Bayer matrix
    this.matrix = [
      [1, 9, 3, 11],
      [13, 5, 15, 7],
      [4, 12, 2, 10],
      [16, 8, 14, 6],
    ];
    this.mratio = 1.0 / 17;
    this.mfactor = 255.0 / 5;
  }

  feed(img) {
    
    this.src = img;
    this.src.loadPixels();
    this.temp = [];

    // put all brightness values of the source frame into an array
    for (let y = 0; y < 87; y++) {
      for (let x = 0; x < 87; x++) {
        var index = (x + y * 87)*4;
        var c = color(this.src.pixels[index + 0], this.src.pixels[index + 1], this.src.pixels[index + 2]);
        var b = brightness(c);
        this.temp.push(b);
      }
    }

    // same, but with get()
    // for (let y = 0; y < 87; y++) {
    //   for (let x = 0; x < 87; x++) {
    //     // let srcpixel = this.src.get(x, y);
    //     let srcpixel = this.src.pixels[x + y * 87];
    //     this.temp.push(brightness(srcpixel));
    //   }
    // }

  }

  dither(mode) {
    this.mode = mode;
    if (this.mode === 0) return this.floydSteinberg();
    else if (this.mode === 1) return this.bayer();
    else if (this.mode === 2) return this.atkinson();
    else if (this.mode === 3) return this.rand();
    return null;
  }

  floydSteinberg() {

    this.result = [];

    for (let y = 0; y < 87; y++) {
      for (let x = 0; x < 87; x++) {
        let oldpixel = this.temp[x + y * 87];
        let newpixel = this.makeBlackorWhite(oldpixel);
        let quant_error = oldpixel - brightness(color(newpixel));

        this.temp[x + y * 87] = newpixel;

        this.temp[x+1 + y * 87] = this.temp[x + 1 + y * 87] + (7.0 / 16) * quant_error;
        this.temp[x-1 + (y+1) * 87] = this.temp[x - 1 + (y + 1) * 87] + (3.0 / 16) * quant_error;
        this.temp[x + (y+1) * 87] = this.temp[x + (y + 1) * 87] + (5.0 / 16) * quant_error;
        this.temp[x+1 + (y+1) * 87] = this.temp[x + 1 + (y + 1) * 87] + (1.0 / 16) * quant_error;

        this.result.push(newpixel);

      }
    }

    return this.result;
  }

  bayer() {

    this.temp = createGraphics(87, 87);
    this.temp.image(this.src, 0, 0);

    this.result = [];

    this.temp.loadPixels();

    for (let y = 0; y < 87; y++) {
      for (let x = 0; x < 87; x++) {

        let oldpixel = this.temp.get(x, y);
        let value = color(
          brightness(oldpixel) +
            this.mratio * this.matrix[x % 4][y % 4] * this.mfactor
        );
        let newpixel = this.makeBlackorWhite(value);
        this.temp.set(x, y, color(newpixel));

        this.result.push(newpixel);

      }
    }
    this.temp.updatePixels();

    return this.result;
  }

  atkinson() {

    this.result = [];

    for (let y = 0; y < 87; y++) {
      for (let x = 0; x < 87; x++) {

        let oldpixel = this.temp[x + y * 87];

        let newpixel = this.makeBlackorWhite(oldpixel);
        let quant_error = oldpixel - brightness(color(newpixel));

        this.temp.push(newpixel);
        
        this.temp[x+1 + y * 87] = brightness(this.src.get(x+1, y)) + (1.0 / 8) * quant_error;
        this.temp[x-1 + (y+1) * 87] = brightness(this.src.get(x-1, y+1)) + (1.0 / 8) * quant_error;
        this.temp[x + (y+1) * 87] = brightness(this.src.get(x, y+1)) + (1.0 / 8) * quant_error;
        this.temp[x+1 + (y+1) * 87] = brightness(this.src.get(x+1, y+1)) + (1.0 / 8) * quant_error;
        this.temp[x+2 + y * 87] = brightness(this.src.get(x+2, y)) + (1.0 / 8) * quant_error;
        this.temp[x + (y+2) * 87] = brightness(this.src.get(x, y + 2)) + (1.0 / 8) * quant_error;

        this.result.push(newpixel);

      }
    }

    return this.result;
  }

  rand() {
    
    this.temp = createGraphics(this.src.width, this.src.height);
    this.temp.image(this.src, 0, 0);

    this.result = [];

    let s = 1;
    this.temp.loadPixels();
    
    for (let y = 0; y < 87; y++) {
      for (let x = 0; x < 87; x++) {

        // let index = 4 * (x + y * 87);
        let index = x + y * 87;

        let oldpixel = this.temp.get(x, y);
        let newpixel = this.makeBlackorWhite(
          color(brightness(oldpixel) + random(-64, 64))
        );
        this.temp.set(x, y, newpixel);        
        
        this.result.push(newpixel);
      }
    }
    this.temp.updatePixels();

    return this.result;
  }

  makeBlackorWhite(pixelColor) {
		let b = 0;
		if (typeof pixelColor === 'number') {  // I'm mixing the ways I look up pixels in the video. Definitely needs fixing.
			b = pixelColor;
		} else {
    	b = brightness(pixelColor);
		}
    if (b > 128) {
      // Since brightness in HSB is from 0 to 255
      return 255; // White
    } else {
      return 0; // Black
    }
  }
}
