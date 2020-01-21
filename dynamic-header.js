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
    var TRIM_ID = 'dynamic-header-trim';

    function getScrollTop() {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }
    function getHeaderOffsetTop() {
        if (isDynamic()) {
            return getTrimOffsetTop();
        } else {
            return header.offsetTop;
        }
    }
    function setHeaderTop(top) {
        header.style.top = top;
    }
    function hasHeaderTop() {
        return header.style.top;
    }
    function getHeaderTop() {
        return parseInt(header.style.top);
    }
    function getHeaderHeight() {
        return header.offsetHeight;
    }
    function getTrimOffsetTop() {
        return trim ? trim.offsetTop : 0;
    }
    function getHeaderOffsetBottom() {
        if (isDynamic()) {
            return getTrimOffsetTop() + getHeaderHeight();
        } else {
            return getHeaderOffsetTop() + getHeaderHeight();
        }
    }
    function isHeaderInvisible() {
        if (isDynamic()) {
            return hasHeaderTop() && (getHeaderTop() + getHeaderHeight() <= 0);
        } else {
            return getHeaderOffsetBottom() < getScrollTop();
        }
    }
    function isHeaderDynamicHidden() {
        return isDynamic() && getHeaderTop() < 0;
    }
    function controlDynamic() {
        if (!dynamic && config.fixed && getHeaderOffsetTop() <= getScrollTop()) {
            modifyHeaderStyle();            
            setHeaderTop(0);
            dynamic = true; //last thing to do in this block
        } else  if (!dynamic && getHeaderOffsetBottom() < getScrollTop()) {
            if (isHeaderInvisible()) {
                setHeaderTop(- getHeaderHeight());
            }
            modifyHeaderStyle();            
            dynamic = true; //last thing to do in this block
        } else if (dynamic && getScrollTop() <= getHeaderOffsetTop()) {
            restoreHeaderStyle();
            dynamic = false; //last thing to do in this block
        }
    }
    function isDynamic() {
        return dynamic;
    }

    function storeHeaderStyle() {
        if (header) {
            initialHeaderStyle = {};
            initialHeaderStyle.transition = header.style.transition;
            initialHeaderStyle.position = header.style.position;
            initialHeaderStyle.left = header.style.left;
            initialHeaderStyle.top = header.style.top;
            initialHeaderStyle.right = header.style.right;
        }
    }

    function restoreHeaderStyle() {

        if (header && initialHeaderStyle) {
            removeClassFromHeader('is-dynamic');
            header.style.transition = initialHeaderStyle.transition;
            header.style.position = initialHeaderStyle.position;
            header.style.left = initialHeaderStyle.left;
            header.style.top = initialHeaderStyle.top;
            header.style.right = initialHeaderStyle.right;
        }
        removeTrim();
    }

    function modifyHeaderStyle() {
        if (header) {
            trimHeader();
            header.style.transition = TRANSITION;
            header.style.position = 'fixed';
            header.style.left = '0';
            header.style.right = '0';
            addClassToHeader('is-dynamic');
        }
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

    function trimHeader(trimHeight) {
        insertTrim();
        if (trim) {
            if (trimHeight) {
                trim.style.height = trimHeight;
            } else {
                trim.style.height = getHeaderHeight() + 'px';
            }
        }
    }

    function insertTrim() {
        if (header && !trim) {
            trim = document.getElementById(TRIM_ID);
            if (!trim) {
                var parent = header.parentElement;
                trim = document.createElement("div");
            }
            trim.id = TRIM_ID;
            parent.insertBefore(trim, header);
        }
        return trim;
    }

    function removeTrim() {
        if (trim) {
            trim.remove();
        }
        trim = null;
    }

    function addClassToHeader(cssClass) {
        if (cssClass) {
            header.classList.add(cssClass);
        }
    }

    function removeClassFromHeader(cssClass) {
        if (cssClass) {
            header.classList.remove(cssClass);
        }
    }

    function showHeader() {
        if (isHeaderDynamicHidden()) {
            setHeaderTop(0);
            addClassToHeader(config.slideIn);
            callback();
        }
    }

    function hideHeader(distance) {
        var wasHidden = isHeaderDynamicHidden();
        if (!wasHidden || !isHeaderInvisible()) {
            var headerHeight = getHeaderHeight();
            if (distance) {
                setHeaderTop(-Math.abs(distance) + 'px');
            } else {
                setHeaderTop(-headerHeight + 'px');
            }
            if (!wasHidden) {
                removeClassFromHeader(config.slideIn);
                callback();
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
                // if scrolling down 
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
            trimHeader();
            hideHeader();
        }
    }

    function onScroll() {
        controlDynamic();
        moveHeader();
    }

    function onClick() {
        controlDynamic();
        if (config.hideOnClick && !config.fixed && isDynamic()) {
            startTimedAction();
        }
    }

    function onLoad() {
        selectHeader();
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