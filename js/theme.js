/*!
* Jacob's Portfolio v1.6 - A GitHub Pages Project
* Last Modified July 2026 | This Source Code is Free for re-use
* Licensed under MIT (https://github.com/jacobdjwilson/jacobdjwilson.github.io/blob/main/LICENSE)
*/

(function () {
    "use strict";

    var STORAGE_KEY = "portfolio-theme";
    var THEMES = ["win95", "geocities", "8bit", "terminal"]; // "default" = no class

    var FONT_URLS = {
        "8bit": "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
    };

    function ensureFontLoaded(theme) {
        var url = FONT_URLS[theme];
        if (!url) return;
        if (document.querySelector('link[data-theme-font="' + theme + '"]')) return;
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        link.setAttribute("data-theme-font", theme);
        document.head.appendChild(link);
    }

    function clearDecorations() {
        var taskbar = document.getElementById("win95-taskbar");
        if (taskbar) taskbar.remove();
        var marquee = document.getElementById("geocities-marquee-wrap");
        if (marquee) marquee.remove();
        if (window._win95ClockInterval) {
            clearInterval(window._win95ClockInterval);
            window._win95ClockInterval = null;
        }
    }

    function addWin95Taskbar() {
        var bar = document.createElement("div");
        bar.id = "win95-taskbar";
        bar.className = "win95-taskbar";
        bar.innerHTML =
            '<span class="win95-start-btn"><i class="fa-brands fa-windows" aria-hidden="true"></i> Start</span>' +
            '<span class="win95-taskbar-clock" id="win95-clock"></span>';
        document.body.appendChild(bar);

        function tick() {
            var el = document.getElementById("win95-clock");
            if (!el) return;
            var now = new Date();
            var h = now.getHours() % 12 || 12;
            var m = String(now.getMinutes()).padStart(2, "0");
            var ampm = now.getHours() >= 12 ? "PM" : "AM";
            el.textContent = h + ":" + m + " " + ampm;
        }
        tick();
        window._win95ClockInterval = setInterval(tick, 1000 * 15);
    }

    function addGeocitiesMarquee() {
        var nav = document.getElementById("mainNav");
        var wrap = document.createElement("div");
        wrap.id = "geocities-marquee-wrap";
        wrap.className = "geocities-marquee-wrap";
        wrap.innerHTML =
            '<span class="geocities-marquee">🚧 UNDER CONSTRUCTION &mdash; BEST VIEWED IN NETSCAPE NAVIGATOR AT 800x600 &mdash; ' +
            'THANKS FOR VISITING MY HOMEPAGE! &mdash; SIGN MY GUESTBOOK! 🚧&nbsp;&nbsp;&nbsp;&nbsp;</span>';
        if (nav && nav.parentNode) {
            nav.parentNode.insertBefore(wrap, nav.nextSibling);
        } else {
            document.body.insertBefore(wrap, document.body.firstChild);
        }
    }

    function applyTheme(theme, persist) {
        var body = document.body;

        THEMES.forEach(function (t) {
            body.classList.remove("theme-" + t);
        });
        clearDecorations();

        if (theme && theme !== "default") {
            body.classList.add("theme-" + theme);
            ensureFontLoaded(theme);

            if (theme === "win95") addWin95Taskbar();
            if (theme === "geocities") addGeocitiesMarquee();
        }

        if (persist) {
            try {
                localStorage.setItem(STORAGE_KEY, theme || "default");
            } catch (e) {
                /* localStorage unavailable - theme just won't persist */
            }
        }

        updateActiveMenuItem(theme || "default");
    }

    function updateActiveMenuItem(theme) {
        var options = document.querySelectorAll(".theme-option");
        options.forEach(function (opt) {
            if (opt.getAttribute("data-theme") === theme) {
                opt.classList.add("active");
            } else {
                opt.classList.remove("active");
            }
        });
    }

    function init() {
        var options = document.querySelectorAll(".theme-option");
        options.forEach(function (opt) {
            opt.addEventListener("click", function (e) {
                e.preventDefault();
                var theme = opt.getAttribute("data-theme");
                applyTheme(theme, true);
            });
        });

        var saved = "default";
        try {
            saved = localStorage.getItem(STORAGE_KEY) || "default";
        } catch (e) {
            /* localStorage unavailable - fall back to default theme */
        }
        applyTheme(saved, false);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();