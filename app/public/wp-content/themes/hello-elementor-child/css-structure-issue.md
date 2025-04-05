# CSS Structure Issue and Resolution Plan

## Current Issue

The theme currently has duplicate CSS files in two locations:

1. **Production Files** (referenced in `functions.php`):
   - `/css/variables.css` (119 lines)
   - `/css/base-styles.css` (437 lines)
   - `/custom.css` (empty, commented out)

2. **Unused Files** (mentioned in original README):
   - `/assets/css/variables.css` (119 lines, identical to production version)
   - `/assets/css/main.css` (76 lines, simplified version of base-styles.css)

This duplication creates confusion about which files to edit and maintain.

## Evidence

1. **functions.php analysis**:
   ```php
   // Enqueue CSS Variables first
   function enqueue_css_variables() {
       wp_enqueue_style('theme-variables', get_stylesheet_directory_uri() . '/css/variables.css', array(), '1.0.0');
       wp_enqueue_style('theme-base-styles', get_stylesheet_directory_uri() . '/css/base-styles.css', array('theme-variables'), '1.0.0');
   }
   ```
   All enqueue functions reference `/css/` directory files, not `/assets/css/` files.

2. **README.md inconsistency**:
   The original README incorrectly referenced `/assets/css/main.css` when the actual file being used is `/css/base-styles.css`.

## Recommended Solution

1. **Keep and maintain only**:
   - `/css/variables.css`
   - `/css/base-styles.css`
   - `/custom.css`

2. **Remove or archive**:
   - `/assets/css/variables.css`
   - `/assets/css/main.css`

3. **Update documentation**:
   - Ensure all documentation references the correct file paths
   - Update README.md (completed)
   - Update style-guide.md (completed)

## Implementation Plan

1. Create a branch `feature/css-structure-cleanup`
2. Make a backup of `/assets/css/` files in case they contain unique styles
3. Update all code references to ensure they point to `/css/` directory
4. Remove `/assets/css/` directory or move it to an archived location
5. Test thoroughly to ensure styles are maintained
6. Create PR and merge to dev branch

## Benefits

1. **Reduced Confusion**: Developers will know exactly which files to edit
2. **Simplified Maintenance**: Only one set of files to update
3. **Improved Documentation**: All references will be accurate
4. **Better Onboarding**: New developers can quickly understand the CSS structure

## Note for Future Development

When making style changes, always edit the files in the `/css/` directory:
- Use `/css/variables.css` for global CSS variables
- Use `/css/base-styles.css` for element styles
- Use `/custom.css` for custom overrides (if needed)

Never create duplicate files in different locations. 