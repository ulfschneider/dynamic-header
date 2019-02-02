# DynamicHeader

Make the header of your web pages dynamic.

<img src="https://raw.githubusercontent.com/ulfschneider/dynamic-header/master/dynamic-header.gif"/ style="max-width:627px">

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

In case you don´t have a Node project and simply want to use the dynamic header in your plain old web page, you have to import javascript library <a href='https://github.com/ulfschneider/dynamic-header/blob/master/dynamic-header.min.js'>dynamic-header.min.js</a> into your html file. An example can be found in the <a href='https://github.com/ulfschneider/dynamic-header/blob/master/dynamic-header.html'>dynamic-header.html</a> file.

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
* <code>settings.delta</code> Number ? A user has to scroll up the given amount of pixels in order to activate the dynamic header behavior. Default is 5.
* <code>settings.fix</code> Boolean ? If true, the header will be fixed and not active. Default is false.
