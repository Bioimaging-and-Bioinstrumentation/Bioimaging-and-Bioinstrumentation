/*
 Copyright 2011-2016 Adobe Systems Incorporated. All Rights Reserved.
*/
(function(c) {
    "function" === typeof define && define.amd && define.amd.jQuery ? define(["jquery", "webpro", "museutils"], c) : c(jQuery)
})(function(c) {
    Muse.Plugins.TabbedPanelsPlugin = {
        defaultOptions: {
            widgetClassName: "TabbedPanelsWidget",
            tabClassName: "TabbedPanelsTab",
            tabHoverClassName: "TabbedPanelsTabHover",
            tabDownClassName: "TabbedPanelsTabDown",
            tabActiveClassName: "TabbedPanelsTabSelected",
            panelClassName: "TabbedPanelsContent",
            panelActiveClassName: "TabbedPanelsContentVisible",
            defaultIndex: 0,
            canCloseAll: !1
        },
        initialize: function(b,
            d) {
            var a = this;
            c.extend(d, c.extend({}, a.defaultOptions, d));
            WebPro.Widget.Disclosure.DisplayPropertyTransitionPlugin.initialize(b, d);
            b.bind("attach-behavior", function() {
                a._attachBehavior(b)
            })
        },
        _attachBehavior: function(b) {
            var c = b.tabs ? b.tabs.$element : null;
            if (c) {
                c.first().addClass("TabbedPanelsTabFirst");
                c.last().addClass("TabbedPanelsTabLast");
                if (b.options.event !== "click") c.on(b.options.event, function() {
                    b.tabs.selectTab(this)
                });
                Muse.Utils.setPageToMaxWidth();
                this._setMinWidth(b.$element, !1);
                Muse.Utils.resetPageWidth();
                b.$element.attr("data-visibility") == "changed" && (b.$element.css("visibility", ""), b.$element.removeAttr("data-visibility"))
            }
        },
        _setMinWidth: function(b) {
            if (b.attr("data-sizePolicy") !== "fixed") {
                var c = Muse.Utils.getMinWidthForElement(b);
                c > 0 && b.css("min-width", c)
            }
        }
    };
    Muse.Plugins.AccordionPlugin = {
        defaultOptions: {
            widgetClassName: "AccordionWidget",
            tabClassName: "AccordionPanelTab",
            tabHoverClassName: "AccordionPanelTabHover",
            tabDownClassName: "AccordionPanelTabDown",
            tabActiveClassName: "AccordionPanelTabOpen",
            panelClassName: "AccordionPanelContent",
            panelActiveClassName: "AccordionPanelContentActive",
            defaultIndex: 0,
            canCloseAll: !1,
            transitionDirection: "vertical"
        },
        initialize: function(b, d) {
            var a = this;
            c.extend(d, c.extend({}, a.defaultOptions, d));
            d.toggleStateEnabled = d.canCloseAll;
            WebPro.Widget.Disclosure.AccordionTransitionPlugin.initialize(b, d);
            b.bind("transform-markup", function() {
                a._transformMarkup(b)
            });
            b.bind("attach-behavior", function() {
                a._attachBehavior(b)
            })
        },
        _transformMarkup: function(b) {
            var d = b.$element[0],
                a = b.options,
                f = a.transitionDirection ===
                "vertical";
            b.$element.data("initialized") || (b.$element.data("initialized", !0), WebPro.scopedFind(d, ".AccordionPanelContent", a.widgetClassName, d).each(function() {
                var a = c(this),
                    b = !f ? parseInt(a.css("left")) : 0;
                a.removeClass(f ? "AccordionPanelContent colelem" : "AccordionPanelContent grpelem").wrap(f ? '<div class="AccordionPanelContent colelem"><div class="AccordionPanelContentClip"></div></div>' : '<div class="AccordionPanelContent grpelem"><div class="AccordionPanelContentClip"></div></div>').closest(".AccordionPanelContent").css({
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    left: b + "px"
                });
                f || a.css({
                    left: "0px",
                    marginRight: "0px"
                })
            }))
        },
        _attachBehavior: function(b) {
            var d = b.$element[0],
                a = b.options,
                f = 0,
                h = a.transitionDirection === "vertical",
                g = h ? "offsetWidth" : "offsetHeight",
                j = h ? "width" : "height",
                l = 0;
            WebPro.scopedFind(d, ".AccordionPanel", a.widgetClassName, d).each(function() {
                f = f < this[g] ? this[g] : f
            }).each(function() {
                f > this[g] && (this.style[j] = f + "px");
                if (!h) {
                    var b = c(this);
                    b.css({
                        width: "auto",
                        marginRight: "0px",
                        left: l + "px"
                    });
                    l += b.children("." + a.tabClassName).outerWidth()
                }
            });
            Muse.Utils.setPageToMaxWidth();
            this._setMinWidth(b.$element, !1);
            Muse.Utils.resetPageWidth();
            b.$element.attr("data-visibility") == "changed" && (b.$element.css("visibility", ""), b.$element.removeAttr("data-visibility"))
        },
        _setMinWidth: function(b) {
            if (b.attr("data-sizePolicy") !== "fixed") {
                var c = Muse.Utils.getMinWidthForElement(b);
                c > 0 && b.css("min-width", c)
            }
        }
    };
    WebPro.Widget.TabbedPanels.prototype.defaultPlugins = [Muse.Plugins.TabbedPanelsPlugin];
    WebPro.Widget.Accordion.prototype.defaultPlugins = [Muse.Plugins.AccordionPlugin]
});;
(function() {
    if (!("undefined" == typeof Muse || "undefined" == typeof Muse.assets)) {
        var c = function(a, b) {
            for (var c = 0, d = a.length; c < d; c++)
                if (a[c] == b) return c;
            return -1
        }(Muse.assets.required, "musewpdisclosure.js");
        if (-1 != c) {
            Muse.assets.required.splice(c, 1);
            for (var c = document.getElementsByTagName("meta"), b = 0, d = c.length; b < d; b++) {
                var a = c[b];
                if ("generator" == a.getAttribute("name")) {
                    "2018.1.0.386" != a.getAttribute("content") && Muse.assets.outOfDate.push("musewpdisclosure.js");
                    break
                }
            }
        }
    }
})();