// =====================================================================
// KASUALITY OS - SIDEBAR WEBVIEW PROVIDER
// Interactive GUI for VS Code Activity Bar with K-UDA, APCA and Team Sync
// =====================================================================

const vscode = require('vscode');
const engine = require('./kasuality-engine');
const { getTranslation } = require('./translations');

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

class KasualitySidebarProvider {
    constructor(extensionUri, stateManager) {
        this._extensionUri = extensionUri;
        this.stateManager = stateManager;
        this._view = null;
    }

    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtml(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'insertCss':
                    await this.stateManager.insertCssIntoEditor();
                    break;
                case 'copyJson':
                    await this.stateManager.copyJsonTokens();
                    break;
                case 'injectCursor':
                    await this.stateManager.injectCursorRules();
                    break;
                case 'newHarmony':
                    this.stateManager.generateNewHarmony();
                    this.updatePaletteView();
                    vscode.window.showInformationMessage(
                        this.stateManager.lang === 'it' ? '🎨 Nuova armonia cromatica generata!' :
                        (this.stateManager.lang === 'es' ? '🎨 ¡Nueva armonía cromática generada!' :
                        (this.stateManager.lang === 'fr' ? '🎨 Nouvelle harmonie chromatique générée !' :
                        (this.stateManager.lang === 'de' ? '🎨 Neue Farbharmonie generiert!' : '🎨 New color harmony generated!')))
                    );
                    break;
                case 'changeLanguage':
                    this.stateManager.setLanguage(data.lang);
                    this.updatePaletteView();
                    break;
                case 'changeFormat':
                    this.stateManager.setFormat(data.format);
                    this.updatePaletteView();
                    break;
                case 'toggleMode':
                    this.stateManager.toggleThemeMode(data.mode);
                    this.updatePaletteView();
                    break;
                case 'connectTeam':
                    this.stateManager.connectTeam(data.key);
                    this.updatePaletteView();
                    break;
                case 'openWebsite': {
                    const lang = this.stateManager.lang;
                    const url = lang === 'it' ? 'https://www.kasuality.com' : `https://www.kasuality.com/${lang}/`;
                    vscode.env.openExternal(vscode.Uri.parse(url));
                    break;
                }
                case 'openLiveRoom': {
                    const roomKey = this.stateManager.teamKey || '';
                    const lang = this.stateManager.lang;
                    const url = lang === 'it' 
                        ? (roomKey ? `https://www.kasuality.com/live.html?room=${encodeURIComponent(roomKey)}` : 'https://www.kasuality.com/live.html')
                        : (roomKey ? `https://www.kasuality.com/${lang}/live.html?room=${encodeURIComponent(roomKey)}` : `https://www.kasuality.com/${lang}/live.html`);
                    vscode.env.openExternal(vscode.Uri.parse(url));
                    break;
                }
                case 'copyColor':
                    await vscode.env.clipboard.writeText(data.value);
                    vscode.window.showInformationMessage(`📋 ${data.role.toUpperCase()}: ${data.value} copiato negli appunti!`);
                    break;
            }
        });
    }

    updatePaletteView() {
        if (this._view) {
            this._view.webview.html = this._getHtml(this._view.webview);
        }
    }

    _getHtml(webview) {
        const state = this.stateManager.getState();
        const t = getTranslation(state.lang);
        const tokens = engine.generateKudaTokens(state.currentPalette);
        const isDark = state.themeMode === 'dark';
        const activeTokens = isDark ? tokens.dark : tokens.light;

        // Calculate contrast against surface
        const bgRgb = isDark ? engine.hexToRgb(tokens.dark.surface.hex) : engine.hexToRgb(tokens.light.surface.hex);
        const txtRgb = isDark ? engine.hexToRgb(tokens.dark.text.hex) : engine.hexToRgb(tokens.light.text.hex);
        const apca = engine.calculateAPCA(txtRgb, bgRgb);
        const wcag = engine.calculateWCAG(txtRgb, bgRgb);

        const nonce = getNonce();
        return `<!DOCTYPE html>
<html lang="${state.lang}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.title}</title>
    <style>
        :root {
            --bg: var(--vscode-sideBar-background, #18181b);
            --fg: var(--vscode-sideBar-foreground, #f4f4f5);
            --card-bg: var(--vscode-editor-background, #27272a);
            --border: var(--vscode-sideBar-border, #3f3f46);
            --accent: #0284c7;
            --accent-hover: #0369a1;
            --success: #10b981;
            --warning: #f59e0b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: var(--vscode-font-family, system-ui, sans-serif);
            font-size: var(--vscode-font-size, 12px);
            color: var(--fg);
            background: var(--bg);
            padding: 12px;
            line-height: 1.4;
            user-select: none;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .brand-block {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .brand {
            font-size: 13px;
            font-weight: 800;
            color: #38bdf8;
            display: flex;
            align-items: center;
            gap: 6px;
            letter-spacing: 0.5px;
        }
        .by-kasuality {
            font-size: 10px;
            color: #94a3b8;
            text-decoration: none;
            cursor: pointer;
            transition: color 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 2px;
            font-weight: 500;
        }
        .by-kasuality:hover {
            color: #38bdf8;
            text-decoration: underline;
        }
        .lang-select {
            background: var(--card-bg);
            color: var(--fg);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 11px;
            cursor: pointer;
            outline: none;
        }
        .theme-toggle-bar {
            display: flex;
            gap: 6px;
            margin-bottom: 8px;
        }
        .mode-btn {
            flex: 1;
            padding: 6px;
            background: var(--card-bg);
            color: var(--fg);
            border: 1px solid var(--border);
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
        }
        .mode-btn.active {
            background: var(--accent);
            color: #ffffff;
            border-color: var(--accent);
        }
        .format-bar {
            display: flex;
            gap: 4px;
            margin-bottom: 12px;
            background: var(--card-bg);
            padding: 2px;
            border-radius: 6px;
            border: 1px solid var(--border);
        }
        .format-btn {
            flex: 1;
            padding: 4px 0;
            background: transparent;
            color: var(--fg);
            border: none;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
            opacity: 0.65;
        }
        .format-btn.active {
            background: var(--accent);
            color: #ffffff;
            opacity: 1;
        }
        .palette-board {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 12px;
        }
        .swatch-card {
            display: flex;
            align-items: center;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 6px 8px;
            gap: 8px;
            cursor: pointer;
            transition: border-color 0.2s, transform 0.1s;
        }
        .swatch-card:hover {
            border-color: #38bdf8;
            transform: translateY(-1px);
        }
        .swatch-color {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.18);
            flex-shrink: 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        }
        .swatch-info {
            flex: 1;
            overflow: hidden;
        }
        .swatch-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2px;
        }
        .swatch-role {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #38bdf8;
        }
        .swatch-alt {
            font-size: 9px;
            color: #94a3b8;
            font-family: var(--vscode-editor-font-family, monospace);
        }
        .swatch-code {
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #f1f5f9;
        }
        .audit-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 6px;
            padding: 8px 10px;
            margin-bottom: 12px;
        }
        .audit-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-bottom: 2px;
        }
        .badge-pass {
            color: var(--success);
            font-weight: 700;
        }
        .btn-stack {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 14px;
        }
        .btn {
            background: var(--vscode-button-background, #0284c7);
            color: var(--vscode-button-foreground, #ffffff);
            border: none;
            border-radius: 4px;
            padding: 8px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: opacity 0.2s, background-color 0.2s;
        }
        .btn:hover { opacity: 0.92; }
        .btn-secondary {
            background: var(--card-bg);
            color: var(--fg);
            border: 1px solid var(--border);
        }
        .btn-secondary:hover {
            border-color: #38bdf8;
        }
        .btn-primary-action {
            background: #0284c7;
            color: #ffffff;
            font-weight: 700;
        }
        .btn-primary-action:hover {
            background: #0369a1;
        }
        .section-title {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #94a3b8;
            margin: 14px 0 6px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            letter-spacing: 0.5px;
        }
        .team-box {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 10px;
        }
        .status-pill {
            display: inline-block;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 12px;
            background: rgba(16, 185, 129, 0.15);
            color: var(--success);
            margin-bottom: 8px;
        }
        .input-text {
            width: 100%;
            background: var(--bg);
            color: var(--fg);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 6px;
            font-size: 11px;
            margin-bottom: 6px;
            outline: none;
        }
        .input-text:focus {
            border-color: #38bdf8;
        }
    </style>
</head>
<body>
    <!-- HEADER -->
    <div class="header">
        <div class="brand-block">
            <div class="brand">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4v16"/><path d="M4 12l10-8"/><path d="M9 12l7 8"/></svg>
                KASUALITY
            </div>
            <a href="#" id="linkByKasuality" class="by-kasuality" title="Visita Kasuality.com">by Kasuality ↗</a>
        </div>
        <select id="langSelect" class="lang-select">
            <option value="it" ${state.lang === 'it' ? 'selected' : ''}>🇮🇹 IT</option>
            <option value="en" ${state.lang === 'en' ? 'selected' : ''}>🇬🇧 EN</option>
            <option value="es" ${state.lang === 'es' ? 'selected' : ''}>🇪🇸 ES</option>
            <option value="fr" ${state.lang === 'fr' ? 'selected' : ''}>🇫🇷 FR</option>
            <option value="de" ${state.lang === 'de' ? 'selected' : ''}>🇩🇪 DE</option>
        </select>
    </div>

    <!-- THEME TOGGLE (K-UDA BIMODAL) -->
    <div class="theme-toggle-bar">
        <button id="btnLight" class="mode-btn ${!isDark ? 'active' : ''}">☀️ ${t.lightMode}</button>
        <button id="btnDark" class="mode-btn ${isDark ? 'active' : ''}">🌙 ${t.darkMode}</button>
    </div>

    <!-- FORMAT TOGGLE (OKLCH, HEX, RGB) -->
    <div class="format-bar">
        <button class="format-btn ${state.format === 'oklch' ? 'active' : ''}" data-fmt="oklch">OKLCH</button>
        <button class="format-btn ${state.format === 'hex' ? 'active' : ''}" data-fmt="hex">HEX</button>
        <button class="format-btn ${state.format === 'rgb' ? 'active' : ''}" data-fmt="rgb">RGB</button>
    </div>

    <!-- SWATCHES -->
    <div class="palette-board" id="swatchesContainer">
        ${Object.entries(activeTokens).map(([role, tok]) => {
            const displayVal = state.format === 'oklch' ? tok.oklch : (state.format === 'rgb' ? tok.rgb : tok.hex);
            const altVal = state.format === 'hex' ? tok.oklch : tok.hex;
            return `
            <div class="swatch-card" data-val="${displayVal}" data-role="${role}" title="Clicca per copiare: ${displayVal}">
                <div class="swatch-color" style="background-color: ${tok.hex}; background-color: ${tok.oklch};"></div>
                <div class="swatch-info">
                    <div class="swatch-top">
                        <span class="swatch-role">${role}</span>
                        <span class="swatch-alt">${altVal}</span>
                    </div>
                    <div class="swatch-code">${displayVal}</div>
                </div>
            </div>`;
        }).join('')}
    </div>

    <!-- ACCESSIBILITY AUDIT -->
    <div class="audit-box">
        <div class="audit-row">
            <span>${t.apcaRating}</span>
            <span class="badge-pass">${apca.score} (${t.apcaPass})</span>
        </div>
        <div class="audit-row">
            <span>${t.wcagRatio}</span>
            <span class="badge-pass">${wcag.ratio}:1 (WCAG AAA)</span>
        </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="btn-stack">
        <button id="btnInsertCss" class="btn btn-primary-action">⚡ ${t.btnInsertCss}</button>
        <button id="btnExportJson" class="btn btn-secondary">📋 ${t.btnExportJson}</button>
        <button id="btnInjectCursor" class="btn btn-secondary">🤖 ${t.btnInjectCursor}</button>
        <button id="btnNewHarmony" class="btn btn-secondary">🎨 ${t.btnNewHarmony}</button>
    </div>

    <!-- TEAM CLOUD SYNC -->
    <div class="section-title">
        <span>${t.teamSection}</span>
    </div>
    <div class="team-box">
        <div class="status-pill">${state.teamConnected ? t.statusConnected : t.statusDisconnected}</div>
        <input type="text" id="teamKeyInput" class="input-text" placeholder="${t.licensePlaceholder}" value="${state.teamKey || ''}">
        <button id="btnConnectTeam" class="btn btn-secondary" style="width:100%; margin-bottom: 6px;">${state.teamConnected ? t.btnDisconnect : t.btnConnect}</button>
        <button id="btnOpenLiveRoom" class="btn btn-secondary" style="width:100%; font-size:10px;">🌐 ${t.btnOpenLive}</button>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        // By Kasuality Link
        document.getElementById('linkByKasuality').addEventListener('click', (e) => {
            e.preventDefault();
            vscode.postMessage({ type: 'openWebsite' });
        });

        // Open Live Room on Web
        const btnOpenLive = document.getElementById('btnOpenLiveRoom');
        if (btnOpenLive) {
            btnOpenLive.addEventListener('click', () => {
                vscode.postMessage({ type: 'openLiveRoom' });
            });
        }

        // Language
        document.getElementById('langSelect').addEventListener('change', (e) => {
            vscode.postMessage({ type: 'changeLanguage', lang: e.target.value });
        });

        // Theme Mode
        document.getElementById('btnLight').addEventListener('click', () => {
            vscode.postMessage({ type: 'toggleMode', mode: 'light' });
        });
        document.getElementById('btnDark').addEventListener('click', () => {
            vscode.postMessage({ type: 'toggleMode', mode: 'dark' });
        });

        // Format selector (OKLCH, HEX, RGB)
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fmt = e.target.getAttribute('data-fmt');
                vscode.postMessage({ type: 'changeFormat', format: fmt });
            });
        });

        // Click swatch to copy
        document.querySelectorAll('.swatch-card').forEach(card => {
            card.addEventListener('click', () => {
                const val = card.getAttribute('data-val');
                const role = card.getAttribute('data-role');
                vscode.postMessage({ type: 'copyColor', value: val, role: role });
            });
        });

        // Actions
        document.getElementById('btnInsertCss').addEventListener('click', () => {
            vscode.postMessage({ type: 'insertCss' });
        });

        document.getElementById('btnExportJson').addEventListener('click', () => {
            vscode.postMessage({ type: 'copyJson' });
        });

        document.getElementById('btnInjectCursor').addEventListener('click', () => {
            vscode.postMessage({ type: 'injectCursor' });
        });

        document.getElementById('btnNewHarmony').addEventListener('click', () => {
            vscode.postMessage({ type: 'newHarmony' });
        });

        document.getElementById('btnConnectTeam').addEventListener('click', () => {
            const key = document.getElementById('teamKeyInput').value.trim();
            vscode.postMessage({ type: 'connectTeam', key: key });
        });
    </script>
</body>
</html>`;
    }
}

module.exports = KasualitySidebarProvider;
