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

            firstSlide : 1,                         // displays slide (n) on page load
            slideSpeed : 800,                       // slide animation speed
            onTriggerSlide : function(e) {},        // callback on slide activate
            onSlideAnimComplete : function() {},    // callback on slide anim complete

            easing : 'swing',                       // custom easing function

            innerPaddingLeft : 15,
            innerPaddingRight : 20,
            minimumSlideWidth : 600,
            minimumAdjacentVisibleSlideHeaders : 3,
            slideCompressionFactor : 0.9
        };

        // merge defaults with options in new settings object
        var settings = $.extend({}, defaults, options);

        var slides = elem.children('ol').children('li');
        var slideCount = slides.length;
        var slideWidth = settings.containerWidth - slideCount * settings.headerWidth;

        var publicMethods = {
            // jump to slide number
            goto : function(index) {
                slides.eq(index).trigger('click.liteAccordion');
            },
            // trigger next slide
            next : function() {
                slides.eq(core.currentSlide === slideCount - 1 ? 0 : core.currentSlide + 1).trigger('click.liteAccordion');
            },
            // trigger previous slide
            prev : function() {
                slides.eq(core.currentSlide - 1).trigger('click.liteAccordion');
            },
            // return current slide
            current : function() {
                return core.currentSlide;
            }
        },
        core = {
            currentSlide : settings.firstSlide - 1,
            slideAnimCompleteFlag : false,

            initStyles : function() {
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

                core.initSlidePositions();
            },
            initSlidePositions : function() {
                slides.eq(settings.firstSlide - 1).addClass('selected');
                
                slides.each(function(index) {
                    var $this = $(this);
                    if(index > 0) {
                        var left = (index - 1) * settings.headerWidth;
                    }
                    else {
                        var left = 0;
                    }
                    var margin = slides.first().next();
                    var offset = parseInt(margin.css('marginLeft'), 10) || parseInt(margin.css('marginRight'), 10) || 0;

                    if (index >= settings.firstSlide) {
                        left += slideWidth;
                    }

                    // set each slide position
                    $this
                        .css('left', left)
                        .width(settings.containerHeight)
                        .next()
                            .width(slideWidth - offset - settings.innerPaddingLeft - settings.innerPaddingRight)
                            .css({
                                left : left,
                                paddingLeft : settings.headerWidth + settings.innerPaddingLeft,
                                paddingRight : settings.innerPaddingRight,
                            });
                });
            },
            // trigger slide animation
            triggerSlide : function(e) {
                var $this = $(this);
                var tab = {
                    elem : $this,
                    index : slides.index($this),
                    next : $this.next(),
                    prev : $this.prev(),
                    parent : $this.parent()
                };

                core.currentSlide = tab.index;
                core.slideAnimCompleteFlag = false;

                // if we have a callback set, trigger it in the context of the sibling div (jQuery wrapped)
                settings.onTriggerSlide.call(tab.next, $this);

                core.animSlideGroup(tab);
            },
            animSlide : function(triggerTab) {
                var _this = this;

                slides
                    .removeClass('selected')
                    .filter(this.elem)
                    .addClass('selected');

                // if slide index not zero
                if (!!this.index) {
                    this.elem
                        .stop(true)
                        .animate({
                                left : this.pos
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
                            }
                        );

                    slides
                        .removeClass('selected')
                        .filter(this.prev)
                        .addClass('selected');

                }
            },

            // animates left and right groups of slides
            animSlideGroupUncompressed : function(triggerTab) {
                //Handle left side
                slides
                    .filter(':lt(' + (triggerTab.index + 1) + ')')
                    .each(function() {
                        var $this = $(this);
                        var slideIndex = slides.index($this);

                        var tab = {
                            elem : $this,
                            index : slideIndex,
                            next : $this.next(),
                            prev : $this.prev(),
                            pos : (slideIndex - 1) * settings.headerWidth
                        };
                        // pass original trigger context for callback fn
                        core.animSlide.call(tab, triggerTab);
                    });

                //Handle right side
                slides
                    .filter(':gt(' + triggerTab.index + ')')
                    .each(function() {
                        var $this = $(this);
                        var slideIndex = slides.index($this);
                        
                        var tab = {
                            elem : $this,
                            index : slideIndex,
                            next : $this.next(),
                            prev : $this.prev(),
                            pos : slideWidth + (slideIndex - 1) * settings.headerWidth
                        };
                        // pass original trigger context for callback fn
                        core.animSlide.call(tab, triggerTab);
                    });

                slides
                    .removeClass('selected')
                    .filter(triggerTab.elem)
                    .addClass('selected');
            },
            animSlideGroupCompressed : function(triggerTab) {
                //Handle self
                triggerTab.pos = (triggerTab.index - 1) * settings.headerWidth;
                core.animSlide.call(triggerTab, triggerTab);

                //Handle left side
                slides
                    .filter(':lt(' + (triggerTab.index + 1) + ')')
                    .each(function() {
                        var $this = $(this);
                        var slideIndex = slides.index($this);
                        var tab = {
                            elem : $this,
                            index : slideIndex,
                            next : $this.next(),
                            prev : $this.prev()
                        };

                        tab.pos = (slideIndex - 1) * settings.headerWidth;


                        // pass original trigger context for callback fn
                        core.animSlide.call(tab, triggerTab);
                    });

                //Assign space on right...
                // console.log(triggerTab.elem.css("left"));
                // var triggerTab.pos = parseInt(triggerTab.elem.css('left'), 10)
                var widthRemaining = settings.containerWidth - (triggerTab.pos + slideWidth + settings.headerWidth);
                console.log(widthRemaining);

                console.log("trigger: " +
                    triggerTab.elem.find('.slideheader').text() +
                    " = " +
                    triggerTab.index + ", " +
                    triggerTab.pos + "px"
                );

                //Handle right side
                slides
                    .filter(':gt(' + triggerTab.index + ')')
                    .each(function() {
                        var $this = $(this);
                        var slideIndex = slides.index($this);
                        var tab = {
                            elem : $this,
                            index : slideIndex,
                            next : $this.next(),
                            prev : $this.prev()
                        };

                        var slidesRemaining = slides.length - slideIndex;
                        var adjustedIndex = slideIndex - triggerTab.index;

                        var name = $this.find('.slideheader').text();
                        console.log(name + " " + adjustedIndex);

                        if(slideIndex - triggerTab.index < settings.minimumAdjacentVisibleSlideHeaders) {
                            //originally:
                            // tab.pos = slideWidth + (slideIndex - 1) * settings.headerWidth;

                            // tab.pos = triggerTab.pos + slideWidth + adjustedIndex * settings.headerWidth;
                            widthRemaining -= settings.headerWidth;
                            tab.pos = settings.containerWidth - widthRemaining;
                        }
                        else {
                            // proportion = remainingwidth / (headerWidth * remainingcount)
                            // proportion *= compressionfactor

                            var averagedWidth = widthRemaining / slidesRemaining;

                            //Clamp to [0, widthRemaining]
                            var maximalWidth = Math.max(0, Math.min(settings.headerWidth, widthRemaining));
                            
                            //Lerp between the two based on compression factor:
                            var offset = averagedWidth + (maximalWidth - averagedWidth) * settings.slideCompressionFactor;

                            // value1 + (value2 - value1) * amount

                            console.log("widthRemaining: " + widthRemaining);
                            console.log("averagedWidth: " + averagedWidth);
                            console.log("maximalWidth: " + maximalWidth);
                            console.log("offset: " + offset);
                            
                            // tab.pos = triggerTab.pos + slideWidth + adjustedIndex * settings.headerWidth;

                            widthRemaining -= offset;
                            tab.pos = settings.containerWidth - settings.headerWidth - widthRemaining;
                            console.log("pos: " + tab.pos);


                            // tab.pos = triggerTab.pos + offset;
                            // tab.pos = slideWidth + (slideIndex - 1) * settings.headerWidth;
                        }

                        // pass original trigger context for callback fn
                        core.animSlide.call(tab, triggerTab);
                    });

                slides
                    .removeClass('selected')
                    .filter(triggerTab.elem)
                    .addClass('selected');
            }
        };


        if(slideWidth < settings.minimumSlideWidth) {
            slideWidth = settings.minimumSlideWidth;
            console.log("compressing!");
            // core.animSlideGroup = core.animSlideGroupCompressed;
            core.animSlideGroup = core.animSlideGroupUncompressed;
        }
        else {
            core.animSlideGroup = core.animSlideGroupUncompressed;
        }
        //TODO: slide width should be absolute/padding when larger than min width? (in the css)


        core.initStyles();
        slides.on('click.liteAccordion', core.triggerSlide);
        return publicMethods;
    };

    // expose as jQuery function
    $.fn.liteAccordion = function(method) {
        var elem = this;
        var instance = elem.data('liteAccordion');

        // if creating a new instance
        if (typeof method === 'object' || !method) {
            return elem.each(function() {
                if (instance) {
                    return;
                }

                var liteAccordion = new LiteAccordion(elem, method);
                elem.data('liteAccordion', liteAccordion);
            });

        // otherwise, call method on current instance
        }
        else if (typeof method === 'string' && instance[method]) {
            instance[method].call(elem);
            return elem;
        }
    };
})(jQuery);