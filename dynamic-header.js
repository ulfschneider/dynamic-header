/**
 * DynamicHeader
 *
 * A dynamic header for web pages.
 * 
 * Please review the [DynamicHeader Playground](https://htmlpreview.github.io/?https://github.com/ulfschneider/dynamic-header/blob/master/dynamic-header.html) to see the usage.
 * 
 * Install DynamicHeader in your Node project with 
 * <pre>
 * npm i dheader
 * </pre>
 * 
 * and use it inside your code via 
 * 
 * <pre>
 * const DynamicHeader = require('dheader');
 * </pre>
 * 
 * or, alternatively 
 * 
 * <pre>
 * import DynamicHeader from 'dheader';
 * </pre>
 * 
 * You can also use it without node, by embedding the script <code>dynamic-header.min.js</code> in your web page.
 * 
 * <pre>
 * &lt;script src="dynamic-header.min.js">&lt;/script>
 * </pre> 
 *  Without any arguments, <code>DynamicHeader.init()</code> will search for a container
 *  with <code>id="header"</code> or a tag <code>header</code> and will make that container the dynamic header.
 */
DynamicHeader = (function () {
    //state
    var config;
    var lastScrollTop;
    var header, content, trim;
    var initialHeaderStyle;
    var pauseStart;
    var TRANSITION = '0.2s ease-in-out';

    function windowHeight() {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }

    function documentHeight() {
        return Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
    }

    function getHeaderHeight() {
        return header.offsetHeight;
    }

    function isHeaderHidden() {
        var top = parseInt(header.style.top);
        return top < 0 && top + getHeaderHeight() <= 0; //check that header is really completely hidden
    }

    function isHeaderVisible() {
        return !isHeaderHidden();
    }

    function modifyHeaderStyle() {
        //save header style for later clean up
        initialHeaderStyle = {};
        initialHeaderStyle.transition = header.style.transition;
        initialHeaderStyle.position = header.style.position;
        initialHeaderStyle.left = header.style.left;
        initialHeaderStyle.top = header.style.top;
        initialHeaderStyle.right = header.style.right;

        //modify header style
        header.style.transition = TRANSITION;
        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.left = '0';
        header.style.right = '0';
    }

    function revertHeaderStyle() {
        //clean up any settings that have been made by DynamicHeader
        if (header && initialHeaderStyle) {
            header.style.transition = initialHeaderStyle.transition;
            header.style.position = initialHeaderStyle.position;
            header.style.left = initialHeaderStyle.left;
            header.style.top = initialHeaderStyle.top;
            header.style.right = initialHeaderStyle.right;
        }
    }

    function selectHeader() {
        if (config.headerId) {
            header = document.getElementById(config.headerId);
        }

        if (!header) {
            let headers = document.getElementsByTagName('header');
            if (headers.length) {
                header = headers[0];
            }
            if (!header) {
                console.error('Header with either id=[' + config.headerId + '] or tag=<header> could not be found in DOM');
                return;
            }
        }

        modifyHeaderStyle();
        return header;
    }

    function selectContent() {
        content = document.body.firstElementChild;
    }

    function setContentTrim(margin) {
        trim.style.height = margin;
    }

    function setHeaderTop(top) {
        header.style.top = top;
    }

    function trimContent() {
        if (trim) {
            var headerHeight = getHeaderHeight();
            setContentTrim(headerHeight - 1 + 'px');
        }
    }

    function addClassToHeader(cssClass) {
        var classes = header.className.split(' ');
        if (classes.indexOf(cssClass) == -1) {
            if (header.className.length) {
                header.className += ' ';
            }
            header.className += cssClass;
        }
    }

    function removeClassFromHeader(cssClass) {
        header.className = header.className.replace(new RegExp(cssClass, 'g'), '');
    }

    function insertTrim() {
        //it´s more unobtrusive to insert a trim div with a specific height
        //before the content instead of setting a top-margin for the
        //content

        if (!config.overlay && header && content && !trim) {
            var parent = content.parentElement;
            trim = document.createElement("div");
            trim.id = 'dynamicHeaderTrim';
            parent.insertBefore(trim, content);
            trimContent();
        } else {
            if (trim) {
                trim.remove();
            }
            trim = null;
        }
    }

    function showHeader() {
        trimContent();
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        if (scrollTop + windowHeight() < documentHeight()) {
            setHeaderTop(0);
            if (config.slideIn) {
                if (scrollTop >= getHeaderHeight()) {
                    addClassToHeader(config.slideIn);
                } else {
                    removeClassFromHeader(config.slideIn);
                }
            }
            callback();
        }

    }

    function hideHeader() {
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        var headerHeight = getHeaderHeight();
        if (scrollTop > headerHeight) {
            setHeaderTop(-2 * headerHeight + 'px');
            callback();
        }
    }

    function startPause() {
        pauseStart = (new Date()).getTime();
    }

    function clearPause() {
        pauseStart = 0;
    }

    function isPaused() {
        let now = (new Date()).getTime();
        return (now - pauseStart <= config.pauseDuration);
    }

    function moveHeader() {
        if (!config.fixed && !isPaused()) {
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            if (Math.abs(lastScrollTop - scrollTop) <= config.delta) return;

            if (scrollTop > lastScrollTop) {
                // if current position > last position AND scrolled past header height,
                // move the header out of the way
                hideHeader();
            } else {
                showHeader();
            }
            lastScrollTop = scrollTop;
        }
    }

    function onResize() {
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        if (scrollTop <= getHeaderHeight()) {
            showHeader();
        } else {
            var top = parseInt(header.style.top);
            if (top < 0) {
                //ensure the header is completely hidden
                //top < 0 indicates the header should be hidden
                //but due to resizing it might not be
                //completely hidden
                hideHeader();
            }
        }
    }

    function onScroll() {
        moveHeader();
    }

    function onClick() {
        if (config.hideOnClick && !config.fixed) {
            startPause();
            setTimeout(hideHeader, config.pauseDuration);
        }
    }

    function onLoad() {
        selectHeader();

        if (header) {
            selectContent();
            insertTrim();
            window.addEventListener('resize', onResize);
            window.addEventListener('scroll', onScroll);
            header.addEventListener('click', onClick);
        }
    }

    function callback() {
        if (config.callback) {
            config.callback(header);
        }
    }

    function cleanUp() {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('load', onLoad);
        if (header) {
            header.removeEventListener('click', onClick);
        }
        clearPause();
        transferConfig(); //reset config
        lastScrollTop = 0;
        scrolled = 0;
        revertHeaderStyle();
        if (trim) {
            trim.remove();
        }
        trim = null;
        header = null;
        content = null;
    }

    function transferConfig(settings) {
        if (settings) {
            config = settings;
        } else {
            config = {};
        }
        config.fixed = config.fix || config.fixed;
        config.pauseDuration = config.pauseDuration || config.pauseMoveDuration;

        if (typeof config.headerId == 'undefined') {
            config.headerId = 'header';
        }
        if (typeof config.delta == 'undefined') {
            config.delta = 25;
        }
        if (typeof config.hideOnClick == 'undefined') {
            config.hideOnClick = true;
        }
        if (typeof config.pauseDuration == 'undefined') {
            config.pauseDuration = 250;
        }
        if (typeof config.slideIn == 'undefined') {
            config.slideIn = 'slide-in';
        }
    }

    //public API
    return {
        init: function (settings) {
            cleanUp();
            transferConfig(settings);
            if (document.readyState == 'complete') {
                onLoad();
            } else {
                window.addEventListener('load', onLoad);
            }
        },
        destroy: function () {
            cleanUp();
        }
    }
})();

//////// Node Module Interface

try {
    if (module) {
        module.exports = {
            /**
             * @param {*} [settings]
             * @param {String} [settings.headerId] - Specify the id of the container you want to make the dynamic header. Default is 'header'. If not specified will search for the html <code>header</code> tag.
            *  @param {Number} [settings.delta] -  The number of pixels a user need to scroll at least in order to make DynamicHeader react on scrolling. Default is 25.
            *  @param {Boolean} [settings.fixed] - If set to true, the header will never slide out of the way. Default is false.
            *  @param {Boolean} [settings.hideOnClick] - If set to true, the header will slide out of the way when a click occurred inside the header. Default is true. Will be ignored when config.fixed is true.
            *  @param {Number} [settings.pauseDuration] - When the header is hidden away after a click, the sliding mechanism is paused for a duration of 250 milliseconds to avoid interference with scrolling. Change the default here in terms of milliseconds.
            *  @param {String} [settings.slideIn] - Provide a CSS class name to be applied to the header whenever the header is sliding into the page (which is the case when the user is scrolling up). The class will only be applied as long as the user is able to scroll up. Once the top of the page is reached, the class will be removed from the header. Default class name is <code>'slide-in'</code>.
            *  @param {Object} [settings.callback] - A callback function to be called whenever the header changes. The header is given as an argument into the callback.
             */
            init: function (settings) {
                if (!this.dheader) {
                    this.dheader = DynamicHeader;
                }
                this.dheader.init(settings);
            },
            /**
             * Revert all changes that have been made by DynamicHeader;
             */
            destroy: function () {
                if (this.dheader) {
                    this.dheader.destroy();
                }
            }
        }
    }
} catch (e) {
    console.log('Using DynamicHeader in non-node environment');
    //in non-node environment module is not defined and therefore
    //we will not export anything
}