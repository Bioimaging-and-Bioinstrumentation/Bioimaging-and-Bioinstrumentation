/*
 Copyright 2011-2016 Adobe Systems Incorporated. All Rights Reserved.
*/
(function(c) {
    "function" === typeof define && define.amd && define.amd.jQuery ? define(["jquery", "museutils"], c) : c(jQuery)
})(function(c) {
    (function(b, c) {
        function a() {}
        var f = {
            version: 0.1,
            inherit: function(a, b) {
                var f = function() {};
                f.prototype = b.prototype;
                a.prototype = new f;
                a.prototype.constructor = a;
                a.prototype._super = b
            },
            ensureArray: function() {
                var a = [],
                    f = arguments.length;
                f > 0 && (a = f > 1 || !b.isArray(arguments[0]) ? b.makeArray(arguments) : arguments[0]);
                return a
            },
            hasPointerCapture: function() {
                return !!c.hasPointerCapture
            },
            setPointerCapture: function(a, b) {
                if (b.pointerId && !c.hasPointerCapture)
                    if (a.setPointerCapture) a.setPointerCapture(b.pointerId), c.hasPointerCapture = !0;
                    else if (a.msSetPointerCapture) a.msSetPointerCapture(b.pointerId), c.hasPointerCapture = !0
            },
            releasePointerCapture: function(a, b) {
                b.pointerId && c.hasPointerCapture && (a.releasePointerCapture ? a.releasePointerCapture(b.pointerId) : a.msReleasePointerCapture && a.msReleasePointerCapture(b.pointerId), delete c.hasPointerCapture)
            },
            scopedFind: function(a, f, c, d) {
                for (var c =
                        " " + c + " ", l = [], a = b(a).find(f), f = a.length, d = b(d)[0], j = 0; j < f; j++)
                    for (var m = a[j], n = m; n;) {
                        if (n.className && (" " + n.className + " ").indexOf(c) !== -1) {
                            n === d && l.push(m);
                            break
                        }
                        n = n.parentNode
                    }
                return b(l)
            },
            findInWidgetScope: function(a, f) {
                var c = [];
                a.find(f).toArray().forEach(function(f) {
                    var g = b(f),
                        f = g.parents();
                    b.each(f, function(f, d) {
                        var n = b(d);
                        if (n.is(a)) return c.push(g), !1;
                        else if (Muse.Utils.isTopLevelWidget(n)) return !1;
                        return !0
                    })
                });
                return c
            }
        };
        b.extend(a.prototype, {
            bind: function(a, f, c) {
                return b(this).bind(a, f,
                    c)
            },
            unbind: function(a, f) {
                return b(this).unbind(a, f)
            },
            trigger: function(a, f) {
                var c = b.Event(a);
                b(this).trigger(c, f);
                return c
            }
        });
        f.EventDispatcher = a;
        c.WebPro = f
    })(c, window, document);
    (function(b, c) {
        var a = 1;
        c.ImageLoader = function(a) {
            c.EventDispatcher.call();
            var h = this;
            this.options = b.extend({}, this.defaultOptions, a);
            this._currentEntry = null;
            this._queue = [];
            this._isRunning = this._needsSort = !1;
            this._loader = new Image;
            this._loadFunc = function() {
                h._handleLoad()
            };
            this._loadErrorFunc = function() {
                h._handleError()
            };
            this._timeoutFunc =
                function() {
                    h.trigger("wp-image-loader-timeout", this._currentEntry);
                    h._loadNext()
                }
        };
        c.inherit(c.ImageLoader, c.EventDispatcher);
        b.extend(c.ImageLoader.prototype, {
            defaultOptions: {
                timeoutInterval: 1E3
            },
            add: function(f, h) {
                if (f) {
                    urls = c.ensureArray(f);
                    for (var g = 0; g < urls.length; g++) {
                        var i = b.extend({
                            reqId: a++,
                            src: urls[g],
                            width: 0,
                            height: 0,
                            priority: 50,
                            callback: null,
                            data: null
                        }, h);
                        this._queue.push(i);
                        this._needsSort = !0;
                        this.trigger("wp-image-loader-add", i)
                    }
                    this._isRunning && !this._currentEntry && this._loadNext()
                }
            },
            reprioritize: function(a, b) {
                if (!(this._currentEntry && this._currentEntry.src == a)) {
                    var g;
                    for (g = 0; g < this._queue.length; ++g)
                        if (this._queue[g].src == a) break;
                    if (g != 0 && g < this._queue.length) this._queue = this._queue.splice(g, b ? this._queue.length - g : 1).concat(this._queue)
                }
            },
            start: function() {
                if (!this._isRunning) this._isRunning = !0, this._loadNext(), this.trigger("wp-image-loader-start")
            },
            stop: function() {
                if (this._isRunning) this._currentEntry && this._queue.unshift(this._currentEntry), this._resetLoader(), this._isRunning = !1, this.trigger("wp-image-loader-stop")
            },
            clearQueue: function() {
                var a = this._isRunning;
                this.stop();
                this._queue.length = 0;
                a && this.start()
            },
            isQueueEmpty: function() {
                return this._queue.length == 0
            },
            _loadNext: function() {
                var d;
                this._resetLoader();
                var a = this._queue;
                if (a.length) {
                    if (this._needsSort) d = this._queue = a.sort(function(a, b) {
                        var f = a.priority - b.priority;
                        return f ? f : a.reqId - b.reqId
                    }), a = d, this._needsSort = !1;
                    this._currentEntry = a = a.shift();
                    var b = this._loader;
                    b.onload = this._loadFunc;
                    b.onerror = this._loadErrorFunc;
                    b.src = a.src
                }
            },
            _resetLoader: function() {
                var a = this._loader;
                a.onload = null;
                a.onerror = null;
                this._currentEntry = a.src = null;
                if (this._timeoutTimerId) clearTimeout(this._timeoutTimerId), this._timeoutTimerId = 0
            },
            _handleLoad: function() {
                var a = this._loader,
                    b = this._currentEntry;
                b.width = a.width;
                b.height = a.height;
                b.callback && b.callback(b.src, b.width, b.height, b.data);
                this.trigger("wp-image-loader-load-success", b);
                this._loadNext()
            },
            _handleError: function() {
                this.trigger("wp-image-loader-load-error", this._currentEntry);
                this._loadNext()
            }
        })
    })(c, WebPro, window, document);
    (function(b, c) {
        function a() {
            c.EventDispatcher.call(this);
            this._initialize.apply(this, arguments)
        }
        c.inherit(a, c.EventDispatcher);
        b.extend(a.prototype, {
            defaultOptions: {},
            _widgetName: "Widget",
            _initialize: function() {
                var a;
                this.plugins = [];
                var c = this.trigger("before-setup");
                c.isDefaultPrevented() || (a = this._setUp.apply(this, arguments), this.trigger("setup"));
                c = this.trigger("before-init-plugins");
                c.isDefaultPrevented() || (this._initializePlugins(a), this.trigger("init-plugins"));
                this.options = b.extend({}, this.defaultOptions, a);
                c = this.trigger("before-extract-data");
                c.isDefaultPrevented() || (this._extractData(), this.trigger("extract-data"));
                c = this.trigger("before-transform-markup");
                c.isDefaultPrevented() || (this._transformMarkup(), this.trigger("transform-markup"));
                c = this.trigger("before-attach-behavior");
                c.isDefaultPrevented() || (this._attachBehavior(), this.trigger("attach-behavior"));
                c = this.trigger("before-ready");
                c.isDefaultPrevented() || (this._ready(), this.trigger("ready"));
                var g = this;
                b("body").on("muse_bp_activate", function(a, b, f) {
                    f.is(g.$bp) && (g._bpActivate(), g.trigger("bp-activate"))
                }).on("muse_bp_deactivate", function(a, b, f) {
                    f.is(g.$bp) && (g._bpDeactivate(), g.trigger("bp-deactivate"))
                })
            },
            _setUp: function(a, c) {
                this.$element = b(a);
                var g = this.$element.closest(".breakpoint");
                if (1 == g.length) this.$bp = g, this.breakpoint = this.$bp.data("bpObj");
                return c
            },
            _initializePlugins: function(a) {
                for (var a = a || {}, b = ((typeof a.useDefaultPlugins === "undefined" || a.useDefaultPlugins) && this.defaultPlugins ?
                        this.defaultPlugins : []).concat(a.plugins || []), b = b.sort(function(a, b) {
                        a = typeof a.priority === "number" ? a.priority : 50;
                        b = typeof b.priority === "number" ? b.priority : 50;
                        return a - b
                    }), g = 0; g < b.length; g++) {
                    var c = b[g];
                    c && c.initialize && c.initialize(this, a)
                }
                this.plugins = b
            },
            _extractData: function() {},
            _transformMarkup: function() {},
            _attachBehavior: function() {},
            _ready: function() {},
            _bpActivate: function() {},
            _bpDeactivate: function() {}
        });
        c.Widget = a;
        c.widget = function(a, h, g) {
            var i = g && h || c.Widget,
                g = g || h || {},
                h = function() {
                    i.apply(this,
                        arguments);
                    this._widgetName = a
                };
            c.inherit(h, i);
            b.extend(h.prototype, g);
            h.prototype.defaultOptions = b.extend({}, i.prototype.defaultOptions, g.defaultOptions);
            var g = a.split("."),
                k = g.length;
            namespace = k > 1 && g[0] || "Widget";
            a = g[k - 1];
            c[namespace][a] = h
        }
    })(c, WebPro, window, document);
    (function(b, c) {
        c.widget("Widget.Button", c.Widget, {
            defaultOptions: {
                hoverClass: "wp-button-hover",
                activeClass: "wp-button-down",
                disabledClass: "wp-button-disabled",
                disabled: !1,
                clickCallback: null,
                prevCallback: null,
                nextCallback: null
            },
            _attachBehavior: function() {
                var a =
                    this,
                    f = function(c) {
                        a.$element.removeClass(a.options.activeClass);
                        !a.options.disabled && a.options.clickCallback && a.options.clickCallback.call(this, c);
                        b(a.$element).off("mouseup pointerup", f);
                        a.pointerHandled = !1;
                        if (c.type == "pointerup") a.completelyHandled = !0
                    };
                this.pointerHandled = this.completelyHandled = !1;
                this.$element.on("keydown", function(b) {
                    if (!a.options.disabled) {
                        var f = b.which || b.keyCode;
                        switch (f) {
                            case 37:
                            case 38:
                                b.preventDefault();
                                a.options.prevCallback && a.options.prevCallback.call(this, b);
                                break;
                            case 39:
                            case 40:
                                b.preventDefault();
                                a.options.nextCallback && a.options.nextCallback.call(this, b);
                                break;
                            case 32:
                            case 13:
                                f === 32 && b.preventDefault(), a.options.clickCallback && a.options.clickCallback.call(this, b)
                        }
                    }
                }).on("mouseover", function() {
                    a.options.disabled || a.$element.addClass(a.options.hoverClass + (a.mouseDown ? " " + a.options.activeClass : ""))
                }).on("mouseleave", function() {
                    a.$element.removeClass(a.options.hoverClass + " " + a.options.activeClass);
                    b(a.$element).off("mouseup", f)
                }).on("mousedown", function() {
                    !a.options.disabled &&
                        !a.pointerHandled && !a.completelyHandled ? (a.$element.addClass(a.options.activeClass), b(a.$element).on("mouseup", f)) : a.completelyHandled = !1
                }).on("pointerdown", function() {
                    if (!a.options.disabled) a.pointerHandled = !0, a.completelyHandled = !1, a.$element.addClass(a.options.activeClass), b(a.$element).on("pointerup", f)
                });
                this.disabled(this.options.disabled)
            },
            disabled: function(a) {
                if (typeof a === "boolean") this.options.disabled = a, this.$element[a ? "addClass" : "removeClass"](this.options.disabledClass);
                return this.options.disabled
            }
        });
        b.fn.wpButton = function(a) {
            this.each(function() {
                new c.Widget.Button(this, a)
            });
            return this
        }
    })(c, WebPro, window, document);
    (function(b, c) {
        c.widget("Widget.RadioGroup", c.Widget, {
            _widgetName: "radio-group",
            defaultOptions: {
                defaultIndex: 0,
                hoverClass: "wp-radio-hover",
                downClass: "wp-radio-down",
                disabledClass: "wp-radio-disabled",
                checkedClass: "wp-radio-checked",
                disabled: !1,
                toggleStateEnabled: !1
            },
            _attachBehavior: function() {
                var a = this;
                this.buttons = [];
                this.activeElement = null;
                this.activeIndex = -1;
                this.$element.each(function() {
                    a.buttons.push(a._addButtonBehavior(this))
                });
                this.disabled(this.options.disabled)
            },
            _bpActivate: function() {
                if (-1 != this.activeIndex) {
                    var a = this._getElement(this.activeIndex);
                    a && b(a).addClass(this.options.checkedClass)
                }
            },
            _bpDeactivate: function() {
                if (-1 != this.activeIndex) {
                    var a = this._getElement(this.activeIndex);
                    a && b(a).removeClass(this.options.checkedClass)
                }
            },
            _addButtonBehavior: function(a) {
                var b = this,
                    h = new c.Widget.Button(a, {
                        hoverClass: this.options.hoverClass,
                        downClass: this.options.downClass,
                        disabledClass: this.options.disabledClass,
                        clickCallback: function(g) {
                            return b._handleClick(g,
                                h, a)
                        },
                        prevCallback: function(g) {
                            return b._handlePrev(g, h, a)
                        },
                        nextCallback: function(g) {
                            return b._handleNext(g, h, a)
                        }
                    });
                return h
            },
            _handlePrev: function() {
                if (!this.options.disabled) {
                    if (this.activeIndex > this._getElementIndex(this.firstButton.$element[0])) this.activeIndex--;
                    else if (this.activeIndex === this._getElementIndex(this.firstButton.$element[0]) || this.activeIndex === -1) this.activeIndex = this._getElementIndex(this.lastButton.$element[0]);
                    this._getElementByIndex(this.activeIndex).focus();
                    this.checkButton(this.activeIndex)
                }
            },
            _handleNext: function() {
                if (!this.options.disabled) {
                    if (this.activeIndex < this.numButtons - 1) this.activeIndex++;
                    else if (this.activeIndex === this.numButtons - 1) this.activeIndex = this._getElementIndex(this.firstButton.$element[0]);
                    this._getElementByIndex(this.activeIndex).focus();
                    this.checkButton(this.activeIndex)
                }
            },
            _handleClick: function(a, b, c) {
                this.options.disabled || this.checkButton(c)
            },
            _getElementIndex: function(a) {
                return a ? b.inArray(a, this.$element.get()) : -1
            },
            _getElementByIndex: function(a) {
                return a >= 0 ? this.$element.eq(a)[0] :
                    null
            },
            _getElement: function(a) {
                return typeof a === "number" ? this._getElementByIndex(a) : a
            },
            checkButton: function(a) {
                var a = this._getElement(a),
                    f = this.activeElement,
                    c = this.options.checkedClass;
                a !== f ? (f && this.uncheckButton(f), a && b(a).addClass(c)) : this.options.toggleStateEnabled && a && (this.uncheckButton(a, c), a = null);
                this.activeElement = a;
                this.activeIndex = this._getElementIndex(a)
            },
            uncheckButton: function(a) {
                b(a).removeClass(this.options.checkedClass)
            },
            disabled: function(a) {
                if (typeof a === "boolean") this.disabled =
                    a, b.each(this.buttons, function() {
                        this.disabled(a)
                    });
                return this.options.disabled
            }
        });
        b.fn.wpRadioGroup = function(a) {
            new c.Widget.RadioGroup(this, a);
            return this
        }
    })(c, WebPro, window, document);
    (function(b, c) {
        c.widget("Widget.TabGroup", c.Widget.RadioGroup, {
            defaultOptions: {
                defaultIndex: 0,
                hoverClass: "wp-tab-hover",
                downClass: "wp-tab-down",
                disabledClass: "wp-tab-disabled",
                checkedClass: "wp-tab-active",
                disabled: !1,
                toggleStateEnabled: !1,
                isPopupButtonWidget: !1,
                parentSelectors: [".ThumbGroup", ".AccordionWidget", ".TabbedPanelsWidget"]
            },
            _attachBehavior: function() {
                this._super.prototype._attachBehavior.apply(this, arguments);
                this.isPopupButtonWidget = this.options.isPopupButtonWidget;
                this.numButtons = this.buttons.length;
                this.firstButton = this.buttons[0];
                this.lastButton = this.buttons[this.numButtons - 1];
                this.configureAria()
            },
            selectTab: function(a) {
                this.checkButton(a)
            },
            configureAria: function() {
                var a = this;
                if (this.options.isPopupButtonWidget === !0 || this.numButtons === 1) b.each(this.buttons, function() {
                    this.$element.attr({
                        role: "button",
                        tabindex: "0",
                        "aria-haspopup": "true"
                    })
                }), this.isPopupButtonWidget = !0;
                else if (this.numButtons > 1) this.parentElement = this.buttons[0].$element.parents(this.options.parentSelectors.join()), this.parentElement.attr("role", "tablist"), b.each(this.buttons, function(b) {
                    this.$element.attr({
                        role: "tab",
                        tabindex: "0"
                    });
                    b > 0 && a.uncheckButton(this.$element)
                })
            },
            checkButton: function(a) {
                var f = this._getElement(a),
                    c = this._getElementIndex(f),
                    c = {
                        tab: f,
                        tabIndex: c
                    };
                this.trigger("wp-tab-before-select", c);
                this._super.prototype.checkButton.apply(this,
                    arguments);
                b(f).attr({
                    tabindex: "0"
                });
                this.options.contentLayout_runtime !== "lightbox" && b(f).attr({
                    "aria-selected": "true"
                });
                this.trigger("wp-tab-select", c)
            },
            uncheckButton: function(a) {
                this._super.prototype.uncheckButton.apply(this, arguments);
                this.isPopupButtonWidget || (b(a).attr({
                    tabindex: "-1"
                }), this.options.contentLayout_runtime !== "lightbox" && b(a).attr({
                    "aria-selected": "false"
                }))
            }
        });
        b.fn.wpTabGroup = function(a) {
            new c.Widget.TabGroup(this, a);
            return this
        }
    })(c, WebPro, window, document);
    (function(b, c) {
        c.widget("Widget.PanelGroup",
            c.Widget, {
                _widgetName: "panel-group",
                defaultOptions: {
                    defaultIndex: 0,
                    panelClass: "wp-panel",
                    activeClass: "wp-panel-active",
                    toggleStateEnabled: !1,
                    tabGroups: null
                },
                _setUp: function() {
                    var a = this;
                    this.tabGroups = [];
                    this._tabCallback = function(b, c) {
                        a._handleTabSelect(b, c)
                    };
                    this.showLock = 0;
                    this.tabDriver = null;
                    return this._super.prototype._setUp.apply(this, arguments)
                },
                _bpActivate: function() {
                    if (-1 != this.activeIndex) {
                        var a = this._getElement(this.activeIndex);
                        a && b(a).addClass(this.options.activeClass)
                    }
                },
                _bpDeactivate: function() {
                    if (-1 !=
                        this.activeIndex) {
                        var a = this._getElement(this.activeIndex);
                        a && b(a).removeClass(this.options.activeClass)
                    }
                },
                _attachBehavior: function() {
                    this.activeElement = null;
                    this.activeIndex = -1;
                    this.$element.addClass(this.options.panelClass);
                    var a = this.options.defaultIndex;
                    typeof a === "number" && a >= 0 && this.showPanel(a);
                    this.addTabGroup(this.options.tabGroups)
                },
                _getElementIndex: function(a) {
                    return a ? b.inArray(a, this.$element.get()) : -1
                },
                _getElementByIndex: function(a) {
                    return this.$element.eq(a)[0]
                },
                _getElement: function(a) {
                    return typeof a ===
                        "number" ? this._getElementByIndex(a) : a
                },
                configureAria: function(a) {
                    b.each(this.$element, function(f, c) {
                        b(c).attr({
                            role: "tabpanel",
                            "aria-labelledby": a.buttons[f].$element.attr("id")
                        });
                        a.buttons[f].$element.attr({
                            "aria-controls": b(c).attr("id")
                        })
                    })
                },
                showPanel: function(a) {
                    if (!this.showLock) {
                        ++this.showLock;
                        var f = this._getElement(a),
                            c = this.activeElement,
                            g = this.options.activeClass;
                        if (f)
                            if (f !== c) {
                                a = {
                                    panel: f,
                                    panelIndex: this._getElementIndex(f)
                                };
                                this.trigger("wp-panel-before-show", a);
                                c && this.hidePanel(c);
                                b(f).addClass(g);
                                this.activeElement = f;
                                this.activeIndex = this._getElementIndex(f);
                                f = this.tabGroups;
                                for (c = 0; c < f.length; c++) g = f[c], g !== this.tabDriver && g.selectTab(this.activeIndex);
                                this.trigger("wp-panel-show", a)
                            } else this.options.toggleStateEnabled && this.hidePanel(f);
                        --this.showLock
                    }
                },
                hidePanel: function(a) {
                    if (a = typeof a === "number" ? this.$element.eq(a)[0] : a) {
                        var f = {
                            panel: a,
                            panelIndex: this._getElementIndex(a)
                        };
                        this.trigger("wp-panel-before-hide", f);
                        b(a).removeClass(this.options.activeClass);
                        if (a === this.activeElement) this.activeElement =
                            null, this.activeIndex = -1;
                        this.trigger("wp-panel-hide", f)
                    }
                },
                _handleTabSelect: function(a, b) {
                    if (!this.showLock) this.tabDriver = a.target, this.showPanel(b.tabIndex), this.tabDriver = null
                },
                addTabGroup: function(a) {
                    if (a)
                        for (var a = c.ensureArray(a), f = a.length, h = 0; h < f; h++) {
                            var g = a[h];
                            b.inArray(this.tabGroups, g) === -1 && (this.tabGroups.push(g), g.selectTab(this.activeIndex), g.unbind("wp-tab-select").bind("wp-tab-select", this._tabCallback), this.configureAria(g))
                        }
                },
                removeTabGroup: function(a) {
                    for (var a = c.ensureArray(a),
                            f = a.length, h = 0; h < f; h++) {
                        var g = a[h];
                        sets = this.tabGroups;
                        loc = b.inArray(sets, g);
                        loc !== -1 && sets.splice(loc, 1)
                    }
                }
            });
        b.fn.wpPanelGroup = function(a) {
            new c.Widget.PanelGroup(this, a);
            return this
        }
    })(c, WebPro, window, document);
    (function(b, c) {
        c.widget("Widget.Disclosure", c.Widget, {
            defaultOptions: {
                widgetClassName: "wp-disclosure-panels",
                tabClassName: "wp-disclosure-panels-tab",
                tabHoverClassName: "wp-disclosure-panels-tab-hover",
                tabDownClassName: "wp-disclosure-panels-tab-down",
                panelClassName: "wp-disclosure-panels-panel",
                tabActiveClassName: "wp-disclosure-panels-tab-active",
                panelActiveClassName: "wp-disclosure-panels-panel-active",
                defaultIndex: 0,
                toggleStateEnabled: !1
            },
            _attachBehavior: function() {
                var a = this.$element[0],
                    b = this.options.widgetClassName,
                    h = c.scopedFind(a, "." + this.options.tabClassName, b, a),
                    a = c.scopedFind(a, "." + this.options.panelClassName, b, a);
                this.tabs = new c.Widget.TabGroup(h, {
                    hoverClass: this.options.tabHoverClassName,
                    downClass: this.options.tabDownClassName,
                    checkedClass: this.options.tabActiveClassName,
                    toggleStateEnabled: this.options.toggleStateEnabled
                });
                this.panels = new c.Widget.PanelGroup(a, {
                    panelClass: this.options.panelClassName,
                    activeClass: this.options.panelActiveClassName,
                    defaultIndex: this.options.defaultIndex,
                    toggleStateEnabled: this.options.toggleStateEnabled
                });
                this.panels.addTabGroup(this.tabs)
            }
        });
        c.widget("Widget.TabbedPanels", c.Widget.Disclosure, {
            defaultOptions: {
                widgetClassName: "wp-tabbed-panels-panels",
                tabClassName: "wp-tabbed-panels-panels-tab",
                tabHoverClassName: "wp-tabbed-panels-panels-tab-hover",
                tabDownClassName: "wp-tabbed-panels-panels-tab-down",
                tabActiveClassName: "wp-tabbed-panels-panels-tab-active",
                panelClassName: "wp-tabbed-panels-panels-panel",
                panelActiveClassName: "wp-tabbed-panels-panels-panel-active",
                toggleStateEnabled: !1
            },
            _transformMarkup: function() {
                Muse.Utils.addWidgetIDToImages(this.$element, this.$element.attr("id"))
            }
        });
        c.widget("Widget.Accordion", c.Widget.Disclosure, {
            defaultOptions: {
                widgetClassName: "wp-accordion",
                tabClassName: "wp-accordion-tab",
                tabHoverClassName: "wp-accordion-tab-hover",
                tabDownClassName: "wp-accordion-tab-down",
                tabActiveClassName: "wp-accordion-tab-active",
                panelClassName: "wp-accordion-panel",
                panelActiveClassName: "wp-accordion-panel-active",
                toggleStateEnabled: !1
            },
            _transformMarkup: function() {
                Muse.Utils.addWidgetIDToImages(this.$element, this.$element.attr("id"))
            }
        })
    })(c, WebPro, window, document);
    (function(b, c) {
        c.Widget.Disclosure.DisplayPropertyTransitionPlugin = {
            defaultOptions: {},
            initialize: function(a, f) {
                var c = this;
                b.extend(f, b.extend({}, c.defaultOptions, f));
                a.bind("attach-behavior", function() {
                    c._attachBehavior(a)
                })
            },
            _attachBehavior: function(a) {
                var a = a.panels,
                    b = a.$element,
                    c = a.activeIndex;
                a.bind("wp-panel-show", function(a, b) {
                    b.panel.style.display = "block"
                });
                a.bind("wp-panel-hide", function(a, b) {
                    b.panel.style.display = "none"
                });
                b.each(function(a) {
                    this.style.display = a !== c ? "none" : "block"
                })
            }
        };
        c.Widget.Disclosure.AccordionTransitionPlugin = {
            defaultOptions: {
                transitionDirection: "vertical",
                transitionDuration: 500,
                dispatchTransitionEvents: !0
            },
            initialize: function(a, f) {
                var c = this;
                b.extend(f, b.extend({}, c.defaultOptions, f));
                a.bind("attach-behavior", function() {
                    c._attachBehavior(a)
                }).bind("bp-activate",
                    function() {
                        c._bpActivate(a)
                    }).bind("bp-deactivate", function() {
                    c._bpDeactivate(a)
                })
            },
            _bpActivate: function(a) {
                if (-1 != a.panels.activeIndex) {
                    var b = a.options,
                        c = b.tabActiveClassName,
                        b = b.transitionDirection,
                        g = a.panels.activeIndex,
                        a = a.panels.$element,
                        d = {
                            overflow: "hidden"
                        };
                    if (b === "vertical" || b === "both") d.height = "auto";
                    if (b === "horizontal" || b === "both") d.width = "auto";
                    a.eq(g).addClass(c).css(d)
                }
            },
            _bpDeactivate: function(a) {
                var f = a.options,
                    c = f.tabActiveClassName,
                    g = f.transitionDirection;
                a.panels.$element.each(function() {
                    var a = {
                        overflow: "hidden"
                    };
                    if (g === "vertical" || g === "both") a.height = "0";
                    if (g === "horizontal" || g === "both") a.width = "0";
                    b(this).css(a).removeClass(c)
                })
            },
            _attachBehavior: function(a) {
                var f = this,
                    c = a.panels,
                    g = c.$element,
                    d = c.activeIndex,
                    k = a.options.transitionDirection,
                    l = a.options.widgetClassName === "AccordionWidget" ? b(g[0]).closest("*[data-rotate]") : null;
                if (l && l.length > 0) a.options.marginBottom = Muse.Utils.getCSSIntValue(l, "margin-bottom"), a.options.originalHeight = l[0].scrollHeight;
                a.options.rotatedAccordion = l;
                c.bind("wp-panel-show",
                    function(b, c) {
                        f._showPanel(a, c)
                    });
                c.bind("wp-panel-hide", function(b, c) {
                    f._hidePanel(a, c)
                });
                g.each(function(a) {
                    var a = a === d,
                        f = {};
                    f.overflow = a ? "" : "hidden";
                    if (k === "vertical" || k === "both") f.height = a ? "auto" : "0";
                    if (k === "horizontal" || k === "both") f.width = a ? "auto" : "0";
                    b(this).css(f)
                })
            },
            _updateMarginBottomForRotatedAccordion: function(a) {
                a.options.rotatedAccordion.css("margin-bottom", Math.round(a.options.marginBottom - (a.options.rotatedAccordion[0].scrollHeight - a.options.originalHeight)) + "px")
            },
            _transitionPanel: function(a,
                f, c) {
                b("body").trigger("wp-page-height-change", f - a);
                if ((a = c.options.rotatedAccordion) && a.length > 0) {
                    if (c.options.originalHeight == 0 && "undefined" !== typeof f) c.options.marginBottom = Muse.Utils.getCSSIntValue(a, "margin-bottom"), c.options.originalHeight = a[0].scrollHeight;
                    this._updateMarginBottomForRotatedAccordion(c)
                }
            },
            _showPanel: function(a, f) {
                if (!a.$bp || a.$bp.hasClass("active")) {
                    var c = a.options,
                        g = c.transitionDirection,
                        d = b(f.panel),
                        k = {},
                        l = c.dispatchTransitionEvents,
                        j = this,
                        m = d.height(),
                        n = function(b) {
                            b = parseInt(b.elem.style.height);
                            j._transitionPanel(m, b, a);
                            m = b
                        };
                    if (g === "vertical" || g === "both") k.height = d[0].scrollHeight + "px";
                    if (g === "horizontal" || g === "both") k.width = d[0].scrollWidth + "px";
                    d.stop(!0, !0).queue("animationFrameFx", b.animationFrameFx).animate(k, {
                        duration: c.transitionDuration,
                        progress: l ? n : null,
                        queue: "animationFrameFx",
                        complete: function() {
                            var b = {
                                overflow: ""
                            };
                            if (g === "vertical" || g === "both") b.height = "auto";
                            if (g === "horizontal" || g === "both") b.width = "auto";
                            d.css(b);
                            (b = a.options.rotatedAccordion) && b.length > 0 && j._updateMarginBottomForRotatedAccordion(a)
                        }
                    }).dequeue("animationFrameFx")
                }
            },
            _hidePanel: function(a, f) {
                if (!a.$bp || a.$bp.hasClass("active")) {
                    var c = a.options,
                        g = c.transitionDirection,
                        d = b(f.panel),
                        k = {},
                        l = c.dispatchTransitionEvents,
                        j = this,
                        m = d.height(),
                        n = function(b) {
                            b = parseInt(b.elem.style.height);
                            j._transitionPanel(m, b, a);
                            m = b
                        };
                    if (g === "vertical" || g === "both") k.height = "0";
                    if (g === "horizontal" || g === "both") k.width = "0";
                    d.stop(!0, !0).queue("animationFrameFx", b.animationFrameFx).animate(k, {
                        duration: c.transitionDuration,
                        queue: "animationFrameFx",
                        progress: l ? n : null,
                        complete: function() {
                            d.css("overflow",
                                "hidden");
                            var b = a.options.rotatedAccordion;
                            b && b.length > 0 && j._updateMarginBottomForRotatedAccordion(a)
                        }
                    }).dequeue("animationFrameFx")
                }
            }
        }
    })(c, WebPro, window, document);
    (function(b, c) {
        c.widget("Widget.SlideShowBase", c.Widget, {
            _widgetName: "slideshow-base",
            defaultOptions: {
                displayInterval: 6E3,
                autoPlay: !1,
                loop: !0,
                playOnce: !1
            },
            _setUp: function() {
                var a = this;
                this._ssTimer = 0;
                this._ssTimerTriggered = !1;
                this._ssTimerCallback = function() {
                    a._ssTimerTriggered = !0;
                    a.next();
                    a._ssTimerTriggered = !1
                };
                return c.Widget.prototype._setUp.apply(this,
                    arguments)
            },
            _ready: function() {
                this.options.autoPlay && this.play()
            },
            play: function(a) {
                e = this.trigger("wp-slideshow-before-play");
                e.isDefaultPrevented() || (this._startTimer(!1, a), this.trigger("wp-slideshow-play"))
            },
            stop: function() {
                e = this.trigger("wp-slideshow-before-stop");
                e.isDefaultPrevented() || (this._stopTimer(), this.trigger("wp-slideshow-stop"))
            },
            isPlaying: function() {
                return this._ssTimer !== 0
            },
            _startTimer: function(a, b) {
                this._stopTimer();
                var c = b ? 0 : this.options.displayInterval;
                a && (c += this.options.transitionDuration);
                this._ssTimer = setTimeout(this._ssTimerCallback, c)
            },
            _stopTimer: function() {
                this._ssTimer && clearTimeout(this._ssTimer);
                this._ssTimer = 0
            },
            _executeCall: function(a, b) {
                e = this.trigger("wp-slideshow-before-" + a);
                if ((!this._$sslbpOverlay || !(this._$sslbpOverlay.hasClass("LightboxContent") && this._$sslbpOverlay.css("opacity") == 0)) && !e.isDefaultPrevented()) this["_" + a].apply(this, b) && this.stop(), this.isPlaying() && this._startTimer(!0), this.trigger("wp-slideshow-" + a)
            },
            first: function() {
                return this._executeCall("first",
                    arguments)
            },
            last: function() {
                return this._executeCall("last", arguments)
            },
            previous: function() {
                return this._executeCall("previous", arguments)
            },
            next: function() {
                return this._executeCall("next", arguments)
            },
            goTo: function() {
                return this._executeCall("goTo", arguments)
            },
            close: function() {
                return this._executeCall("close", arguments)
            },
            _first: function() {},
            _last: function() {},
            _previous: function() {},
            _next: function() {},
            _goTo: function() {},
            _close: function() {}
        })
    })(c, WebPro, window, document);
    (function(b, c) {
        c.widget("Widget.ContentSlideShow",
            c.Widget.SlideShowBase, {
                _widgetName: "content-slideshow",
                defaultOptions: {
                    slideshowClassName: "wp-slideshow",
                    clipClassName: "wp-slideshow-clip",
                    viewClassName: "wp-slideshow-view",
                    slideClassName: "wp-slideshow-slide",
                    slideLinkClassName: "wp-slideshow-slide-link",
                    firstBtnClassName: "wp-slideshow-first-btn",
                    lastBtnClassName: "wp-slideshow-last-btn",
                    prevBtnClassName: "wp-slideshow-prev-btn",
                    nextBtnClassName: "wp-slideshow-next-btn",
                    playBtnClassName: "wp-slideshow-play-btn",
                    stopBtnClassName: "wp-slideshow-stop-btn",
                    closeBtnClassName: "wp-slideshow-close-btn",
                    playingClassName: "wp-slideshow-playing"
                },
                _findWidgetElements: function(a) {
                    for (var f = this.$element[0], a = c.scopedFind(f, a, this.options.slideshowClassName, f), f = !0, h = 0; h < a.length; h++)
                        if (parseInt(b(a[h]).attr("data-col-pos") || -100) === -100) {
                            f = !1;
                            break
                        }
                    f && a.sort(function(a, f) {
                        var c = parseInt(b(a).attr("data-col-pos") || -1),
                            d = parseInt(b(f).attr("data-col-pos") || -1);
                        if (c < d) return -1;
                        if (c > d) return 1;
                        return 0
                    });
                    return a
                },
                _attachBtnHandler: function(a, b) {
                    var c = this;
                    this["$" +
                        b + "Btn"] = this._findWidgetElements("." + a).attr({
                        tabindex: "0",
                        role: "button",
                        "aria-label": b
                    }).unbind("keydown").bind("keydown", function(a) {
                        var d = a.keyCode || a.which;
                        if (d === 32 || d === 13) c[b](), a.preventDefault()
                    }).unbind("click").bind("click", function(a) {
                        c[b]();
                        a.preventDefault()
                    })
                },
                _getAjaxSrcForImage: function(a) {
                    return a.data("src")
                },
                _reprioritizeImageLoadingIfRequired: function(a) {
                    !this._isLoaded(a) && this._cssilLoader && !this._cssilLoader.isQueueEmpty() && (a = b(this.slides.$element[a]), this._cssilLoader.reprioritize(this._getAjaxSrcForImage(a.is("img") ?
                        a : a.find("img")), this.isPlaying()))
                },
                _bpActivate: function() {
                    this.slides.bind("wp-panel-show", this._panelShowCallback)
                },
                _bpDeactivate: function() {
                    this.slides.unbind("wp-panel-show").unbind("wp-panel-before-show").unbind("wp-panel-hide").unbind("wp-panel-before-hide");
                    this.unbind("wp-slideshow-play").unbind("wp-slideshow-stop");
                    this.tabs && this.tabs.trigger("wp-panel-hide", {
                        panelIndex: this.slides.activeIndex
                    })
                },
                _attachBehavior: function() {
                    var a = this,
                        b = this.options;
                    this._super.prototype._attachBehavior.call(this);
                    this._panelShowCallback = function() {
                        a._ssTimerTriggered || a.isPlaying() && a._startTimer(!1)
                    };
                    this.$element.addClass(b.slideshowClassName);
                    var h = this.slides ? this.slides.$element : this._findWidgetElements("." + b.slideClassName),
                        g = this.tabs ? this.tabs.$element : this._findWidgetElements("." + b.slideLinkClassName),
                        i = b.event === "click" && b.deactivationEvent === "mouseout_click";
                    if (!this.slides && (this.slides = new c.Widget.PanelGroup(h, {
                                defaultIndex: this.slides && this.slides.activeIndex || b.defaultIndex || 0,
                                toggleStateEnabled: i
                            }),
                            this.slides.bind("wp-panel-show", this._panelShowCallback), this.tabs = null, g.length)) this.tabs = new c.Widget.TabGroup(g, {
                        defaultIndex: this.tabs && this.tabs.activeIndex || b.defaultIndex || 0,
                        toggleStateEnabled: i,
                        contentLayout_runtime: b.contentLayout_runtime
                    }), this.slides.addTabGroup(this.tabs);
                    this.slides.bind("wp-panel-before-show", function(b, f) {
                        a._reprioritizeImageLoadingIfRequired(f.panelIndex)
                    });
                    this._attachBtnHandler(b.firstBtnClassName, "first");
                    this._attachBtnHandler(b.lastBtnClassName, "last");
                    this._attachBtnHandler(b.prevBtnClassName,
                        "previous");
                    this._attachBtnHandler(b.nextBtnClassName, "next");
                    this._attachBtnHandler(b.playBtnClassName, "play");
                    this._attachBtnHandler(b.stopBtnClassName, "stop");
                    this._attachBtnHandler(b.closeBtnClassName, "close");
                    this.bind("wp-slideshow-play", function() {
                        this.$element.addClass(b.playingClassName)
                    });
                    this.bind("wp-slideshow-stop", function() {
                        this.$element.removeClass(b.playingClassName)
                    })
                },
                _first: function() {
                    this.slides.showPanel(0)
                },
                _last: function() {
                    var a = this.slides;
                    a.showPanel(a.$element.length - 1)
                },
                _previous: function() {
                    var a = this.slides,
                        b = a.$element.length,
                        c = a.activeIndex,
                        b = (c < 1 ? b : c) - 1;
                    !this.options.loop && 0 == c ? this.isPlaying() && this.stop() : a.showPanel(b)
                },
                _next: function() {
                    var a = this.slides,
                        b = a.activeIndex,
                        c = (b + 1) % a.$element.length;
                    !this.options.loop && 0 == c ? this.isPlaying() && this.stop() : a.activeIndex != -1 && this.options.playOnce && 0 == c && this.isPlaying() ? this.stop() : (!this.isPlaying() || this._isLoaded(b) && this._isLoaded(c)) && a.showPanel(c)
                },
                _goTo: function() {
                    var a = this.slides;
                    a.showPanel.apply(a, arguments)
                },
                _close: function() {
                    var a = this.slides;
                    a.hidePanel(a.activeElement)
                },
                _isLoaded: function(a) {
                    if (this._csspIsImageSlideShow && (a = b(this.slides.$element[a]), a = a.is("img") ? a : a.find("img"), a.length > 0 && (a.hasClass(this.options.imageIncludeClassName) || !a[0].complete))) return !1;
                    return !0
                }
            })
    })(c, WebPro, window, document);
    (function(b, c, a, f, h) {
        c.Widget.ContentSlideShow.fadingTransitionPlugin = {
            defaultOptions: {
                transitionDuration: 500
            },
            initialize: function(a, f) {
                var c = this;
                b.extend(f, b.extend({}, c.defaultOptions, f));
                a.bind("attach-behavior",
                    function() {
                        c.attachBehavior(a)
                    })
            },
            attachBehavior: function(g) {
                var i = this,
                    k = g.slides,
                    l = k.$element,
                    j = k.activeIndex,
                    m = g._findWidgetElements("." + g.options.viewClassName);
                0 == m.length && g._$sslbpOverlay && (m = b("." + g.options.viewClassName, g._$sslbpOverlay));
                k.bind("wp-panel-show", function(a, f) {
                    i._showElement(g, b(f.panel));
                    Muse.Utils.isStackedOrScatteredLayout(g.options.contentLayout_runtime) && i._showElement(g, g.$closeBtn)
                }).bind("wp-panel-hide", function(a, f) {
                    i._hideElement(g, b(f.panel));
                    Muse.Utils.isStackedOrScatteredLayout(g.options.contentLayout_runtime) &&
                        i._hideElement(g, g.$closeBtn)
                });
                Muse.Utils.isStackedOrScatteredLayout(g.options.contentLayout_runtime) && g.bind("wp-slideshow-close", function() {
                    i._hideElement(g, g.$closeBtn)
                });
                for (var n = 0; n < l.length; n++)
                    if (n !== j) l[n].style.display = "none";
                if (g.options.elastic === "fullWidth") {
                    var q = b(a),
                        o = b(f.body),
                        p = function(a) {
                            a === h && (a = Math.max(q.width(), parseInt(o.css("min-width"))));
                            g.options.contentLayout_runtime !== "lightbox" && m.css("left", m.position().left - m.offset().left);
                            m.width(a);
                            i._showElement(g, b(k.activeElement))
                        };
                    p();
                    for (n = 0; n < l.length; n++) {
                        var r = b(l[n]);
                        r.width("100%");
                        r.addClass("borderbox")
                    }
                    if (g.options.contentLayout_runtime === "lightbox") g._fstpPositionSlides = p;
                    else q.on("orientationchange resize", function() {
                        p()
                    })
                }
                j === -1 && Muse.Utils.isStackedOrScatteredLayout(g.options.contentLayout_runtime) && g.$closeBtn.hide();
                if (Muse.Browser.Features.Touch && g.options.enableSwipe === !0) {
                    m.addClass("horizontalSlideShow");
                    var s = g.options.transitionDuration;
                    g._ftpSwipeNoInterrupt = !1;
                    l.each(function() {
                        var a = b(this);
                        a.data("opacity",
                            a.css("opacity"));
                        var f = Muse.Utils.getCanvasDirection(a, "horizontal"),
                            h = f.dir === "horizontal",
                            j = f.reverse;
                        if (f = a.swipe.defaults.excludedElements) {
                            var f = f.split(/\s*,\s*/),
                                n = f.indexOf("a");
                            if (0 <= n) f.splice(n, 1), a.swipe.defaults.excludedElements = f.join(", ")
                        }
                        a.swipe({
                            triggerOnTouchEnd: !0,
                            allowPageScroll: h ? "vertical" : "horizontal",
                            threshold: 75,
                            swipeStatus: function(b, f, n, m) {
                                if (f == "start") g.stop();
                                else if (f == "move" && (h && (n == "left" || n == "right") || !h && (n == "up" || n == "down"))) !c.hasPointerCapture() && Math.abs(m) >
                                    1 && c.setPointerCapture(a[0], b), i._scrollTo(g, -1, m * (!j && (n == "left" || n == "up") || j && (n == "right" || n == "down") ? 1 : -1), 0);
                                else if (f == "cancel") i._scrollTo(g, g.slides.activeIndex, 0, s), c.releasePointerCapture(a[0], b), g.trigger("wp-swiped");
                                else if (f == "end") {
                                    f = g.slides.activeIndex;
                                    m = -1;
                                    if (h && (n == "right" && !j || n == "left" && j) || !h && (n == "down" && !j || n == "up" && j)) m = f - 1 < 0 ? l.length - 1 : f - 1;
                                    else if (h && (n == "left" && !j || n == "right" && j) || !h && (n == "up" && !j || n == "down" && j)) m = f + 1 > l.length - 1 ? 0 : f + 1;
                                    m != -1 && i._scrollTo(g, m, 0, s);
                                    c.releasePointerCapture(a[0],
                                        b);
                                    g.trigger("wp-swiped")
                                }
                            }
                        })
                    })
                }
            },
            _showElement: function(a, b) {
                var f = !1,
                    c = function() {
                        f || (f = !0, b.show().css("opacity", ""))
                    },
                    d = setTimeout(c, a.options.transitionDuration + 10);
                b.stop(!1, !0).fadeIn(a.options.transitionDuration, function() {
                    clearTimeout(d);
                    c()
                })
            },
            _hideElement: function(a, b) {
                var f = !1,
                    c = function() {
                        f || (f = !0, b.hide().css("opacity", ""))
                    },
                    d = setTimeout(c, a.options.transitionDuration + 10);
                b.stop(!1, !0).fadeOut(a.options.transitionDuration, function() {
                    clearTimeout(d);
                    c()
                })
            },
            _scrollTo: function(a, f, c, d) {
                if (!a._ftpSwipeNoInterrupt) {
                    var h =
                        a.slides.$element,
                        m = a.slides.activeIndex,
                        n = f == -1;
                    f == -1 && (f = c < 0 ? m - 1 < 0 ? h.length - 1 : m - 1 : m + 1 > h.length - 1 ? 0 : m + 1);
                    var q = b(h[m]),
                        o = b(h[f]);
                    if (!n && c == 0 || m == f) {
                        a._ftpSwipeNoInterrupt = !0;
                        var p = 0,
                            r = !1,
                            s = function() {
                                if (!r && (r = !0, o.show().css("opacity", ""), f != m && a.slides.showPanel(f), ++p == h.length)) a._ftpSwipeNoInterrupt = !1
                            };
                        if (o.css("opacity") != o.data("opacity")) {
                            var w = setTimeout(s, d + 10);
                            o.stop(!1, !0).animate({
                                opacity: o.data("opacity")
                            }, d, function() {
                                clearTimeout(w);
                                s()
                            })
                        } else s();
                        h.each(function(c) {
                            var n = b(this),
                                m = !1,
                                k = function() {
                                    if (!m && (m = !0, n.hide().css("opacity", ""), ++p == h.length)) a._ftpSwipeNoInterrupt = !1
                                },
                                q;
                            c != f && (n.css("display") != "none" && n.css("opacity") != 0 ? (q = setTimeout(k, d + 10), n.stop(!1, !0).animate({
                                opacity: 0
                            }, d, function() {
                                clearTimeout(q);
                                k()
                            })) : k())
                        })
                    } else c = Math.abs(c), n = q.width(), c > n && (c = n), c = o.data("opacity") * (c / n), n = q.data("opacity") * (1 - c), q.stop(!1, !0).animate({
                        opacity: n
                    }, d), o.stop(!1, !0).show().animate({
                        opacity: c
                    }, d)
                }
            }
        };
        c.Widget.ContentSlideShow.filmstripTransitionPlugin = {
            defaultOptions: {
                transitionDuration: 500,
                transitionStyle: "horizontal"
            },
            initialize: function(a, f) {
                var c = this;
                b.extend(f, b.extend({}, c.defaultOptions, f));
                a.bind("attach-behavior", function() {
                    c.attachBehavior(a)
                }).bind("bp_activate", function() {
                    c.bpActivate(a)
                }).bind("bp-deactivate", function() {
                    c.bpDeactivate(a)
                })
            },
            bpActivate: function(a) {
                plugin._goToSlide(a, a.slides.activeElement, a.options.transitionDuration)
            },
            bpDeactivate: function(a) {
                a.slides.unbind("wp-panel-show").unbind("wp-panel-hide");
                a.unbind("wp-slideshow-before-previous").unbind("wp-slideshow-before-next").unbind("wp-slideshow-previous").unbind("wp-slideshow-next")
            },
            attachBehavior: function(g) {
                var i = this,
                    k = b(a),
                    l = b(f.body),
                    j = g.options,
                    m = function() {
                        return j.elastic === "fullWidth" ? Math.max(k.width(), parseInt(l.css("min-width"))) : p.width()
                    },
                    n = j.transitionStyle === "horizontal",
                    q = g.slides,
                    o = q.$element,
                    p = g.$clip ? g.$clip : g._findWidgetElements("." + j.clipClassName),
                    r = g.$view ? g.$view : g._findWidgetElements("." + j.viewClassName),
                    s = m(),
                    w = p.height(),
                    y = {
                        left: 1,
                        right: 1
                    },
                    u = {
                        up: 1,
                        down: 1
                    },
                    t = {
                        top: "0",
                        left: "0"
                    };
                g.$clip = p;
                g.$view = r;
                var x = p.css("position");
                x !== "absolute" && x !== "fixed" &&
                    j.elastic !== "fullScreen" && p.css("position", "relative");
                r.css("position") !== "absolute" && (t.position = "relative");
                Muse.Utils.updateSlideshow_fstpOffsetSize(g);
                g._fstp$Clip = p;
                g._fstp$View = r;
                g._fstpStyleProp = n ? "left" : "top";
                g._fstpStylePropZero = n ? "top" : "left";
                q.bind("wp-panel-show", function(a, b) {
                    i._goToSlide(g, b.panel, j.transitionDuration);
                    g.options.contentLayout_runtime === "stack" && (g.$closeBtn.css("opacity", ""), g.$closeBtn.stop(!0).fadeIn(j.transitionDuration))
                });
                g.options.contentLayout_runtime === "stack" &&
                    g.bind("wp-slideshow-close", function() {
                        p.css({
                            opacity: 0.99
                        }).stop(!0).animate({
                            opacity: 0
                        }, {
                            queue: !1,
                            duration: j.transitionDuration,
                            complete: function() {
                                t[g._fstpStyleProp] = (n ? p.width() : p.height()) + "px";
                                t[g._fstpStylePropZero] = "0";
                                r.css(t);
                                p.css({
                                    opacity: ""
                                })
                            }
                        });
                        g.$closeBtn.stop(!0).fadeOut(j.transitionDuration)
                    });
                g._fstpRequestType = null;
                g.bind("wp-slideshow-before-previous wp-slideshow-before-next", function(a) {
                    g._fstpRequestType = a.type.replace(/.*-/, "");
                    g._fstpOldActiveIndex = g.slides.activeIndex
                }).bind("wp-slideshow-previous wp-slideshow-next",
                    function() {
                        g._fstpRequestType = null;
                        g._fstpOldActiveIndex = -1
                    });
                var z = function(a, f) {
                    var c;
                    r.parents().each(function() {
                        c = b(this);
                        c.css("display") == "none" && (c.attr("data-margin-left", c.css("margin-left")), c.css("margin-left", "-10000px"), c.css("display", "block"), c.attr("data-display-attr-change", "true"))
                    });
                    if (a === h || f === h) a = m(), f = p.height();
                    j.elastic === "fullWidth" && (f = p.height(), p.width(a), j.contentLayout_runtime !== "lightbox" && p.css("left", p.position().left - p.offset().left), r.width(a));
                    for (var d = 0, l = n ?
                            a : f, k = g._fstpStyleProp, u = g._fstpStylePropZero, v = 0; v < o.length; v++) {
                        var x = o[v].style;
                        x[u] = "0";
                        x[k] = d + "px";
                        x.margin = "0";
                        x.position = "absolute";
                        d += l
                    }
                    i._goToSlide(g, q.activeElement, 0);
                    j.elastic === "off" && (t[n ? "width" : "height"] = n && j.isResponsive ? "100%" : d + "px", t[n ? "height" : "width"] = n ? w + "px" : j.isResponsive ? "100%" : s + "px");
                    r.parents().each(function() {
                        c = b(this);
                        c.attr("data-display-attr-change") == "true" && (c.css("display", ""), c.css("display") != "none" && c.css("display", "none"), c.css("margin-left", ""), c.css("margin-left") !=
                            c.attr("data-margin-left") && c.css("margin-left", c.attr("data-margin-left")), c.removeAttr("data-display-attr-change"), c.removeAttr("data-margin-left"))
                    });
                    return d
                };
                z();
                if (j.elastic === "fullWidth")
                    for (x = 0; x < o.length; x++) {
                        var v = b(o[x]);
                        v.width("100%");
                        v.addClass("borderbox")
                    }
                g._fstpPositionSlides = z;
                k.on("orientationchange resize", function() {
                    z()
                });
                if (g.$element.attr("data-inside-lightbox") === "true" || Muse.Utils.widgetInsideLightbox(g.$element.parents(".PamphletWidget"))) g.$element.attr("data-inside-lightbox",
                    "true"), k.on("lightboxresize", function() {
                    z()
                });
                q.activeElement || (t[g._fstpStyleProp] = (n ? s : w) + "px", t[g._fstpStylePropZero] = "0", g.options.contentLayout_runtime === "stack" && g.$closeBtn.hide());
                t.overflow = "visible";
                r.css(t);
                i._goToSlide(g, q.activeElement, j.transitionDuration);
                Muse.Browser.Features.Touch && g.options.enableSwipe === !0 && (b(this), n ? r.addClass("horizontalSlideShow") : r.addClass("verticalSlideShow"), r.swipe({
                    triggerOnTouchEnd: !0,
                    allowPageScroll: n ? "vertical" : "horizontal",
                    threshold: 75,
                    swipeStatus: function(a,
                        b, f, h) {
                        var l = Muse.Utils.getCanvasDirection(r, j.transitionStyle).reverse,
                            l = !l && (f == "left" || f == "up") || l && (f == "right" || f == "down") ? 1 : -1;
                        switch (b) {
                            case "start":
                                g.stop();
                                break;
                            case "move":
                                if (n && f in y || !n && f in u) !c.hasPointerCapture() && Math.abs(h) > 1 && c.setPointerCapture(r[0], a), i._scrollBy(g, h * l);
                                break;
                            case "cancel":
                                i._goToSlide(g, q.activeElement, 0);
                                c.releasePointerCapture(r[0], a);
                                g.trigger("wp-swiped");
                                break;
                            case "end":
                                i._finalizeSwipe(g, g._fstpOffsetSize * g.slides.activeIndex + h * l, l, f), c.releasePointerCapture(r[0],
                                    a)
                        }
                    }
                }))
            },
            _scrollBy: function(a, b) {
                var f = a._fstp$View,
                    c = a.slides.activeIndex * -a._fstpOffsetSize,
                    d = a._fstpStyleProp,
                    h = {};
                f.stop(!1, !0);
                h[d] = c - b + "px";
                f.css(h)
            },
            _finalizeSwipe: function(a, b, f) {
                var c = a.slides,
                    d = a._fstp$View,
                    h = b / a._fstpOffsetSize,
                    b = a._fstpStyleProp,
                    n = {},
                    h = f === 1 ? Math.ceil(h) : Math.floor(h),
                    h = Math.max(0, Math.min(h, c.$element.length - 1));
                n[b] = -(h * a._fstpOffsetSize) + "px";
                d.animate(n, a.options.transitionDuration, function() {
                    c.showPanel(h);
                    a.trigger("wp-swiped")
                })
            },
            _goToSlide: function(a, f, c) {
                if (a) {
                    var d =
                        b(f),
                        h = a._fstp$View,
                        m = a._fstpStyleProp,
                        n = m === "left" ? "offsetLeft" : "offsetTop",
                        q = m === "left" ? "offsetWidth" : "offsetHeight",
                        o = f ? -f[n] : a._fstp$Clip[0][q],
                        p = {};
                    p[m] = o + "px";
                    var r = a._fstpRequestType,
                        s = a._fstpOldActiveIndex;
                    if (r && s !== -1) {
                        var w = a.slides.activeIndex,
                            y = a.slides.$element.length - 1;
                        if (w !== s) {
                            var u = 0;
                            r === "previous" && s === 0 && w === y ? u = -f[q] : r === "next" && s === y && w === 0 && (a = a.slides.$element[s], u = a[n] + a[q]);
                            u && (p[m] = -u + "px", d.css(m, u + "px"))
                        }
                    }
                    h.stop(!1, !0).animate(p, c, function() {
                        u && (d.css(m, -o + "px"), h.css(m,
                            o + "px"))
                    })
                }
            }
        };
        c.Widget.ContentSlideShow.alignPartsToPagePlugin = {
            defaultOptions: {
                alignPartToPageClassName: "wp-slideshow-align-part-to-page"
            },
            initialize: function(a, f) {
                var c = this;
                b.extend(f, b.extend({}, c.defaultOptions, f));
                a.bind("attach-behavior", function() {
                    c.attachBehavior(a)
                })
            },
            attachBehavior: function(f) {
                if (!("fullWidth" !== f.options.elastic || !f.$element.hasClass("align_parts_to_page") || "fixed" !== f.$element.css("position") || f.options.contentLayout_runtime === "lightbox")) {
                    var c = b(a),
                        d = b("#page"),
                        h = f.options,
                        j = function() {
                            var a = d.offset().left + "px";
                            b("." + h.alignPartToPageClassName, f.$element).each(function() {
                                b(this).css("margin-left", a)
                            })
                        };
                    f.$element.children().each(function() {
                        var a = b(this);
                        0 < b("." + h.viewClassName, a).length || a.addClass(h.alignPartToPageClassName)
                    });
                    j();
                    c.on("orientationchange resize", function() {
                        j()
                    })
                }
            }
        };
        c.Widget.ContentSlideShow.slideImageIncludePlugin = {
            defaultOptions: {
                imageIncludeClassName: "wp-slideshow-slide-image-include",
                slideLoadingClassName: "wp-slideshow-slide-loading"
            },
            initialize: function(a,
                f) {
                var h = this;
                b.extend(f, b.extend({}, h.defaultOptions, f));
                a._cssilLoader = new c.ImageLoader;
                a.bind("attach-behavior", function() {
                    h._attachBehavior(a)
                })
            },
            _attachBehavior: function(a) {
                var f = this,
                    c = a._cssilLoader,
                    d, h = a._findWidgetElements("." + a.options.slideClassName);
                d = a._findWidgetElements("." + a.options.slideLinkClassName);
                for (var m = h.length, n = "." + a.options.imageIncludeClassName, q = a.options.slideLoadingClassName, o = function(b, c, d, h) {
                        f._handleImageLoad(a, b, c, d, h)
                    }, p = 0; p < m; p++) {
                    var r = h.eq(a._shuffleArray ?
                            a._shuffleArray[p] : p),
                        s = r.is("img") ? r : r.find(n),
                        w = s[0],
                        y, u, t;
                    d.length && (y = b(d[p]), u = y.is("img") ? y : y.find(n), t = u[0]);
                    var x = function(b, f, d) {
                        if (d) {
                            var h = a._getAjaxSrcForImage(f) || d.href;
                            if (h) f = {
                                width: f.data("width"),
                                height: f.data("height"),
                                $ele: f,
                                $slide: b,
                                slideshow: a
                            }, d.style.visibility = "hidden", c.add(h, {
                                callback: o,
                                data: f
                            }), b.addClass(q)
                        }
                    };
                    x(r, s, w);
                    d.length && x(y, u, t)
                }
                a._cssilLoader.start()
            },
            _handleImageLoad: function(a, f, c, d, j) {
                var m = j.$ele,
                    n = m[0];
                n.src = f;
                if (a.options.elastic !== "off" && b(n).closest(".SSSlideLink").length !=
                    1) m.data("imageWidth", c), m.data("imageHeight", d), a._csspPositionImage(n, a.options.heroFitting, a.options.elastic, c, d);
                else if (b(n).attr("data-heightwidthratio") == h) n.width = j.width || c, n.height = j.height || d;
                n.style.visibility = "";
                m.removeClass(a.options.imageIncludeClassName);
                j.$slide.removeClass(a.options.slideLoadingClassName);
                a.isPlaying() && a.slides.$element[a.slides.activeIndex] == j.$slide[0] && a._startTimer(!1)
            }
        };
        c.Widget.ContentSlideShow.shufflePlayPlugin = {
            defaultOptions: {
                randomDefaultIndex: !0
            },
            initialize: function(a,
                f) {
                var c = this;
                b.extend(f, b.extend({}, c.defaultOptions, f));
                a._shuffleArray = [];
                a._shuffleNextDict = {};
                a._realNext = a._next;
                a._next = function() {
                    c._handleNext(a)
                };
                a._shufflePlayCount = 1;
                a.bind("before-attach-behavior", function() {
                    c._reshuffle(a);
                    if (f.randomDefaultIndex && typeof f.defaultIndex === "undefined") a.options.defaultIndex = a._shuffleArray[0]
                })
            },
            _fisherYatesArrayShuffle: function(a) {
                if (a && a.length)
                    for (var b = a.length; --b;) {
                        var f = Math.floor(Math.random() * (b + 1)),
                            c = a[f];
                        a[f] = a[b];
                        a[b] = c
                    }
            },
            _reshuffle: function(a) {
                var b =
                    a._shuffleArray,
                    f = {},
                    c = a.slides ? a.slides.$element.length : a._findWidgetElements("." + a.options.slideClassName).length;
                if (b.length !== c)
                    for (var d = b.length = 0; d < c; d++) b[d] = d;
                this._fisherYatesArrayShuffle(b);
                for (d = 0; d < c; d++) f[b[d]] = b[(d + 1) % c];
                a._shuffleNextDict = f;
                a._shufflePlayCount = 1
            },
            _handleNext: function(a) {
                if (a.isPlaying()) {
                    var b = a.slides.activeIndex,
                        f = a._shuffleNextDict[b] || 0;
                    a._isLoaded(b) && a._isLoaded(f) && (a._goTo(f), ++a._shufflePlayCount >= a.slides.$element.length && (this._reshuffle(a), (!a.options.loop ||
                        a.options.playOnce) && a.stop()))
                } else a._realNext()
            }
        }
    })(c, WebPro, window, document);
    (function(b, d, a) {
        d.widget("Widget.Form", d.Widget, {
            _widgetName: "form",
            defaultOptions: {
                validationEvent: "blur",
                errorStateSensitivity: "low",
                ajaxSubmit: !0,
                fieldWrapperClass: "field",
                formErrorClass: "form-error",
                formSubmittedClass: "form-submitted",
                formDeliveredClass: "form-delivered",
                focusClass: "focus",
                notEmptyClass: "not-empty",
                emptyClass: "empty",
                validClass: "valid",
                invalidClass: "invalid",
                requiredClass: "required"
            },
            validationTypes: {
                "always-valid": /.*/,
                email: /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
                alpha: /^[A-z\s]+$/,
                numeric: /^[0-9]+$/,
                phone: /^([0-9])?(\s)?(\([0-9]{3}\)|[0-9]{3}(\-)?)(\s)?[0-9]{3}(\s|\-)?[0-9]{4}(\s|\sext|\sx)?(\s)?[0-9]*$/,
                captcha: function(a) {
                    return a.data("captchaValid")
                },
                recaptcha: function() {
                    if ("undefined" == typeof Recaptcha) return !1;
                    var a = Recaptcha.get_response();
                    return a && 0 < a.length
                },
                recaptcha2: function(a) {
                    if ("undefined" != typeof reCaptchaV2Manager) {
                        a =
                            b("input[type=hidden]", a);
                        if (1 != a.length) return !1;
                        a = a.attr("data-recaptcha-id");
                        return reCaptchaV2Manager.isInstanceVerified(a)
                    } else if ("undefined" != typeof grecaptcha && "undefined" != typeof muReCAPTCHA2Instances) return a = muReCAPTCHA2Instances[a.attr("id")], (a = grecaptcha.getResponse(a)) && 0 < a.length;
                    return !1
                },
                checkbox: function() {
                    return !0
                },
                checkboxgroup: function() {
                    return !0
                },
                radio: function() {
                    return !0
                },
                radiogroup: function() {
                    return !0
                },
                time: function(a) {
                    var a = a.find("input, textarea"),
                        b = a.val().replace(/[^0-9:APM]/g,
                            "");
                    if (b.indexOf(":") != -1 && b.match(/:/).length == 1) {
                        var c = b.split(":"),
                            d = parseInt(c[0]),
                            c = parseInt(c[1]);
                        if (d < 0 || d > 24) return !0;
                        if (c < 0 || c > 59) return !0
                    } else return !1;
                    a.val(b);
                    return !0
                }
            },
            _transformMarkup: function() {
                var a = this;
                a.hasCAPTCHA = !1;
                a.hasReCAPTCHA = !1;
                a.hasReCAPTCHA2 = !1;
                this.$element.find("." + this.options.fieldWrapperClass).each(function() {
                    var c = b(this);
                    switch (c.attr("data-type")) {
                        case "captcha":
                            a.hasCAPTCHA = !0;
                            c.find('input[name="CaptchaV2"]').remove();
                            c.find('input[name="muse_CaptchaV2"]').attr("name",
                                "CaptchaV2");
                            break;
                        case "recaptcha":
                            a.hasReCAPTCHA = !0;
                            break;
                        case "recaptcha2":
                            a.hasReCAPTCHA2 = !0
                    }
                })
            },
            _extractData: function() {
                this.event = this.options.validationEvent;
                this.errorSensitivity = this.options.errorStateSensitivity;
                this.classNames = {
                    focus: this.options.focusClass,
                    blur: this.options.emptyClass,
                    keydown: this.options.notEmptyClass
                }
            },
            _isEmpty: function(a) {
                var c = a.find('input[type!="hidden"], textarea');
                switch (a.data("type")) {
                    case "checkboxgroup":
                    case "radiogroup":
                        return c = c.attr("name"), b('input[name="' +
                            c + '"]:checked').length == 0;
                    case "checkbox":
                    case "radio":
                        return typeof c.attr("checked") === "undefined";
                    default:
                        var a = !0,
                            d;
                        for (d = 0; d < c.length; d++) {
                            var i = b(c[d]);
                            if (!(i.is("input") && i.css("display") == "none")) {
                                a = i.val() == "";
                                break
                            }
                        }
                        return a
                }
            },
            _getGroupField: function(a) {
                switch (a.data("type")) {
                    case "radio":
                        return a.parent().closest("." + this.options.fieldWrapperClass).filter(function() {
                            return "radiogroup" == b(this).data("type")
                        });
                    case "checkbox":
                        return a.parent().closest("." + this.options.fieldWrapperClass).filter(function() {
                            return "checkboxgroup" ==
                                b(this).data("type")
                        })
                }
                return null
            },
            _updateReCaptchaChallenge: function() {
                var a = b("#recaptcha_response_field", this.$element);
                if (0 != a.length) {
                    if (0 == b("#recaptcha_challenge_field_holder", a.parent()).length) {
                        var c = b("#recaptcha_challenge_field_holder");
                        a.before(c)
                    }
                    for (var a = b("#recaptcha_image", this.$element), c = ["#ReCaptchaV2", "#ReCaptchaAnswer", "#ReCaptchaChallenge"], d = 0; d < c.length; d++)
                        if (0 == b(c[d], a).length) {
                            var i = b(c[d]);
                            a.after(i)
                        }
                }
            },
            _attachBehavior: function() {
                var a = this;
                if (this._bpID = this.$element.closest(".breakpoint").attr("id")) b("body").on("muse_bp_activate",
                    function(b, c, d) {
                        a._bpID == d.attr("id") && a._updateReCaptchaChallenge()
                    }), this._updateReCaptchaChallenge();
                this.$element.find("." + this.options.fieldWrapperClass).each(function() {
                    var c = b(this);
                    a._isEmpty(c) || c.find("input, textarea").each(function() {
                        b(this).removeClass(a.options.emptyClass)
                    });
                    c.attr("data-type") == "captcha" && (c.data("captchaValid", !1), c.find('input[name="CaptchaV2"]').keyup(function() {
                        var d = b(this).val(),
                            i = c.find('input[name="CaptchaHV2"]').val();
                        a._validateCaptcha(i, d, function(b) {
                            c.data("captchaValid",
                                b);
                            c.data("error-state") && a.errorSensitivity == "high" && a._validate(c)
                        })
                    }));
                    a._isEmpty(c) || c.addClass(a.classNames.keydown)
                });
                this.$element.find("input, textarea").bind("focus blur keydown change propertychange", function(c) {
                    var d = a.classNames[c.type],
                        i = a.classNames.focus,
                        k = a.classNames.keydown,
                        l = a.classNames.blur,
                        j = b(this).closest("." + a.options.fieldWrapperClass),
                        m = a._getGroupField(j);
                    switch (c.type) {
                        case "focus":
                            j.addClass(d).removeClass(l);
                            break;
                        case "keydown":
                            "checkbox" != j.data("type") && "radio" !=
                                j.data("type") && j.addClass(d).removeClass(l);
                            break;
                        case "blur":
                            j.removeClass(i);
                            a._isEmpty(j) && j.addClass(d).removeClass(k);
                            m && a._isEmpty(m) && m.addClass(d).removeClass(k);
                            break;
                        case "change":
                        case "propertychange":
                            "radio" == j.data("type") && m.find("." + a.options.fieldWrapperClass).removeClass(k), a._isEmpty(j) ? j.addClass(l).removeClass(k) : j.addClass(k).removeClass(l), m && (a._isEmpty(m) ? m.addClass(l).removeClass(k) : m.addClass(k).removeClass(l))
                    }
                });
                switch (this.event) {
                    case "blur":
                    case "keyup":
                        this.$element.find("." +
                            this.options.fieldWrapperClass + " input, ." + this.options.fieldWrapperClass + " textarea").bind(this.event, function() {
                            a._validate(b(this).closest("." + a.options.fieldWrapperClass))
                        });
                    case "submit":
                        this.$element.submit(function(c) {
                            var d = !0,
                                i = a.$element.find("." + a.options.fieldWrapperClass).length - 1;
                            a.$element.find("." + a.options.fieldWrapperClass).each(function(k) {
                                if ((d = a._validate(b(this)) ? d : !1) && k == i)
                                    if (a.options.ajaxSubmit) c.preventDefault(), a._submitForm();
                                    else {
                                        var k = b("#ReCaptchaAnswer", a.$element),
                                            l = b("#ReCaptchaChallenge", a.$element);
                                        a.hasReCAPTCHA && 1 == k.length && 1 == l.length && (k.val(Recaptcha.get_response()), l.val(Recaptcha.get_challenge()))
                                    }
                                d || c.preventDefault()
                            });
                            b("." + a.options.fieldWrapperClass, a.$element).each(function() {
                                var a = b(this);
                                a.attr("data-type") == "email" && (a = a.find("input, textarea"), a.val() == "no.reply@example.com" && a.val(""))
                            })
                        })
                }
            },
            _validateCaptcha: function(a, c, d) {
                c.length != 6 ? d(!1) : b.get("/ValidateCaptcha.ashx", {
                    key: a,
                    answer: c
                }, function(a) {
                    d(a == "true")
                })
            },
            _validateReCaptcha: function(a,
                c) {
                b.get("/ValidateCaptcha.ashx", {
                    key: Recaptcha.get_challenge(),
                    answer: Recaptcha.get_response(),
                    imageVerificationType: "recaptcha"
                }, function(b) {
                    b == "true" ? a() : c()
                })
            },
            _submitForm: function() {
                var a = this,
                    c = b("#ReCaptchaAnswer", a.$element),
                    d = b("#ReCaptchaChallenge", a.$element);
                a.hasReCAPTCHA && 1 == c.length && 1 == d.length ? (c.val(Recaptcha.get_response()), d.val(Recaptcha.get_challenge()), a._validateReCaptcha(function() {
                    a._submitFormInternal()
                }, function() {
                    b("." + a.options.fieldWrapperClass, a.$element).each(function() {
                        var c =
                            b(this);
                        c.attr("data-type") == "recaptcha" && a._switchState("invalid", c)
                    });
                    Recaptcha.reload()
                })) : a._submitFormInternal()
            },
            _submitFormInternal: function() {
                var f = this,
                    d = this.options.formSubmittedClass,
                    g = this.options.formDeliveredClass,
                    i = this.options.formErrorClass,
                    k = d + " " + g + " " + i,
                    l = this.$element.find("input[type=submit], button");
                b.ajax({
                    url: this.$element.attr("action"),
                    type: "post",
                    data: this.$element.serialize(),
                    beforeSend: function() {
                        f.$element.removeClass(k);
                        f.$element.addClass(d);
                        f.$element.find("." +
                            f.options.fieldWrapperClass).removeClass(f.options.focusClass);
                        l.attr("disabled", "disabled")
                    },
                    complete: function(j) {
                        j && (j.status >= 400 || j.responseText && j.responseText.indexOf("<?php") >= 0) && alert("Form PHP script is missing from web server, or PHP is not configured correctly on your web hosting provider. Check if the form PHP script has been uploaded correctly, then contact your hosting provider about PHP configuration.");
                        f.$element.removeClass(d);
                        var m = null;
                        if (j && j.responseText) try {
                            m = c.parseJSON(j.responseText),
                                m = m.FormProcessV2Response || m.FormResponse || m.MusePHPFormResponse || m
                        } catch (n) {}
                        if (m && m.success) {
                            f.$element.addClass(g);
                            if (m.redirect) {
                                a.location.href = m.redirect;
                                return
                            }
                            f.$element[0].reset();
                            f.hasCAPTCHA && f.$element.find("input:not([type=submit]), textarea").each(function() {
                                b(this).attr("disabled", "disabled")
                            });
                            f.$element.find("." + f.options.notEmptyClass).each(function() {
                                b(this).removeClass(f.options.notEmptyClass)
                            })
                        } else if (j = f._getFieldsWithError(m))
                            for (m = 0; m < j.length; m++) f._switchState("invalid",
                                j[m]);
                        else f.$element.addClass(i);
                        f.hasCAPTCHA || l.removeAttr("disabled");
                        f.hasReCAPTCHA && Recaptcha.reload();
                        f.hasReCAPTCHA2 && ("undefined" != typeof reCaptchaV2Manager ? reCaptchaV2Manager.reloadControls() : "undefined" != typeof grecaptcha && "undefined" != typeof muReCAPTCHA2Instances && b("[data-type=recaptcha2]", f.$element).each(function() {
                            var a = muReCAPTCHA2Instances[b(this).attr("id")];
                            grecaptcha.reset(a)
                        }))
                    }
                })
            },
            _getFieldsWithError: function(a) {
                if (!a || !a.error || !a.error.fields || !a.error.fields.length) return null;
                for (var c = [], d = 0; d < a.error.fields.length; d++) {
                    var i = b('[name="' + a.error.fields[d].field + '"]', this.$element).parents("." + this.options.fieldWrapperClass);
                    1 == i.length && c.push(i)
                }
                return c
            },
            _validate: function(a) {
                var b = a.attr("data-type") || "always-valid",
                    c = a.find("input, textarea"),
                    d = this.validationTypes[b],
                    k = a.attr("data-required") === "true",
                    l = this._isEmpty(a),
                    d = d instanceof RegExp ? Boolean(c.val().match(d)) : d(a);
                if (k && l) return this._switchState("required", a);
                b == "email" && l && c.val("no.reply@example.com");
                if (!d && (k || !l)) return this._switchState("invalid", a);
                return this._switchState("valid", a)
            },
            _switchState: function(a, c) {
                var d = c.attr("data-type"),
                    i = this.options.validClass,
                    k = this.options.invalidClass,
                    l = this.options.requiredClass,
                    j = this,
                    m = function(a) {
                        var a = b(a.target),
                            f;
                        a.length && (f = a.closest("." + j.options.fieldWrapperClass));
                        f && f.length && j._validate(f)
                    };
                c.removeClass(i + " " + k + " " + l);
                if (a == "required" || a == "invalid") return a == "invalid" ? c.addClass(k) : c.addClass(l), "recaptcha" != d && this.errorSensitivity != "low" &&
                    (i = this.errorSensitivity == "high" ? "keyup" : "blur", c.data("error-state") || (c.data("error-state", !0), c.find("input, textarea").bind(i, m))), !1;
                c.data("error-state") && (this.errorSensitivity == "high" ? this.event != "keyup" && c.data("error-state", !1).find("input, textarea").unbind("keyup", m) : this.errorSensitivity == "medium" && this.event != "blur" && c.data("error-state", !1).find("input, textarea").unbind("blur", m));
                if ("checkbox" == d || "radio" == d)
                    if ((m = this._getGroupField(c)) && m.hasClass(l)) {
                        c.addClass(l);
                        return
                    }
                c.addClass(i);
                return !0
            }
        });
        b.fn.wpForm = function(a) {
            new d.Widget.Form(this, a);
            return this
        }
    })(c, WebPro, window, document)
});;
(function() {
    if (!("undefined" == typeof Muse || "undefined" == typeof Muse.assets)) {
        var c = function(a, b) {
            for (var c = 0, d = a.length; c < d; c++)
                if (a[c] == b) return c;
            return -1
        }(Muse.assets.required, "webpro.js");
        if (-1 != c) {
            Muse.assets.required.splice(c, 1);
            for (var c = document.getElementsByTagName("meta"), b = 0, d = c.length; b < d; b++) {
                var a = c[b];
                if ("generator" == a.getAttribute("name")) {
                    "2018.1.0.386" != a.getAttribute("content") && Muse.assets.outOfDate.push("webpro.js");
                    break
                }
            }
        }
    }
})();