# Living QR Code: the P5 version 

See this version live in action at https://openprocessing.org/sketch/2289887.

I wanted to make this P5js version to be able to link to a quick demo. This version is less smooth however than the [Processing version](https://github.com/twisst/living_QR_code/) I started with. I spent quite a bit of time figuring out if I could make the script faster and the dithering better looking, but I'm just not that good at Javascript I'm afraid :-)

P5's set() is supposed to be faster than directly accessing pixels in the pixel array. The dithering class still uses a lot of those. I thought using an array to store the video frame's pixels in would make it a lot faster, but I don't think I got it to work as well as it could. There's also a lot of calls to the get() function and that has the same problem. It makes the framerate lower than it could be. If you know how to fix that, please do! I would welcome pull requests.

In the browser sometimes the aspect ratio of the webcam video seems off, like too wide. Strangely, it somwetimes goes back to normal when I simultaneously start up the script in Processing. Also weird: video from the webcam has less contrast in P5 than the same webcam in Processing (at least on my computer, in Firefox on Mac). I don't know how fix these things ¯\_(ツ)_/¯ Again, pull requests are welcome.