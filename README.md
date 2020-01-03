# DynamicHeader

Make the header of your web pages dynamic.

![](https://raw.githubusercontent.com/ulfschneider/dynamic-header/master/dynamic-header.gif)

## Node
Install in your Node project with

<pre>
npm i dheader
</pre>

and use it inside your code via

<pre>
const DynamicHeader = require('dheader');
</pre>

or, alternatively

<pre>
import DynamicHeader from 'dheader';
</pre>

## Plain old Web Page

In case you don´t have a Node project and simply want to use the dynamic header in your web page, you have to import the javascript library <a href='https://github.com/ulfschneider/dynamic-header/blob/master/dynamic-header.min.js'>dynamic-header.min.js</a> into your html file. An example can be found in <a href='https://github.com/ulfschneider/dynamic-header/blob/master/dynamic-header.html'>dynamic-header.html</a>.

## Usage

Once you made the module/library available to your code, you can use the dynamic header as follows:

<pre>
DynamicHeader.init();
</pre>

## Settings

The DynamicHeader can be configured by providing a settings object to the init routine.

<pre>
DynamicHeader.init(settings);
</pre>

* <code>settings.headerId</code> String ? The id of the header object. If omitted the html header tag (if existing) or any dom element with an id named 'header' will be selected to apply the DynamicHeader behavior.
* <code>settings.delta</code> Number ? A user has to scroll the given amount of pixels in order to activate the dynamic header behavior. Default is 5.
* <code>settings.fixed</code> Boolean ? If true, the header will be positioned fix and will not slide in and out. Default is false.
* <code>settings.hideOnClick</code> Boolean ? If true, the header will be hidden when it´s been clicked inside. Default is true.
* <code>settings.pauseMoveDuration</code> Number ? When the header is hidden on click, for an amount of 1000 milliseconds the header will not moved anymore by default. Change the default here.
* <code>settings.slideIn</code> String ? Provide a CSS class name to be applied to the header whenever the header is sliding into the page (which is the case when the user is scrolling up). The class will only be applied as long as the user is able to scroll up. Once the top of the page is reached, the class will be removed from the header. Default class name is 'slide-in'.
