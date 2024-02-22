# Living QR code
A QR code that appears to be entirely composed of your webcam video — and yet remains scannable!

This Processing script shows a 29x29-squares QR code where a video is shown in between the necessary squares.

This works because the squares that make up the QR code actually consist of 3x3 smaller squares. Only the middle one is needed for the QR code to work.
 
Also based on [Mirror 2](https://github.com/processing/processing-video/tree/main/examples/Capture/Mirror2) by Daniel Shiffman, where pixels from the video source are drawn as a rectangle with size based on brightness. (See Dan's [tutorial on live video](https://processing.org/tutorials/video)).

The dithering is handled by Julian Hespenheide's [dithering class for Processing](https://github.com/ndsh/dither).  


## Making the base QR code
The base QR code pattern is stored in a PNG file called blank_qr_code.png.
The pixels in that image tell this script which squares should appear larger (without those the QR code would not scan correctly).

The actual data for the QR is created using an online service. There are several that will let you create QR codes for free. [Goqr.me](https://goqr.me/) will let you output QR codes as vector images, which you can then convert to a tiny PNG file. 

The script expects the QR code to have a size of 29x29 squares (QR code version 3). To get that from Goqr.me, you have to enter at least 33 characters. If necessary, pad the url with spaces.
Click on 'Download', set border to 0, leave everything else as-is, then under 'Download QR Code as' click on 'SVG'.

Using [Inkscape](https://inkscape.org/): open the SVG, File > Export, set width and height both to 29 in the Document tab, set the filetype to PNG at the bottom there, choose a name and set the destination folder to the data folder for the Processing script and click 'Export'.
You may need to uncheck 'Hide Export Settings' and set 'antialias' to 0 in the export settings window that pops up.
