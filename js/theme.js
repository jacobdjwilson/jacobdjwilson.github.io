/*!
* Jacob's Portfolio v1.7 - A GitHub Pages Project
* Last Modified October 2026 | This Source Code is Free for re-use
* Licensed under MIT (https://github.com/jacobdjwilson/jacobdjwilson.github.io/blob/main/LICENSE)
*/
(function () {
    "use strict";

    var THEMES = ["win95", "geocities", "8bit", "terminal"];
    var CURRENT_THEME = "default";
    var _dialogYesCallback = null;
    var _audioCtx = null;
    var _soundMuted = false;
    var _draggedWin = null;
    var _dragOffset = { x: 0, y: 0 };
    var _winZIndex = 1045;
    var _lastSparkleTime = 0;
    var _sparkleColors = ["#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff0055", "#ffffff"];
    var _sparkleGlyphs = ["✦", "★", "✧", "✨", "✯"];

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function getAudioContext() {
        if (!_audioCtx) {
            var AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) _audioCtx = new AudioContextClass();
        }
        if (_audioCtx && _audioCtx.state === "suspended") {
            _audioCtx.resume();
        }
        return _audioCtx;
    }

    function play8BitTone(freq, duration, type, startDelay, endFreq) {
        if (_soundMuted) return;
        try {
            var ctx = getAudioContext();
            if (!ctx) return;
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = type || "square";
            var startTime = ctx.currentTime + (startDelay || 0);
            osc.frequency.setValueAtTime(freq, startTime);
            if (endFreq) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), startTime + duration);
            }
            gain.gain.setValueAtTime(0.08, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
        } catch (e) { }
    }

    function playCoinSound() {
        play8BitTone(987, 0.08, "square", 0);
        play8BitTone(1318, 0.32, "square", 0.08);
    }

    function playStompSound() {
        play8BitTone(420, 0.22, "triangle", 0, 80);
    }


    function playJumpSound() {
        play8BitTone(150, 0.16, "square", 0, 580);
    }

    function playBumpSound() {
        play8BitTone(140, 0.10, "triangle", 0, 40);
    }

    function playPowerdownSound() {
        var notes = [494, 466, 440, 415, 392, 349, 330, 294];
        notes.forEach(function (freq, i) {
            play8BitTone(freq, 0.08, "triangle", i * 0.06);
        });
    }

    function playStageClearSound() {
        var melody = [
            [392, 0.10], [523, 0.10], [659, 0.10], [784, 0.10], [1046, 0.10], [1318, 0.10], [1568, 0.25], [1318, 0.25],
            [415, 0.10], [523, 0.10], [622, 0.10], [830, 0.10], [1046, 0.10], [1244, 0.10], [1661, 0.25], [1244, 0.25],
            [466, 0.10], [587, 0.10], [698, 0.10], [932, 0.10], [1174, 0.10], [1396, 0.10], [1864, 0.25],
            [1975, 0.12], [1975, 0.12], [1975, 0.12], [2093, 0.50]
        ];
        var t = 0;
        melody.forEach(function (item) {
            play8BitTone(item[0], item[1], "square", t);
            t += item[1] * 0.95;
        });
    }

    function playGameOverSound() {
        var melody = [
            [523, 0.15], [392, 0.15], [330, 0.15],
            [440, 0.18], [494, 0.18], [440, 0.18],
            [415, 0.18], [466, 0.18], [415, 0.18],
            [392, 0.40]
        ];
        var t = 0;
        melody.forEach(function (item) {
            play8BitTone(item[0], item[1], "triangle", t);
            t += item[1] * 0.95;
        });
    }

    function play1UpSound() {
        var notes = [1318, 1568, 2637, 2093, 2349, 3136];
        notes.forEach(function (freq, i) {
            play8BitTone(freq, 0.12, "square", i * 0.09);
        });
    }

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
        var webring = document.getElementById("geocities-webring");
        if (webring) webring.remove();
        var guestbook = document.getElementById("geocities-guestbook-modal");
        if (guestbook) guestbook.remove();
        var header8bit = document.getElementById("8bit-header");
        if (header8bit) header8bit.remove();
        var termCursor = document.getElementById("terminal-cursor");
        if (termCursor) termCursor.remove();
        var termCli = document.getElementById("terminal-cli-wrap");
        if (termCli) termCli.remove();
        document.body.classList.remove("terminal-amber");
        stopMatrixRain();

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
            'THANKS FOR VISITING MY HOMEPAGE! - <a href="#" data-action="open-guestbook" style="color:#ffff00;text-decoration:underline;">SIGN MY GUESTBOOK!</a> 🚧&nbsp;&nbsp;&nbsp;&nbsp;</span>';
        if (nav && nav.parentNode) {
            nav.parentNode.insertBefore(wrap, nav.nextSibling);
        } else {
            document.body.insertBefore(wrap, document.body.firstChild);
        }

        var footer = document.querySelector("footer");
        if (footer && !document.getElementById("geocities-webring")) {
            var ring = document.createElement("div");
            ring.id = "geocities-webring";
            ring.className = "geocities-webring";
            ring.innerHTML =
                '<div><b>🛡️ InfoSec Webring Hub #1337 🛡️</b> &middot; ' +
                '[ <a href="#" data-action="open-guestbook">Sign Guestbook!</a> ]</div>' +
                '<div style="font-size:11px;margin-top:4px;color:#ffff00;">Proud Member of the 1999 Cyber Defenders Webring!</div>';
            footer.parentNode.insertBefore(ring, footer);
        }
    }

    function handleGeoCitiesMouseMove(e) {
        if (CURRENT_THEME !== "geocities") return;
        var now = Date.now();
        if (now - _lastSparkleTime < 50) return;
        _lastSparkleTime = now;

        var span = document.createElement("span");
        span.className = "geocities-sparkle";
        span.textContent = _sparkleGlyphs[Math.floor(Math.random() * _sparkleGlyphs.length)];
        span.style.left = (e.clientX + Math.random() * 12 - 6) + "px";
        span.style.top = (e.clientY + Math.random() * 12 - 6) + "px";
        span.style.color = _sparkleColors[Math.floor(Math.random() * _sparkleColors.length)];
        document.body.appendChild(span);
        setTimeout(function () { span.remove(); }, 800);
    }

    function openGuestbookModal() {
        if (document.getElementById("geocities-guestbook-modal")) return;
        var overlay = document.createElement("div");
        overlay.id = "geocities-guestbook-modal";
        overlay.className = "geocities-modal-overlay";
        overlay.innerHTML =
            '<div class="geocities-guestbook">' +
            '<h3>📖 Jake\'s Cyber Guestbook (1999) 📖</h3>' +
            '<p style="text-align:center;font-size:12px;">Leave your mark on the cyberspace superhighway!</p>' +
            '<form id="guestbook-form">' +
            '<input type="text" id="gb-name" placeholder="Your Hacker Handle / Name" required />' +
            '<textarea id="gb-msg" rows="2" placeholder="Your Message..." required></textarea>' +
            '<div style="display:flex;gap:8px;">' +
            '<button type="submit" style="background:#cc0000;color:#fff;font-weight:bold;padding:4px 12px;border:2px outset #fff;cursor:pointer;">Sign Guestbook!</button>' +
            '<button type="button" data-action="close-guestbook" style="background:#666;color:#fff;padding:4px 12px;border:2px outset #fff;cursor:pointer;">Close</button>' +
            '</div>' +
            '</form>' +
            '<div class="geocities-guestbook-entries" id="gb-entries">' +
            '<div class="geocities-guestbook-entry"><b>ZeroCool</b>: <i>"Hack the planet! Cool portfolio site."</i></div>' +
            '<div class="geocities-guestbook-entry"><b>NetscapeFan99</b>: <i>"Loaded in 14.4k modem without problems!"</i></div>' +
            '</div>' +
            '</div>';
        document.body.appendChild(overlay);

        overlay.querySelector("#guestbook-form").addEventListener("submit", function (e) {
            e.preventDefault();
            var nameInput = document.getElementById("gb-name");
            var msgInput = document.getElementById("gb-msg");
            var name = (nameInput.value || "Anonymous").trim();
            var msg = (msgInput.value || "").trim();
            if (!msg) return;
            var entry = document.createElement("div");
            entry.className = "geocities-guestbook-entry";
            entry.innerHTML = '<b>' + escapeHtml(name) + '</b>: <i>"' + escapeHtml(msg) + '"</i>';
            var list = document.getElementById("gb-entries");
            if (list) list.insertBefore(entry, list.firstChild);
            nameInput.value = "";
            msgInput.value = "";
        });
    }

    function closeGuestbookModal() {
        var gb = document.getElementById("geocities-guestbook-modal");
        if (gb) gb.remove();
    }

    function addTerminalCursor() {
        if (document.getElementById("terminal-cursor")) return;
        var brand = document.querySelector("#mainNav .navbar-brand");
        if (!brand) return;
        var cur = document.createElement("span");
        cur.id = "terminal-cursor";
        cur.className = "terminal-cursor";
        cur.setAttribute("aria-hidden", "true");
        cur.innerHTML = "&nbsp;";
        brand.appendChild(cur);
    }

    var _matrixAnimId = null;

    function toggleMatrixRain() {
        var existing = document.getElementById("terminal-matrix-canvas");
        if (existing) {
            if (_matrixAnimId) cancelAnimationFrame(_matrixAnimId);
            _matrixAnimId = null;
            existing.remove();
            return "[-] Matrix digital rain deactivated.";
        }
        var canvas = document.createElement("canvas");
        canvas.id = "terminal-matrix-canvas";
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var ctx = canvas.getContext("2d");
        var chars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEF<>/*+-~#";
        var fontSize = 14;
        var columns = Math.floor(canvas.width / fontSize);
        var drops = [];
        for (var i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * -50);
        }

        function draw() {
            var isAmber = document.body.classList.contains("terminal-amber");
            var color = isAmber ? "#ffb000" : "#33ff33";
            ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = color;
            ctx.font = fontSize + "px monospace";
            for (var j = 0; j < drops.length; j++) {
                var text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, j * fontSize, drops[j] * fontSize);
                if (drops[j] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[j] = 0;
                }
                drops[j]++;
            }
            _matrixAnimId = requestAnimationFrame(draw);
        }
        draw();
        return "[+] Matrix digital rain initiated. Press ESC or type 'matrix' to exit.";
    }

    function stopMatrixRain() {
        var existing = document.getElementById("terminal-matrix-canvas");
        if (existing) {
            if (_matrixAnimId) cancelAnimationFrame(_matrixAnimId);
            _matrixAnimId = null;
            existing.remove();
        }
    }

    function addTerminalCli() {
        if (document.getElementById("terminal-cli-wrap")) return;
        var wrap = document.createElement("div");
        wrap.id = "terminal-cli-wrap";
        wrap.innerHTML =
            '<div class="terminal-cli-history" id="terminal-cli-history">' +
            '<div class="cmd-entry">SYS_INIT: WOPR / OASIS Terminal v2.4 . Type <span style="text-decoration:underline;">help</span> for commands.</div>' +
            '</div>' +
            '<div class="terminal-cli-input-row">' +
            '<span class="terminal-cli-prompt">&gt;</span>' +
            '<input type="text" id="terminal-cli-input" placeholder="Type a command (help, neofetch, nmap, wargames, oasis, matrix)..." autocomplete="off" spellcheck="false" />' +
            '<button type="button" class="terminal-color-toggle-btn" id="terminal-color-toggle" title="Toggle Amber/Green CRT">Amber CRT</button>' +
            '</div>';
        document.body.appendChild(wrap);

        var input = document.getElementById("terminal-cli-input");
        var hist = document.getElementById("terminal-cli-history");
        var colorBtn = document.getElementById("terminal-color-toggle");
        var cliHistory = [];
        var cliHistoryIdx = -1;

        colorBtn.addEventListener("click", function () {
            var isAmber = document.body.classList.toggle("terminal-amber");
            colorBtn.textContent = isAmber ? "Green CRT" : "Amber CRT";
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "ArrowUp") {
                if (cliHistory.length === 0) return;
                e.preventDefault();
                if (cliHistoryIdx === -1) {
                    cliHistoryIdx = cliHistory.length - 1;
                } else if (cliHistoryIdx > 0) {
                    cliHistoryIdx--;
                }
                input.value = cliHistory[cliHistoryIdx];
                return;
            }
            if (e.key === "ArrowDown") {
                if (cliHistory.length === 0) return;
                e.preventDefault();
                if (cliHistoryIdx !== -1 && cliHistoryIdx < cliHistory.length - 1) {
                    cliHistoryIdx++;
                    input.value = cliHistory[cliHistoryIdx];
                } else {
                    cliHistoryIdx = -1;
                    input.value = "";
                }
                return;
            }
            if (e.key !== "Enter") return;
            var val = input.value.trim();
            if (!val) return;
            cliHistory.push(val);
            cliHistoryIdx = -1;
            input.value = "";
            handleTerminalCommand(val, hist, cliHistory);
        });
    }

    function handleTerminalCommand(cmdStr, histEl, historyArr) {
        var trimmed = cmdStr.trim();
        var firstSpace = trimmed.indexOf(" ");
        var cmd = (firstSpace === -1 ? trimmed : trimmed.substring(0, firstSpace)).toLowerCase();
        var rest = firstSpace === -1 ? "" : trimmed.substring(firstSpace + 1).trim();
        var args = rest ? rest.split(/\s+/) : [];
        var out = "";

        switch (cmd) {
            case "help":
            case "?":
                out = "Navigation Commands:\n" +
                    "  whoami          - Display user credentials & clearance\n" +
                    "  exp / work      - Jump to professional experience\n" +
                    "  edu             - Jump to education\n" +
                    "  awards          - Jump to awards & achievements\n" +
                    "  media           - Jump to media coverage\n" +
                    "  amber / green   - Switch CRT phosphor color\n" +
                    "  theme <name>    - Switch theme (default, win95, geocities, 8bit, terminal)\n" +
                    "  date            - Print current system timestamp\n" +
                    "  history         - Display command history\n" +
                    "  clear           - Clear terminal screen\n\n" +
                    "Applications & Warez:\n" +
                    "  neofetch        - System information tool\n" +
                    "  nmap / scan     - Network security / port scanner\n" +
                    "  wargames        - NORAD W.O.P.R.r\n" +
                    "  oasis / rpo     - Halliday scoreboard\n" +
                    "  hackers         - Gibson supercomputer\n" +
                    "  matrix          - Toggle full-screen digital rain\n" +
                    "  sneakers        - Setec Astronomy / Too Many Secrets\n" +
                    "  ls / dir        - List classified files (wopr_games, anorak_almanac...)\n" +
                    "  cat <file>      - Read classified files (e.g. cat wopr_games.list)\n" +
                    "  games           - List all playable easter egg games\n" +
                    "  cowsay <msg>    - Talking ASCII hacker cow\n" +
                    "  fortune         - Hacker cinema & folklore quotes\n" +
                    "  sudo <cmd>      - Execute a command as another user\n" +
                    "  flag / ctf      - Check hidden CTF challenge flag\n" +
                    "  ping <host>     - Ping network target\n" +
                    "  rot13 / base64  - Cryptographic utilities";
                break;
            case "whoami":
                out = "guest@WOPR (Alias: Parzival / David Lightman) [Access Level: OASIS Gunther / NORAD Falken]";
                break;
            case "exp":
            case "work":
            case "experience":
                out = "Navigating to experience...";
                var expEl = document.querySelector("#experience");
                if (expEl) expEl.scrollIntoView({ behavior: "smooth", block: "start" });
                break;
            case "edu":
            case "education":
                out = "Navigating to education...";
                var eduEl = document.querySelector("#education");
                if (eduEl) eduEl.scrollIntoView({ behavior: "smooth", block: "start" });
                break;
            case "awards":
                out = "Navigating to awards...";
                var awEl = document.querySelector("#awards");
                if (awEl) awEl.scrollIntoView({ behavior: "smooth", block: "start" });
                break;
            case "media":
                out = "Navigating to media...";
                var medEl = document.querySelector("#media");
                if (medEl) medEl.scrollIntoView({ behavior: "smooth", block: "start" });
                break;
            case "amber":
                document.body.classList.add("terminal-amber");
                var btnA = document.getElementById("terminal-color-toggle");
                if (btnA) btnA.textContent = "Green CRT";
                out = "Phosphor mode set to AMBER (P3 phosphor).";
                break;
            case "green":
                document.body.classList.remove("terminal-amber");
                var btnG = document.getElementById("terminal-color-toggle");
                if (btnG) btnG.textContent = "Amber CRT";
                out = "Phosphor mode set to GREEN (P1 phosphor).";
                break;
            case "theme":
                var targetTheme = (args[0] || "").toLowerCase();
                if (THEMES.indexOf(targetTheme) !== -1 || targetTheme === "default") {
                    applyTheme(targetTheme);
                    return;
                } else {
                    out = "Usage: theme <default|win95|geocities|8bit|terminal>";
                }
                break;
            case "date":
                out = new Date().toString();
                break;
            case "clear":
                histEl.innerHTML = "";
                return;
            case "history":
                if (!historyArr || historyArr.length === 0) {
                    out = "No command history.";
                } else {
                    out = historyArr.map(function (c, idx) { return "  " + (idx + 1) + "  " + c; }).join("\n");
                }
                break;
            case "neofetch":
            case "banner":
            case "uname":
            case "sysinfo":
                out = "       _,met$$$$$gg.          guest@WOPR\n" +
                    "    ,g$$$$$$$$$$$$$$$P.       ----------\n" +
                    "   ,g$$P\"     \"\"\"Y$$\".\"       OS: Debian GNU/Linux 12 (bookworm) x86_64\n" +
                    "  ,$$P'              `$$$.    Host: WOPR-9000 (Cray X-MP/48 Cluster)\n" +
                    " ',$$P       ,ggs.     `$$b:  Kernel: Linux 6.12.0-1-amd64\n" +
                    " `d$$'     ,$P\"'   .    $$$   Uptime: 43 years, 155 days (since May 1983)\n" +
                    "  $$P      d$'     ,    $$P   Packages: 1983 (dpkg)\n" +
                    "  $$:      $$.   -    ,d$$'   Shell: bash 5.2.21\n" +
                    "   $$;      Y$b._   _,d$P'    Terminal: IMSAI-8080 (OASIS Console)\n" +
                    "   Y$$.    `.`\"Y$$$$P\"'       CPU: Cray-1 Dual-Vector Processor @ 105 MHz\n" +
                    "    `$$b      \"-.__           Memory: 16MB / 64MB (Vector SRAM)\n" +
                    "     `Y$$                     IP Address: 26.19.83.42 (MILNET / OASIS WAN)\n" +
                    "      `$$b.                   Hostname: joshua.wopr.norad.mil (OASIS Sector 01)\n" +
                    "        `\"Y$b._               Sector: Cheyenne Mountain / Columbus Stacks\n" +
                    "           `\"\"\"";
                break;
            case "matrix":
                out = toggleMatrixRain();
                break;
            case "ls":
            case "dir":
                out = "total 42\n" +
                    "drwxr-xr-x 2 joshua wopr    4096 Oct 11 1983 .\n" +
                    "drwxr-xr-x 4 root   root    4096 Oct 11 1983 ..\n" +
                    "-rw-r--r-- 1 joshua wopr    1983 May 09 1983 wopr_games.list\n" +
                    "-rw-r--r-- 1 parzvl oasis   1984 Jan 01 2045 anorak_almanac.txt\n" +
                    "-rw-r--r-- 1 parzvl oasis    512 Feb 11 2045 copper_key.hint\n" +
                    "-rw-r--r-- 1 falken wopr     256 Jun 03 1983 falkens_maze.bas\n" +
                    "-rw-r--r-- 1 root   root    1337 Oct 11 2026 flag.txt";
                break;
            case "cat":
                var file = (args[0] || "").toLowerCase();
                if (!file) {
                    out = "Usage: cat <filename> (type 'ls' to view classified files)";
                } else if (file === "wopr_games.list" || file === "wopr_games" || file === "games.list") {
                    out = "W.O.P.R. GAME SELECTION MENU (NORAD / FALKEN):\n" +
                        "  1. FALKEN'S MAZE\n" +
                        "  2. BLACK JACK\n" +
                        "  3. GIN RUMMY\n" +
                        "  4. HEARTS\n" +
                        "  5. BRIDGE\n" +
                        "  6. CHESS\n" +
                        "  7. POKER\n" +
                        "  8. FIGHTER COMBAT\n" +
                        "  9. GUERRILLA ENGAGEMENT\n" +
                        " 10. DESERT WARFARE\n" +
                        " 11. AIR-TO-GROUND ACTIONS\n" +
                        " 12. THEATERWIDE TACTICAL WARFARE\n" +
                        " 13. THEATERWIDE BIOTIC AND CHEMICAL WARFARE\n" +
                        " 14. GLOBAL THERMONUCLEAR WAR\n\n" +
                        "Type 'wargames' to launch the simulation.";
                } else if (file === "anorak_almanac.txt" || file === "almanac" || file === "anorak") {
                    out = "JAMES HALLIDAY'S ANORAK'S ALMANAC (VOL. 1):\n" +
                        "-------------------------------------------\n" +
                        "\"Three hidden keys open three secret gates\n" +
                        " Wherein the errant will be tested for worthy traits\n" +
                        " And those with the skill to survive these straits\n" +
                        " Will reach the End where the prize awaits.\"\n\n" +
                        "[+] First to the Key! First to the Egg!\n" +
                        "Type 'oasis' to check current Egg Hunt standings.";
                } else if (file === "copper_key.hint" || file === "copper_key" || file === "copper") {
                    out = "COPPER KEY CLUE (Tomb of Horrors / Planet Ludus):\n" +
                        "\"The Copper Key awaits those who dare enter the Tomb on Ludus.\n" +
                        " Defeat the demi-lich Acererak at a best-of-three game of JOUST.\n" +
                        " Remember: Play on player-1 (left) side to reverse the hand advantage!\"";
                } else if (file === "falkens_maze.bas" || file === "falkens_maze" || file === "maze") {
                    out = "10 REM FALKEN'S MAZE - IMSAI 8080 TTY\n" +
                        "20 PRINT \"ENTERING DR. STEPHEN FALKEN'S LABYRINTH...\"\n" +
                        "30 PRINT \"TIC-TAC-TOE TRAINERS ENGAGED: WINNER = NONE\"\n" +
                        "40 PRINT \"A STRANGE GAME. THE ONLY WINNING MOVE IS NOT TO PLAY.\"\n" +
                        "50 END";
                } else if (file === "flag.txt" || file === "flag") {
                    out = "FLAG{1983_w0pr_j0shu4_04515_345t3r_3gg}\n[+] Egg Hunt Complete! You found the hidden Easter Egg.";
                } else if (file === "skills.sh" || file === "bio.md" || file === "certs.txt") {
                    out = "[Notice]: Career profile files migrated. Active easter egg archives: wopr_games.list, anorak_almanac.txt, copper_key.hint. Type 'ls'.";
                } else if (file === "/etc/shadow" || file === "shadow" || file === "/etc/passwd" || file === "passwd") {
                    out = "cat: " + file + ": Permission denied (WOPR DEFCON-1 lockdown active)";
                } else {
                    out = "cat: " + file + ": No such file or directory. Try 'ls' for classified files.";
                }
                break;
            case "skills":
            case "tools":
            case "arsenal":
                out = "[+] HACKER & VIDEO GAME EASTER EGG INVENTORY:\n" +
                    "    - W.O.P.R. / Joshua: Type 'wargames'\n" +
                    "    - OASIS Egg Hunt: Type 'oasis'\n" +
                    "    - Matrix Digital Rain: Type 'matrix'\n" +
                    "    - Gibson Hackers: Type 'hackers'\n" +
                    "    - Setec Astronomy: Type 'sneakers'\n" +
                    "    - Classified Files: Type 'ls' and 'cat <file>'";
                break;
            case "flag":
            case "ctf":
                out = "FLAG{1983_w0pr_j0shu4_04515_345t3r_3gg}\n[+] Egg Hunt Complete! You found the hidden Easter Egg.";
                break;
            case "sudo":
                if (!rest) {
                    out = "usage: sudo -u user command\nusage: sudo [-k]";
                } else if (rest.toLowerCase().indexOf("rm") !== -1 && rest.indexOf("/") !== -1) {
                    out = "rm: cannot remove root directory: Protected by W.O.P.R. DEFCON-1 safeguards.";
                } else {
                    out = "[sudo] password for guest:\nguest is not in the sudoers file. This incident will be reported to Dr. Falken.";
                }
                break;
            case "nmap":
            case "scan":
                out = "Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-11 19:46 EDT\n" +
                    "Nmap scan report for jacobdjwilson.com (198.3.19.83)\n" +
                    "Host is up (0.00018s latency).\n" +
                    "rDNS record for 198.3.19.83: wopr-01.norad.mil\n" +
                    "Not shown: 996 closed tcp ports (reset)\n" +
                    "PORT     STATE SERVICE VERSION\n" +
                    "22/tcp   open  ssh     OpenSSH 9.8p1 Debian 12 (protocol 2.0)\n" +
                    "80/tcp   open  http    Apache/2.4.62 (Debian)\n" +
                    "443/tcp  open  https   Apache/2.4.62 (Debian)\n" +
                    "1337/tcp open  waste?  none\n" +
                    "MAC Address: 00:00:46:13:37:42 (Cray Research, Inc.)\n" +
                    "Device type: Cray Supercomputer | Vector Parallel Processor\n" +
                    "Running: Debian GNU/Linux 12 (bookworm) / UNICOS\n" +
                    "OS CPE: cpe:/o:debian:debian_linux:12 cpe:/o:cray:unicos\n" +
                    "Nmap done: 1 IP address (1 host up) scanned in 0.38 seconds.";
                break;
            case "cowsay":
                var msg = rest || "Happy hacking! The only winning move is not to play.";
                var border = "-".repeat(msg.length + 2);
                out = " " + "_".repeat(msg.length + 2) + "\n" +
                    "< " + msg + " >\n" +
                    " " + border + "\n" +
                    "        \\   ^__^\n" +
                    "         \\  (oo)\\_______\n" +
                    "            (__)\\       )\\/\\\n" +
                    "                ||----w |\n" +
                    "                ||     ||";
                break;
            case "wargames":
            case "war_games":
            case "joshua":
            case "falken":
                out = "LOGON: JOSHUA\n\n" +
                    "GREETINGS PROFESSOR FALKEN.\n\n" +
                    "SHALL WE PLAY A GAME?\n" +
                    "  1. CHESS\n" +
                    "  2. GLOBAL THERMONUCLEAR WAR\n\n" +
                    "[DEFCON 1] PRIMARY TARGETS: LAS VEGAS, SEATTLE, CHICAGO, WASHINGTON D.C.\n" +
                    "SIMULATION: TIC-TAC-TOE VS. W.O.P.R. SUPERCOMPUTER...\n" +
                    "RESULT: STALEMATE (0 - 0)\n\n" +
                    "\"A STRANGE GAME. THE ONLY WINNING MOVE IS NOT TO PLAY.\"\n" +
                    "HOW ABOUT A NICE GAME OF CHESS?";
                break;
            case "oasis":
            case "rpo":
            case "readyplayer1":
            case "anorak":
            case "gunther":
                out = "=== THE OASIS EASTER EGG HUNT LOG (v2.4) ===\n" +
                    "\"People come to the OASIS for all the things they can do,\n" +
                    " but they stay because of all the things they can be.\"\n\n" +
                    "THE HIGH FIVE SCOREBOARD:\n" +
                    "  1. Parzival   - 100,000 pts [Copper Key | First Gate Clear]\n" +
                    "  2. Art3mis    -  99,000 pts [Copper Key | First Gate Clear]\n" +
                    "  3. Aech       -  98,000 pts [Copper Key | First Gate Clear]\n" +
                    "  4. Daito      -  97,000 pts [Copper Key | First Gate Clear]\n" +
                    "  5. Shoto      -  96,000 pts [Copper Key | First Gate Clear]\n" +
                    "  -- SIXERS (IOI-655321): 0 Keys --\n\n" +
                    "[+] FIRST TO THE KEY! FIRST TO THE EGG!";
                break;
            case "hackers":
            case "gibson":
                out = "\"HACK THE PLANET! HACK THE PLANET!\"\n\n" +
                    "- \"Mess with the best, die like the rest.\"\n" +
                    "- \"RISC architecture is gonna change everything.\"\n" +
                    "- \"Pool on the roof must have a leak...\"\n" +
                    "- \"Zero Cool? Crash Override? Acid Burn? Cereal Killer?\"\n" +
                    "- \"They're trashing our rights! Trashing!\"\n\n" +
                    "[+] Target: Ellingson Mineral Gibson Supercomputer | Status: ROOTED";
                break;
            case "sneakers":
            case "setec":
                out = "\"SETEC ASTRONOMY\" -> \"TOO MANY SECRETS\"\n\n" +
                    "- \"My voice is my passport. Verify me.\"\n" +
                    "- \"There's a war out there, old friend. A world war. It's not about who's got the most bullets. It's about who controls the information.\"\n" +
                    "- \"I want peace on earth and goodwill toward men.\" / \"We are the United States Government. We don't do that sort of thing.\"";
                break;
            case "games":
            case "game":
                out = "CLASSIC HACKER & VIDEO GAME EASTER EGGS:\n" +
                    "  wargames      - W.O.P.R. / Joshua Global Thermonuclear War\n" +
                    "  oasis         - Ready Player One Halliday Egg Hunt scoreboard\n" +
                    "  matrix        - Toggle falling green digital rain\n" +
                    "  hackers       - Hack The Planet / Gibson quotes\n" +
                    "  sneakers      - Setec Astronomy / Too Many Secrets\n" +
                    "  flag / ctf    - Capture The Flag challenge\n" +
                    "  cowsay <msg>  - Talking ASCII hacker cow\n" +
                    "  fortune       - Hacker cinema & folklore quotes";
                break;
            case "fortune":
            case "quote":
                var quotes = [
                    "\"A strange game. The only winning move is not to play. How about a nice game of chess?\" — W.O.P.R. (WarGames)",
                    "\"No one in the world gets what they want and that is beautiful.\" — James Halliday (Ready Player One)",
                    "\"Hack the planet!\" — Dade Murphy / Zero Cool (Hackers)",
                    "\"Too many secrets.\" — Cosmo / Martin Bishop (Sneakers)",
                    "\"Remember... all I'm offering is the truth. Nothing more.\" — Morpheus (The Matrix)",
                    "\"Greetings, Professor Falken. Shall we play a game?\" — Joshua (WarGames)",
                    "\"First to the key, first to the egg!\" — Gunther Creed (Ready Player One)",
                    "\"Mess with the best, die like the rest.\" — Acid Burn (Hackers)",
                    "\"End of Line.\" — Master Control Program (TRON)",
                    "\"My voice is my passport. Verify me.\" — Werner Brandes (Sneakers)"
                ];
                out = quotes[Math.floor(Math.random() * quotes.length)];
                break;
            case "hack":
            case "exploit":
                out = "[!] WARDIALING (311) 767-1083 (Sunnyvale Carrier Detect)...\n" +
                    "[+] CONNECT 1200 BAUD\n" +
                    "IDENTIFICATION NOT RECOGNIZED BY W.O.P.R.\n" +
                    "LOGON: JOSHUA\n" +
                    "GREETINGS PROFESSOR FALKEN.\n" +
                    "Type 'wargames' to begin.";
                break;
            case "ping":
                var target = args[0] || "127.0.0.1";
                out = "PING " + target + " (56 data bytes)\n" +
                    "64 bytes from " + target + ": icmp_seq=0 ttl=64 time=0.038 ms\n" +
                    "64 bytes from " + target + ": icmp_seq=1 ttl=64 time=0.041 ms\n" +
                    "--- " + target + " ping statistics ---\n" +
                    "2 packets transmitted, 2 received, 0% packet loss";
                break;
            case "rot13":
                if (!rest) {
                    out = "Usage: rot13 <message>";
                } else {
                    out = rest.replace(/[a-zA-Z]/g, function (c) {
                        return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
                    });
                }
                break;
            case "base64":
            case "b64":
                if (!rest) {
                    out = "Usage: base64 <text to encode or decode>";
                } else {
                    try {
                        if (/^[A-Za-z0-9+/=]+$/.test(rest) && rest.length % 4 === 0) {
                            out = "[Decoded]: " + atob(rest);
                        } else {
                            out = "[Encoded]: " + btoa(rest);
                        }
                    } catch (e) {
                        out = "[Encoded]: " + btoa(rest);
                    }
                }
                break;
            case "1337":
            case "leet":
                out = "4LL Y0UR B453 4R3 B3L0N6 T0 U5. H4CK TH3 PL4N3T!";
                break;
            case "sl":
                out = "      ====        ________                ___________\n" +
                    "  _D _|  |_______/        \\__I_I_____===__|_________|\n" +
                    "   |(_)---  |   H\\________/ _____ |   | |   |       |\n" +
                    "   /     |  |   H  |  |     |   | |   | |   |       |\n" +
                    "  |      |  |   H  |__--------------------|_______|\n" +
                    "  | ________|___H__/__|_____/[][]~\\_______|      |\n" +
                    "  |/ |   |_____I_____I_____I_____I_____I__|______|\n" +
                    "Chugga chugga choo choo! (Did you mean 'ls'?)";
                break;
            default:
                out = "bash: " + cmd + ": command not found. Type 'help' for available commands.";
        }

        var entry = document.createElement("div");
        entry.className = "cmd-entry";
        entry.textContent = "> " + cmdStr;
        var outputDiv = document.createElement("div");
        outputDiv.className = "cmd-output";
        outputDiv.textContent = out;
        histEl.appendChild(entry);
        histEl.appendChild(outputDiv);
        histEl.scrollTop = histEl.scrollHeight;
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
        if (color) floatEl.style.color = color;
        document.body.appendChild(floatEl);
        setTimeout(function () {
            floatEl.remove();
        }, 800);
    }

    /* ==========================================================================
   RETRO 8-BIT SPRITE ENGINE (LIGHTWEIGHT, COPYRIGHT-SAFE PROCEDURAL PIXEL ART)
   ========================================================================== */
    var BIT_PALETTE = {
        ".": null,
        "R": "#e40012",
        "B": "#0028a0",
        "S": "#fca044",
        "D": "#a84400",
        "Y": "#fcd000",
        "W": "#ffffff",
        "K": "#000000",
        "G": "#00a800",
        "L": "#80d010",
        "T": "#c84c0c",
        "O": "#f8d8a8",
        "C": "#9c9c9c"
    };

    var BIT_SPRITE_DATA = {
        "hero_idle": [
            "....RRRRR.......",
            "...RRRRRRRRR....",
            "...DDDSSKS......",
            "..DSDSSSKSSS....",
            "..DSDDSSKSSS....",
            "..DDSSSSKKKK....",
            "....SSSSSSS.....",
            "...RRBRRR.......",
            "..RRRBRRRBRRR...",
            "..RRRBBBBBRRR...",
            "..SSBYBBBYBSS...",
            "...BBBBBBBBB....",
            "...BBBBBBBBB....",
            "..BBB.....BBB...",
            "..DDD.....DDD...",
            ".DDDD.....DDDD.."
        ],
        "hero_run1": [
            "....RRRRR.......",
            "...RRRRRRRRR....",
            "...DDDSSKS......",
            "..DSDSSSKSSS....",
            "..DSDDSSKSSS....",
            "..DDSSSSKKKK....",
            "....SSSSSSS.....",
            "...RRBRRR.......",
            "..RRRBRRRBRRR...",
            "..RRRBBBBBRRR...",
            "..SSBYBBBYBSS...",
            "...BBBBBBBBB....",
            "..BBBBBBBBBBBB..",
            ".DDDD..BB..DDD..",
            ".......DD.......",
            "................"
        ],
        "hero_run2": [
            "....RRRRR.......",
            "...RRRRRRRRR....",
            "...DDDSSKS......",
            "..DSDSSSKSSS....",
            "..DSDDSSKSSS....",
            "..DDSSSSKKKK....",
            "....SSSSSSS.....",
            "...RRBRRR.......",
            "..RRRBRRRBRRR...",
            "..RRRBBBBBRRR...",
            "..SSBYBBBYBSS...",
            "...BBBBBBBBB....",
            "..BBBBBBBBBBB...",
            "...DDD...DDDD...",
            "..DDDD..........",
            "................"
        ],
        "hero_run3": [
            "....RRRRR.......",
            "...RRRRRRRRR....",
            "...DDDSSKS......",
            "..DSDSSSKSSS....",
            "..DSDDSSKSSS....",
            "..DDSSSSKKKK....",
            "....SSSSSSS.....",
            "...RRBRRR.......",
            "..RRRBRRRBRRR...",
            "..RRRBBBBBRRR...",
            "..SSBYBBBYBSS...",
            "...BBBBBBBBB....",
            "...BBBBBBBBB....",
            "..BBB.....BBB...",
            "..DDD.....DDD...",
            ".DDDD.....DDDD.."
        ],
        "hero_jump": [
            "....RRRRR.......",
            "...RRRRRRRRR....",
            "...DDDSSKS......",
            "..DSDSSSKSSS....",
            "..DSDDSSKSSS....",
            "..DDSSSSKKKK....",
            "....SSSSSSS.....",
            "..SSRRBRRR......",
            ".SSSRRBBBBBRRR..",
            "..SSRRBYBBBYSS..",
            "...RRBBBBBBBBB..",
            "..BBBBBBBBBBBB..",
            "..BBBB...BBBB...",
            ".DDDD.....DDDD..",
            "................",
            "................"
        ],
        "hero_dead": [
            "....RRRRR.......",
            "...RRRRRRRRR....",
            "...DDDSSKS......",
            "..DSDSSSKSSS....",
            "..DSDDSSKSSS....",
            "..DDSSSSKKKK....",
            "....SSSSSSS.....",
            "....RRRRRRR.....",
            "...RRRRRRRRR....",
            "..RRRRRRRRRRR...",
            "..SS.RRRRR..SS..",
            "...DD..BB..DD...",
            "..DDD..BB..DDD..",
            ".......DD.......",
            "......DDDD......",
            "................"
        ],
        "critter_walk1": [
            "......DDDD......",
            ".....DDDDDD.....",
            "....DDDDDDDD....",
            "...DDDDDDDDDD...",
            "..DKKDDDDDDKKD..",
            ".DDDOKDDDDKODDD.",
            ".DDDOKKKKKKODDD.",
            "DDDDOKODDOKODDDD",
            "DDDDOOODDOOODDDD",
            "DDDDDDDDDDDDDDDD",
            ".DDDDOOOOOODDDD.",
            "....OOOOOOOO....",
            "....OOOOOOOOKK..",
            "...KKOOOOOKKKKK.",
            "...KKKOOOKKKKKK.",
            "....KKK..KKKKK.."
        ],
        "critter_walk2": [
            "......DDDD......",
            ".....DDDDDD.....",
            "....DDDDDDDD....",
            "...DDDDDDDDDD...",
            "..DKKDDDDDDKKD..",
            ".DDDOKDDDDKODDD.",
            ".DDDOKKKKKKODDD.",
            "DDDDOKODDOKODDDD",
            "DDDDOOODDOOODDDD",
            "DDDDDDDDDDDDDDDD",
            ".DDDDOOOOOODDDD.",
            "....OOOOOOOO....",
            "..KKOOOOOOOO....",
            ".KKKKKOOOOOKK...",
            ".KKKKKKOOOKKK...",
            "..KKKKK..KKK...."
        ],
        "critter_flat": [
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "..DKKDDDDDDKKD..",
            ".DDDOKDDDDKODDD.",
            "DDDDOKKKKKKODDDD",
            "DDDDOKODDOKODDDD",
            ".DDDDOOOOOODDDD.",
            "....OOOOOOOO....",
            "...KKKKKKKKKK...",
            "....KKKKKKKK...."
        ],
        "block_q1": [
            "KKKKKKKKKKKKKKKK",
            "KSDDDDDDDDDDDDSK",
            "KDSYYYYYYYYYYSDK",
            "KDYYYYYYYYYYYYDK",
            "KDYYKKKKKKYYYYDK",
            "KDYYKDDDDDKYYYDK",
            "KDYYKDDDDKKYYYDK",
            "KDYYYYYYKKYYYYDK",
            "KDYYYYYKKYYYYYDK",
            "KDYYYYKKKYYYYYDK",
            "KDYYYYKKKYYYYYDK",
            "KDYYYYYYYYYYYYDK",
            "KDYYYYKKKYYYYYDK",
            "KDSYYYKKKYYYYSDK",
            "KSDDDDDDDDDDDDSK",
            "KKKKKKKKKKKKKKKK"
        ],
        "block_q2": [
            "KKKKKKKKKKKKKKKK",
            "KSWWWWWWWWWWWWSK",
            "KWSYYYYYYYYYYSDK",
            "KWYYYYYYYYYYYYDK",
            "KWYYKKKKKKYYYYDK",
            "KWYYKDDDDDKYYYDK",
            "KWYYKDDDDKKYYYDK",
            "KWYYYYYYKKYYYYDK",
            "KWYYYYYKKYYYYYDK",
            "KWYYYYKKKYYYYYDK",
            "KWYYYYKKKYYYYYDK",
            "KWYYYYYYYYYYYYDK",
            "KWYYYYKKKYYYYYDK",
            "KWSYYYKKKYYYYSDK",
            "KSWWWWWWWWWWWWSK",
            "KKKKKKKKKKKKKKKK"
        ],
        "block_empty": [
            "KKKKKKKKKKKKKKKK",
            "KSSSSSSSSSSSSSSK",
            "KSDDDDDDDDDDDDDK",
            "KSDKKDDDDDDDDKDK",
            "KSDKSDDDDDDDDSDK",
            "KSDDDDDDDDDDDDDK",
            "KSDDDDDDDDDDDDDK",
            "KSDDDDDDDDDDDDDK",
            "KSDDDDDDDDDDDDDK",
            "KSDDDDDDDDDDDDDK",
            "KSDDDDDDDDDDDDDK",
            "KSDKSDDDDDDDDSDK",
            "KSDKKDDDDDDDDKDK",
            "KSDDDDDDDDDDDDDK",
            "KDDDDDDDDDDDDDDK",
            "KKKKKKKKKKKKKKKK"
        ],
        "block_brick": [
            "TTTTTTTTTTTTTTTT",
            "TOOOOOOOTTOOOOOT",
            "TOOOOOOOTTOOOOOT",
            "TTTTTTTTTTTTTTTT",
            "TTOOOOOTTOOOOOOT",
            "TTOOOOOTTOOOOOOT",
            "TTTTTTTTTTTTTTTT",
            "TOOOOOOOTTOOOOOT",
            "TOOOOOOOTTOOOOOT",
            "TTTTTTTTTTTTTTTT",
            "TTOOOOOTTOOOOOOT",
            "TTOOOOOTTOOOOOOT",
            "TTTTTTTTTTTTTTTT",
            "TOOOOOOOTTOOOOOT",
            "TOOOOOOOTTOOOOOT",
            "TTTTTTTTTTTTTTTT"
        ],
        "coin": [
            ".....YYYYYY.....",
            "...YYWWWWWWYY...",
            "..YWWWWWWWWWWY..",
            ".YWWYY....YYWWY.",
            ".YWWYY....YYWWY.",
            "YWWYY..YY..YYWWY",
            "YWWYY..YY..YYWWY",
            "YWWYY..YY..YYWWY",
            "YWWYY..YY..YYWWY",
            "YWWYY..YY..YYWWY",
            ".YWWYY....YYWWY.",
            ".YWWYY....YYWWY.",
            "..YWWWWWWWWWWY..",
            "...YYWWWWWWYY...",
            ".....YYYYYY.....",
            "................"
        ],
        "flag": [
            "WWWWWWWWWWWWWW..",
            "WRRRRRRRRRRRRW..",
            "WRRWWWRRRWWWRW..",
            "WRRWKWRRRWKWRW..",
            "WRRWWWRRRWWWRW..",
            "WRRRRRRRRRRRRW..",
            "WRRRRWWWWWRRRW..",
            "WRRRRWKWKWRRRW..",
            "WRRRRRWWWRRRRW..",
            "WWWWWWWWWWWWWW..",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    };

    var _spriteCanvases = {};
    var _spriteUrls = {};

    function getSpriteCanvas(name) {
        if (_spriteCanvases[name]) return _spriteCanvases[name];
        var rows = BIT_SPRITE_DATA[name];
        if (!rows) return null;
        var cvs = document.createElement("canvas");
        cvs.width = 16;
        cvs.height = 16;
        var ctx = cvs.getContext("2d");
        for (var y = 0; y < 16; y++) {
            var row = rows[y];
            for (var x = 0; x < 16; x++) {
                var ch = row[x];
                var col = BIT_PALETTE[ch];
                if (col) {
                    ctx.fillStyle = col;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        _spriteCanvases[name] = cvs;
        return cvs;
    }

    function getSpriteUrl(name) {
        if (_spriteUrls[name]) return _spriteUrls[name];
        var cvs = getSpriteCanvas(name);
        if (!cvs) return "";
        var url = cvs.toDataURL();
        _spriteUrls[name] = url;
        return url;
    }

    /* ==========================================================================
       RETRO 8-BIT ARCADE RUNNER (LIGHTWEIGHT, FAST, PLAYABLE PLATFORMER)
       ========================================================================== */
    var _marioArcade = {
        active: false,
        canvas: null,
        ctx: null,
        animId: null,
        cameraX: 0,
        levelWidth: 1400,
        screenW: 480,
        screenH: 270,
        groundY: 238,
        score: 0,
        coins: 0,
        time: 400,
        timeTick: 0,
        state: "playing",
        keys: { left: false, right: false, jump: false },
        player: null,
        blocks: [],
        pipes: [],
        critters: [],
        stairs: [],
        particles: [],
        floatScores: [],
        flagpole: { x: 1220, topY: 80, bottomY: 238, flagY: 96 },
        castle: { x: 1300, y: 142, w: 96, h: 96, doorX: 1334, doorY: 198 }
    };

    function initMarioLevel() {
        var arc = _marioArcade;
        arc.cameraX = 0;
        arc.state = "playing";
        arc.score = window._8bitScore || 0;
        arc.coins = window._8bitCoins || 0;
        arc.time = 400;
        arc.timeTick = 0;
        arc.particles = [];
        arc.floatScores = [];
        arc.flagpole.flagY = 96;

        arc.player = {
            x: 40,
            y: arc.groundY - 32,
            w: 24,
            h: 32,
            vx: 0,
            vy: 0,
            facing: 1,
            grounded: true,
            jumping: false,
            animTimer: 0,
            animFrame: 0,
            dead: false,
            deathVy: 0,
            deathY: 0
        };

        arc.blocks = [
            { x: 160, y: 154, type: "question", bumpY: 0 },
            { x: 224, y: 154, type: "brick", bumpY: 0 },
            { x: 256, y: 154, type: "question", bumpY: 0 },
            { x: 288, y: 154, type: "brick", bumpY: 0 },
            { x: 256, y: 86, type: "question", bumpY: 0 },

            { x: 480, y: 154, type: "question", bumpY: 0 },
            { x: 512, y: 154, type: "question", bumpY: 0 },

            { x: 820, y: 154, type: "brick", bumpY: 0 },
            { x: 852, y: 154, type: "question", bumpY: 0 },
            { x: 884, y: 154, type: "brick", bumpY: 0 }
        ];

        arc.pipes = [
            { x: 360, y: 198, w: 48, h: 40 },
            { x: 700, y: 182, w: 48, h: 56 },
            { x: 960, y: 166, w: 48, h: 72 }
        ];

        arc.stairs = [
            { x: 1080, y: 206, w: 32, h: 32 },
            { x: 1112, y: 174, w: 32, h: 64 },
            { x: 1144, y: 142, w: 32, h: 96 },
            { x: 1176, y: 110, w: 32, h: 128 }
        ];

        arc.critters = [
            { x: 240, y: arc.groundY - 28, w: 28, h: 28, vx: -1.0, stomped: false, stompTimer: 0 },
            { x: 520, y: arc.groundY - 28, w: 28, h: 28, vx: -1.0, stomped: false, stompTimer: 0 },
            { x: 840, y: arc.groundY - 28, w: 28, h: 28, vx: -1.0, stomped: false, stompTimer: 0 }
        ];
    }

    function openMarioArcade() {
        var overlay = document.getElementById("mario-arcade-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "mario-arcade-overlay";
            overlay.className = "mario-arcade-modal";
            overlay.innerHTML =
                '<div class="mario-arcade-box">' +
                '<div class="mario-arcade-header">' +
                '<span class="mario-arcade-title">WORLD 1-1</span>' +
                '<div class="mario-arcade-actions">' +
                '<button type="button" class="mario-hdr-btn" id="mario-btn-restart" title="Restart Game">↺ RETRY</button>' +
                '<button type="button" class="mario-hdr-btn" id="mario-btn-sound" title="Toggle Sound">' + (_soundMuted ? "🔇" : "🔊") + '</button>' +
                '<button type="button" class="mario-hdr-btn" id="mario-btn-close" title="Close [ESC]">✕ ESC</button>' +
                '</div>' +
                '</div>' +
                '<div class="mario-screen-wrapper">' +
                '<canvas id="mario-arcade-canvas" width="480" height="270"></canvas>' +
                '<div class="mario-crt-scanlines"></div>' +
                '</div>' +
                '<div class="mario-arcade-footer">' +
                '<div class="mario-keyboard-hint">CONTROLS: [←/→ or A/D] MOVE &nbsp; [SPACE/↑/W] JUMP</div>' +
                '<div class="mario-touch-pad">' +
                '<div class="mario-dpad">' +
                '<button type="button" class="dpad-btn" id="dpad-left" aria-label="Move Left">◄</button>' +
                '<button type="button" class="dpad-btn" id="dpad-right" aria-label="Move Right">►</button>' +
                '</div>' +
                '<div class="mario-action-btns">' +
                '<button type="button" class="action-btn btn-a" id="touch-jump" aria-label="Jump">JUMP</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            document.body.appendChild(overlay);

            document.getElementById("mario-btn-close").addEventListener("click", closeMarioArcade);
            document.getElementById("mario-btn-restart").addEventListener("click", function () {
                initMarioLevel();
            });
            document.getElementById("mario-btn-sound").addEventListener("click", function () {
                _soundMuted = !_soundMuted;
                var sym = _soundMuted ? "🔇" : "🔊";
                this.textContent = sym;
                var hdrSound = document.getElementById("bit-sound-toggle");
                if (hdrSound) hdrSound.textContent = sym;
            });

            var btnL = document.getElementById("dpad-left");
            var btnR = document.getElementById("dpad-right");
            var btnJ = document.getElementById("touch-jump");

            if (btnL) {
                btnL.addEventListener("touchstart", function (e) { e.preventDefault(); _marioArcade.keys.left = true; });
                btnL.addEventListener("touchend", function (e) { e.preventDefault(); _marioArcade.keys.left = false; });
            }
            if (btnR) {
                btnR.addEventListener("touchstart", function (e) { e.preventDefault(); _marioArcade.keys.right = true; });
                btnR.addEventListener("touchend", function (e) { e.preventDefault(); _marioArcade.keys.right = false; });
            }
            if (btnJ) {
                btnJ.addEventListener("touchstart", function (e) {
                    e.preventDefault();
                    if (_marioArcade.player && _marioArcade.player.grounded) {
                        _marioArcade.player.vy = -8.8;
                        _marioArcade.player.grounded = false;
                        _marioArcade.player.jumping = true;
                        playJumpSound();
                    }
                });
            }
        }

        overlay.style.display = "flex";
        _marioArcade.active = true;
        _marioArcade.canvas = document.getElementById("mario-arcade-canvas");
        _marioArcade.ctx = _marioArcade.canvas.getContext("2d");

        initMarioLevel();
        bindArcadeKeys();

        if (_marioArcade.animId) cancelAnimationFrame(_marioArcade.animId);
        function arcadeLoop() {
            if (!_marioArcade.active) return;
            updateMarioGame();
            renderMarioGame();
            _marioArcade.animId = requestAnimationFrame(arcadeLoop);
        }
        _marioArcade.animId = requestAnimationFrame(arcadeLoop);
    }

    function closeMarioArcade() {
        _marioArcade.active = false;
        if (_marioArcade.animId) {
            cancelAnimationFrame(_marioArcade.animId);
            _marioArcade.animId = null;
        }
        unbindArcadeKeys();
        var overlay = document.getElementById("mario-arcade-overlay");
        if (overlay) overlay.style.display = "none";
    }

    function bindArcadeKeys() {
        window._marioKeyHandler = function (e) {
            if (!_marioArcade.active) return;
            var arc = _marioArcade;
            var down = e.type === "keydown";

            if (e.key === "Escape") {
                if (down) closeMarioArcade();
                return;
            }

            if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
                arc.keys.left = down;
                e.preventDefault();
            } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
                arc.keys.right = down;
                e.preventDefault();
            } else if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
                if (down && !arc.keys.jump && arc.player && arc.player.grounded && arc.state === "playing") {
                    arc.player.vy = -8.8;
                    arc.player.grounded = false;
                    arc.player.jumping = true;
                    playJumpSound();
                }
                if (down && arc.state === "win") {
                    initMarioLevel();
                }
                arc.keys.jump = down;
                e.preventDefault();
            }
        };
        window.addEventListener("keydown", window._marioKeyHandler);
        window.addEventListener("keyup", window._marioKeyHandler);
    }

    function unbindArcadeKeys() {
        if (window._marioKeyHandler) {
            window.removeEventListener("keydown", window._marioKeyHandler);
            window.removeEventListener("keyup", window._marioKeyHandler);
            window._marioKeyHandler = null;
        }
    }

    function updateMarioGame() {
        var arc = _marioArcade;
        var p = arc.player;
        if (!p) return;

        // Bumping blocks animation
        arc.blocks.forEach(function (b) {
            if (b.bumpY < 0) {
                b.bumpY += 1.5;
                if (b.bumpY > 0) b.bumpY = 0;
            }
        });

        if (arc.state === "dead") {
            p.deathVy += 0.44;
            p.deathY += p.deathVy;
            return;
        }

        if (arc.state === "flag_slide") {
            p.y += 3;
            if (arc.flagpole.flagY < arc.groundY - 32) arc.flagpole.flagY += 3;
            if (p.y >= arc.groundY - 32) {
                p.y = arc.groundY - 32;
                arc.state = "walk_to_castle";
            }
            return;
        }

        if (arc.state === "walk_to_castle") {
            p.x += 1.8;
            p.facing = 1;
            p.animTimer++;
            p.animFrame = Math.floor(p.animTimer / 6) % 3;
            if (p.x >= arc.castle.doorX) {
                arc.state = "win";
                arc.score += 2000;
                if (window.update8bitScore) window.update8bitScore(2000);
            }
            return;
        }

        if (arc.state === "win") return;

        // Player input physics
        var targetVx = 0;
        if (arc.keys.left) {
            targetVx -= 3.0;
            p.facing = -1;
        }
        if (arc.keys.right) {
            targetVx += 3.0;
            p.facing = 1;
        }
        p.vx = p.vx * 0.75 + targetVx * 0.25;

        // Variable jump height
        if (!arc.keys.jump && p.jumping && p.vy < -3.0) {
            p.vy = -3.0;
        }

        // Gravity
        p.vy += 0.44;
        if (p.vy > 9) p.vy = 9;

        p.x += p.vx;
        if (p.x < 10) { p.x = 10; p.vx = 0; }

        p.y += p.vy;

        // Build list of solid rects for collision
        var solids = [];
        solids.push({ x: 0, y: arc.groundY, w: 600, h: 40 });
        solids.push({ x: 670, y: arc.groundY, w: arc.levelWidth - 670, h: 40 });

        arc.pipes.forEach(function (pi) { solids.push(pi); });
        arc.stairs.forEach(function (st) { solids.push(st); });
        arc.blocks.forEach(function (bl) {
            solids.push({ x: bl.x, y: bl.y + bl.bumpY, w: 32, h: 32, blockRef: bl });
        });

        p.grounded = false;

        // Collision detection
        solids.forEach(function (s) {
            if (p.x + p.w > s.x + 4 && p.x < s.x + s.w - 4) {
                // Landing on top
                if (p.vy >= 0 && p.y + p.h >= s.y && p.y + p.h - p.vy <= s.y + 12) {
                    p.y = s.y - p.h;
                    p.vy = 0;
                    p.grounded = true;
                    p.jumping = false;
                }
                // Hitting block from below
                else if (p.vy < 0 && p.y <= s.y + s.h && p.y - p.vy >= s.y + s.h - 12) {
                    p.y = s.y + s.h;
                    p.vy = 1;
                    if (s.blockRef) {
                        var bl = s.blockRef;
                        bl.bumpY = -6;
                        if (bl.type === "question") {
                            bl.type = "empty";
                            playCoinSound();
                            arc.score += 200;
                            arc.coins += 1;
                            if (window.update8bitScore) window.update8bitScore(200);
                            if (window.update8bitCoins) window.update8bitCoins(1);
                            arc.particles.push({ x: bl.x + 8, y: bl.y - 12, vy: -6, life: 28 });
                            arc.floatScores.push({ text: "200", x: bl.x + 8, y: bl.y - 18, life: 35 });
                        } else if (bl.type === "brick") {
                            playBumpSound();
                        }
                    }
                }
            }
        });

        // Pit check
        if (p.y > arc.screenH + 20) {
            triggerPlayerDeath();
            return;
        }

        // Flagpole collision
        if (p.x >= arc.flagpole.x - 14) {
            arc.state = "flag_slide";
            p.x = arc.flagpole.x - 4;
            p.vx = 0;
            p.vy = 0;
            playStageClearSound();
            return;
        }

        // Critter collision & physics
        arc.critters.forEach(function (c) {
            if (c.stomped) {
                c.stompTimer--;
                return;
            }
            c.x += c.vx;
            arc.pipes.forEach(function (pi) {
                if (c.x + c.w > pi.x && c.x < pi.x + pi.w) {
                    c.vx = -c.vx;
                }
            });
            if (c.x < 100) c.vx = Math.abs(c.vx);

            // Stomp or damage
            if (p.x + p.w > c.x + 4 && p.x < c.x + c.w - 4 && p.y + p.h > c.y && p.y < c.y + c.h) {
                if (p.vy > 0 && p.y + p.h - p.vy <= c.y + 14) {
                    c.stomped = true;
                    c.stompTimer = 25;
                    p.vy = -6.8;
                    playStompSound();
                    arc.score += 200;
                    if (window.update8bitScore) window.update8bitScore(200);
                    arc.floatScores.push({ text: "200", x: c.x, y: c.y, life: 30 });
                } else if (arc.state === "playing") {
                    triggerPlayerDeath();
                }
            }
        });

        arc.critters = arc.critters.filter(function (c) { return !c.stomped || c.stompTimer > 0; });

        // Camera follow
        var targetCamX = p.x - 160;
        arc.cameraX = Math.max(0, Math.min(arc.levelWidth - arc.screenW, targetCamX));

        // Particles & floating score
        arc.particles.forEach(function (pt) {
            pt.y += pt.vy;
            pt.vy += 0.4;
            pt.life--;
        });
        arc.particles = arc.particles.filter(function (pt) { return pt.life > 0; });

        arc.floatScores.forEach(function (fs) {
            fs.y -= 0.6;
            fs.life--;
        });
        arc.floatScores = arc.floatScores.filter(function (fs) { return fs.life > 0; });
    }

    function triggerPlayerDeath() {
        var arc = _marioArcade;
        arc.state = "dead";
        var p = arc.player;
        p.deathY = p.y;
        p.deathVy = -7.5;
        playPowerdownSound();
        setTimeout(function () {
            if (arc.active) initMarioLevel();
        }, 1200);
    }

    function renderMarioGame() {
        var arc = _marioArcade;
        var ctx = arc.ctx;
        if (!ctx) return;
        var cx = Math.floor(arc.cameraX);

        // Crisp NES Sky
        ctx.fillStyle = "#5c94fc";
        ctx.fillRect(0, 0, arc.screenW, arc.screenH);

        // Background Clouds & Hills
        drawArcadeScenery(ctx, cx);

        // Ground Blocks
        var groundImg = getSpriteCanvas("block_brick");
        for (var gx = 0; gx < arc.levelWidth; gx += 32) {
            if (gx < 600 || gx >= 670) {
                var sgx = gx - cx;
                if (sgx > -32 && sgx < arc.screenW) {
                    ctx.drawImage(groundImg, sgx, arc.groundY, 32, 32);
                }
            }
        }

        // Castle & Flagpole
        drawArcadeCastle(ctx, arc.castle, cx);
        drawArcadeFlagpole(ctx, arc.flagpole, cx);

        // Stairs
        var brickImg = getSpriteCanvas("block_brick");
        arc.stairs.forEach(function (st) {
            var sx = st.x - cx;
            if (sx > -st.w && sx < arc.screenW) {
                for (var sy = st.y; sy < arc.groundY; sy += 32) {
                    ctx.drawImage(brickImg, sx, sy, 32, 32);
                }
            }
        });

        // Pipes
        arc.pipes.forEach(function (p) {
            var px = p.x - cx;
            if (px > -p.w && px < arc.screenW) {
                drawArcadePipe(ctx, px, p.y, p.w, p.h);
            }
        });

        // Floating Blocks
        var qFrame = Math.floor(Date.now() / 240) % 2 === 0 ? getSpriteCanvas("block_q1") : getSpriteCanvas("block_q2");
        var emptyImg = getSpriteCanvas("block_empty");

        arc.blocks.forEach(function (b) {
            var bx = b.x - cx;
            var by = b.y + b.bumpY;
            if (bx > -32 && bx < arc.screenW) {
                var img = b.type === "question" ? qFrame : (b.type === "brick" ? brickImg : emptyImg);
                ctx.drawImage(img, bx, by, 32, 32);
            }
        });

        // Critters
        var cw1 = getSpriteCanvas("critter_walk1");
        var cw2 = getSpriteCanvas("critter_walk2");
        var cf = getSpriteCanvas("critter_flat");
        var critterFrame = Math.floor(Date.now() / 250) % 2 === 0 ? cw1 : cw2;

        arc.critters.forEach(function (c) {
            var cgx = c.x - cx;
            if (cgx > -32 && cgx < arc.screenW) {
                if (c.stomped) {
                    ctx.drawImage(cf, cgx, c.y + 12, 28, 16);
                } else {
                    ctx.drawImage(critterFrame, cgx, c.y, 28, 28);
                }
            }
        });

        // Coins from blocks
        var coinImg = getSpriteCanvas("coin");
        arc.particles.forEach(function (pt) {
            var ptx = pt.x - cx;
            ctx.drawImage(coinImg, ptx, pt.y, 20, 20);
        });

        // Floating score text
        ctx.fillStyle = "#ffffff";
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 2;
        arc.floatScores.forEach(function (fs) {
            ctx.fillText(fs.text, fs.x - cx, fs.y);
        });
        ctx.shadowBlur = 0;

        // Player
        drawArcadePlayer(ctx, arc.player, cx);

        // Win Banner
        if (arc.state === "win") {
            ctx.fillStyle = "rgba(0, 24, 76, 0.94)";
            ctx.strokeStyle = "#fcd000";
            ctx.lineWidth = 3;
            ctx.fillRect(40, 70, 400, 100);
            ctx.strokeRect(40, 70, 400, 100);

            ctx.fillStyle = "#fcd000";
            ctx.font = '11px "Press Start 2P", monospace';
            ctx.textAlign = "center";
            ctx.fillText("WORLD CLEAR!", 240, 105);
            ctx.fillStyle = "#ffffff";
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillText("YOU HAVE SAVED THE PRINCESS!", 240, 128);
            ctx.fillStyle = "#fc9838";
            ctx.fillText("PRESS [SPACE] OR RETRY TO PLAY", 240, 150);
            ctx.textAlign = "left";
        }
    }

    function drawArcadeScenery(ctx, cx) {
        // Pixel Clouds
        var clouds = [
            { x: 100, y: 35 }, { x: 380, y: 55 }, { x: 700, y: 30 },
            { x: 1020, y: 45 }, { x: 1300, y: 35 }
        ];
        ctx.fillStyle = "#ffffff";
        clouds.forEach(function (cl) {
            var sx = cl.x - cx * 0.4;
            if (sx > -60 && sx < 520) {
                ctx.beginPath();
                ctx.arc(sx + 15, cl.y + 12, 12, 0, Math.PI * 2);
                ctx.arc(sx + 30, cl.y + 8, 16, 0, Math.PI * 2);
                ctx.arc(sx + 45, cl.y + 12, 12, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Bushes
        var bushes = [
            { x: 120, y: 222 }, { x: 440, y: 222 }, { x: 800, y: 222 }, { x: 1040, y: 222 }
        ];
        ctx.fillStyle = "#00a800";
        bushes.forEach(function (bu) {
            var sx = bu.x - cx;
            if (sx > -50 && sx < 520) {
                ctx.beginPath();
                ctx.arc(sx + 12, bu.y + 10, 10, 0, Math.PI * 2);
                ctx.arc(sx + 24, bu.y + 6, 14, 0, Math.PI * 2);
                ctx.arc(sx + 36, bu.y + 10, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    function drawArcadePipe(ctx, px, py, pw, ph) {
        ctx.fillStyle = "#00a800";
        // Pipe body
        ctx.fillRect(px + 4, py + 12, pw - 8, ph - 12);
        ctx.fillStyle = "#80d010";
        ctx.fillRect(px + 6, py + 12, 4, ph - 12);
        ctx.fillStyle = "#005800";
        ctx.fillRect(px + pw - 8, py + 12, 4, ph - 12);

        // Pipe rim
        ctx.fillStyle = "#00a800";
        ctx.fillRect(px, py, pw, 12);
        ctx.fillStyle = "#80d010";
        ctx.fillRect(px + 2, py + 2, 4, 8);
        ctx.fillStyle = "#005800";
        ctx.fillRect(px + pw - 6, py + 2, 4, 8);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, pw, 12);
    }

    function drawArcadeFlagpole(ctx, fp, cx) {
        var sx = fp.x - cx;
        if (sx < -20 || sx > 500) return;

        // Pole
        ctx.fillStyle = "#c0c0c0";
        ctx.fillRect(sx, fp.topY, 4, fp.bottomY - fp.topY);
        // Golden ball top
        ctx.fillStyle = "#fcd000";
        ctx.beginPath();
        ctx.arc(sx + 2, fp.topY - 3, 5, 0, Math.PI * 2);
        ctx.fill();

        // Sliding Flag
        var flagImg = getSpriteCanvas("flag");
        ctx.drawImage(flagImg, sx - 24, fp.flagY, 24, 20);
    }

    function drawArcadeCastle(ctx, c, cx) {
        var sx = c.x - cx;
        if (sx < -120 || sx > 500) return;

        // Fortress body
        ctx.fillStyle = "#c84c0c";
        ctx.fillRect(sx, c.y, c.w, c.h);
        ctx.fillStyle = "#f8d8a8";
        for (var bx = sx + 8; bx < sx + c.w; bx += 20) {
            ctx.fillRect(bx, c.y + 8, 12, 8);
            ctx.fillRect(bx - 10, c.y + 24, 12, 8);
            ctx.fillRect(bx, c.y + 40, 12, 8);
        }

        // Crenellations
        ctx.fillStyle = "#c84c0c";
        ctx.fillRect(sx, c.y - 12, 16, 12);
        ctx.fillRect(sx + 28, c.y - 12, 16, 12);
        ctx.fillRect(sx + 56, c.y - 12, 16, 12);
        ctx.fillRect(sx + 80, c.y - 12, 16, 12);

        // Doorway
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(sx + c.w / 2, c.doorY, 12, Math.PI, 0);
        ctx.rect(sx + c.w / 2 - 12, c.doorY, 24, c.y + c.h - c.doorY);
        ctx.fill();

        // Spire flag on victory
        if (_marioArcade.state === "win") {
            var flagImg = getSpriteCanvas("flag");
            ctx.drawImage(flagImg, sx + c.w / 2 - 6, c.y - 28, 20, 16);
        }
    }

    function drawArcadePlayer(ctx, p, cx) {
        if (!p) return;
        var px = Math.floor(p.x - cx);
        var py = Math.floor(p.y);
        var spriteName = "hero_idle";

        if (_marioArcade.state === "dead") {
            spriteName = "hero_dead";
            py = Math.floor(p.deathY);
        } else if (_marioArcade.state === "flag_slide") {
            spriteName = "hero_jump";
        } else if (!p.grounded) {
            spriteName = "hero_jump";
        } else if (Math.abs(p.vx) > 0.1) {
            p.animTimer += Math.abs(p.vx) * 0.4;
            var f = (Math.floor(p.animTimer / 4) % 3) + 1;
            spriteName = "hero_run" + f;
        }

        var cvs = getSpriteCanvas(spriteName);
        if (!cvs) return;

        ctx.save();
        if (p.facing === -1) {
            ctx.scale(-1, 1);
            ctx.drawImage(cvs, -px - 28, py, 28, 32);
        } else {
            ctx.drawImage(cvs, px, py, 28, 32);
        }
        ctx.restore();
    }

    /* ==========================================================================
       PAGE-LEVEL MARIO WALKER (INTERACTIVE WEBSITE COMPANION)
       ========================================================================== */
    var _pageMario = {
        active: false,
        el: null,
        goombaEl: null,
        x: 80,
        y: 0,
        vy: 0,
        dir: 1,
        jumping: false,
        animTimer: null
    };

    function initPageMarioWalker() {
        if (document.getElementById("mario-page-walker")) return;
        var walker = document.createElement("div");
        walker.id = "mario-page-walker";
        walker.className = "mario-page-walker";
        walker.setAttribute("role", "button");
        walker.setAttribute("tabindex", "0");
        walker.setAttribute("title", "Click to Jump! Press [P] or Click Play for Arcade");
        walker.innerHTML = '<img id="mario-page-img" src="' + getSpriteUrl("hero_idle") + '" alt="Hero" />';
        document.body.appendChild(walker);

        var goomba = document.createElement("div");
        goomba.id = "mario-page-goomba";
        goomba.className = "mario-page-goomba";
        goomba.setAttribute("title", "Stomp me!");
        goomba.innerHTML = '<img id="goomba-page-img" src="' + getSpriteUrl("critter_walk1") + '" alt="Critter" />';
        document.body.appendChild(goomba);

        _pageMario.active = true;
        _pageMario.el = walker;
        _pageMario.goombaEl = goomba;
        _pageMario.x = 80;
        _pageMario.y = 0;
        _pageMario.vy = 0;
        _pageMario.dir = 1;
        _pageMario.jumping = false;

        var goombaX = Math.min(window.innerWidth - 120, 500);
        var goombaDir = -1;
        var goombaStomped = false;

        walker.addEventListener("click", function (e) {
            e.stopPropagation();
            if (!_pageMario.jumping) {
                _pageMario.jumping = true;
                _pageMario.vy = -12;
                playJumpSound();
            }
        });

        goomba.addEventListener("click", function (e) {
            e.stopPropagation();
            if (goombaStomped) return;
            goombaStomped = true;
            playStompSound();
            var gImg = document.getElementById("goomba-page-img");
            if (gImg) {
                gImg.src = getSpriteUrl("critter_flat");
                gImg.style.transform = "none";
            }
            var rect = goomba.getBoundingClientRect();
            showFloatText("+200", rect.left + 16, rect.top, "#fcd000");
            if (window.update8bitScore) window.update8bitScore(200);
            setTimeout(function () {
                goombaStomped = false;
                if (gImg) gImg.src = getSpriteUrl("critter_walk1");
            }, 2500);
        });

        window._pageMarioKeyDown = function (e) {
            if (CURRENT_THEME !== "8bit" || _marioArcade.active) return;
            if (e.key === "p" || e.key === "P") {
                openMarioArcade();
                return;
            }
            if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
                _pageMario.dir = -1;
                _pageMario.x = Math.max(10, _pageMario.x - 18);
            }
            if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
                _pageMario.dir = 1;
                _pageMario.x = Math.min(window.innerWidth - 42, _pageMario.x + 18);
            }
            if ((e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") && !_pageMario.jumping) {
                if (e.key === " " || e.key === "ArrowUp") e.preventDefault();
                _pageMario.jumping = true;
                _pageMario.vy = -12;
                playJumpSound();
            }
        };
        window.addEventListener("keydown", window._pageMarioKeyDown);

        var walkTick = 0;
        function loop() {
            if (CURRENT_THEME !== "8bit") {
                removePageMarioWalker();
                return;
            }
            walkTick++;

            if (_pageMario.jumping) {
                _pageMario.vy += 0.8;
                _pageMario.y += _pageMario.vy;
                _pageMario.x += _pageMario.dir * 1.5;
                if (_pageMario.x > window.innerWidth - 60) _pageMario.dir = -1;
                if (_pageMario.x < 30) _pageMario.dir = 1;
                if (_pageMario.y >= 0) {
                    _pageMario.y = 0;
                    _pageMario.jumping = false;
                    _pageMario.vy = 0;
                }
            } else {
                if (walkTick % 4 === 0) {
                    _pageMario.x += _pageMario.dir * 2;
                    if (_pageMario.x > window.innerWidth - 60) _pageMario.dir = -1;
                    if (_pageMario.x < 30) _pageMario.dir = 1;
                }
            }

            walker.style.setProperty("left", _pageMario.x + "px", "important");
            walker.style.setProperty("bottom", (32 - _pageMario.y) + "px", "important");
            var mImg = document.getElementById("mario-page-img");
            if (mImg) {
                if (_pageMario.jumping) {
                    mImg.src = getSpriteUrl("hero_jump");
                } else {
                    var f = Math.floor(walkTick / 6) % 3;
                    mImg.src = getSpriteUrl("hero_run" + (f + 1));
                }
                mImg.style.transform = "scaleX(" + _pageMario.dir + ")";
            }

            if (!goombaStomped) {
                goombaX += goombaDir * 1.5;
                if (goombaX > window.innerWidth - 60) goombaDir = -1;
                if (goombaX < 40) goombaDir = 1;
                goomba.style.left = goombaX + "px";
                var gImg = document.getElementById("goomba-page-img");
                if (gImg) {
                    var gf = Math.floor(walkTick / 8) % 2;
                    gImg.src = getSpriteUrl(gf === 0 ? "critter_walk1" : "critter_walk2");
                    gImg.style.transform = "none";
                }

                var dx = Math.abs((_pageMario.x + 16) - (goombaX + 16));
                if (dx < 24 && _pageMario.jumping && _pageMario.vy > 0 && _pageMario.y > -20) {
                    goombaStomped = true;
                    _pageMario.vy = -10;
                    playStompSound();
                    if (gImg) {
                        gImg.src = getSpriteUrl("critter_flat");
                        gImg.style.transform = "none";
                    }
                    showFloatText("+200", goombaX + 16, window.innerHeight - 52, "#fcd000");
                    if (window.update8bitScore) window.update8bitScore(200);
                    setTimeout(function () {
                        goombaStomped = false;
                        if (gImg) gImg.src = getSpriteUrl("critter_walk1");
                    }, 2500);
                }
            }

            _pageMario.animTimer = requestAnimationFrame(loop);
        }
        _pageMario.animTimer = requestAnimationFrame(loop);
    }

    function removePageMarioWalker() {
        _pageMario.active = false;
        if (_pageMario.animTimer) cancelAnimationFrame(_pageMario.animTimer);
        var w = document.getElementById("mario-page-walker");
        if (w) w.remove();
        var g = document.getElementById("mario-page-goomba");
        if (g) g.remove();
        if (window._pageMarioKeyDown) {
            window.removeEventListener("keydown", window._pageMarioKeyDown);
        }
    }

    function add8bitHeader() {
        if (document.getElementById("8bit-header")) return;
        var header = document.createElement("div");
        header.id = "8bit-header";
        header.className = "bit-header";
        header.innerHTML =
            '<div><span>HERO</span><span id="8bit-score">000000</span></div>' +
            '<div><span class="bit-coin-icon"></span><span id="8bit-coins">x00</span></div>' +
            '<div><span>WORLD</span><span>1-1</span></div>' +
            '<div><span>TIME</span><span id="8bit-time">400</span></div>' +
            '<div class="bit-header-actions">' +
            '<button type="button" class="bit-play-arcade-btn" id="bit-play-btn" title="Play World 1-1 Side-Scroller">▶ PLAY NOW</button>' +
            '</div>';

        document.body.insertBefore(header, document.body.firstChild);

        window._8bitScore = 0;
        window._8bitCoins = 0;
        window._8bitTime = 400;

        var scoreEl = document.getElementById("8bit-score");
        var coinsEl = document.getElementById("8bit-coins");
        var timeEl = document.getElementById("8bit-time");
        var playBtn = document.getElementById("bit-play-btn");

        if (playBtn) {
            playBtn.addEventListener("click", openMarioArcade);
        }

        window.update8bitScore = function (amount) {
            window._8bitScore += amount;
            if (scoreEl) scoreEl.textContent = String(window._8bitScore).padStart(6, "0");
            if (_marioArcade.active) _marioArcade.score = window._8bitScore;
        };

        window.update8bitCoins = function (amount) {
            window._8bitCoins += amount;
            if (window._8bitCoins >= 100) {
                window._8bitCoins = 0;
                window.update8bitScore(1000);
                play1UpSound();
                showFloatText("1-UP!", window.innerWidth / 2, window.innerHeight / 2, "#00e756");
            }
            if (coinsEl) coinsEl.textContent = "x" + String(window._8bitCoins).padStart(2, "0");
            if (_marioArcade.active) _marioArcade.coins = window._8bitCoins;
        };

        if (window._8bitTimer) clearInterval(window._8bitTimer);
        window._8bitTimer = setInterval(function () {
            if (CURRENT_THEME !== "8bit") {
                clearInterval(window._8bitTimer);
                return;
            }
            if (window._8bitTime > 0) {
                window._8bitTime--;
                if (timeEl) timeEl.textContent = String(window._8bitTime).padStart(3, "0");
            }
        }, 1000);

        initPageMarioWalker();
    }

    window._8bitBlockClick = function (e) {
        if (CURRENT_THEME !== "8bit") return;
        var block = e.target.closest(".btn, .card");

        if (block && block.classList.contains("btn") && block.classList.contains("hit")) return;

        if (block) {
            if (block.classList.contains("btn")) {
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

            setTimeout(function () {
                if (coin) coin.remove();
            }, 600);

            playCoinSound();
            if (window.update8bitScore) window.update8bitScore(100);
            if (window.update8bitCoins) window.update8bitCoins(1);
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

    function bringToFront(win) {
        if (!win) return;
        _winZIndex += 1;
        win.style.zIndex = _winZIndex;
    }

    function toggleMaximizeWindow(win) {
        if (!win) return;
        bringToFront(win);
        win.classList.toggle("maximized");
        var icon = win.querySelector('[data-action="maximize-window"] i');
        if (icon) {
            icon.className = win.classList.contains("maximized") ? "fa-regular fa-window-restore" : "fa-regular fa-square";
        }
    }

    function minimizeWin95Window(win) {
        if (!win) return;
        var id = win.id.replace("win95-window-", "");
        win.style.display = "none";
        var task = document.getElementById("win95-taskbar-task-" + id);
        if (task) task.classList.remove("active-window");
    }

    function toggleMinimizeWindow(id) {
        var win = document.getElementById("win95-window-" + id);
        var task = document.getElementById("win95-taskbar-task-" + id);
        if (!win || !task) return;
        var minimized = win.style.display === "none";
        win.style.display = minimized ? "flex" : "none";
        task.classList.toggle("active-window", minimized);
        if (minimized) bringToFront(win);
    }

    function closeWin95Window(win) {
        if (!win) return;
        var id = win.id.replace("win95-window-", "");
        win.remove();
        removeTaskbarTask(id);
    }

    function handleTitlebarPointerDown(e) {
        var titlebar = e.target.closest(".win95-window-titlebar");
        if (!titlebar || e.target.closest(".win95-window-controls")) return;
        var win = titlebar.closest(".win95-window");
        if (!win || win.classList.contains("maximized")) return;

        bringToFront(win);
        var rect = win.getBoundingClientRect();
        win.style.transform = "none";
        win.style.left = rect.left + "px";
        win.style.top = rect.top + "px";

        var clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
        var clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
        _dragOffset.x = clientX - rect.left;
        _dragOffset.y = clientY - rect.top;
        _draggedWin = win;
    }

    function handlePointerMove(e) {
        if (!_draggedWin) return;
        var clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
        var clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
        if (clientX === undefined || clientY === undefined) return;
        var x = clientX - _dragOffset.x;
        var y = clientY - _dragOffset.y;
        x = Math.max(0, Math.min(window.innerWidth - 60, x));
        y = Math.max(0, Math.min(window.innerHeight - 60, y));
        _draggedWin.style.left = x + "px";
        _draggedWin.style.top = y + "px";
    }

    function handlePointerUp() {
        _draggedWin = null;
    }

    function openWindow(opts) {
        var winId = "win95-window-" + opts.id;
        var existing = document.getElementById(winId);
        if (existing) {
            if (existing.style.display === "none") {
                existing.style.display = "flex";
                var taskEl = document.getElementById("win95-taskbar-task-" + opts.id);
                if (taskEl) taskEl.classList.add("active-window");
            }
            bringToFront(existing);
            return;
        }

        var win = document.createElement("div");
        win.className = "win95-window";
        win.id = winId;
        bringToFront(win);
        win.innerHTML =
            '<div class="win95-window-titlebar">' +
            '<span class="win95-window-icon ' + opts.icon + '" aria-hidden="true"></span>' +
            '<span class="win95-window-title">' + opts.title + '</span>' +
            '<span class="win95-window-controls">' +
            '<button type="button" class="win95-window-btn" data-action="minimize-window" aria-label="Minimize"><i class="fa-solid fa-minus" aria-hidden="true"></i></button>' +
            '<button type="button" class="win95-window-btn" data-action="maximize-window" aria-label="Maximize"><i class="fa-regular fa-square" aria-hidden="true"></i></button>' +
            '<button type="button" class="win95-window-btn" data-action="close-window" aria-label="Close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' +
            '</span>' +
            '</div>' +
            '<div class="win95-window-menubar"><span>File</span><span>Edit</span><span>View</span><span>Help</span></div>' +
            '<div class="win95-window-body">' + opts.bodyHtml + '</div>' +
            (opts.footerHtml ? '<div class="win95-window-footer-actions">' + opts.footerHtml + '</div>' : '') +
            '<div class="win95-window-statusbar"><span>' + opts.status + '</span><span>' + (opts.statusRight || "") + '</span></div>';

        document.body.appendChild(win);
        addTaskbarTask(opts.id, opts.title, opts.icon);

        win.addEventListener("mousedown", function () {
            bringToFront(win);
        });
        win.addEventListener("touchstart", function () {
            bringToFront(win);
        }, { passive: true });

        win.addEventListener("dblclick", function (e) {
            var titlebar = e.target.closest(".win95-window-titlebar");
            if (titlebar && !e.target.closest(".win95-window-controls")) {
                toggleMaximizeWindow(win);
                return;
            }
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
            themeItemHtml("8-Bit Mario", "8bit", "fa-solid fa-gamepad") +
            themeItemHtml("Terminal", "terminal", "fa-solid fa-terminal") +
            '</div>' +
            '</div>' +
            '<div class="win95-start-sep"></div>' +
            '<div class="win95-start-item" data-action="shutdown"><i class="fa-solid fa-power-off" aria-hidden="true"></i><span>Shut Down&hellip;</span></div>' +
            '</div>';
        document.body.appendChild(menu);
        updateStartMenuActiveTheme();

        var flyoutParent = menu.querySelector(".win95-flyout-parent");
        if (flyoutParent) {
            var flyout = flyoutParent.querySelector(".win95-flyout");
            flyoutParent.addEventListener("mouseenter", function () {
                if (flyout) positionWin95Flyout(flyout);
            });
        }
        menu.addEventListener("mouseover", function (e) {
            var item = e.target.closest(".win95-start-item");
            if (item && !item.classList.contains("win95-flyout-parent") && !item.closest(".win95-flyout")) {
                closeAllFlyouts();
            }
        });
    }

    function positionWin95Flyout(flyout) {
        if (!flyout) return;
        flyout.style.top = "auto";
        flyout.style.bottom = "-3px";
        var rect = flyout.getBoundingClientRect();
        if (rect.top < 6) {
            flyout.style.top = "4px";
            flyout.style.bottom = "auto";
        }
        rect = flyout.getBoundingClientRect();
        if (rect.bottom > window.innerHeight - 34) {
            var overflow = rect.bottom - (window.innerHeight - 34);
            flyout.style.bottom = (-3 + overflow) + "px";
            flyout.style.top = "auto";
        }
        if (rect.right > window.innerWidth) {
            flyout.style.left = "auto";
            flyout.style.right = "100%";
        } else {
            flyout.style.left = "100%";
            flyout.style.right = "auto";
        }
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

        setTimeout(function () {
            document.addEventListener("keydown", dismissBSOD);
            document.addEventListener("click", dismissBSOD);
        }, 150);
    }

    function removeWin95Extras() {
        ["win95-desktop-icons", "win95-start-menu", "win95-shutdown-screen", "win95-bsod-screen"].forEach(function (id) {
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
        var header = document.getElementById("8bit-header");
        if (header) header.remove();
        var shell = document.getElementById("enemy-shell");
        if (shell) shell.remove();
        removePageMarioWalker();
        closeMarioArcade();
        var overlay = document.getElementById("mario-arcade-overlay");
        if (overlay) overlay.remove();
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
            if (CURRENT_THEME === "terminal") {
                addTerminalCursor();
                addTerminalCli();
            }
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
        var navLink = e.target.closest('#navbarResponsive .nav-link:not(.dropdown-toggle)');
        if (navLink) {
            var navbarResponsive = document.getElementById("navbarResponsive");
            if (navbarResponsive && navbarResponsive.classList.contains("show")) {
                if (window.bootstrap && window.bootstrap.Collapse) {
                    var bsCollapse = window.bootstrap.Collapse.getInstance(navbarResponsive);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    } else {
                        navbarResponsive.classList.remove("show");
                    }
                } else {
                    navbarResponsive.classList.remove("show");
                }
            }
        }

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

        if (CURRENT_THEME === "win95") {
            var cardWinBtn = e.target.closest('.win95-titlebar .win95-window-btn, .win95-titlebar .win95-window-controls');
            if (cardWinBtn) {
                e.preventDefault();
                triggerBSOD();
                return;
            }

            var titlebar = e.target.closest('.win95-titlebar');
            if (titlebar && !e.target.closest('.win95-window')) {
                var tbRect = titlebar.getBoundingClientRect();
                var tbClickX = tbRect.right - e.clientX;
                if (tbClickX <= 75) {
                    e.preventDefault();
                    triggerBSOD();
                    return;
                }
            }

            var cardBody = e.target.closest('.card-body');
            if (cardBody) {
                var rect = cardBody.getBoundingClientRect();
                var clickY = e.clientY - rect.top;
                var clickX = rect.right - e.clientX;
                if (clickY >= 0 && clickY <= 30 && clickX >= 0 && clickX <= 60) {
                    e.preventDefault();
                    triggerBSOD();
                    return;
                }
            }
        }

        var flyoutParent = e.target.closest('[data-action="toggle-flyout"]');
        if (flyoutParent) {
            e.preventDefault();
            e.stopPropagation();
            var willOpen = !flyoutParent.classList.contains("open");
            flyoutParent.classList.toggle("open", willOpen);
            if (willOpen) {
                var flyout = flyoutParent.querySelector(".win95-flyout");
                if (flyout) positionWin95Flyout(flyout);
            }
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

        var minWinBtn = e.target.closest('[data-action="minimize-window"]');
        if (minWinBtn) {
            minimizeWin95Window(minWinBtn.closest(".win95-window"));
            return;
        }

        var maxWinBtn = e.target.closest('[data-action="maximize-window"]');
        if (maxWinBtn) {
            toggleMaximizeWindow(maxWinBtn.closest(".win95-window"));
            return;
        }

        var openGuestbookBtn = e.target.closest('[data-action="open-guestbook"]');
        if (openGuestbookBtn) {
            e.preventDefault();
            openGuestbookModal();
            return;
        }

        var closeGuestbookBtn = e.target.closest('[data-action="close-guestbook"]');
        if (closeGuestbookBtn) {
            closeGuestbookModal();
            return;
        }

        var soundToggle = e.target.closest("#bit-sound-toggle");
        if (soundToggle) {
            e.preventDefault();
            _soundMuted = !_soundMuted;
            soundToggle.textContent = _soundMuted ? "🔇" : "🔊";
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
            stopMatrixRain();
            closeDialog();
            closeStartMenu();
            closeGuestbookModal();
        }
        if ((e.key === "Enter" || e.key === " ") && e.target && e.target.closest(".win95-start-btn")) {
            e.preventDefault();
            toggleStartMenu();
        }

        var menu = document.getElementById("win95-start-menu");
        if (menu && menu.classList.contains("visible")) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                var items = Array.from(menu.querySelectorAll(".win95-start-item"));
                var activeIdx = items.indexOf(document.activeElement);
                if (e.key === "ArrowDown") {
                    activeIdx = (activeIdx + 1) % items.length;
                } else {
                    activeIdx = (activeIdx - 1 + items.length) % items.length;
                }
                if (items[activeIdx]) items[activeIdx].focus();
            }
        }
    }

    function init() {
        try {
            localStorage.removeItem("portfolio_theme");
        } catch (e) { }
        document.addEventListener("click", handleDocumentClick);
        document.addEventListener("keydown", handleDocumentKeydown);
        document.addEventListener("mousedown", handleTitlebarPointerDown);
        document.addEventListener("mousemove", handlePointerMove);
        document.addEventListener("mouseup", handlePointerUp);
        document.addEventListener("mousemove", handleGeoCitiesMouseMove);
        document.addEventListener("touchstart", handleTitlebarPointerDown, { passive: true });
        document.addEventListener("touchmove", handlePointerMove, { passive: true });
        document.addEventListener("touchend", handlePointerUp);
        applyTheme("default");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
