/* minifyOnSave, filenamePattern: ./$1.min.$2 */

/*
 * DynamicHeader
 *
 * @version 3-Jan-2020
 * @author Ulf Schneider
 * @link https://github.com/ulfschneider/dynamic-header
 * @license MIT
 */
DynamicHeader = (function() {
    //state
    var self = this;
    var scrolled, lastScrollTop;
    var header, content, trim;
    var initialHeaderStyle;
    var pauseMove = false;
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
        if (config.headerId) {
            header = document.getElementById(config.headerId);
        }

        if (!header) {
            header = document.getElementsByTagName('header')[0]
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
        callback();
    }

    function showHeader() {
        setHeaderTop(0);
        trimContent();
    }

    function hideHeader() {
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        var headerHeight = getHeaderHeight();
        console.log(scrollTop);
        if (scrollTop > headerHeight) {
            setHeaderTop(-headerHeight + 'px');
            callback();
        }
    }

    function moveHeader() {
        if (!self.config.fixed && !pauseMove) {
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            if (Math.abs(lastScrollTop - scrollTop) <= self.config.delta) return;

            if (scrollTop > lastScrollTop) {
                // if current position > last position AND scrolled past header height,
                // move the header out of the way
                hideHeader();
            } else {
                if (scrollTop + windowHeight() < documentHeight()) {
                    setHeaderTop(0);

                    if (self.config.slideIn) {
                        if (scrollTop >= getHeaderHeight()) {
                            addClassToHeader(self.config.slideIn);
                        } else {
                            removeClassFromHeader(self.config.slideIn);
                        }
                    }
                    callback();
                }
            }
            lastScrollTop = scrollTop;
        }
    }

    function onResize() {
        showHeader();
    }

    function onScroll() {
        scrolled = true;
    }

    function onClick() {
        if (self.config.hideonClick) {
            pauseMove = true;
            hideHeader();
            setTimeout(function() {
                pauseMove = false;
            }, self.config.pauseMoveDuration);
        }
    }

    function callback() {
        if (self.config.callback) {
            self.config.callback(header);
        }
    }

    function cleanUp() {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('load', onLoad);
        if (header) {
            header.removeEventListener('click', onClick);
        }
        transferConfig(); //reset config
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
            self.config = config;
        } else {
            self.config = {};
        }
        self.config.fixed = self.config.fix || self.config.fixed;
        if (typeof self.config.headerId == 'undefined') {
            self.config.headerId = 'header';
        }
        if (typeof self.config.delta == 'undefined') {
            self.config.delta = 5;
        }
        if (typeof self.config.hideonClick == 'undefined') {
            self.config.hideonClick = true;
        }
        if (typeof self.config.pauseMoveDuration == 'undefined') {
            self.config.pauseMoveDuration = 1000;
        }
        if (typeof self.config.slideIn == 'undefined') {
            self.config.slideIn = 'slide-in';
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
        /*  Without any arguments, DynamicHeader.init() will search for a container
         *  with id="header" or a tag <header> and will make that container the dynamic header.
         *
         *  Alternative usage:
         *  @function DynamicHeader.init(config);
         *  @param {String} config.headerId - Specify the id of the container you want to make the dynamic header. Default is 'header'.
         *  @param {Number} config.delta -  The number of pixels a user need to scroll at least in order to make DynamicHeader react on the scrolling. Default is 5.
         *
         */
        init: function(config) {
            cleanUp();
            transferConfig(config);
            if (document.readyState == 'complete') {
                onLoad();
            } else {
                window.addEventListener('load', onLoad);
            }
        },
        /*  @function DynamicHeader.destroy();
         *  Revert all changes that have been made by DynamicHeader.init();
         */
        destroy: function() {
            cleanUp();
        }
    }
})();

//////// Node Module Interface


try {
    if (module) {
        module.exports = {
            init: function(settings) {
                if (!this.dheader) {
                    this.dheader = DynamicHeader;
                }
                this.dheader.init(settings);
            },
            destroy: function() {
                if (this.dheader) {
                    this.dheader.destroy();
                }
            }
        }
    }
} catch (e) {
    //in non-node environment module is not defined and therefore
    //we will not export anything
}