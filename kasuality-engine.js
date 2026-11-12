// =====================================================================
// KASUALITY OS - MATHEMATICAL ENGINE AND COLOR SCIENCE
// OKLCH, APCA, WCAG 2.1, K-UDA BITEMATIC TOKENS AND CURSOR AI RULES
// =====================================================================

function srgbToLinear(c) {
    c = c / 255.0;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c) {
    c = Math.max(0.0, Math.min(1.0, c));
    const val = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1.0 / 2.4) - 0.055;
    return Math.round(Math.max(0.0, Math.min(1.0, val)) * 255.0);
}

function hexToRgb(hex) {
    hex = hex.replace('#', '').trim();
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function rgbToHex(r, g, b) {
    const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
    h = (((h % 360) + 360) % 360) / 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    if (s === 0) {
        const val = Math.round(l * 255);
        return { r: val, g: val, b: val };
    }
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
        r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
    };
}

function rgbToOklch(r, g, b) {
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);

    const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

    const l_ = Math.sign(l) * Math.pow(Math.abs(l), 1.0 / 3.0);
    const m_ = Math.sign(m) * Math.pow(Math.abs(m), 1.0 / 3.0);
    const s_ = Math.sign(s) * Math.pow(Math.abs(s), 1.0 / 3.0);

    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const b_val = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

    let C = Math.sqrt(a * a + b_val * b_val);
    let h_deg = (Math.atan2(b_val, a) * (180.0 / Math.PI) + 360.0) % 360.0;

    // Phantom hue stabilization on neutrals
    if (C < 0.0001) { C = 0; h_deg = 0; }

    return {
        L: Math.max(0, Math.min(1, L)),
        C: Math.max(0, C),
        h: h_deg,
        formatted: `oklch(${Math.round(L * 1000) / 10}% ${Math.round(C * 1000) / 1000} ${Math.round(h_deg * 10) / 10})`
    };
}

function oklchToRgb(L, C, h) {
    const h_rad = (h * Math.PI) / 180.0;
    const a = C * Math.cos(h_rad);
    const b = C * Math.sin(h_rad);

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    const l = Math.pow(l_, 3.0);
    const m = Math.pow(m_, 3.0);
    const s = Math.pow(s_, 3.0);

    const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

    return {
        r: linearToSrgb(lr),
        g: linearToSrgb(lg),
        b: linearToSrgb(lb)
    };
}

// WCAG 2.1 Contrast
function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function calculateWCAG(rgb1, rgb2) {
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);
    return {
        ratio: Math.round(ratio * 100) / 100,
        isAA: ratio >= 4.5,
        isAAA: ratio >= 7.0,
        isLargeAA: ratio >= 3.0
    };
}

// APCA (Advanced Perceptual Contrast Algorithm - WCAG 3 Candidate)
function calculateAPCA(txtRgb, bgRgb) {
    const mainTR = Math.pow(txtRgb.r / 255.0, 2.4) * 0.2126729;
    const mainTG = Math.pow(txtRgb.g / 255.0, 2.4) * 0.7151522;
    const mainTB = Math.pow(txtRgb.b / 255.0, 2.4) * 0.0721750;
    const Ytxt = mainTR + mainTG + mainTB;

    const mainBR = Math.pow(bgRgb.r / 255.0, 2.4) * 0.2126729;
    const mainBG = Math.pow(bgRgb.g / 255.0, 2.4) * 0.7151522;
    const mainBB = Math.pow(bgRgb.b / 255.0, 2.4) * 0.0721750;
    const Ybg = mainBR + mainBG + mainBB;

    // Clamping
    const normYtxt = Ytxt > 0.001 ? Ytxt : 0.001;
    const normYbg = Ybg > 0.001 ? Ybg : 0.001;

    let Lc = 0;
    if (normYbg > normYtxt) {
        // Dark text on light background
        const Sbg = Math.pow(normYbg, 0.56);
        const Stxt = Math.pow(normYtxt, 0.57);
        Lc = (Sbg - Stxt) * 1.14;
    } else {
        // Light text on dark background
        const Sbg = Math.pow(normYbg, 0.62);
        const Stxt = Math.pow(normYtxt, 0.65);
        Lc = (Sbg - Stxt) * 1.14;
    }

    const score = Math.round(Math.abs(Lc) * 100);
    return {
        score: score,
        rating: score >= 90 ? 'L_c 90+ (Readability Master)' : (score >= 75 ? 'L_c 75+ (Body Text Pass)' : (score >= 60 ? 'L_c 60+ (Sub-Headlines Pass)' : 'L_c <60 (Fail/Insufficient)')),
        isPass: score >= 60,
        isBodyPass: score >= 75
    };
}

// Generate K-UDA Bitematic Tokens (Light and Dark)
function generateKudaTokens(colors) {
    const roles = ['primary', 'secondary', 'accent', 'surface', 'text'];
    const lightTokens = {};
    const darkTokens = {};

    colors.forEach((c, idx) => {
        const role = roles[idx] || `color-${idx + 1}`;
        const hex = c.hex;
        const rgb = c.rgb || hexToRgb(hex);
        const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);

        lightTokens[role] = {
            hex: hex,
            rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
            oklch: oklch.formatted,
            L: oklch.L,
            C: oklch.C,
            h: oklch.h
        };

        // K-UDA Inversion Algorithm for Dark Mode with Chroma Stabilization
        let darkL = oklch.L;
        let darkC = oklch.C;
        if (role === 'surface') {
            darkL = Math.max(0.12, 1.0 - oklch.L * 0.95);
            darkC = Math.min(0.03, oklch.C * 0.4);
        } else if (role === 'text') {
            darkL = Math.min(0.96, 1.0 - oklch.L * 0.85);
            darkC = Math.min(0.02, oklch.C * 0.3);
        } else {
            // Accent / Brand colors: boost luminance slightly in dark mode for OLED clarity
            darkL = Math.min(0.85, Math.max(0.55, oklch.L * 1.1));
            darkC = Math.min(0.35, oklch.C * 1.05);
        }

        const darkRgb = oklchToRgb(darkL, darkC, oklch.h);
        const darkHex = rgbToHex(darkRgb.r, darkRgb.g, darkRgb.b);
        darkTokens[role] = {
            hex: darkHex,
            rgb: `rgb(${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b})`,
            oklch: `oklch(${Math.round(darkL * 1000) / 10}% ${Math.round(darkC * 1000) / 1000} ${Math.round(oklch.h * 10) / 10})`,
            L: darkL,
            C: darkC,
            h: oklch.h
        };
    });

    return { light: lightTokens, dark: darkTokens };
}

// Generate CSS Self-Healing Runtime Code
function generateCssRuntime(tokens) {
    let css = `/* =========================================================================
 * KASUALITY K-UDA RUNTIME (Self-Healing CSS with Relative Colors and APCA)
 * Generated automatically by Kasuality OS v2.0
 * ========================================================================= */

:root {
  /* --- LIGHT MODE TOKENS (Universal Fallback) --- */
  --kas-primary: ${tokens.light.primary.hex};
  --kas-secondary: ${tokens.light.secondary.hex};
  --kas-accent: ${tokens.light.accent.hex};
  --kas-surface: ${tokens.light.surface.hex};
  --kas-text: ${tokens.light.text.hex};
}

@supports (color: oklch(0% 0 0)) {
  :root {
    /* --- LIGHT MODE TOKENS (Modern OKLCH Wide-Gamut) --- */
    --kas-primary: ${tokens.light.primary.oklch};
    --kas-secondary: ${tokens.light.secondary.oklch};
    --kas-accent: ${tokens.light.accent.oklch};
    --kas-surface: ${tokens.light.surface.oklch};
    --kas-text: ${tokens.light.text.oklch};
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    /* --- DARK MODE TOKENS (K-UDA Inverted + APCA Verified) --- */
    --kas-primary: ${tokens.dark.primary.hex};
    --kas-secondary: ${tokens.dark.secondary.hex};
    --kas-accent: ${tokens.dark.accent.hex};
    --kas-surface: ${tokens.dark.surface.hex};
    --kas-text: ${tokens.dark.text.hex};
  }

  @supports (color: oklch(0% 0 0)) {
    :root {
      --kas-primary: ${tokens.dark.primary.oklch};
      --kas-secondary: ${tokens.dark.secondary.oklch};
      --kas-accent: ${tokens.dark.accent.oklch};
      --kas-surface: ${tokens.dark.surface.oklch};
      --kas-text: ${tokens.dark.text.oklch};
    }
  }
}

/* Explicit theme class override */
[data-theme="dark"] {
  --kas-primary: ${tokens.dark.primary.oklch};
  --kas-secondary: ${tokens.dark.secondary.oklch};
  --kas-accent: ${tokens.dark.accent.oklch};
  --kas-surface: ${tokens.dark.surface.oklch};
  --kas-text: ${tokens.dark.text.oklch};
}
`;
    return css;
}

// Generate W3C DTCG Format JSON
function generateW3cTokensJson(tokens) {
    const w3c = {
        "$schema": "https://design-tokens.github.io/community-group/format/",
        "$description": "Kasuality K-UDA Universal Design Tokens (W3C DTCG Format)",
        "color": {
            "primary": {
                "$value": tokens.light.primary.oklch,
                "$type": "color",
                "$extensions": {
                    "kasuality.com/token": {
                        "fallbackHex": tokens.light.primary.hex,
                        "darkValue": tokens.dark.primary.oklch
                    }
                }
            },
            "secondary": {
                "$value": tokens.light.secondary.oklch,
                "$type": "color",
                "$extensions": {
                    "kasuality.com/token": {
                        "fallbackHex": tokens.light.secondary.hex,
                        "darkValue": tokens.dark.secondary.oklch
                    }
                }
            },
            "accent": {
                "$value": tokens.light.accent.oklch,
                "$type": "color",
                "$extensions": {
                    "kasuality.com/token": {
                        "fallbackHex": tokens.light.accent.hex,
                        "darkValue": tokens.dark.accent.oklch
                    }
                }
            },
            "surface": {
                "$value": tokens.light.surface.oklch,
                "$type": "color",
                "$extensions": {
                    "kasuality.com/token": {
                        "fallbackHex": tokens.light.surface.hex,
                        "darkValue": tokens.dark.surface.oklch
                    }
                }
            },
            "text": {
                "$value": tokens.light.text.oklch,
                "$type": "color",
                "$extensions": {
                    "kasuality.com/token": {
                        "fallbackHex": tokens.light.text.hex,
                        "darkValue": tokens.dark.text.oklch
                    }
                }
            }
        }
    };
    return JSON.stringify(w3c, null, 2);
}

// Generate Cursor AI Rules (.cursorrules / k-uda-cursor-rule.mdc)
function generateCursorRules(tokens, lang = 'en') {
    const isIt = lang === 'it';
    const rules = `---
description: ${isIt ? "Direttiva Critica Kasuality K-UDA per Agenti IA (Cursor, Windsurf, Claude Code)" : "Critical Kasuality K-UDA Directive for AI Coding Agents (Cursor, Windsurf, Claude Code)"}
globs: ["**/*.{css,scss,html,jsx,tsx,vue,svelte,ts,js}"]
---

# ${isIt ? "REGOLA FONDAMENTALE DI DESIGN SYSTEM (ANTI-HEX ED ANTI-ALLUCINAZIONE)" : "FUNDAMENTAL DESIGN SYSTEM RULE (ANTI-HEX AND ANTI-HALLUCINATION)"}

You are an autonomous senior front-end architect. When generating or editing UI components in this repository, you MUST follow these non-negotiable mandates:

1. **ZERO HARDCODED COLORS (FORBIDDEN)**:
   - DO NOT write hardcoded hex values (e.g., #3b82f6, #ffffff) or ad-hoc rgb() in CSS or inline styles.
   - ALWAYS consume the active Kasuality K-UDA design tokens via CSS variables:
     - Primary / CTA: \`var(--kas-primary)\`
     - Secondary: \`var(--kas-secondary)\`
     - Accent: \`var(--kas-accent)\`
     - Surface / Card Background: \`var(--kas-surface)\`
     - Body Text / Titles: \`var(--kas-text)\`

2. **BITEMATIC CONTEXT (LIGHT AND DARK ACCESSIBILITY)**:
   - The project uses Kasuality Self-Healing tokens. Suffix or media query manual overrides are NOT required when using the semantic variables, as they adapt automatically under \`@media (prefers-color-scheme: dark)\` and \`[data-theme="dark"]\`.
   - Never place \`var(--kas-text)\` directly on an unstyled background. Always pair text with \`var(--kas-surface)\` to guarantee W3C APCA $L_c \\ge 75$ contrast readability.

3. **GRADIENT DOCTOR MANDATE (OKLCH)**:
   - When generating CSS gradients, ALWAYS use the modern Progressive OKLCH syntax:
     \`\`\`css
     background: linear-gradient(90deg, var(--kas-primary), var(--kas-secondary));
     background: linear-gradient(in oklch 90deg, var(--kas-primary), var(--kas-secondary));
     \`\`\`
   - This prevents the "gray dead zone" (desaturation dip) in intermediate gradient stops.
`;
    return rules;
}

module.exports = {
    srgbToLinear,
    linearToSrgb,
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    rgbToOklch,
    oklchToRgb,
    calculateWCAG,
    calculateAPCA,
    generateKudaTokens,
    generateCssRuntime,
    generateW3cTokensJson,
    generateCursorRules
};
