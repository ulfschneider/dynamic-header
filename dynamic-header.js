/* minifyOnSave, filenamePattern: ./$1.min.$2 */


/*
 * DynamicHeader
 *
 * @version 1.0 17-Feb-2018
 * @author Ulf Schneider
 * @link https://github.com/ulfschneider/dynamic-header
 * @license MIT
 */
var DynamicHeader = (function() {
    //state
    var self = this;
    var scrolled, lastScrollTop;
    var header, content, trim;
    var initialHeaderStyle;
    var TRANSITION = 'top 0.2s ease-in-out';

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
        return header.clientHeight;
    }

    function isHeaderHidden() {
        var top = parseInt(header.style.top);
        return top < 0;
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
        header = document.getElementById(config.headerId);
        if (!header) {
            console.error('Header with id=[' + config.headerId + '] could not be found in DOM');
        } else {
            modifyHeaderStyle();
        }
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
            setContentTrim(headerHeight + 'px');
        }
    }

    function insertTrim() {
        //it´s more unobtrusive to insert a trim div with a specific height
        //before the content instead of setting a top-margin for the
        //content

        if (!self.config.overlay && header && content && !trim) {
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

    function trimHeader() {
        if (header) {
            if (isHeaderHidden()) {
                var headerHeight = getHeaderHeight();
                //move the header out of the way, even if resizing the window
                //leads to different height of header
                setHeaderTop(-2 * headerHeight + 'px');
            }
        }
    }

    function moveHeader() {
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        if (Math.abs(lastScrollTop - scrollTop) <= config.delta) return;

        var headerHeight = getHeaderHeight();
        if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
            // if current position > last position AND scrolled past header height,
            // move the header out of the way
            setHeaderTop(-headerHeight + 'px');
        } else {
            if (scrollTop + windowHeight() < documentHeight()) {
                setHeaderTop(0);
            }
        }
        lastScrollTop = scrollTop;
    }

    function onresize() {
        trimHeader();
        trimContent();
    }

    function onscroll() {
        scrolled = true;
    }

    function cleanUp() {
        self.config = {
            delta: 5,
            headerId: 'header',
        }
        lastScrollTop = 0;
        scrolled = false;
        revertHeaderStyle();
        if (trim) {
            trim.remove();
        }
        trim = null;
        header = null;
        content = null;
    }

    function transferConfig(config) {
        if (config) {
            if (config.headerId) {
                self.config.headerId = config.headerId;
            }
            if (config.overlay) {
                self.config.overlay = config.overlay;
            }
            if (config.delta) {
                self.config.delta = config.delta;
            }
        }
    }

    function onload() {
        selectHeader();

        if (header) {
            selectContent();
            insertTrim();
            window.addEventListener('resize', onresize);
            window.addEventListener('scroll', onscroll);
            setInterval(function() {
                if (scrolled) {
                    scrolled = false;
                    moveHeader();
                }
            }, 250);
        }
    }

    //public API
    return {

        init: function(config) {
            cleanUp();
            transferConfig(config);
            window.addEventListener('load', onload);
        },
        destroy: function() {
            cleanUp();
        }
    }
})();