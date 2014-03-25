/*************************************************!
*
*   project:    liteAccordion - a horizontal accordion plugin for jQuery
*   author:     Nicola Hibbert
*   url:        http://nicolahibbert.com/liteaccordion-v2/
*   demo:       http://www.nicolahibbert.com/demo/liteAccordion/
*
*   Version:    2.2.0
*   Copyright:  (c) 2010-2013 Nicola Hibbert
*   Licence:    MIT
*
**************************************************/

;(function($) {

    var LiteAccordion = function(elem, options) {

        var defaults = {
            containerWidth : 960,                   // fixed (px)
            containerHeight : 320,                  // fixed (px)
            headerWidth : 48,                       // fixed (px)

            // click or mouseover
            firstSlide : 1,                         // displays slide (n) on page load
            slideSpeed : 800,                       // slide animation speed
            onTriggerSlide : function(e) {},        // callback on slide activate
            onSlideAnimComplete : function() {},    // callback on slide anim complete

            easing : 'swing',                       // custom easing function

            innerPaddingLeft : 15,
            innerPaddingRight : 20,
        },

        // merge defaults with options in new settings object
        settings = $.extend({}, defaults, options),

        // 'globals'
        slides = elem.children('ol').children('li'),
        header = slides.children(':first-child'),
        slideLen = slides.length,
        slideWidth = settings.containerWidth - slideLen * settings.headerWidth,

        // public methods
        methods = {
            // jump to slide number
            goto : function(index) {
                header.eq(index).trigger('click.liteAccordion');
            },

            // trigger next slide
            next : function() {
                header.eq(core.currentSlide === slideLen - 1 ? 0 : core.currentSlide + 1).trigger('click.liteAccordion');
            },

            // trigger previous slide
            prev : function() {
                header.eq(core.currentSlide - 1).trigger('click.liteAccordion');
            },
			
			// return current slide
			current : function() {
				return core.currentSlide;
			},
        },

        core = {
            // set style properties
            setStyles : function() {
                // set container height and width
                elem
                    .width(settings.containerWidth)
                    .height(settings.containerHeight)
                    .addClass('liteAccordion');

                // set slide heights
                slides
                    .addClass('slide')
                    .children(':first-child')
                    .height(settings.headerWidth);

                // set slide positions
                core.setSlidePositions();
            },

            // set initial positions for each slide
            setSlidePositions : function() {
                var selected = header.filter('.selected');

                // account for already selected slide
                if (!selected.length)
                    header.eq(settings.firstSlide - 1).addClass('selected');

                header.each(function(index) {
                    var $this = $(this),
                        left = index * settings.headerWidth,
                        margin = header.first().next(),
                        offset = parseInt(margin.css('marginLeft'), 10) || parseInt(margin.css('marginRight'), 10) || 0;

                    // compensate for already selected slide on resize
                    if (selected.length) {
                        if (index > header.index(selected))
                            left += slideWidth;
                    } else {
                        if (index >= settings.firstSlide)
                            left += slideWidth;
                    }

                    // set each slide position
                    $this
                        .css('left', left)
                        .width(settings.containerHeight)
                        .next()
                            .width(slideWidth - offset  - settings.innerPaddingLeft - settings.innerPaddingRight)
                            .css({
                                left : left,
                                paddingLeft : settings.headerWidth + settings.innerPaddingLeft,
                                paddingRight : settings.innerPaddingRight,
                            });
                });
            },

            // bind events
            bindEvents : function() {
                header.on('click.liteAccordion', core.triggerSlide);
            },

            currentSlide : settings.firstSlide - 1,

            // next slide index
            nextSlide : function(index) {
                var next = index + 1 || core.currentSlide + 1;

                // closure
                return function() {
                    return next++ % slideLen;
                };
            },

            slideAnimCompleteFlag : false,

            // trigger slide animation
            triggerSlide : function(e) {
                var $this = $(this),
                    tab = {
                        elem : $this,
                        index : header.index($this),
                        next : $this.next(),
                        prev : $this.parent().prev().children('.slideheader'),
                        parent : $this.parent()
                    };

                                    // update core.currentSlide
                core.currentSlide = tab.index;

                // reset onSlideAnimComplete callback flag
                core.slideAnimCompleteFlag = false;

                // trigger callback in context of sibling div (jQuery wrapped)
                settings.onTriggerSlide.call(tab.next, $this);

                // animate
                if ($this.hasClass('selected') && $this.position().left < slideWidth / 2) {
                    // animate single selected tab
                    core.animSlide.call(tab);
                } else {
                    // animate groups
                    core.animSlideGroup(tab);
                }
            },

            animSlide : function(triggerTab) {
                var _this = this;

                // set pos for single selected tab
                if (typeof this.pos === 'undefined') {
                    this.pos = slideWidth;
                }

                // remove, then add selected class
                header
                    .removeClass('selected')
                    .filter(this.elem)
                    .addClass('selected');

                // if slide index not zero
                if (!!this.index) {
                    this.elem
                        .add(this.next)
                        .stop(true)
                        .animate({
                            left : this.pos + this.index * settings.headerWidth
                        },
                            settings.slideSpeed,
                            settings.easing,
                            function() {
                                // flag ensures that fn is only called one time per triggerSlide
                                if (!core.slideAnimCompleteFlag) {
                                    // trigger onSlideAnimComplete callback in context of sibling div (jQuery wrapped)
                                    settings.onSlideAnimComplete.call(triggerTab ? triggerTab.next : _this.prev.next());
                                    core.slideAnimCompleteFlag = true;
                                }
                            });

                        // remove, then add selected class
                        header.removeClass('selected').filter(this.prev).addClass('selected');

                }
            },

            // animates left and right groups of slides
            animSlideGroup : function(triggerTab) {
                var group = ['left', 'right'];

                $.each(group, function(index, side) {
                    var filterExpr, left;

                    if (side === 'left')  {
                        filterExpr = ':lt(' + (triggerTab.index + 1) + ')';
                        left = 0;
                    } else {
                        filterExpr = ':gt(' + triggerTab.index + ')';
                        left = slideWidth;
                    }

                    slides
                        .filter(filterExpr)
                        .children('.slideheader')
                        .each(function() {
                            var $this = $(this),
                                tab = {
                                    elem : $this,
                                    index : header.index($this),
                                    next : $this.next(),
                                    prev : $this.parent().prev().children('.slideheader'),
                                    pos : left
                                };

                            // trigger item anim, pass original trigger context for callback fn
                            core.animSlide.call(tab, triggerTab);
                        });

                });

                // remove, then add selected class
                header.removeClass('selected').filter(triggerTab.elem).addClass('selected');
            },

            init : function() {
                core.setStyles();
                core.bindEvents();
            }
        };

        // init plugin
        core.init();

        // expose methods
        return methods;
    };

    $.fn.liteAccordion = function(method) {
        var elem = this,
            instance = elem.data('liteAccordion');

        // if creating a new instance
        if (typeof method === 'object' || !method) {
            return elem.each(function() {
                var liteAccordion;

                // if plugin already instantiated, return
                if (instance) return;

                // otherwise create a new instance
                liteAccordion = new LiteAccordion(elem, method);
                elem.data('liteAccordion', liteAccordion);
            });

        // otherwise, call method on current instance
        } else if (typeof method === 'string' && instance[method]) {
            // debug method isn't chainable b/c we need the debug object to be returned
            if (method === 'debug') {
                return instance[method].call(elem);
            } else { // the rest of the methods are chainable though
                instance[method].call(elem);
                return elem;
            }
        }
    };

})(jQuery);