# DynamicHeader

Make the header of your web pages dynamic.

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
</prex>

## Plain old Web Page

In case you don´t have a Node project and simply want to use the dynamic header in your plain old web page, you have to import javascript library <code><a href='https://github.com/ulfschneider/dynamic-header/blob/master/dynamic-header.min.js'>dynamic-header.min.js</a></code> via <code><script src="dynamic-header.min.js"></script></code> into your html file. An example can be found in the <code><a href='https://github.com/ulfschneider/dynamic-header/blob/master/dynamic-header.html'>dynamic-header.html</a></code> file.

## Usage

Use you made the module/library available, you can use the dynamic header as follows:

<pre>
DynamicHeader.init(settings);
<pre>
