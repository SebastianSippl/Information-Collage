// See: https://github.com/Factlink/js-library/blob/825adb0548af92fc21d6f22b2deb9ec768a4a3f2/app/js/loader/loader_common.coffee

class DomElementUI
{
    constructor(pageInfo)
    {

        var global = this;
        global.pageInfo = pageInfo;

        (function() {
        global.AttentionSpan = (function() {
            function AttentionSpan(options) {
                var base, base1;
                this.options = options != null ? options : {};
                this._has_attention = false;
                if ((base = this.options).wait_for_attention == null) {
                    base.wait_for_attention = 0;
                }
                if ((base1 = this.options).wait_for_neglection == null) {
                    base1.wait_for_neglection = 0;
                }
            }

            AttentionSpan.prototype.gainAttention = function() {
                this.clearTimeout('losing_attention_timeout_handler');
                return this.gaining_attention_timeout_handler != null ? this.gaining_attention_timeout_handler : this.gaining_attention_timeout_handler = setTimeout((function(_this) {
                    return function() {
                        return _this.gainAttentionNow();
                    };
                })(this), this.options.wait_for_attention);
            };

            AttentionSpan.prototype.loseAttention = function() {
                this.clearTimeout('gaining_attention_timeout_handler');
                return this.losing_attention_timeout_handler != null ? this.losing_attention_timeout_handler : this.losing_attention_timeout_handler = setTimeout((function(_this) {
                    return function() {
                        return _this.loseAttentionNow();
                    };
                })(this), this.options.wait_for_neglection);
            };

            AttentionSpan.prototype.has_attention = function() {
                return this._has_attention;
            };

            AttentionSpan.prototype.loseAttentionNow = function() {
                var base;
                this.clearTimeout('gaining_attention_timeout_handler');
                this.clearTimeout('losing_attention_timeout_handler');
                this._has_attention = false;
                return typeof (base = this.options).onAttentionLost === "function" ? base.onAttentionLost() : void 0;
            };

            AttentionSpan.prototype.gainAttentionNow = function() {
                var base;
                this.clearTimeout('gaining_attention_timeout_handler');
                this.clearTimeout('losing_attention_timeout_handler');
                this._has_attention = true;
                return typeof (base = this.options).onAttentionGained === "function" ? base.onAttentionGained() : void 0;
            };

            AttentionSpan.prototype.clearTimeout = function(name) {
                clearTimeout(this[name]);
                return delete this[name];
            };

            AttentionSpan.prototype.destroy = function() {
                this.clearTimeout('gaining_attention_timeout_handler');
                return this.clearTimeout('losing_attention_timeout_handler');
            };

            return AttentionSpan;

        })();

    }).call(this);

    (function() {
        var mouse_touch_drag_events;

        global.$factlinkCoreContainer = $("<factlink-core-container></factlink-core-container>");

        $('body').append(global.$factlinkCoreContainer);

        mouse_touch_drag_events = "mouseup mousedown click mouseenter mouseleave mousemove mouseout mouseover dblclick\nshow contextmenu\ndrag dragstart dragenter dragover dragleave dragend drop\ntouchstart touchmove touchleave touchenter touchend touchcancel";

        global.$factlinkCoreContainer.on(mouse_touch_drag_events, function(event) {
            return event.stopPropagation();
        });

    }).call(this);

    (function() {
        var IconButton, hostATag, hrefToHost,
            bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

        hostATag = document.createElement('a');

        hrefToHost = function(href) {
            hostATag.href = href;
            return hostATag.host;
        };

        IconButton = (function() {
            function IconButton(options) {
                this._targetElement = options.targetElement;
                this._targetOffset = options.targetOffset;
                this.$el = $("<factlink-icon-button>\n  </factlink-icon-button>");

                this.bubble = "<factlink-icon-button-bubble>\n    " + options.content + "\n    <factlink-icon-button-bubble-triangle></factlink-icon-button-bubble-triangle>\n  </factlink-icon-button-bubble>\n";

                var self = this;

                this.editor = new annotator.ui.editor.Editor();

                $(this.editor.element).find("a").attr("href", "javascript:void(0);");

                this.editor._onSaveClick = function (e) {
                   e.stopPropagation();
                   this.submit();

                };

                this.editor._onCancelClick = function (e) {
                  e.stopPropagation();
                  this.hide();
                  self.editor.element.detach();

                  var element = global.app.getElementByXpath(DomHelper.getXPath(self._targetElement));

                  if(element) {
                    self.$el.append(self.bubble);
                    self._setStyles();
                  }
                };

                this.editor.submit = function () {
                    for (var i = 0, len = this.fields.length; i < len; i++) {
                        var field = this.fields[i];
                        field.submit(field.element, this.annotation);
                    }
                    if (typeof this.dfd !== 'undefined' && this.dfd !== null) {
                        this.dfd.resolve();
                    }

                    this.annotation.textAnnotation = false;

                    if(this.annotation.id == undefined)
                    {
                        //This is a new entry
                        //Save, if element does not yet exist
                        this.annotation.id = ++pageInfo.id;
                        this.annotation.links = [{rel:'alternate',href:"#", type: 'text/html', id: this.annotation.id}];
                        window.setTimeout(function () {
                            var oldCol = $("[data-annotator-extensions-id]").css("background-color");
                            $("[data-annotator-extensions-id]").css({"background-color": "transparent"});
                            $(".annotator-viewer").hide();
                            window.setTimeout(function () {

                                var brect = self._targetElement.getBoundingClientRect();
                                //console.log( DomHelper.getXPath(self._targetElement));
                                PageSnippetHelper.createPageSnippet(brect, DomHelper.extractTextFromElement(self._targetElement), DomHelper.getXPath(self._targetElement), self.editor.annotation, null, function () {
                                    $("[data-annotator-extensions-id]").css({"background-color": oldCol});
                                    $(".annotator-viewer").show();
                                    global.app.updatePageElements();
                                    $(self._targetElement).addClass("extractedElement");
                                    self.editor.element.detach();

                                });
                            }, 50);
                        }, 50);



                    }
                    else
                    {
                        //Update comment, if element already exists
                        chrome.extension.sendMessage({name: 'updateElement', element: {id: this.annotation.id , annotation: this.annotation}}, function (r) {
                            self.editor.element.detach();
                        });
                    }

                    this.hide();
                };

                this.editor.element.css({"z-index" :1});


                this.viewer = new annotator.ui.viewer.Viewer({
                    permitEdit: function(){return true;},
                    permitDelete: function () {return true;},
                    onEdit: function (ann) {
                       self.editor.element.appendTo(self.$el);
                       self.viewer.hide();
                       self.editor.load(ann);
                       self.editor.show();
                    },
                    onDelete: function(ann){
                        chrome.extension.sendMessage({name: 'deleteElement', element: {id : ann.id}},
                            (response) => {
                                global.app.updatePageElements();
                                $(self._targetElement).removeClass("extractedElement");
                                self.viewer.element.detach();
                            });

                    }

                });
                this.viewer._startHideTimer = function () {};
                this.viewer._clearHideTimer = function () {};
                this.viewer.element.css({"z-index" :-1});
                this.viewer.show();

                global.$factlinkCoreContainer.append(this.$el);

                this._setStyles();
                this.$el.on('mousemove touchstart touchmove', options.onmouseenter);
                this.$el.on('mouseleave', options.onmouseleave);
                this.$el.on('click', options.onclick);
                this._tether = new window.Tether(this._tether_options());

            }

            IconButton.prototype.resetOffset = function(targetOffset) {
                if (targetOffset === this._targetOffset) {
                    return;
                }
                this._targetOffset = targetOffset;
                return this._tether.setOptions(this._tether_options());
            };

            IconButton.prototype._tether_options = function() {
                return {
                    element: this.$el[0],
                    target: this._targetElement,
                    attachment: 'top left',
                    targetAttachment: 'top right',
                    classPrefix: 'factlink-tether',
                    targetOffset: this._targetOffset || '0 0'
                };
            };

            IconButton.prototype.destroy = function() {
                this._tether.destroy();
                this.$el.empty();
                return this.$el.remove();
            };

            IconButton.prototype.fadeIn = function() {

                var element = null;

                //Cannot use xpath for google image search results
                if(window.location.href.includes("https://www.google.at/search?q=image+search"))
                    element = global.pageInfo.pageElements[0];
                else
                    element = global.app.getElementByXpath(DomHelper.getXPath(this._targetElement));

                if(element == null && this.$el.children().length == 0)
                {
                    //Show Add bubble
                    this.$el.append(this.bubble);
                    this._setStyles();
                }

                if(element)
                {
                    var annotation = element.annotation;

                    if(annotation.id == undefined)
                        annotation.id = element.id;

                    this.viewer.element.appendTo(this.$el);
                    this.viewer.load([annotation]);
                }

                return this.$el.addClass('factlink-control-visible');
            };

            IconButton.prototype.fadeOut = function() {
                return this.$el.removeClass('factlink-control-visible');
            };

            IconButton.prototype._setStyles = function() {
                var b, g, r, style, targetBrightness, targetColor, targetRGB;
                style = window.getComputedStyle(this._targetElement);
                targetColor = style.color;
                targetRGB = targetColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+(\.\d+)?)?\)$/);
                r = targetRGB[1] / 255;
                g = targetRGB[2] / 255;
                b = targetRGB[3] / 255;
                targetBrightness = 0.2126 * r * r + 0.7152 * g * g + 0.0722 * b * b;
                this.$el.css({
                    'line-height': style.lineHeight,
                    'font-size': style.fontSize,
                    'font-family': style.fontFamily
                });
                this.$el.find('factlink-icon-button-bubble').css({
                    'background-color': targetColor,
                    'color': targetBrightness > 0.5 ? 'black' : 'white',
                    'font-size': Math.max(12, Math.min(16, Math.round(0.8 * parseInt(style.fontSize))))
                });
                this.$el.find('factlink-icon-button-bubble-triangle').css({
                    'border-top-color': targetColor
                });
                return this.$el.css(this._siteSpecificStyles());
            };

            IconButton.prototype._siteSpecificStyles = function() {
                switch (hrefToHost(window.location.href)) {
                    case 'medium.com':
                        return {
                            'margin-left': '2em'
                        };
                    default:
                        return {};
                }
            };

            return IconButton;

        })();

        global.ParagraphIconButtonContainer = (function() {
            function ParagraphIconButtonContainer(paragraphElement, onClick) {
                this._onHideAllParagraphButtons = bind(this._onHideAllParagraphButtons, this);
                this._showOnlyThisParagraphButton = bind(this._showOnlyThisParagraphButton, this);
                this.$paragraph = $(paragraphElement);
                this._iconButton = new IconButton({
                    content: '+',
                    targetElement: this.$paragraph[0],
                    onmouseenter: (function(_this) {
                        return function() {
                            var ref;
                            return (ref = _this._attentionSpan) != null ? ref.gainAttention() : void 0;
                        };
                    })(this),
                    onmouseleave: (function(_this) {
                        return function() {
                            var ref;
                            return (ref = _this._attentionSpan) != null ? ref.loseAttention() : void 0;
                        };
                    })(this),
                    onclick: () => {

                        var element = global.app.getElementByXpath(DomHelper.getXPath(this._iconButton._targetElement));

                        if(!element)
                        {
                            var el =  this._iconButton.$el.children()[0];

                            $(el).detach();

                            this._iconButton.editor.element.appendTo(this._iconButton.$el);
                            this._iconButton.editor.show();
                        }
                    }
                });
                this._attentionSpan = new global.AttentionSpan({
                    wait_for_neglection: 500,
                    onAttentionGained: (function(_this) {
                        return function() {
                            _this._iconButton.fadeIn();
                            return _this._visible = true;
                        };
                    })(this),
                    onAttentionLost: (function(_this) {
                        return function() {
                            _this._iconButton.fadeOut();
                            return _this._visible = false;
                        };
                    })(this)
                });
                this.$paragraph.on('mousemove touchstart touchmove', this._showOnlyThisParagraphButton);
                this.$paragraph.on('mouseleave', (function(_this) {
                    return function() {
                        return _this._attentionSpan.loseAttention();
                    };
                })(this));
                $(document).on('hideAllParagraphButtons', this._onHideAllParagraphButtons);
            }

            ParagraphIconButtonContainer.prototype._showOnlyThisParagraphButton = function() {

                if (this._visible) {
                    return;
                }
               // $(document).trigger('hideAllParagraphButtons');
                return this._attentionSpan.gainAttention();
            };

            ParagraphIconButtonContainer.prototype._onHideAllParagraphButtons = function() {
                return this._attentionSpan.loseAttentionNow();
            };

            ParagraphIconButtonContainer.prototype.destroy = function() {
                var ref;
                this._iconButton.destroy();
                return (ref = this._attentionSpan) != null ? ref.destroy() : void 0;
            };

            return ParagraphIconButtonContainer;

        })();

    }).call(this);

    (function() {
        $.fn.distinctDescendants = function() {
            var $parents, elements;
            $parents = [];
            $(this).parentsUntil(function() {
                var $parent, isParentAlready;
                $parent = $(this);
                isParentAlready = $parent.data('$.fn.distinctDescendants.isParent');
                $parent.data('$.fn.distinctDescendants.isParent', true);
                $parents.push($parent);
                return isParentAlready;
            });
            elements = $(this).filter(function() {
                return !$(this).data('$.fn.distinctDescendants.isParent');
            });
            $parents.forEach(function($parent) {
                return $parent.removeData('$.fn.distinctDescendants.isParent');
            });
            return $(elements);
        };

    }).call(this);

    (function() {
        global.ParagraphButtons = (function() {
            function ParagraphButtons(_onClick) {
                this._onClick = _onClick;
            }

            ParagraphButtons.prototype._paragraphHasContent = function(el) {
                var $clonedEl, textLength;
                $clonedEl = $(el).clone();
                $clonedEl.find('a').remove();
                textLength = $clonedEl.text().trim().replace(/\s\s+/g, ' ').length;
                $clonedEl.remove();
                return textLength >= 50;
            };

            ParagraphButtons.prototype._addParagraphButton = function(el) {
                return new global.ParagraphIconButtonContainer(el, (function(_this) {
                    return function() {};
                })(this));
            };

            ParagraphButtons.prototype._addParagraphButtonsBatch = function(elements) {
                this.buttons = [];
                var el, elementsLeft, i, len, ref;
                ref = elements.slice(0, 10);
                for (i = 0, len = ref.length; i < len; i++) {
                    el = ref[i];
                    this.buttons.push(this._addParagraphButton(el));
                }
                elementsLeft = elements.slice(10);
                if (elementsLeft.length > 0) {
                    return setTimeout(((function(_this) {
                        return function() {
                            return _this._addParagraphButtonsBatch(elementsLeft);
                        };
                    })(this)), 200);
                }
            };

            ParagraphButtons.prototype.destroy = function () {
                for (i = 0, len = this.buttons.length; i < len; i++) {
                    this.buttons[i].destroy();
                }
            };

            ParagraphButtons.prototype._paragraphSelectors = function() {

                var hostname = window.location.host;

                //console.log(hostname);

                var hostDict = [];

                hostDict["stackoverflow.com"] = ["img", ".postcell", ".answercell"];
                hostDict["msdn.microsoft.com"] = ["img", ".codeSnippetContainerCodeContainer"];
                hostDict["www.heise.de"] = ["img", "article"];
                hostDict["www.google.at"] = [".irc_mi", ".irc_mut", "p", "ol"];
                hostDict["de.wikipedia.org"] = [ "img", "#bodyContent"];
                hostDict["en.wikipedia.org"] = ["#bodyContent", "img"];
                hostDict["derstandard.at"] = ["#objectContent", "img"];
                hostDict["www.imdb.com"] = [".minPosterWithPlotSummaryHeight", ".slate_wrapper", "img", ".article",".results", ".category"];
                hostDict["www.bildschirmarbeiter.com"] = [".image"];
                hostDict["dl.acm.org"] = ["#abstract"];

                var hostRules = hostDict[hostname];

                //console.log("Selected host rules: " + hostRules);

                //hostRules = undefined;

                if(hostRules == undefined)
                    hostRules = ['article', 'img'];

                return hostRules;

            };

            ParagraphButtons.prototype._prefixedParagraphSelectors = function(prefix) {
                var i, len, ref, results, selector;
                ref = this._paragraphSelectors();
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    selector = ref[i];
                    results.push(prefix + ' ' + selector);
                }
                return results;
            };

            ParagraphButtons.prototype._defaultSelector = function() {
                return this._paragraphSelectors().join(',');
            };


            ParagraphButtons.prototype._paragraphElements = function() {

                var selector = this._defaultSelector();

                return $(selector);
            };

            ParagraphButtons.prototype.addParagraphButtons = function() {
                return this._addParagraphButtonsBatch(this._paragraphElements());
            };

            return ParagraphButtons;

        })();

    }).call(this);

    (function() {
        global.paragraphUi = function() {

            return {

                accentuatePageElements: function () {
                    chrome.extension.sendMessage({name: 'getPageElements', url: window.location.href}, function (response) {
                        for (var i = 0; i < response.length; i++) {
                            if(!response[i].annotation.textAnnotation)
                            {
                                var el = DomHelper.getElementByPath(response[i].domPath);

                                $(el).addClass("extractedElement");
                            }
                        }

                    });
                },

                start: function(app) {

                    $("*").removeClass("extractedElement");
                    this.accentuatePageElements();

                    global.app = app;

                    this.paragraphButtons = new global.ParagraphButtons(function(el) {
                        return app.runHook('createFromParagraph', [el]);
                    });
                    return this.paragraphButtons.addParagraphButtons();
                },
                destroy: function (app) {
                    $("factlink-icon-button-bubble").remove();
                    $("factlink-icon-button").remove();
                }
            };
        };

    }).call(this);
    }

}