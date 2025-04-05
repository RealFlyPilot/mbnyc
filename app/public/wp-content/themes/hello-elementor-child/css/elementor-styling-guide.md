# Elementor Styling Guide for MBNYC Fitness

## Overview

This guide outlines how to maintain consistent styling when working with Elementor on the MBNYC Fitness site. Our theme uses CSS variables to maintain a consistent design system across the site, which allows for easy updates and ensures visual consistency.

## CSS Variables System

All styling is controlled by CSS variables defined in `css/variables.css`. These variables define:

- **Typography**: Font families, sizes, weights, line heights, and letter spacing
- **Colors**: Primary, secondary, accent, and UI colors
- **Spacing**: Margins, paddings, and layout spacing values
- **Borders**: Border-radius, width, and styles
- **Shadows**: Box shadows for different elevation levels

## How to Style Elementor Elements

**Preferred Approach**:
1. Use existing Elementor classes where possible
2. Rely on CSS variables for styling attributes
3. Focus on layout and content in Elementor, rather than making direct styling changes

The `elementor-reset.css` file provides standardized styling for all Elementor elements using our design system. This ensures that all Elementor elements are visually consistent across the site.

## Working with Elementor's Style Panel

When you need to make specific style adjustments in Elementor:

### Typography
- **Don't** change font family or weight in Elementor directly
- **Do** select heading levels appropriately (H1-H6) 
- **Do** use CSS classes to adjust typography when needed

### Colors
- **Don't** set custom colors in Elementor
- **Do** use the predefined color scheme which pulls from CSS variables

### Buttons
- **Don't** customize button appearance heavily in Elementor
- **Do** use the button size options (XS, S, M, L, XL)
- **Do** use the "Inverted" button type for secondary styling

### Classes
- **Do** add custom classes to elements for specific styling needs
- **Do** use utility classes defined in `base.css` when possible

## Guidelines for Specific Element Types

### Headings
- Use H1 only once per page, typically for the page title
- Follow the proper heading hierarchy (H1 → H2 → H3, etc.)
- Set proper heading levels based on content structure, not styling preferences

### Buttons
- Use the default button styling when possible
- Choose appropriate button sizes based on context
- Use the "Inverted" button type for secondary action buttons

### Text
- Keep text formatting minimal
- Use paragraphs for body text
- Use inline elements (strong, em) for emphasis rather than changing color/size

### Forms
- Use the default form styling
- Don't change field styles unless absolutely necessary
- Add appropriate spacing between form elements

## Best Practices

1. **Maintain Hierarchy**: Use proper heading levels to maintain document structure
2. **Be Consistent**: Use the same styling patterns across similar elements
3. **Mobile Responsiveness**: Test all pages on mobile and adjust accordingly
4. **Custom Styling**: If you need custom styles, use the custom.css file

## Custom Button Types

We've added a custom "Inverted" button type to Elementor. To use it:
1. Add a button widget
2. In the Style tab, find the button type dropdown
3. Select "Inverted"

## Troubleshooting

If Elementor styles are overriding your custom styles:
1. Check that styles are being enqueued in the correct order
2. Verify that Elementor's CSS regeneration is working
3. Use more specific selectors in custom CSS if needed

## Future Updates

When updates to the site styling are needed:
1. Modify the CSS variables in `variables.css`
2. Regenerate Elementor CSS from Elementor → Tools → Regenerate CSS

This approach ensures that styling changes are applied consistently across the entire site. 