(function () {
    "use strict";

    var THEMES = ["win95", "geocities", "8bit", "terminal"]; 
    var CURRENT_THEME = "default";
    var _dialogYesCallback = null;

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
        var header8bit = document.getElementById("8bit-header");
        if (header8bit) header8bit.remove();
        
        if (window._win95ClockInterval) {
            clearInterval(window._win95ClockInterval);
            window._win95ClockInterval = null;
        }
        removeWin95Extras();
        remove8bitExtras();
    }

    function addGeocitiesMarquee() {
        var nav = document.getElementById("mainNav");
        var wrap = document.createElement("div");
        wrap.id = "geocities-marquee-wrap";
        wrap.className = "geocities-marquee-wrap";
        wrap.innerHTML =
            '<span class="geocities-marquee">🚧 UNDER CONSTRUCTION - BEST VIEWED IN NETSCAPE NAVIGATOR AT 800x600 - ' +
            'THANKS FOR VISITING MY HOMEPAGE! - SIGN MY GUESTBOOK! 🚧&nbsp;&nbsp;&nbsp;&nbsp;</span>';
        if (nav && nav.parentNode) {
            nav.parentNode.insertBefore(wrap, nav.nextSibling);
        } else {
            document.body.insertBefore(wrap, document.body.firstChild);
        }
    }

    function addWin95Taskbar() {
        var bar = document.createElement("div");
        bar.id = "win95-taskbar";
        bar.className = "win95-taskbar";
        bar.innerHTML =
            '<span class="win95-start-btn" role="button" tabindex="0" aria-label="Start"><i class="win95-start-icon" aria-hidden="true"></i> Start</span>' +
            '<div class="win95-taskbar-tasks" id="win95-taskbar-tasks"></div>' +
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

    function showFloatText(text, x, y, color) {
        var floatEl = document.createElement("div");
        floatEl.className = "player-float-score";
        floatEl.textContent = text;
        floatEl.style.left = (x - 12) + "px";
        floatEl.style.top = (y - 48) + "px";
        if(color) floatEl.style.color = color;
        document.body.appendChild(floatEl);
        setTimeout(function() {
            floatEl.remove();
        }, 800);
    }

    function add8bitHeader() {
        if(document.getElementById("8bit-header")) return;
        var header = document.createElement("div");
        header.id = "8bit-header";
        header.className = "bit-header";
        header.innerHTML =
            '<div><span>Player 1</span><span id="8bit-score">000000</span></div>' +
            '<div><span class="bit-coin-icon"></span><span id="8bit-coins">x00</span></div>' +
            '<div><span>WORLD</span><span>1-1</span></div>' +
            '<div><span>TIME</span><span id="8bit-time">400</span></div>';

        document.body.insertBefore(header, document.body.firstChild);

        window._8bitScore = 0;
        window._8bitCoins = 0;
        window._8bitTime = 400;

        var scoreEl = document.getElementById("8bit-score");
        var coinsEl = document.getElementById("8bit-coins");
        var timeEl = document.getElementById("8bit-time");

        window.update8bitScore = function(amount) {
            window._8bitScore += amount;
            if (scoreEl) scoreEl.textContent = String(window._8bitScore).padStart(6, "0");
        };

        window.update8bitCoins = function(amount) {
            window._8bitCoins += amount;
            if (window._8bitCoins >= 100) {
                window._8bitCoins = 0;
                window.update8bitScore(1000);
                showFloatText("1-UP!", window.innerWidth/2, window.innerHeight/2, "#00e756");
            }
            if (coinsEl) coinsEl.textContent = "x" + String(window._8bitCoins).padStart(2, "0");
        };

        if(window._8bitTimer) clearInterval(window._8bitTimer);
        window._8bitTimer = setInterval(function() {
            if(CURRENT_THEME !== "8bit") {
                clearInterval(window._8bitTimer);
                return;
            }
            if(window._8bitTime > 0) {
                window._8bitTime--;
                if(timeEl) timeEl.textContent = String(window._8bitTime).padStart(3, "0");
            }
        }, 1000);

        spawnEnemy();
    }

    function spawnEnemy() {
        if(document.getElementById("enemy-shell")) return;
        var shell = document.createElement("div");
        shell.id = "enemy-shell";
        shell.className = "enemy-shell";
        document.body.appendChild(shell);

        var pos = 0;
        var speed = 3;
        var dir = 1;

        function animateShell() {
            if (CURRENT_THEME !== "8bit") {
                shell.remove();
                return;
            }
            pos += speed * dir;
            if (pos > window.innerWidth - 32) {
                dir = -1;
            } else if (pos < 0) {
                dir = 1;
            }
            shell.style.left = pos + "px";
            shell.style.transform = "scaleX(" + (dir === 1 ? -1 : 1) + ")";
            requestAnimationFrame(animateShell);
        }
        animateShell();
    }

    window._8bitBlockClick = function(e) {
        if(CURRENT_THEME !== "8bit") return;
        var block = e.target.closest(".btn, .card");
        
        if(block && block.classList.contains("btn") && block.classList.contains("hit")) return;

        if (block) {
            if(block.classList.contains("btn")) {
                block.classList.add("hit");
            }

            var rect = block.getBoundingClientRect();
            var x = rect.left + (rect.width / 2) + window.scrollX;
            var y = rect.top + window.scrollY;

            var coin = document.createElement("div");
            coin.className = "player-coin-anim";
            coin.style.left = (x - 12) + "px";
            coin.style.top = (y - 36) + "px";
            document.body.appendChild(coin);

            showFloatText("100", x, y, "#fff");

            setTimeout(function() {
                if(coin) coin.remove();
            }, 600);

            if(window.update8bitScore) window.update8bitScore(100);
            if(window.update8bitCoins) window.update8bitCoins(1);
        }
    };
    
    document.removeEventListener("click", window._8bitBlockClick);
    document.addEventListener("click", window._8bitBlockClick);

    function createDesktopIcons() {
        if (document.getElementById("win95-desktop-icons")) return;
        var wrap = document.createElement("div");
        wrap.id = "win95-desktop-icons";
        wrap.className = "win95-desktop-icons";
        wrap.innerHTML =
            '<div class="win95-desktop-icon" data-window="mycomputer" tabindex="0">' +
                '<span class="win95-icon-glyph win95-icon-mycomputer" aria-hidden="true"></span>' +
                '<span class="win95-icon-label">My Computer</span>' +
            '</div>' +
            '<div class="win95-desktop-icon" data-window="recyclebin" tabindex="0">' +
                '<span class="win95-icon-glyph win95-icon-recyclebin" aria-hidden="true"></span>' +
                '<span class="win95-icon-label">Recycle Bin</span>' +
            '</div>';
        document.body.appendChild(wrap);

        var lastTap = {};

        function selectIcon(icon) {
            var all = wrap.querySelectorAll(".win95-desktop-icon.selected");
            all.forEach(function (i) { i.classList.remove("selected"); });
            icon.classList.add("selected");
        }

        wrap.addEventListener("click", function (e) {
            var icon = e.target.closest(".win95-desktop-icon");
            if (!icon) return;
            selectIcon(icon);
            var key = icon.getAttribute("data-window");
            var now = Date.now();
            if (lastTap.key === key && (now - lastTap.time) < 450) {
                activateDesktopIcon(icon);
                lastTap = {};
            } else {
                lastTap = { key: key, time: now };
            }
        });

        wrap.addEventListener("dblclick", function (e) {
            var icon = e.target.closest(".win95-desktop-icon");
            if (icon) activateDesktopIcon(icon);
        });

        wrap.addEventListener("keydown", function (e) {
            if (e.key !== "Enter" && e.key !== " ") return;
            var icon = e.target.closest(".win95-desktop-icon");
            if (icon) {
                e.preventDefault();
                selectIcon(icon);
                activateDesktopIcon(icon);
            }
        });
    }

    function activateDesktopIcon(icon) {
        var id = icon.getAttribute("data-window");
        if (id === "mycomputer") openMyComputerWindow();
        else if (id === "recyclebin") openRecycleBinWindow();
    }

    function addTaskbarTask(id, title, iconClass) {
        var list = document.getElementById("win95-taskbar-tasks");
        if (!list || document.getElementById("win95-taskbar-task-" + id)) return;
        var task = document.createElement("div");
        task.id = "win95-taskbar-task-" + id;
        task.className = "win95-taskbar-task active-window";
        task.setAttribute("data-window-target", id);
        task.setAttribute("role", "button");
        task.setAttribute("tabindex", "0");
        task.innerHTML =
            '<span class="win95-taskbar-task-icon ' + iconClass + '" aria-hidden="true"></span>' +
            '<span>' + title + '</span>';
        list.appendChild(task);
    }

    function removeTaskbarTask(id) {
        var task = document.getElementById("win95-taskbar-task-" + id);
        if (task) task.remove();
    }

    function toggleMinimizeWindow(id) {
        var win = document.getElementById("win95-window-" + id);
        var task = document.getElementById("win95-taskbar-task-" + id);
        if (!win || !task) return;
        var minimized = win.style.display === "none";
        win.style.display = minimized ? "flex" : "none";
        task.classList.toggle("active-window", minimized);
    }

    function closeWin95Window(win) {
        if (!win) return;
        var id = win.id.replace("win95-window-", "");
        win.remove();
        removeTaskbarTask(id);
    }

    function openWindow(opts) {
        var winId = "win95-window-" + opts.id;
        if (document.getElementById(winId)) return;

        var win = document.createElement("div");
        win.className = "win95-window";
        win.id = winId;
        win.innerHTML =
            '<div class="win95-window-titlebar">' +
                '<span class="win95-window-icon ' + opts.icon + '" aria-hidden="true"></span>' +
                '<span class="win95-window-title">' + opts.title + '</span>' +
                '<span class="win95-window-controls">' +
                    '<button type="button" class="win95-window-btn" data-action="close-window" aria-label="Close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' +
                '</span>' +
            '</div>' +
            '<div class="win95-window-menubar"><span>File</span><span>Edit</span><span>View</span><span>Help</span></div>' +
            '<div class="win95-window-body">' + opts.bodyHtml + '</div>' +
            (opts.footerHtml ? '<div class="win95-window-footer-actions">' + opts.footerHtml + '</div>' : '') +
            '<div class="win95-window-statusbar"><span>' + opts.status + '</span><span>' + (opts.statusRight || "") + '</span></div>';

        document.body.appendChild(win);
        addTaskbarTask(opts.id, opts.title, opts.icon);

        win.addEventListener("dblclick", function (e) {
            var row = e.target.closest(".win95-file-row[data-scroll]");
            if (!row) return;
            var target = document.querySelector(row.getAttribute("data-scroll"));
            closeWin95Window(win);
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    function myComputerBodyHtml() {
        return (
            '<div class="win95-file-row" data-scroll="#background"><i class="fa-solid fa-hard-drive" aria-hidden="true"></i><span>(C:) Background</span></div>' +
            '<div class="win95-file-row" data-scroll="#experience"><i class="fa-solid fa-hard-drive" aria-hidden="true"></i><span>(D:) Experience</span></div>' +
            '<div class="win95-file-row" data-scroll="#education"><i class="fa-solid fa-hard-drive" aria-hidden="true"></i><span>(E:) Education</span></div>' +
            '<div class="win95-file-row" data-scroll="#awards"><i class="fa-solid fa-hard-drive" aria-hidden="true"></i><span>(F:) Awards</span></div>' +
            '<div class="win95-file-row" data-scroll="#media"><i class="fa-solid fa-compact-disc" aria-hidden="true"></i><span>(G:) Media</span></div>'
        );
    }

    function openMyComputerWindow() {
        openWindow({
            id: "mycomputer",
            title: "My Computer",
            icon: "win95-icon-mycomputer",
            bodyHtml: myComputerBodyHtml(),
            status: "5 object(s)"
        });
    }

    function recycleBinBodyHtml() {
        return (
            '<div class="win95-file-row"><i class="fa-regular fa-file-lines" aria-hidden="true"></i><span>cyber_insurance_coverage_limits.xls</span></div>' +
            '<div class="win95-file-row"><i class="fa-regular fa-file-lines" aria-hidden="true"></i><span>prod_db_passwords_FINAL.txt</span></div>' +
            '<div class="win95-file-row"><i class="fa-regular fa-file-lines" aria-hidden="true"></i><span>unpatched_CVE-2017-0144.log</span></div>' +
            '<div class="win95-file-row"><i class="fa-regular fa-file-lines" aria-hidden="true"></i><span>jakes_resume_1995.doc</span></div>' +
            '<div class="win95-file-row"><i class="fa-regular fa-file-lines" aria-hidden="true"></i><span>excuse_for_missed_patch_tuesday.txt</span></div>' +   
            '<div class="win95-file-row"><i class="fa-regular fa-file-lines" aria-hidden="true"></i><span>legacy_flash_player_v8_DO_NOT_UPDATE.exe</span></div>'
        );
    }

    function openRecycleBinWindow() {
        openWindow({
            id: "recyclebin",
            title: "Recycle Bin",
            icon: "win95-icon-recyclebin",
            bodyHtml: recycleBinBodyHtml(),
            status: "6 object(s)",
            footerHtml: '<button type="button" class="win95-dialog-btn" data-action="empty-recycle">Empty Recycle Bin</button>'
        });
    }

    function handleEmptyRecycleBin() {
        showConfirmDialog({
            title: "Confirm File Delete",
            icon: "fa-solid fa-circle-question",
            message: "Are you sure you want to permanently delete these 6 item(s)?",
            onYes: function () {
                var recycleWin = document.getElementById("win95-window-recyclebin");
                if (!recycleWin) return;
                var body = recycleWin.querySelector(".win95-window-body");
                if (body) body.innerHTML = '<div class="win95-empty-msg">The Recycle Bin is empty.</div>';
                var statusSpan = recycleWin.querySelector(".win95-window-statusbar span");
                if (statusSpan) statusSpan.textContent = "0 object(s)";
                var footer = recycleWin.querySelector(".win95-window-footer-actions");
                if (footer) footer.remove();
            }
        });
    }

    function navItemHtml(icon, label, href) {
        return '<a class="win95-start-item" href="' + href + '" data-action="close-start">' +
            '<i class="' + icon + '" aria-hidden="true"></i><span>' + label + '</span></a>';
    }

    function themeItemHtml(label, theme, icon) {
        return '<a class="win95-start-item theme-option" href="#" data-theme="' + theme + '">' +
            '<i class="' + icon + '" aria-hidden="true"></i><span>' + label + '</span></a>';
    }

    function buildStartMenu() {
        if (document.getElementById("win95-start-menu")) return;
        var menu = document.createElement("div");
        menu.id = "win95-start-menu";
        menu.className = "win95-start-menu";
        menu.innerHTML =
            '<div class="win95-start-menu-side"><span>Windows 95</span></div>' +
            '<div class="win95-start-menu-items">' +
                navItemHtml("fa-solid fa-user", "Background", "#background") +
                navItemHtml("fa-solid fa-briefcase", "Experience", "#experience") +
                navItemHtml("fa-solid fa-graduation-cap", "Education", "#education") +
                navItemHtml("fa-solid fa-trophy", "Awards", "#awards") +
                navItemHtml("fa-solid fa-newspaper", "Media", "#media") +
                '<div class="win95-start-sep"></div>' +
                '<div class="win95-start-item win95-flyout-parent" data-action="toggle-flyout">' +
                    '<i class="fa-solid fa-palette" aria-hidden="true"></i><span>Themes</span>' +
                    '<span class="win95-flyout-arrow">&#9656;</span>' +
                    '<div class="win95-flyout">' +
                        themeItemHtml("Default", "default", "fa-solid fa-star") +
                        themeItemHtml("Windows 95", "win95", "fa-brands fa-windows") +
                        themeItemHtml("GeoCities", "geocities", "fa-solid fa-globe") +
                        themeItemHtml("8-Bit RPG", "8bit", "fa-solid fa-gamepad") +
                        themeItemHtml("Terminal", "terminal", "fa-solid fa-terminal") +
                    '</div>' +
                '</div>' +
                '<div class="win95-start-sep"></div>' +
                '<div class="win95-start-item" data-action="shutdown"><i class="fa-solid fa-power-off" aria-hidden="true"></i><span>Shut Down&hellip;</span></div>' +
            '</div>';
        document.body.appendChild(menu);
        updateStartMenuActiveTheme();
    }

    function updateStartMenuActiveTheme() {
        var items = document.querySelectorAll("#win95-start-menu .theme-option");
        items.forEach(function (opt) {
            opt.classList.toggle("active-theme", opt.getAttribute("data-theme") === CURRENT_THEME);
        });
    }

    function toggleStartMenu() {
        var menu = document.getElementById("win95-start-menu");
        var btn = document.querySelector(".win95-start-btn");
        if (!menu) return;
        var willOpen = !menu.classList.contains("visible");
        menu.classList.toggle("visible", willOpen);
        if (btn) btn.classList.toggle("active", willOpen);
        if (!willOpen) closeAllFlyouts();
    }

    function closeStartMenu() {
        var menu = document.getElementById("win95-start-menu");
        var btn = document.querySelector(".win95-start-btn");
        if (menu) menu.classList.remove("visible");
        if (btn) btn.classList.remove("active");
        closeAllFlyouts();
    }

    function closeAllFlyouts() {
        document.querySelectorAll(".win95-flyout-parent.open").forEach(function (p) {
            p.classList.remove("open");
        });
    }

    function showConfirmDialog(opts) {
        closeDialog();
        var overlay = document.createElement("div");
        overlay.id = "win95-modal-overlay";
        overlay.className = "win95-modal-overlay";
        overlay.innerHTML =
            '<div class="win95-dialog" role="alertdialog" aria-modal="true">' +
                '<div class="win95-dialog-titlebar"><span>' + opts.title + '</span></div>' +
                '<div class="win95-dialog-body">' +
                    '<i class="' + opts.icon + ' win95-dialog-icon" aria-hidden="true"></i>' +
                    '<span>' + opts.message + '</span>' +
                '</div>' +
                '<div class="win95-dialog-actions">' +
                    '<button type="button" class="win95-dialog-btn" data-action="dialog-yes">Yes</button>' +
                    '<button type="button" class="win95-dialog-btn" data-action="dialog-no">No</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(overlay);
        _dialogYesCallback = opts.onYes || null;
    }

    function closeDialog() {
        var overlay = document.getElementById("win95-modal-overlay");
        if (overlay) overlay.remove();
        _dialogYesCallback = null;
    }

    function confirmShutdown() {
        showConfirmDialog({
            title: "Shut Down Windows",
            icon: "fa-solid fa-power-off",
            message: "Are you sure you want to exit the Windows 95 theme?",
            onYes: playShutdownSequence
        });
    }

    function playShutdownSequence() {
        if (document.getElementById("win95-shutdown-screen")) return;
        var overlay = document.createElement("div");
        overlay.id = "win95-shutdown-screen";
        overlay.className = "win95-shutdown-screen";
        overlay.innerHTML = "It's now safe to turn off<br>your computer.";
        document.body.appendChild(overlay);

        window._win95ShutdownTimers = window._win95ShutdownTimers || [];
        window._win95ShutdownTimers.push(setTimeout(function () {
            applyTheme("default");
        }, 2200));
    }

    function triggerBSOD() {
        if (document.getElementById("win95-bsod-screen")) return;
        
        var overlay = document.createElement("div");
        overlay.id = "win95-bsod-screen";
        overlay.className = "win95-bsod-screen";
        overlay.innerHTML =
            '<div class="win95-bsod-inner">' +
                '<div class="win95-bsod-title">Windows</div>' +
                '<p>A fatal exception 0E has occurred at 028:C0011E36 in VXD VMM(01) + 00010E36. The current application will be terminated.</p>' +
                '<p>* Press any key to terminate the current application.<br>' +
                '* Press CTRL+ALT+DEL again to restart your computer. You will lose any unsaved information in all applications.</p>' +
                '<p class="win95-bsod-continue">Press any key to continue <span class="blink">_</span></p>' +
            '</div>';
        
        document.body.appendChild(overlay);

        function dismissBSOD(e) {
            overlay.remove();
            document.removeEventListener("keydown", dismissBSOD);
            document.removeEventListener("click", dismissBSOD);
        }
        
        setTimeout(function() {
            document.addEventListener("keydown", dismissBSOD);
            document.addEventListener("click", dismissBSOD);
        }, 150);
    }

    function removeWin95Extras() {
        ["win95-desktop-icons", "win95-start-menu", "win95-shutdown-screen"].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.remove();
        });
        document.querySelectorAll(".win95-window").forEach(function (w) { w.remove(); });
        closeDialog();
        if (window._win95ShutdownTimers) {
            window._win95ShutdownTimers.forEach(clearTimeout);
            window._win95ShutdownTimers = [];
        }
    }

    function remove8bitExtras() {
        if (window._8bitTimer) {
            clearInterval(window._8bitTimer);
            window._8bitTimer = null;
        }
        var shell = document.getElementById("enemy-shell");
        if (shell) shell.remove();
    }

    function initWin95Extras() {
        createDesktopIcons();
        buildStartMenu();
    }

    function applyTheme(theme) {
        var body = document.body;
        var backgroundVideo = document.getElementById("background-video");

        THEMES.forEach(function (t) {
            body.classList.remove("theme-" + t);
        });
        if (backgroundVideo) {
            backgroundVideo.style.display = "block";
        }
        clearDecorations();

        CURRENT_THEME = theme && theme !== "default" ? theme : "default";

        if (CURRENT_THEME !== "default") {
            body.classList.add("theme-" + CURRENT_THEME);
            ensureFontLoaded(CURRENT_THEME);

            if (backgroundVideo) {
                backgroundVideo.style.display = "none";
            }

            if (CURRENT_THEME === "win95") {
                addWin95Taskbar();
                initWin95Extras();
            }
            if (CURRENT_THEME === "geocities") addGeocitiesMarquee();
            if (CURRENT_THEME === "8bit") add8bitHeader();
        }

        updateActiveMenuItem(CURRENT_THEME);
    }

    function updateActiveMenuItem(theme) {
        var options = document.querySelectorAll(".theme-option");
        options.forEach(function (opt) {
            opt.classList.toggle("active", opt.getAttribute("data-theme") === theme);
        });
        updateStartMenuActiveTheme();
    }

    function handleDocumentClick(e) {
        var themeOpt = e.target.closest(".theme-option");
        if (themeOpt) {
            e.preventDefault();
            applyTheme(themeOpt.getAttribute("data-theme"));
            closeStartMenu();
            return;
        }

        var startBtn = e.target.closest(".win95-start-btn");
        if (startBtn) {
            e.preventDefault();
            toggleStartMenu();
            return;
        }

        var cardBody = e.target.closest('.card-body');
        if (cardBody && CURRENT_THEME === "win95") {
            var rect = cardBody.getBoundingClientRect();
            var clickY = e.clientY - rect.top;
            var clickX = rect.right - e.clientX; 
            if (clickY >= 0 && clickY <= 25 && clickX >= 0 && clickX <= 40) {
                e.preventDefault();
                triggerBSOD();
                return;
            }
        }

        var flyoutParent = e.target.closest('[data-action="toggle-flyout"]');
        if (flyoutParent) {
            e.preventDefault();
            e.stopPropagation();
            flyoutParent.classList.toggle("open");
            return;
        }

        var navItem = e.target.closest('.win95-start-item[data-action="close-start"]');
        if (navItem) {
            e.preventDefault();
            closeStartMenu();
            var target = document.querySelector(navItem.getAttribute("href"));
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        var shutdownTrigger = e.target.closest('[data-action="shutdown"]');
        if (shutdownTrigger) {
            e.preventDefault();
            closeStartMenu();
            confirmShutdown();
            return;
        }

        var closeWinBtn = e.target.closest('[data-action="close-window"]');
        if (closeWinBtn) {
            closeWin95Window(closeWinBtn.closest(".win95-window"));
            return;
        }

        var taskbarTask = e.target.closest(".win95-taskbar-task");
        if (taskbarTask) {
            toggleMinimizeWindow(taskbarTask.getAttribute("data-window-target"));
            return;
        }

        var emptyBtn = e.target.closest('[data-action="empty-recycle"]');
        if (emptyBtn) {
            handleEmptyRecycleBin();
            return;
        }

        var dialogYes = e.target.closest('[data-action="dialog-yes"]');
        if (dialogYes) {
            var cb = _dialogYesCallback;
            closeDialog();
            if (cb) cb();
            return;
        }

        var dialogNo = e.target.closest('[data-action="dialog-no"]');
        if (dialogNo) {
            closeDialog();
            return;
        }

        var menu = document.getElementById("win95-start-menu");
        if (menu && menu.classList.contains("visible")) {
            if (!menu.contains(e.target) && !e.target.closest(".win95-start-btn")) {
                closeStartMenu();
            }
        }
    }

    function handleDocumentKeydown(e) {
        if (e.key === "Escape") {
            closeDialog();
            closeStartMenu();
        }
    }

    function init() {
        document.addEventListener("click", handleDocumentClick);
        document.addEventListener("keydown", handleDocumentKeydown);
        applyTheme("default");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
