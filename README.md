LEAPnav
=======

The LEAP motion device (see www.leapmoton.com) has presented a new means of controlling computers with hand gestures and now that it is in the hands of thousands of consumers and developers, it can be put to use.

With just a few lines of code, LEAPnav can be added to any website and can be used to trigger events within the site or navigation between pages of a site. LEAPnav is able to communicate with a LEAP motion if the website viewer has one plugged  (or plugs one in after opening the site) and provides an intuitive interface for accepting hand gestures for convenient website control. For viewers who do not have a LEAP motion, the same actions which hand gestures can control, can be activated using the keyboard. A demo can be seen running at www.workbygavin.com

Types of Controls:
Left: Waving the hand to the left or pressing the left arrow key.
Right: Waving the hand to the right or pressing the right arrow key.
Up: Waving the hand vertically or pressing the up arrow key.
Select: Holding the hand above the LEAP for about a second or pressing the enter key.

The LEAPnav can be added to a website by including a <canvas> html element with the id set to "leap-nav", as well as including the LEAPnav.js script and the jQuery.js and leap.js script which it relies on. The canvas element is recommended to be set to a width and height of 150 pixels.

A JavaScript API is provided for sites to interact with the LEAPnav as follows:

Display Customizations:

LEAPnav.enable(<string>);

Takes in any string constant provided below and enables its function.

LEAPnav.disable(<string>);

Takes in any string constant provided below and disables its function.

String Constants:

LEAPnav.Left - defaults to enabled.
LEAPnav.Right - defaults to enabled.
LEAPnav.Up - defaults to enabled.
LEAPnav.Select - defaults to enabled.
LEAPnav.Keyboard - defaults to enabled.
LEAPnav.Gesture - defaults to enabled.

Callback Functions:

LEAPnav.onLeft(<function>);

Sets a function to be called when the left command is fired.

LEAPnav.onRight(<function>);

Sets a function to be called when the right command is fired.

LEAPnav.onUp(<function>);

Sets a function to be called when the up command is fired.

LEAPnav.onSelect(<function>);

Sets a function to be called when the select command is fired.

