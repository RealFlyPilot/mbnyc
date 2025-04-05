# Hello Elementor Child Theme Style Guide

## File Structure Clarification

**⚠️ IMPORTANT:** This theme currently has duplicate CSS files in two locations:
- `/css/` directory (actively used in production via functions.php)
- `/assets/css/` directory (not actively used)

**Always use the files in the `/css/` directory** as they are properly referenced in functions.php.

## CSS Variable System

### Color Palette
The theme uses a monochromatic color scheme inspired by Gucci.com:

```css
--color-primary: #000000;
--color-secondary: #333333;
--color-accent: #ffffff;
--color-light: #ffffff;
--color-dark: #000000;
```

Plus grayscale variants from `--color-gray-100` (lightest) to `--color-gray-900` (darkest).

### Typography
The theme uses Futura PT as its primary font:

```css
--font-primary: futura-pt, 'Futura PT', sans-serif;
--font-heading: var(--font-primary);
--font-size-base: 16px;
```

#### Font Scale
Based on a perfect fourth ratio (1.333):

| Variable | Size | Usage |
|----------|------|-------|
| `--font-size-xs` | 12px | Small print, footnotes |
| `--font-size-sm` | 14px | Secondary text |
| `--font-size-md` | 16px | Body text (base) |
| `--font-size-lg` | 18px | Large body text |
| `--font-size-xl` | 21px | H3, subheadings |
| `--font-size-2xl` | 28px | H2 |
| `--font-size-3xl` | 38px | H1 |
| `--font-size-4xl` | 50px | Hero headlines |
| `--font-size-5xl` | 67px | Display headlines |

### Spacing System
Consistent spacing increments:

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
/* ... and so on */
```

### Container Widths
Responsive breakpoints:

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-full: 100%;
```

## Using CSS Variables in Elementor

### In Custom CSS Tab
When adding custom CSS to Elementor elements, use variables like:

```css
selector {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-4);
}
```

### For Typography Settings
1. Font Family: Futura PT
2. Font Size: Use sizes that match our scale (16px, 21px, 28px, etc.)
3. Font Weight: Match our defined weights (400 normal, 700 bold)
4. Text Transform: Uppercase for headings

## Theme Modes

### Light Mode (Default)
Apply `theme-light` class to a section for light mode styling:
- Background: White (`--color-accent`)
- Text: Black (`--color-primary`)

### Dark Mode
Apply `theme-dark` class to a section for dark mode styling:
- Background: Black (`--color-primary`)
- Text: White (`--color-accent`)

### Text Inversion
Apply `text-inverted` class to invert text color regardless of theme mode.

## Button Styles

### Default Button
Black background with white text:
- Background: `--color-primary` (black)
- Text: `--color-accent` (white)
- Text Transform: Uppercase
- Letter Spacing: Wide

### Inverted Button (Custom Type)
White background with black text:
- Background: `--color-accent` (white)
- Text: `--color-primary` (black)
- Border: 1px solid `--color-primary` (black)

## Implementation Guidelines

### General Rules
1. Use CSS variables for all styling properties
2. Keep specificity low
3. Use the class-based approach for theme variations
4. Test all components in both light and dark modes

### Elementor Best Practices
1. Use Elementor's built-in controls when possible
2. Add custom CSS only when necessary
3. Use the theme's fonts, colors and spacing consistently
4. Use custom classes from our system for special components

## Working with WordPress Customizer

The theme uses WordPress Customizer for some global settings. When working with the Customizer:

1. Prefer CSS variables for styling over Customizer settings
2. Use Customizer only for features that need to be user-configurable
3. Document any Customizer settings that affect the theme's appearance

## Reset Scripts

If theme styles get corrupted, these scripts can be run from the site root:
- `reset-elementor.php`: Resets Elementor settings
- `reset-customizer.php`: Resets WordPress Customizer settings
- `reset-styles.php`: Resets style-related settings 