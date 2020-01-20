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
    var header, trim, timeoutId;
    var initialHeaderStyle;
    var pauseStart;
    var dynamic;
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
    function getScrollTop() {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }
    function getHeaderTop() {
        if (isDynamic()) {
            return getTrimTop();
        } else {
            return header.offsetTop;
        }
    }
    function getHeaderHeight() {
        return header.offsetHeight;
    }
    function getTrimTop() {
        return trim ? trim.offsetTop : 0;
    }
    function getHeaderBottom() {
        if (isDynamic()) {
            return getTrimTop() + getHeaderHeight();
        } else {
            return getHeaderTop() + getHeaderHeight();
        }
    }
    function isHeaderInvisible() {
        if (isDynamic()) {
            return getHeaderBottom() - header.style.top > 0;
        } else {
            return getHeaderBottom() > 0;
        }
    }
    function isHeaderDynamicHidden() {
        return isDynamic() && parseInt(header.style.top) < 0;
    }
    function controlDynamic() {
        if (!dynamic && getHeaderBottom() < getScrollTop()) {
            dynamic = true;
            if (isHeaderInvisible()) {
                header.style.visibility = 'none';
                hideHeader();
            }
            modifyHeaderStyle();            
            addClassToHeader('is-dynamic');
            header.style.visibility = 'unset';
        } else if (dynamic && getScrollTop() <= getHeaderTop()) {
            dynamic = false;
            removeClassFromHeader('is-dynamic');
            restoreHeaderStyle();
        }
        if (dynamic) {
            trimHeader();
        }
    }
    function isDynamic() {
        return dynamic;
    }

    function storeHeaderStyle() {
        initialHeaderStyle = {};
        initialHeaderStyle.transition = header.style.transition;
        initialHeaderStyle.position = header.style.position;
        initialHeaderStyle.left = header.style.left;
        initialHeaderStyle.top = header.style.top;
        initialHeaderStyle.right = header.style.right;
    }

    function restoreHeaderStyle() {
        removeTrim();
        if (header && initialHeaderStyle) {
            header.style.transition = initialHeaderStyle.transition;
            header.style.position = initialHeaderStyle.position;
            header.style.left = initialHeaderStyle.left;
            header.style.top = initialHeaderStyle.top;
            header.style.right = initialHeaderStyle.right;
        }

    }

    function modifyHeaderStyle() {
        header.style.transition = TRANSITION;
        header.style.position = 'fixed';
        header.style.left = '0';
        header.style.right = '0';
    }


    function selectHeader() {
        if (config.headerId) {
            header = document.getElementById(config.headerId);
        }

        if (!header) {
            var headers = document.getElementsByTagName('header');
            if (headers.length) {
                header = headers[0];
            }
            if (!header) {
                console.error('Header with either id=[' + config.headerId + '] or tag=<header> could not be found in DOM');
                return;
            }
        }

        storeHeaderStyle();
        return header;
    }

    function setHeaderTop(top) {
        header.style.top = top;
    }

    function trimHeader(trimHeight) {
        insertTrim();
        if (trim) {
            if (trimHeight) {
                trim.style.height = trimHeight;
            } else {
                if (isHeaderInvisible()) {
                    trim.style.height = getHeaderHeight() - 1 + 'px';
                }
            }
        }
    }

    function insertTrim() {
        if (header && !trim) {
            var parent = header.parentElement;
            trim = document.createElement("div");
            trim.id = 'dynamic-header-trim';
            parent.insertBefore(trim, header);
        }
    }

    function removeTrim() {
        if (trim) {
            trim.remove();
        }
        trim = null;
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

    function showHeader() {
        if (isHeaderDynamicHidden()) {
            var scrollTop = getScrollTop();
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
    }

    function hideHeader(distance) {
        if (!isHeaderDynamicHidden() || !isHeaderInvisible()) {
            var wasHidden = isHeaderDynamicHidden();

            var scrollTop = getScrollTop();
            lastScrollTop = scrollTop;
            var headerHeight = getHeaderHeight();
            if (scrollTop > headerHeight) {
                if (distance) {
                    setHeaderTop(-Math.abs(distance) + 'px');
                } else {
                    setHeaderTop(-headerHeight + 'px');
                }
                if (!wasHidden) {
                    callback();
                }
            }
        }
    }

    function startPause() {
        pauseStart = (new Date()).getTime();
    }

    function clearPause() {
        pauseStart = 0;
    }

    function isPaused() {
        var now = (new Date()).getTime();
        return (now - pauseStart <= config.pauseDuration);
    }

    function startTimedAction(action) {
        startPause();
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(action ? action : hideHeader, config.pauseDuration);
    }

    function moveHeader() {
        if (!config.fixed && !isPaused() && isDynamic()) {
            var scrollTop = getScrollTop();

            if (Math.abs(lastScrollTop - scrollTop) <= config.delta) {
                return;
            }

            if (scrollTop > lastScrollTop) {
                // if scrolling down AND scrolled past header height,
                // move the header out of the way
                hideHeader();
            } else {
                showHeader();
            }
            lastScrollTop = scrollTop;
        }
    }

    function onResize() {
        controlDynamic();
        if (isHeaderDynamicHidden()) {
            hideHeader();
        }
    }

    function onScroll() {
        controlDynamic();
        if (isDynamic()) {
            moveHeader();
        }
    }

    function onClick() {
        controlDynamic();
        if (config.hideOnClick && !config.fixed) {
            if (isDynamic()) {
                startTimedAction();
            }
        }
    }

    function onLoad() {
        selectHeader();
        controlDynamic();
        if (header) {
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
        restoreHeaderStyle();
        lastScrollTop = 0;
        header = null;
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
            *  @param {String} [settings.slideIn] - Provide a CSS class name to be applied to the header whenever the header is sliding into the page (which is the case when the user is scrolling up). The class will only be applied as long as the user is able to scroll up. Once the top of the page is reached, the class will be removed from the header. Default class name is <code>slide-in</code>. The header will have the CSS class <code>is-dynamic</code> when activated.
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