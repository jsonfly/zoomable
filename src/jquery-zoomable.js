/**
 * Created by Gábor on 2014.11.29..
 */

$(function(){
    /**
     *
     * credits for this plugin go to brandonaaron.net
     *
     * unfortunately his site is down
     *
     * @param {Object} up
     * @param {Object} down
     * @param {Object} preventDefault
     */
    jQuery.fn.extend({
        mousewheel: function(up, down, preventDefault) {
            return this.hover(
                function() {
                    jQuery.event.mousewheel.giveFocus(this, up, down, preventDefault);
                },
                function() {
                    jQuery.event.mousewheel.removeFocus(this);
                }
            );
        },
        mousewheeldown: function(fn, preventDefault) {
            return this.mousewheel(function(){}, fn, preventDefault);
        },
        mousewheelup: function(fn, preventDefault) {
            return this.mousewheel(fn, function(){}, preventDefault);
        },
        unmousewheel: function() {
            return this.each(function() {
                jQuery(this).unmouseover().unmouseout();
                jQuery.event.mousewheel.removeFocus(this);
            });
        },
        unmousewheeldown: jQuery.fn.unmousewheel,
        unmousewheelup: jQuery.fn.unmousewheel
    });


    jQuery.event.mousewheel = {
        giveFocus: function(el, up, down, preventDefault) {
            if (el._handleMousewheel) jQuery(el).unmousewheel();

            if (preventDefault == window.undefined && down && down.constructor != Function) {
                preventDefault = down;
                down = null;
            }

            el._handleMousewheel = function(event) {
                if (!event) event = window.event;
                if (preventDefault)
                    if (event.preventDefault) event.preventDefault();
                    else event.returnValue = false;
                var delta = 0;
                if (event.wheelDelta) {
                    delta = event.wheelDelta/120;
                    if (window.opera) delta = -delta;
                } else if (event.detail) {
                    delta = -event.detail/3;
                }
                if (up && (delta > 0 || !down))
                    up.apply(el, [event, delta]);
                else if (down && delta < 0)
                    down.apply(el, [event, delta]);
            };

            if (window.addEventListener)
                window.addEventListener('DOMMouseScroll', el._handleMousewheel, false);
            window.onmousewheel = document.onmousewheel = el._handleMousewheel;
        },

        removeFocus: function(el) {
            if (!el._handleMousewheel) return;

            if (window.removeEventListener)
                window.removeEventListener('DOMMouseScroll', el._handleMousewheel, false);
            window.onmousewheel = document.onmousewheel = null;
            el._handleMousewheel = null;
        }
    };

    (function( $ ) {

        $.fn.zoomable = function() {
            var $imgs = $(this).not('.zoomable');
            $imgs.each(function (i, e) {
                var $img = $(e);

                $img.ready(function () {
                    var $canvas = $('<canvas></canvas>');
                    var $div = $('<div></div>');
                    $canvas.css('cursor', 'move');
                    $canvas.attr('width', Math.round($img.width()));
                    $canvas.attr('height', Math.round($img.height()));
                    $div.css('cursor', 'move');
                    $div.css('width', Math.round($img.width()) + 'px');
                    $div.css('height', Math.round($img.height()) + 'px');
                    $div.css('display', $img.css('display'));
                    $div.css('position', $img.css('position'));
                    $div.css('top', $img.css('top'));
                    $div.css('right', $img.css('right'));
                    $div.css('left', $img.css('left'));
                    $div.css('bottom', $img.css('bottom'));
                    $div.css('max-width', $img.css('max-width'));
                    $div.css('max-height', $img.css('max-height'));
                    $div.css('z-index', $img.css('z-index'));

                    $div.append($img.clone());
                    $div.append($canvas);
                    $img.replaceWith($div);

                    $img = $div.find('img');
                    $img.addClass('zoomable');
                    var img = $img[0];

                    var canvas = $canvas[0];
                    var context = canvas.getContext('2d');

                    var drag = {};
                    drag.drag = false;
                    drag.x = 0;
                    drag.y = 0;
                    var scrolled;
                    var zoom = 1;
                    var pontx, ponty;
                    var startx = 0;
                    var starty = 0;
                    var width = img.naturalWidth;
                    var height = img.naturalHeight;
                    var mouse_x = 0;
                    var mouse_y = 0;

                    var draw = function () {
                        canvas.width = canvas.width;
                        context.drawImage(img, Math.round(startx), Math.round(starty), Math.round(width), Math.round(height), 0, 0, canvas.width, canvas.height);
                    };

                    draw();
                    $img.hide();


                    var zoomIn = function(x, y, zoomBigness) {
                        if (zoom / zoomBigness > 25) {
                            zoomBigness = zoom / 25;
                            zoom = 25;
                        }
                        else {
                            zoom /= zoomBigness;
                        }
                        pontx = startx + x / canvas.width * width;
                        startx = pontx - x / canvas.width * width * zoomBigness;
                        width *= zoomBigness;

                        ponty = starty + y / canvas.height * height;
                        starty = ponty - y / canvas.height * height * zoomBigness;
                        height *= zoomBigness;

                        draw();
                    };

                    var zoomOut = function(x, y, zoomBigness) {
                        if (zoom * zoomBigness < 1) {
                            zoomBigness = 1 / zoom;
                            zoom = 1;
                        }
                        else {
                            zoom *= zoomBigness;
                        }

                        pontx = startx + x / canvas.width * width;
                        startx = pontx - x / canvas.width * width / zoomBigness;
                        width /= zoomBigness;
                        ponty = starty + y / canvas.height * height;
                        starty = ponty - y / canvas.height * height / zoomBigness;
                        height /= zoomBigness;
                        startx = (startx < 0) ? 0 : startx;
                        starty = (starty < 0) ? 0 : starty;
                        startx = ((startx + width) > img.naturalWidth) ? img.naturalWidth - width : startx;
                        starty = ((starty + height) > img.naturalHeight) ? img.naturalHeight - height : starty;
                        draw();
                    };

                    $canvas.on('mousedown', function (event) {
                        event = event || window.event;
                        mouse_x = event.pageX - canvas.offsetLeft;
                        mouse_y = event.pageY - canvas.offsetTop;

                        drag.drag = true;
                        drag.x = mouse_x;
                        drag.y = mouse_y;

                        event.preventDefault();
                    });

                    $canvas.on('mouseup', function (event) {
                        drag.drag = false;

                        event.preventDefault();
                        return false;
                    });

                    $canvas.on('click', function(event){
                       event.preventDefault();
                        return false;
                    });

                    $canvas.on('mouseout', function () {
                        drag.drag = false;
                    });

                    $canvas.on('mousemove', function (event) {

                        event = event || window.event;
                        var now_x = event.pageX - canvas.offsetLeft;
                        var now_y = event.pageY - canvas.offsetTop;

                        if (drag.drag) {
                            startx += -(now_x - drag.x) / canvas.width * width;
                            starty += -(now_y - drag.y) / canvas.height * height;
                            startx = ((startx + width) > img.naturalWidth) ? img.naturalWidth - width : startx;
                            starty = ((starty + height) > img.naturalHeight) ? img.naturalHeight - height : starty;
                            startx = (startx < 0) ? 0 : startx;
                            starty = (starty < 0) ? 0 : starty;
                            drag.x = now_x;
                            drag.y = now_y;
                            draw();
                        }
                    });

                    $canvas.mousewheel(function (event, intDelta) {
                        if (scrolled == true) {
                            scrolled = false;
                            event.preventDefault();
                            return false;
                        }

                        event = event || window.event;
                        var x = event.pageX - $(canvas).offset().left;
                        var y = event.pageY - $(canvas).offset().top;

                        if (intDelta > 0) {
                            zoomIn(x, y, 0.8);
                        }
                        else {
                            zoomOut(x, y, 0.8);
                        }

                        scrolled = true;
                        event.preventDefault();
                        return false;
                    });
                });
            });

            return this;
        };

    })( jQuery );
});