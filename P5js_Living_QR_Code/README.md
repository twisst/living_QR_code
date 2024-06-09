# Living QR Code in P5

See the P5js version of the Living QR Code in action on https://openprocessing.org/sketch/2289887.

I thought it would be fun to try it in P5, but this version is definitely less smooth than the [Processing version](https://github.com/twisst/living_QR_code/) I started with. I spent quite a bit of time figuring out if I could make the script faster and the dithering better looking, but I'm just not that good at Javascript I'm afraid :-)

I thought using an array to store the video frame's pixels in would make it a lot faster, but I don't think it really helps. P5's set() is supposed to be faster than directly accessing pixels in the pixel array
The get() function has the same problem. 

Weird: video from the webcam has less contrast in P5 than the same webcam in Processing (at least on my computer, in Firefox on Mac) ¯\_(ツ)_/¯ I don't know how to fix that.