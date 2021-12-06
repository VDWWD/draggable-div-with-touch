(function ($) {

    //VDWWD: declare some extra variables
    var margin = 10;
    var extra_margin_right = 0;
    var extra_margin_bottom = 0;
    var z_index = 100;

    //VDWWD: extra margin right when there is a vertical scrollbar
    if (document.body.scrollHeight > window.innerHeight) {
        extra_margin_right = 20;
    }

    //VDWWD: extra margin bottom when there is a horizontal scrollbar
    if (document.body.scrollWidth > window.innerWidth) {
        extra_margin_bottom = 20;
    }

    $.fn.draggableTouch = function (action) {
        // check if the device has touch support, and if not, fallback to use mouse
        // draggableMouse which uses mouse events
        if (!("ontouchstart" in document.documentElement)) {
            return this.draggableMouse(action);
        }

        // check if we shall make it not draggable
        if (action == "disable") {
            this.unbind("touchstart.draggableTouch");
            this.unbind("touchmove.draggableTouch");
            this.unbind("touchend.draggableTouch");
            this.unbind("touchcancel.draggableTouch");

            this.trigger("dragdisabled");

            return this;
        }

        this.each(function () {
            var $element = $(this);
            var offset = null;
            var draggingTouchId = null;

            var end = function (e) {
                //VDWWD: turned off preventDefault otherwise input elements in the div won't work
                //e.preventDefault();

                var orig = e.originalEvent;
                for (var i = 0; i < orig.changedTouches.length; i++) {
                    var touch = orig.changedTouches[i];
                    // the only touchend/touchcancel event we care about is the touch
                    // that started the dragging
                    if (touch.identifier != draggingTouchId) {
                        continue;
                    }

                    $element.trigger("dragend", {
                        top: orig.changedTouches[0].pageY - offset.y,
                        left: orig.changedTouches[0].pageX - offset.x
                    });

                    draggingTouchId = null;
                }
            };

            $element.bind("touchstart.draggableTouch", function (e) {
                var orig = e.originalEvent;
                // if this element is already being dragged, we can exit early, otherwise
                // we need to store which touch started dragging the element
                if (draggingTouchId) {
                    return;
                }

                draggingTouchId = orig.changedTouches[0].identifier;
                var pos = $(this).position();

                //VDWWD: move div to top with z-index
                z_index++;
                $element.css('z-index', z_index);

                offset = {
                    x: orig.changedTouches[0].pageX - pos.left,
                    y: orig.changedTouches[0].pageY - pos.top
                };

                $element.trigger("dragstart", pos);
            });

            $element.bind("touchmove.draggableTouch", function (e) {
                e.preventDefault();
                var orig = e.originalEvent;

                for (var i = 0; i < orig.changedTouches.length; i++) {
                    var touch = orig.changedTouches[i];
                    // the only touchend/touchcancel event we care about is the touch
                    // that started the dragging
                    if (touch.identifier != draggingTouchId) {
                        continue;
                    }

                    //$(this).css({
                    //    top: touch.pageY - offset.y,
                    //    left: touch.pageX - offset.x
                    //});

                    //VDWWD: use the setCss function
                    setCss($element, touch.pageY - offset.y, touch.pageX - offset.x);
                }
            });

            $element.bind("touchend.draggableTouch touchcancel.draggableTouch", end);
        });

        return this;
    };


    /**
     * Draggable fallback for when touch is not available
     */
    $.fn.draggableMouse = function (action) {
        // check if we shall make it not draggable
        if (action == "disable") {
            this.unbind("mousedown.draggableTouch");
            this.unbind("mouseup.draggableTouch");
            $(document).unbind("mousemove.draggableTouch");

            this.trigger("dragdisabled");

            return this;
        }

        this.each(function () {
            var $element = $(this);
            var offset = null;

            var move = function (e) {
                //$element.css({
                //    top: e.pageY - offset.y,
                //    left: e.pageX - offset.x,
                //});

                //VDWWD: use the setCss function
                setCss($element, e.pageY - offset.y, e.pageX - offset.x);
            };

            var up = function (e) {
                $element.unbind("mouseup.draggableTouch", up);
                $(document).unbind("mousemove.draggableTouch", move);

                $element.trigger("dragend", {
                    top: e.pageY - offset.y,
                    left: e.pageX - offset.x
                });
            };

            $element.bind("mousedown.draggableTouch", function (e) {
                var pos = $element.position();

                offset = {
                    x: e.pageX - pos.left,
                    y: e.pageY - pos.top
                };

                $(document).bind("mousemove.draggableTouch", move);
                $element.bind("mouseup.draggableTouch", up);
                $element.trigger("dragstart", pos);

                //VDWWD: move div to top with z-index
                z_index++;
                $element.css('z-index', z_index);

                //VDWWD: turned off preventDefault otherwise input elements in the div won't work
                //e.preventDefault();
            });
        });

        return this;
    };


    //VDWWD: separate function to keep the element withing the viewport and apply the corrected css
    function setCss($element, top, left) {
        //check if the element does not exceed the viewport at the top of bottom
        if (top < margin) {
            top = margin;
        } else if (top + $element.height() + margin + extra_margin_bottom > window.innerHeight) {
            top = window.innerHeight - margin - $element.height() - extra_margin_bottom;
        }

        //check if the element does not exceed the viewport at the left of right
        if (left < margin) {
            left = margin;
        } else if (left + $element.width() + margin + extra_margin_right > window.innerWidth) {
            left = window.innerWidth - margin - $element.width() - extra_margin_right;
        }

        //apply the position
        $element.css({
            top: top,
            left: left,
        });
    }
})(jQuery);
