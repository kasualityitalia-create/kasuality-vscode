// =====================================================================
// KASUALITY OS - OFFICIAL VS CODE AND CURSOR EXTENSION (v1.0.1)
// Color Science, OKLCH Tokens, K-UDA Bitematic Engine and Cursor AI Rules
// =====================================================================

const vscode = require('vscode');
const engine = require('./kasuality-engine');
const { getTranslation } = require('./translations');
const KasualitySidebarProvider = require('./sidebar');

class StateManager {
    constructor(context) {
        this.context = context;
        // Default brand palette
        this.currentPalette = [
            { hex: '#06B6D4', role: 'primary' },
            { hex: '#8B5CF6', role: 'secondary' },
            { hex: '#F43F5E', role: 'accent' },
            { hex: '#F8FAFC', role: 'surface' },
            { hex: '#0F172A', role: 'text' }
        ];
        this.themeMode = 'light'; // 'light' or 'dark'
        this.format = 'oklch'; // 'oklch', 'hex', 'rgb'
        this.lang = vscode.env.language.startsWith('it') ? 'it' : (
            vscode.env.language.startsWith('es') ? 'es' : (
                vscode.env.language.startsWith('fr') ? 'fr' : (
                    vscode.env.language.startsWith('de') ? 'de' : 'en'
                )
            )
        );
        this.teamConnected = false;
        this.teamKey = '';
        this.sidebarProvider = null;
    }

    getState() {
        return {
            currentPalette: this.currentPalette,
            themeMode: this.themeMode,
            format: this.format,
            lang: this.lang,
            teamConnected: this.teamConnected,
            teamKey: this.teamKey
        };
    }

    setLanguage(lang) {
        this.lang = lang;
    }

    setFormat(format) {
        this.format = format;
    }

    toggleThemeMode(mode) {
        if (mode) {
            this.themeMode = mode;
        } else {
            this.themeMode = this.themeMode === 'light' ? 'dark' : 'light';
        }
    }

    connectTeam(key) {
        if (!key) {
            this.teamConnected = false;
            this.teamKey = '';
            vscode.window.showInformationMessage(getTranslation(this.lang).statusDisconnected);
            return;
        }
        this.teamConnected = true;
        this.teamKey = key;
        vscode.window.showInformationMessage(`${getTranslation(this.lang).statusConnected} (${key})`);
    }

    generateNewHarmony() {
        const randomHue = Math.floor(Math.random() * 360);
        const rgb1 = engine.hslToRgb(randomHue, 85, 55);
        const rgb2 = engine.hslToRgb((randomHue + 40) % 360, 80, 50);
        const rgb3 = engine.hslToRgb((randomHue + 180) % 360, 90, 60);

        this.currentPalette = [
            { hex: engine.rgbToHex(rgb1.r, rgb1.g, rgb1.b), role: 'primary' },
            { hex: engine.rgbToHex(rgb2.r, rgb2.g, rgb2.b), role: 'secondary' },
            { hex: engine.rgbToHex(rgb3.r, rgb3.g, rgb3.b), role: 'accent' },
            { hex: '#F8FAFC', role: 'surface' },
            { hex: '#0F172A', role: 'text' }
        ];
    }

    async insertCssIntoEditor() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Nessun file aperto nell\'editor.');
            return;
        }
        const tokens = engine.generateKudaTokens(this.currentPalette);
        const cssContent = engine.generateCssRuntime(tokens);
        
        const success = await editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, cssContent);
        });
        if (success) {
            vscode.window.showInformationMessage(getTranslation(this.lang).toastInserted);
        } else {
            vscode.window.showErrorMessage('Impossibile inserire il CSS: selezione o file non modificabile.');
        }
    }

    async copyJsonTokens() {
        const tokens = engine.generateKudaTokens(this.currentPalette);
        const jsonContent = engine.generateW3cTokensJson(tokens);
        await vscode.env.clipboard.writeText(jsonContent);
        vscode.window.showInformationMessage(getTranslation(this.lang).toastJsonCopied);
    }

    async injectCursorRules() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('Apri una cartella o workspace per iniettare le regole di Cursor AI.');
            return;
        }
        const rootUri = workspaceFolders[0].uri;
        const tokens = engine.generateKudaTokens(this.currentPalette);
        const ruleContent = engine.generateCursorRules(tokens, this.lang);
        const ruleBuffer = Buffer.from(ruleContent, 'utf8');

        // Helper per scrittura sicura con verifica esistenza e backup (Rilievo H-01)
        const safeWriteFile = async (targetUri, fileName) => {
            let exists = false;
            try {
                await vscode.workspace.fs.stat(targetUri);
                exists = true;
            } catch {
                exists = false;
            }

            if (exists) {
                const choice = await vscode.window.showWarningMessage(
                    `Il file ${fileName} esiste già nel workspace. Come desideri procedere?`,
                    'Sovrascrivi',
                    'Crea copia backup (.bak)',
                    'Annulla'
                );

                if (choice === 'Crea copia backup (.bak)') {
                    const bakUri = vscode.Uri.joinPath(rootUri, fileName + '.bak');
                    const currentContent = await vscode.workspace.fs.readFile(targetUri);
                    await vscode.workspace.fs.writeFile(bakUri, currentContent);
                } else if (choice !== 'Sovrascrivi') {
                    return false; // Operazione annullata dall'utente
                }
            }

            await vscode.workspace.fs.writeFile(targetUri, ruleBuffer);
            return true;
        };

        try {
            // 1. Scrivi .cursorrules con protezione
            const cursorRulesUri = vscode.Uri.joinPath(rootUri, '.cursorrules');
            const wroteRoot = await safeWriteFile(cursorRulesUri, '.cursorrules');
            if (!wroteRoot) return;

            // 2. Scrivi .cursor/rules/k-uda-cursor-rule.mdc per Cursor moderno
            const cursorDir = vscode.Uri.joinPath(rootUri, '.cursor', 'rules');
            await vscode.workspace.fs.createDirectory(cursorDir);
            const mdcUri = vscode.Uri.joinPath(cursorDir, 'k-uda-cursor-rule.mdc');
            await safeWriteFile(mdcUri, '.cursor/rules/k-uda-cursor-rule.mdc');

            vscode.window.showInformationMessage(getTranslation(this.lang).toastCursorRules);
        } catch (err) {
            vscode.window.showErrorMessage('Errore durante la scrittura delle regole Cursor: ' + err.message);
        }
    }
}

function activate(context) {
    const stateManager = new StateManager(context);
    const sidebarProvider = new KasualitySidebarProvider(context.extensionUri, stateManager);
    stateManager.sidebarProvider = sidebarProvider;

    // 1. Registra Webview nella Sidebar
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('kasuality-sidebar', sidebarProvider)
    );

    // 2. Registra Comandi
    context.subscriptions.push(
        vscode.commands.registerCommand('kasuality.openSidebar', () => {
            vscode.commands.executeCommand('workbench.view.extension.kasuality-activitybar');
        }),
        vscode.commands.registerCommand('kasuality.insertTokensCss', async () => {
            try {
                await stateManager.insertCssIntoEditor();
            } catch (err) {
                vscode.window.showErrorMessage('Errore inserimento CSS: ' + err.message);
            }
        }),
        vscode.commands.registerCommand('kasuality.insertTokensJson', async () => {
            try {
                await stateManager.copyJsonTokens();
            } catch (err) {
                vscode.window.showErrorMessage('Errore copia JSON: ' + err.message);
            }
        }),
        vscode.commands.registerCommand('kasuality.injectCursorRules', async () => {
            try {
                await stateManager.injectCursorRules();
            } catch (err) {
                vscode.window.showErrorMessage('Errore generazione regole Cursor: ' + err.message);
            }
        }),
        vscode.commands.registerCommand('kasuality.checkContrast', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;
            const selection = editor.document.getText(editor.selection).trim();
            if (/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(selection)) {
                const rgb = engine.hexToRgb(selection);
                const oklch = engine.rgbToOklch(rgb.r, rgb.g, rgb.b);
                const apcaAgainstWhite = engine.calculateAPCA(rgb, { r: 255, g: 255, b: 255 });
                vscode.window.showInformationMessage(`Kasuality Color Inspector: ${selection} -> ${oklch.formatted} | APCA su bianco: ${apcaAgainstWhite.score} (${apcaAgainstWhite.rating})`);
            } else {
                vscode.window.showInformationMessage('Seleziona un codice colore HEX valido (es. #06B6D4) per visualizzare l\'ispezione APCA/OKLCH.');
            }
        })
    );

    // 3. Registra Autocompletamento Intelligente (IntelliSense)
    const supportedLanguages = ['css', 'scss', 'less', 'html', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'vue', 'svelte', 'json', 'plaintext'];

    const completionProvider = vscode.languages.registerCompletionItemProvider(
        supportedLanguages,
        {
            provideCompletionItems(document, position) {
                const state = stateManager.getState();
                const tokens = engine.generateKudaTokens(state.currentPalette);
                const items = [];

                const roles = ['primary', 'secondary', 'accent', 'surface', 'text'];
                roles.forEach(role => {
                    const tok = tokens.light[role];
                    const darkTok = tokens.dark[role];

                    // Completion per CSS Variable: var(--kas-primary)
                    const varItem = new vscode.CompletionItem(`--kas-${role}`, vscode.CompletionItemKind.Color);
                    varItem.detail = `Kasuality K-UDA ${role.toUpperCase()}: ${tok.oklch}`;
                    varItem.documentation = new vscode.MarkdownString(`**Kasuality K-UDA Bitematic Token**\n\n- **Light:** \`${tok.oklch}\` (${tok.hex})\n- **Dark:** \`${darkTok.oklch}\` (${darkTok.hex})\n- **APCA Compliance:** L_c verified $\\ge 75$`);
                    varItem.insertText = `var(--kas-${role})`;
                    items.push(varItem);

                    // Completion per Tailwind: bg-kas-primary
                    const twItem = new vscode.CompletionItem(`kas-${role}`, vscode.CompletionItemKind.Variable);
                    twItem.detail = `Tailwind / CSS Token: ${tok.hex}`;
                    twItem.insertText = `kas-${role}`;
                    items.push(twItem);
                });

                // Completion per Gradient Doctor
                const gradItem = new vscode.CompletionItem('kas-gradient-oklch', vscode.CompletionItemKind.Snippet);
                gradItem.detail = 'The Gradient Doctor (Progressive OKLCH Gradient)';
                gradItem.documentation = new vscode.MarkdownString('Generates a clean CSS gradient interpolated in OKLCH space to eliminate the gray dead zone.');
                gradItem.insertText = new vscode.SnippetString(
                    'background: linear-gradient(${1:90deg}, ${2:var(--kas-primary)}, ${3:var(--kas-secondary)});\nbackground: linear-gradient(in oklch ${1:90deg}, ${2:var(--kas-primary)}, ${3:var(--kas-secondary)});'
                );
                items.push(gradItem);

                return items;
            }
        },
        '-', 'k', 'o' // Triggers
    );
    context.subscriptions.push(completionProvider);

    // 4. Registra Color Decorator (Mostra il quadratino colorato in linea)
    const colorProvider = vscode.languages.registerColorProvider(supportedLanguages, {
        provideDocumentColors(document) {
            const text = document.getText();
            const colors = [];
            const hexRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
            let match;

            while ((match = hexRegex.exec(text)) !== null) {
                const rgb = engine.hexToRgb(match[0]);
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);

                colors.push(new vscode.ColorInformation(
                    range,
                    new vscode.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255, 1)
                ));
            }
            return colors;
        },
        provideColorPresentations(color, context) {
            const r = Math.round(color.red * 255);
            const g = Math.round(color.green * 255);
            const b = Math.round(color.blue * 255);
            const hex = engine.rgbToHex(r, g, b);
            const oklch = engine.rgbToOklch(r, g, b);

            return [
                new vscode.ColorPresentation(hex),
                new vscode.ColorPresentation(oklch.formatted),
                new vscode.ColorPresentation(`rgb(${r}, ${g}, ${b})`)
            ];
        }
    });
    context.subscriptions.push(colorProvider);

    console.log('Kasuality Design System Extension activated successfully!');
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
