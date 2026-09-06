# VetDz Luxury Typography & Design System Specification

A luxury, high-end fashion design specification based on `public/main.png` and VetDz atelier design tokens.

---

## 1. Color Palette & Tokens (Quiet Luxury Noir & Champagne)

| Role | Color Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- | :--- |
| **Noir / Deep Dark** | Midnight Charcoal | `#0A0B0D` | Site backgrounds, hero backdrop, deep card surfaces |
| **Noir Panel** | Noir Slate Surface | `#14161B` | Product cards, floating navigation, modal panels, elevated surfaces |
| **Champagne Accent** | Warm Champagne Gold | `#DFD0B8` / `#C5A880` | Accent headline words ("Elevate Your"), active badges, key focus points |
| **Champagne CTA** | Light Champagne Sand | `#EAD8C0` | Primary action button fills (`Explore Collection`), contrast hover highlights |
| **Text Primary** | Pure Alabaster | `#FFFFFF` | High-contrast editorial titles, active links |
| **Text Muted** | Warm Cashmere Gray | `#A3A7B0` / `#9498A0` | Subtitles, editorial descriptions, microcopy, category metadata |
| **Hairline Borders** | Luxury Border Stroke | `rgba(255, 255, 255, 0.1)` | Subtle dividers, glassmorphic headers, card borders, eyebrow lines |
| **Gold Glow** | Champagne Glow | `rgba(223, 208, 184, 0.15)` | Subtle ambient glows and focus states |

---

## 2. Typography Scale & Roles

The design system establishes a high-end luxury editorial hierarchy: **Editorial Display (Serif)**, **Clean Modern Body (Sans-serif)**, and **Tracked Haute-Couture Microcopy (Uppercase)**.

### Hierarchy Overview

| Role | Font Family | Weight | Size Scale | Tracking & Spacing | Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Serif** | `Playfair Display` | Regular (400) / Medium (500) / SemiBold (600) | `2.5rem` - `4.5rem` (`40px` - `72px`) | Tight (`-0.02em`), line-height `1.08` | Hero titles, collection names, section headlines |
| **Editorial Body** | `Inter` / `Plus Jakarta` | Regular (400) | `0.95rem` - `1.125rem` (`15px` - `18px`) | Normal (`0`), line-height `1.7` | Hero description, story paragraphs, product descriptions |
| **Eyebrow / Microcopy**| `Inter` / `Outfit` | Medium (500) / SemiBold (600) | `0.75rem` - `0.85rem` (`12px` - `13.5px`) | Tracked Uppercase (`0.2em` - `0.25em`) | Eyebrow badges (`PREMIUM FASHION FOR MODERN MEN`), button labels, scroll indicators |
| **Price / Numeral** | `Playfair Display` / `Inter` | SemiBold (600) | `1.15rem` - `1.5rem` | Clean tracking (`0.02em`) | Currency figures (`14.500 DA`, `249.00 $`) |

### Font Stack Mapping

* **LTR (Latin / English / French):**
  * **Display & Editorial Headlines:** `Playfair Display`, "Didot", "Bodoni MT", Georgia, serif (`--font-serif`)
  * **Brand Mark & Display Sans:** `Outfit`, sans-serif (`--font-outfit`)
  * **Body & UI Elements:** `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif (`--font-inter`)
* **RTL (Arabic):**
  * **Display / Accents:** `Changa` & `Cairo` (`--font-cairo`, `--font-changa`)
  * **Body & Headings:** `Cairo`, sans-serif with refined line-heights

---

## 3. Typography Styles & CSS Classes

```css
/* Editorial Serif Headline */
.typography-display {
  font-family: var(--font-serif), "Playfair Display", Georgia, serif;
  font-size: clamp(2.5rem, 5vw + 1rem, 4.25rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #FFFFFF;
}

/* Gold Accent within Editorial Titles */
.typography-gold {
  color: #DFD0B8;
  background: linear-gradient(135deg, #F5E8D3 0%, #DFD0B8 50%, #C5A880 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Haute-Couture Eyebrow */
.typography-eyebrow {
  font-family: var(--font-inter), sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.typography-eyebrow::before {
  content: "";
  display: inline-block;
  width: 24px;
  height: 1px;
  background: rgba(223, 208, 184, 0.6);
}

/* Refined Editorial Body */
.typography-body {
  font-family: var(--font-inter), sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.7;
  color: #9CA3AF;
}
```

---

## 4. UI Components & Variants

### 4.1 Header & Navigation
- **Background**: Translucent dark glass (`rgba(10, 11, 13, 0.75)`) with backdrop blur (`blur(16px)`).
- **Brand Logo**: Clean uppercase `VETDZ` with hairline divider and subtle letter spacing.
- **Top Navigation**: Centered links with quiet hover animations and active gold underline indicator.
- **Action Group**: Search icon button, Language selector with globe icon, and minimal shopping bag icon.

### 4.2 Hero Section (`main.png`)
- **Composition**: Full-bleed cinematic photography with moody directional sunlight and deep shadows.
- **Eyebrow**: Tracked uppercase with hairline rule.
- **Headline**: Split two-tone serif with luxury champagne gradient highlight on "Elevate Your".
- **Primary CTA**: Champagne sand button (`#EAD8C0`), dark noir text, smooth hover lift, with clean directional arrow.
- **Indicators**: Floating dot indicators (`• ◦ ◦ ◦`) on bottom-left, vertical "SCROLL ↓" marker on bottom-right.

### 4.3 Editorial Product Cards
- **Aspect Ratio**: 3:4 or 4:5 tall silhouette frame.
- **Surfaces**: Ultra-minimal background, soft ambient shadow on hover, delicate corner radius (`0.75rem`).
- **Typography**: Clean serif or sans titles, discreet muted category subtitle, and clear price formatting.
