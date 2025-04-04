# Hello Elementor Child Theme with CSS Variables System

This child theme extends Hello Elementor with a robust CSS variables system inspired by Gucci.com's design aesthetic. The system provides consistent styling across the site while maintaining compatibility with Elementor.

## Architecture Overview

The styling system follows a "first-level styling" approach where base styles are defined in code files rather than through Elementor's UI or WordPress Customizer. This provides several benefits:

1. **Code-based control** - All styling is managed through version-controlled files
2. **Consistency** - Design tokens ensure uniform styling
3. **Maintainability** - Changes to variables automatically propagate throughout the site
4. **Elementor compatibility** - Styles are visible in both the Elementor editor and the frontend

## Directory Structure

```
hello-elementor-child/
├── css/
│   ├── variables.css        # CSS variables/design tokens
│   ├── base-styles.css      # Base element styles
│   └── style-guide.md       # Documentation of the system
├── custom.css               # Legacy file (commented out)
├── functions.php            # Enqueues stylesheets
├── style.css                # Theme declaration
└── README.md                # This file
```

## How the System Works

1. **CSS Variables (Design Tokens)**
   - Defined in `css/variables.css`
   - Follows a monochromatic black and white scheme
   - Includes typographic scale, spacing, colors, etc.

2. **Base Element Styles**
   - Defined in `css/base-styles.css`
   - Applies variables to HTML elements
   - Includes Elementor-specific overrides

3. **Theme System**
   - Supports both light (black on white) and dark (white on black) themes
   - Add `theme-light` or `theme-dark` class to containers
   - Text inversion available within each theme

4. **Typographic Scale**
   - Based on the perfect fourth ratio (1.333)
   - Mathematical relationship between text sizes
   - Responsive adjustments through base size changes

## Usage Examples

### Light Theme Container
```html
<div class="theme-light">
  <h2>Black heading on white background</h2>
  <p>Regular paragraph text</p>
  <p class="text-inverted">White text on black background</p>
</div>
```

### Dark Theme Container
```html
<div class="theme-dark">
  <h2>White heading on black background</h2>
  <p>Regular paragraph text</p>
  <p class="text-inverted">Black text on white background</p>
</div>
```

### Using Variables in Elementor

In Elementor's Custom CSS field:
```css
selector {
  color: var(--color-primary);
  letter-spacing: var(--letter-spacing-wide);
  padding: var(--spacing-4);
}
```

## Modifying the System

1. **To Change Design Tokens**
   - Edit `css/variables.css`
   - All changes will automatically propagate

2. **To Change How Elements Look**
   - Edit `css/base-styles.css`
   - Target specific elements as needed

3. **For Custom Components**
   - Use the variables for all properties
   - Follow the existing naming conventions
   - Test in both light and dark themes

## Resetting Elementor Styles

If you need to reset Elementor's styling to defaults:

1. Visit `/reset-styles.php` in your browser while logged in as an admin
2. This resets both Elementor and WordPress Customizer settings
3. Your CSS variables system will take precedence

## Further Documentation

For more detailed information on the variables and usage examples, see the [style guide](./css/style-guide.md).

## Development Workflow

1. Edit CSS files directly in code
2. Use version control for tracking changes
3. Use Elementor for layout and content, not global styling
4. Override specific elements in Elementor only when necessary 