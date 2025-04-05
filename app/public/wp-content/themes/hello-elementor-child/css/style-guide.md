# Gucci-Inspired Theme Style Guide

This document outlines how to use the theme's CSS variables and theme system to create a luxury aesthetic inspired by Gucci.com.

## CSS Variables System

The theme uses a monochromatic black and white color scheme with a robust CSS variables system that defines all design tokens.

These variables are defined in `css/variables.css` and applied to elements in `css/base-styles.css`. They're loaded in both the frontend and Elementor editor.

## Typographic Scale

The theme uses a harmonious typographic scale based on the perfect fourth ratio (1.333). This creates a balanced visual hierarchy that maintains proportional relationships between text elements.

### Font Sizes
Our type scale is built on a mathematical relationship:

- `--font-size-base`: 16px (base size)
- `--font-scale-ratio`: 1.333 (perfect fourth)

This creates the following sizes:
- `--font-size-xs`: 12px (base ÷ ratio)
- `--font-size-sm`: 14px (base ÷ (ratio × 0.75))
- `--font-size-md`: 16px (base)
- `--font-size-lg`: 18px (base × ratio × 0.75)
- `--font-size-xl`: 21px (base × ratio)
- `--font-size-2xl`: 28px (base × ratio²)
- `--font-size-3xl`: 38px (base × ratio³)
- `--font-size-4xl`: 50px (base × ratio⁴)
- `--font-size-5xl`: 67px (base × ratio⁵)

### Usage Example
```css
.headline { font-size: var(--font-size-2xl); }
.subheading { font-size: var(--font-size-xl); }
.body-text { font-size: var(--font-size-md); }
.caption { font-size: var(--font-size-sm); }
```

### Responsive Adjustments
The scale automatically creates proper proportions at all sizes, making it easy to adjust for different screen sizes:

```css
@media (max-width: 768px) {
  :root {
    --font-size-base: 14px; /* Smaller base size */
  }
}
```

## Light and Dark Theme System

The theme includes a flexible system for creating light-on-dark and dark-on-light sections:

### Light Theme (Default)
```html
<div class="theme-light">
  <!-- Black text on white background -->
  <p>Default text in light theme</p>
  
  <!-- White text on black background -->
  <p class="text-inverted">Inverted text in light theme</p>
</div>
```

### Dark Theme
```html
<div class="theme-dark">
  <!-- White text on black background -->
  <p>Default text in dark theme</p>
  
  <!-- Black text on white background -->
  <p class="text-inverted">Inverted text in dark theme</p>
</div>
```

## Typography

Typography follows Gucci's minimal, elegant aesthetic:

- **Primary Font**: Futura PT
- **Headings**: Uppercase, light weight, wide letter spacing
- **Body Text**: Clean, well-spaced
- **Line Heights**: Scaled proportionally with text sizes
  - `--line-height-none`: 1
  - `--line-height-tight`: 1.2 (for headlines)
  - `--line-height-snug`: 1.33
  - `--line-height-normal`: 1.5 (for body text)
  - `--line-height-relaxed`: 1.66
  - `--line-height-loose`: 1.75
- **Letter Spacing**: Multiple options for creative control
  - From `--letter-spacing-tightest` (-0.05em) 
  - To `--letter-spacing-widest` (0.25em)

## Using CSS Variables in Elementor

### 1. In Custom CSS Field

In any Elementor element, you can access the "Advanced" tab and use the "Custom CSS" field:

```css
selector {
  font-family: var(--font-primary);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: var(--text-transform-uppercase);
}
```

### 2. For Sections

You can implement Gucci-inspired sections using classes:

```css
/* Light theme (black on white) */
.elementor-section.theme-light {
  color: var(--color-primary);
  background-color: var(--color-accent);
}

/* Dark theme (white on black) */
.elementor-section.theme-dark {
  color: var(--color-accent);
  background-color: var(--color-primary);
}
```

## Design Principles

1. **Minimalist**: Clean, uncluttered layouts with generous white space
2. **Typography-Driven**: Bold typographic statements in uppercase Futura PT
3. **Monochromatic**: Primarily black and white, with occasional subtle neutrals
4. **Refined**: Elegant spacing, clean lines, no rounded corners
5. **Focus on Content**: Let content breathe with ample padding

## Available Variables

### Colors
- `--color-primary`: #000000 (Black)
- `--color-accent`: #ffffff (White)
- `--color-secondary`: #333333 (Dark gray)
- Various gray shades from `--color-gray-100` to `--color-gray-900`

### Typography
- `--font-primary`: futura-pt, 'Futura PT', sans-serif
- `--font-size-xs` through `--font-size-5xl`: Scaled font sizes
- `--font-weight-light` through `--font-weight-bold`: Font weights
- `--letter-spacing-tightest` through `--letter-spacing-widest`: Letter spacing
- `--text-transform-uppercase`: uppercase

### Spacing
- `--spacing-0` through `--spacing-32`: Various spacing values
- Utility classes: mt-4, mb-6, py-8, px-12, etc.

## Key Components

### Buttons

Buttons follow Gucci's minimal, refined aesthetic:
- Rectangular (no rounded corners)
- Uppercase text with wide letter spacing
- Black with white text (or inverted)

```html
<!-- Default button -->
<button class="button">Shop Now</button>

<!-- Outline button -->
<button class="button button-outline">Learn More</button>
```

### Containers

```html
<!-- Standard container with max-width -->
<div class="container">Content</div>

<!-- Full-width container -->
<div class="container container-full">Content</div>
```

## Example Usage

### Gucci-Style Product Section
```html
<div class="theme-light py-12">
  <div class="container">
    <h2 class="text-uppercase mb-8">New Collection</h2>
    <p class="large mb-6">Discover the latest designs from our exclusive collection.</p>
    <button class="button">View Products</button>
  </div>
</div>

<div class="theme-dark py-12">
  <div class="container">
    <h2 class="text-uppercase mb-8">Brand Heritage</h2>
    <p class="large mb-6">A legacy of excellence and unparalleled craftsmanship since 1921.</p>
    <button class="button">Our Story</button>
  </div>
</div>
```

## Customizing Variables

To modify these variables, edit the `css/variables.css` file. All changes will automatically propagate everywhere the variables are used. 