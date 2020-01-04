<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [DynamicHeader][1]
-   [init][2]
    -   [Parameters][3]
-   [destroy][4]

## DynamicHeader

DynamicHeader

A dynamic header for web pages.

<img src="https://raw.githubusercontent.com/ulfschneider/dynamic-header/master/dynamic-header.gif"/>

Install it in your Node project with 

<pre>
npm i dheader
</pre>

and use it inside your code via 

<pre>
const dheader = require('dheader');
</pre>

or, alternatively 

<pre>
import dheader from 'dheader';
</pre>

You can also use it without node, by embedding the script <code>dynamic-header.min.js</code> in your web page.

<pre>
<script src="dynamic-header.min.js"></script>

</pre>

Please review [https://raw.githubusercontent.com/ulfschneider/dynamic-header/master/dynamic-header.html][5] to see the usage.
 Without any arguments, <code>DynamicHeader.init()</code> will search for a container
 with <code>id="header"<code> or a tag <code>header</code> and will make that container the dynamic header.

## init

### Parameters

-   `settings` **any?** 
    -   `settings.headerId` **[String][6]?** Specify the id of the container you want to make the dynamic header. Default is 'header'. If not specified will search for the html <code>header</code> tag.
    -   `settings.delta` **[Number][7]?**  The number of pixels a user need to scroll at least in order to make DynamicHeader react on scrolling. Default is 5.
    -   `settings.fixed` **[Boolean][8]?** If set to true, the header will never slide out of the way. Default is false.
    -   `settings.hideOnClick` **[Boolean][8]?** If set to true, the header will slide out of the way when a click occurred inside the header. Default is true. Will be ignored when config.fixed is true.
    -   `settings.pauseMoveDuration` **[Number][7]?** When the header is hidden away after a click, the sliding mechanism is paused for a duration of 1000 milliseconds to avoid interference with scrolling. Change the default here in terms of milliseconds.
    -   `settings.slideIn` **[String][6]?** Provide a CSS class name to be applied to the header whenever the header is sliding into the page (which is the case when the user is scrolling up). The class will only be applied as long as the user is able to scroll up. Once the top of the page is reached, the class will be removed from the header. Default class name is 'slide-in'.
    -   `settings.callback` **[Object][9]?** A callback function to be called whenever the header changes. The header is given as an argument into the callback.

## destroy

Revert all changes that have been made by DynamicHeader.init();

[1]: #dynamicheader

[2]: #init

[3]: #parameters

[4]: #destroy

[5]: https://raw.githubusercontent.com/ulfschneider/dynamic-header/master/dynamic-header.html

[6]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[7]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[8]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[9]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object
