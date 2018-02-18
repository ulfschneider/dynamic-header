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
    var colorThiefLib;
    var colorThief;
    var color;
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
        header = document.getElementById(self.config.headerId);
        if (!header) {
            console.error('Header with id=[' + self.config.headerId + '] could not be found in DOM');
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

        if (Math.abs(lastScrollTop - scrollTop) <= self.config.delta) return;

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
            if (config.pickColorFromImgId) {
                self.config.pickColorFromImgId = config.pickColorFromImgId;
                loadColorThiefLib();
            }
            if (config.lightColor) {
                self.config.lightColor = config.lightColor;
            }
            if (config.darkColor) {
                self.config.darkColor = config.darkColor;
            }
            if (config.opacity) {
                self.config.opacity = config.opacity;
            }
            if (config.delta) {
                self.config.delta = config.delta;
            }
        }
    }

    function getBrightness() {
        //http://www.w3.org/TR/AERT#color-contrast
        return (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;
    }

    function isDark() {
        return getBrightness() < 128;
    }

    function isLight() {
        return isDark();
    }

    function stealColor() {
        if (self.config.pickColorFromImgId) {
            var img = document.getElementById(self.config.pickColorFromImgId);
            if (!img) {
                console.error('Image with id=[' + self.config.pickColorFromImgId + '] could not be found in DOM');
            } else if (img.src) {
                var image = new Image();
                image.src = img.src;
                image.onload = function() {
                    color = colorThief.getColor(image);
                    header.style.background = 'rgb(' + color.join(',') + ')';
                    if (isDark() && self.config.lightColor) {
                        header.style.color = self.config.lightColor;
                        console.log(header.style.color);
                    } else if (isLight() && self.config.darkColor) {
                        header.style.color = self.config.darkColor;
                        console.log(header.style.color);
                    }
                    if (self.config.opacity) {
                        header.style.background = 'rgb(' + color.join(',') + ',' + self.config.opacity + ')';
                    }
                }
            }
        }
    }

    function makeColorThiefInstance() {
        colorThief = new ColorThief();
    }

    function loadColorThiefLib() {
        if (!colorThief) {
            colorThiefLib = document.createElement('script');
            colorThiefLib.type = 'text/javascript';
            colorThiefLib.src = 'color-thief.min.js';
            colorThiefLib.onload = makeColorThiefInstance;
            document.getElementsByTagName('head')[0].appendChild(colorThiefLib);
        }
    }

    function onload() {
        selectHeader();
        stealColor();

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
        /*  Without any arguments, DynamicHeader.init() will search for a container
         *  with id="header" and will make that container the dynamic header.
         *
         *  Alternative usage:
         *  @function DynamicHeader.init(config);
         *  @param {String} config.headerId - Specify the id of the container you want to make the dynamic header. Default is 'header'.
         *  @param {Number} config.delta -  The number of pixels a user need to scroll at least in order to make DynamicHeader react on the scrolling. Default is 5.
         * @param {String} config.pickColorFromImgId - Specify the id of an image from which the dominant color will be extracted and being used as the background color for the header. Default is none. In order to get this working, color-thief.min.js must be placed in the same directory like dyntamic-header.js
         * @param {String} config.darkColor - The color to use for text inside of a light header. Typically to be used in combination with pickColorFrom ImgId.
         * @param {String} config.lightColor - The color to use for text inside of a dark header. Typically to be used in combination with pickColorFrom ImgId.
         * @param {Number} config.opacity - Specify the opacity of the header background with a number from 0 to 1. Default is 1.
         * @param {Boolean} config.overlay - Specify if the header should be layed over the content without adding additional vertical space for the header at the top of the page. Default is false.
         *
         */
        init: function(config) {
            cleanUp();
            transferConfig(config);
            window.addEventListener('load', onload);
        },
        /*  @function DynamicHeader.destroy();
         *  Revert all changes that have been made by DynamicHeader.init();
         */
        destroy: function() {
            cleanUp();
        }
    }
})();