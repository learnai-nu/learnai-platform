# LearnAI brand guide

Destilleret fra to referencer, som Jesper har peget på: **aileadership.com** (struktur, farvedisciplin,
komponentsprog) og **angst.dk** (varme, serif-stemme, menneskelig rytme). Alle værdier er aflæst direkte
i de to sites' kildekode; det, der er interpoleret, er markeret som *afledt*.

Visuel udgave: se den publicerede brand guide-artifact (link i sessionen).

## 1. Idé

- Blå bærer **handling**: knapper, links, fremdrift, status.
- Amber bærer **stemme**: emneetiketter, eyebrow-streger, den ene menneskelige CTA per side.
- Navy bærer **dybde**: sjældne mørke felter, hvor der skal træffes en beslutning.
- En overskrift er aldrig blå, og man klikker aldrig på noget amber i en læringsflade.

## 2. Farver

| Token | Hex | Rolle | Kilde |
| --- | --- | --- | --- |
| `primary-blue` | `#004FA6` | Primær knap, links, fremdrift, tal (8,3:1 på hvid) | AIL, aflæst |
| `navy` | `#16283F` | Mørke sektioner, priskort, footer | angst.dk, aflæst |
| `navy-mid` | `#24446B` | Ikoner og checkmarks på lys bund | angst.dk, aflæst |
| `deep-blue` | `#001E40` | Blæk på lyseblå flader | AIL, aflæst |
| `highlight-blue` | `#3688F8` | Fokusring (25 %), hårlinjer. Ikke tekst på hvid | AIL, aflæst |
| `light-blue` | `#97C0F9` | Kanter, tekst på mørke billeder | AIL, aflæst |
| `badge-soft` | `#E8F1FE` | Blå på blød bund: status, tal-cirkler | AIL, afledt |
| `amber` | `#B98B4E` | Flader og streger. Ikke tekst på hvid (3,0:1) | angst.dk, aflæst |
| `amber-text` | `#8A6534` | Amber som tekst på lyst (5,1:1) | afledt |
| `amber-light` | `#D4AA6E` | Amber på navy | angst.dk, aflæst |
| `sand` | `#FBF1DC` | Bløde varme felter, noter | angst.dk, aflæst |
| `paper` | `#F5F3EE` | Sektionsbund, tekst på navy | angst.dk, aflæst |
| `greige-300` | `#E7E5E3` | Eneste kantfarve på lyse flader | AIL, aflæst |
| `greige-700/800/950` | `#57554F` / `#3A3833` / `#1C1B17` | Sekundær tekst / brødtekst / overskrifter | 950 aflæst, øvrige afledt |

På navy bruges `rgb(245 243 238 / 18%)` som kant i stedet for greige-300.

## 3. Typografi

**Fraunces** (variabel, opsz 9–144) til overskrifter, citater, tal og priser.
**Geist** til brødtekst, navigation, knapper og etiketter. **Geist Mono** til kode og data.
Brug `font-optical-sizing: auto` på Fraunces.

| Rolle | Skrift | Mobil | Desktop | Vægt |
| --- | --- | --- | --- | --- |
| Hero | Fraunces | 34 / 38 | 56 / 60 | 500 (+ kursiv til andet led) |
| H2 | Fraunces | 28 / 34 | 40 / 46 | 500 |
| H3 / kort | Geist | 20 / 26 | 22 / 28 | 700 |
| Manchet | Geist | 17 / 27 | 19 / 30 | 400 |
| Brød | Geist | 16 / 25 | 16 / 25 | 400 |
| Eyebrow | Geist | 13 / 18 | 13 / 18 | 700, versaler, amber streg + blå tekst |
| Tal og priser | Fraunces | 26 / 32 | 32 / 38 | 500 |

Angst.dk's Manrope er et gyldigt alternativ til Geist — vælg ét, ikke begge.

## 4. Layout

- Indholdsbredde 1136 px; brødtekst 60–65 tegn.
- Sidepadding 24 → 40 → 152 px. Sektionshøjde 64 → 80 → 96 px lodret.
- Radius: 16 px kort (18–20 px på store), 999 px knapper og tags, 28 px dialoger.
- Kant: 1 px `greige-300`, aldrig 2 px.
- Sektionens faste anslag: eyebrow → overskrift → manchet → 48 px → indhold.
- Bølgestregen (angst.dk's `wave-divider`, amber ved 55 %) bruges ved bløde emneskift, ikke overalt.
- Maks to navy-sektioner per side.

## 5. Komponenter

- Alt interaktivt er fuldt afrundet; alt indholdsbærende har 16 px radius.
- Knapper: blå primær (produkt og forløb), amber til den ene menneskelige handling per side,
  greige sekundær, ghost til navigation. To primære knapper ved siden af hinanden er en fejl.
- Fokusring overalt: `0 0 0 3px rgb(54 136 248 / 25%)`.
- Etiketter: amber-tag = emne, blåt tag = status/position i forløb.
- Fremdrift: cirkler med light-blue kant, aktivt trin fyldt navy. Store fortællende trin bruger
  Fraunces-tal (01–04).
- Emnekort (genkendelse) har ingen knapper.

## 6. Sprog

Gør: anden person ental; påstand først, forklaring bagefter; efterprøvbare tal; sig hvad I ikke kan;
overskrifter som hele sætninger; svar direkte på pris.

Undgå: superlativer ("revolutionerende", "game changer"), emojis og versaler som betoning,
modelnavne som salgsargument, løfter uden modtager, konkurrerende CTA'er.

## 7. Tokens

```css
:root {
  /* Handling */
  --color-primary-blue:   #004FA6;
  --color-highlight-blue: #3688F8;
  --color-light-blue:     #97C0F9;
  --color-badge-soft:     #E8F1FE;

  /* Dybde */
  --color-navy:      #16283F;
  --color-navy-mid:  #24446B;
  --color-deep-blue: #001E40;

  /* Stemme */
  --color-amber:       #B98B4E;
  --color-amber-text:  #8A6534;
  --color-amber-light: #D4AA6E;
  --color-sand:        #FBF1DC;

  /* Grund */
  --color-paper:      #F5F3EE;
  --color-greige-300: #E7E5E3;
  --color-greige-700: #57554F;
  --color-greige-800: #3A3833;
  --color-greige-950: #1C1B17;

  /* Form */
  --radius-card:   1rem;
  --radius-pill:   999px;
  --radius-dialog: 1.75rem;

  /* Elevation */
  --shadow-card:   0 1px 2px rgb(28 27 23 / 6%), 0 12px 32px rgb(28 27 23 / 7%);
  --shadow-medium: 0 1px 2px rgb(28 27 23 / 8%), 0 4px 10px rgb(28 27 23 / 6%);
  --focus-ring:    0 0 0 3px rgb(54 136 248 / 25%);

  /* Skrift */
  --font-display: "Fraunces", Georgia, "Times New Roman", serif;
  --font-sans:    "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono:    "Geist Mono", ui-monospace, monospace;
}

/* Map til det eksisterende orbit-lag i src/styles/blue-orbit-tokens.css */
:root {
  --brand-action: var(--color-primary-blue);
  --brand-ink:    var(--color-greige-950);
  --brand-paper:  var(--color-paper);
  --brand-signal: var(--color-amber);
  --brand-rule:   var(--color-greige-300);
}
```

## 8. Forbehold

Ikke aflæseligt af den udleverede kode: pink-værdien i AIL's gradientstriber, angst.dk's
`--teal-tint`, `--ink-soft` og `--line`, samt begge sites' SVG-baggrunde. De ligger i Tailwind-config
og temafiler og skal bekræftes der, hvis udtrykket skal rammes 100 %.
