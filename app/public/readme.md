# Theme documentation

https://github.com/RealFlyPilot/fp-starter-theme

## Local installation instructions

https://github.com/RealFlyPilot/fp-starter-theme/blob/main/readme.md#for-wpengine-projects-with-an-existing-repo

For project implementations, delete this line and everything below
=============================================================================================================


# Installation

## Local Install Directions

### Pull down environment
Use Local (localwp.com) to connect to WPEngine and pull down the project environment.
#### Attention
Check the size of the `omg-feeds.log` file in the root directory before pulling down. It's possible this file is excessively large. If this is the case, navigate to the environments' `omg-feed-settings` page in the wp-admin dashboard. Under the `logs` tab is a button to clear or clean the log.

## For WPEngine projects with an existing repo
Once you have pulled down with Local, `git clone` the WPEngine project's repo and `git checkout` the same environment as the one you pulled down in Local - if you pulled down dev, checkout the dev branch. If you pull down production, you'll checkout main/master.

Then take the `.git` folder from your cloned repo and copy it and `.gitignore` to the `public/` directory of the Local project directory.

Now you have your local set up with the git repo. Check `git status` to make sure you see the expected result.

Sometimes hidden files such as .gitignore, the .github/folder, etc are not pulled down from Local
When you run `git status`, it may show you that those files are missing. If those are the only things missing and you really just want to get your local environment in sync with your repo, then just run a `git stash` and test again with `git status`.

You can also check the Source Control tab in VS Code to see any uncommitted changes. We expect there to be no changes, but sometimes if changes were made to the filesystem outside of git, then there will be a discrepancy and you will need to decide whether to `commit` or `stash` that change. VS Code will make it easy for you to do this one at a time.

Add starter theme (if not done already):
https://github.com/RealFlyPilot/fp-starter-theme?tab=readme-ov-file#add-starter-theme-files

## For WPEngine projects that need a new repo
Once you have pulled down with Local, navigate to the `public/` directory. 




### Create new repo in Github
In Github, create a new repository
- Name the repo
- Set it to public or private
- Set it to not add a Readme or .gitignore

It will give you a list of commands to run, but we will only be running some. Do not close this page.

All the following commands should be run in your `public/` directory:
- Start with `git init` (initialize the repo).
- At this point check `git status` and/or `git status -u`  to make sure all the files we are going to track are what we want.

For `git status -u` the response I expect looks like:
```
.github/workflows/wpe-deploy_dev.yml
.github/workflows/wpe-deploy_production.yml
.github/workflows/wpe-deploy_staging.yml
.gitignore
.prettierignore
readme.md
wp-content/themes/fp-starter-child/.prettierrc
wp-content/themes/fp-starter-child/composer.json
wp-content/themes/fp-starter-child/composer.lock
wp-content/themes/fp-starter-child/functions.php
wp-content/themes/fp-starter-child/index.d.ts
... (more from fp-starter-child)
wp-content/themes/fp-starter/child-resources/package-lock.json
wp-content/themes/fp-starter/child-resources/package.json
wp-content/themes/fp-starter/child-resources/webpack.mix.js
wp-content/themes/fp-starter/composer.json
wp-content/themes/fp-starter/composer.lock
wp-content/themes/fp-starter/functions.php
wp-content/themes/fp-starter/index.d.ts
wp-content/themes/fp-starter/index.php
wp-content/themes/fp-starter/package-lock.json
wp-content/themes/fp-starter/package.json
... (more from fp-starter)
```

If you see other themes like twentytwentyfour or genesis, I find it better to just delete those folders, we can add them in later for bugtests if needed.

If you do see other themes here, that means they exist on the server that you pulled down from, so you should delete those non fp-starter themes from `/wp-admin/themes.php` to get a fresh start

  
- When sure, run `git add .` to add all the files to the index to be committed.
- Run `git commit -m 'initial commit'`
- Run the git remote add origin command that we have from when we created a new repo.
  - It should look like: `git remote add origin git@github.com:username/new-project.git`
- Rename the branch to match your current environment
  - If you are on the production branch, run `git branch -M main`
  - If you are on the staging branch, run `git branch -M staging`
  - If you are on the dev branch, run `git branch -M dev`
- Push
  - If you are on the production branch, run `git push -u origin main`
  - If you are on the staging branch, run `git push -u origin staging`
  - If you are on the dev branch, run `git push -u origin dev`

Your repo is now set up!

Add starter theme (if not done already):
https://github.com/RealFlyPilot/fp-starter-theme?tab=readme-ov-file#add-starter-theme-files


## Add starter theme files
### .gitignore
Add a `.gitignore` file to the `public/` directory. You should just copy the one that is in the main directory of the starter theme repo.
If you already have one, you may want to merge the two files

### .prettierignore
Add a `.prettierignore` file to the `public/` directory. You should just copy the one that is in the main directory of the starter theme repo.
If you already have one, you may want to merge the two files

### Add theme folders
In the starter theme repo, there are 2 theme folders in `/wp-content/themes`.
Copy both the parent and child themes to your `/wp-content/themes` repo

### Add actions
Copy the `.github` folder from the starter theme to the `public/` directory of your project.
IMPORTANT: In _each_ yml file, change the `WPE_ENV` value to match the WPEngine environment.

### Activate child theme
In the dashboard, under Appearance -> Themes, activate the FP Starter Child theme

## Local development
Optional: Run `composer install` from the parent theme's root folder to install any composer dependencies - if any.

Running `npm run watch` will monitor the child theme for updates while you develop. This function will also check to make sure the build/node_modules folders exist in the parent and child themes. If anything is not, then it will reinstall/rebuild. This function will compile SCSS, TS, JS, and even PHP. Our PHP enqueuing process is tied to Laravel Mix.

You may need to restart the watch command if you change the webpack.mix.js file or add anything to /acfblocks

## Things to know

The text domain for the parent theme is `fpst`
The text domain for the child theme is `fpstc`

It is common to need to change the child theme text domain for your new site so just find and replace `fpstc`

# FP Starter Theme updates (PARENT)

For parent theme updates done through the CMS, this means going to the dashboard to update the version of the parent theme, any node changes will not be ran. So it's best to update the theme version in the dashboard first. Then we need to trigger a GH compile action, so either make any change to the repo or force an action deploy in GH to trigger a compile.

Not recommended, but in case you do.., any code updates to the parent theme on your local need to be recompiled in the parent folder using `npx mix --production`. Normally we compile the child theme regularly, not the parent theme.

## Common errors during Github Actions

If you see a 'function already declared' error for something you put in the fp-starter-child/src/functions folder, this is probably due to a file/folder structure change that is leaving duplicate files on the server. Simply log in through ssh/sftp and delete the content in the fp-starter-child/src/functions folder, then run GH Actions deploy again and that should fix that until we find a better solution.


## Code Formatting

Install the Prettier extension for VS Code
Go to Settings->Settings and search for Format on Save to autoformat when you save a file
It will automatically use the .prettierrc configuation file

### VSCODE

package.json includes a php formatter compatible with prettier. Add the following to your settings.json file:

```
"editor.formatOnSave": true,
  "prettier.documentSelectors": [
    "**/*.{js,jsx,ts,tsx,vue,html,css,scss,less,json,md,mdx,graphql,yaml,yml,php}"
  ]
```

Note that the patterns/ folder is set to be ignored by Prettier because it causes extra new lines with the WP block code

## Third-party integrations

### Github Actions

Issue - When moving file locations or renaming files, only the new file appears on the server, the old file remains. To remedy this, 2 files : `build/fpst/existing-php-functions.json` and `build/fpstc/existing-php-functions.json` are created by webpack in the parent and child themes during compile. This makes it so only the files in the repo are included.
For example, if you create a file `themes/fp-starter-child/functions/badanalytics/analytics.php` and commit it to the repo, then it will appear on the server. If you remove that file from your repo, it will still remain on the server. This means we can't just enqueue every PHP file in `/functions/` because old files that were deleted from the repo could still exist. Using `existing-php-functions.json` to decide which files should be enqueued will make sure that the only files we are enqueing are the ones that exist in the repo.


## Page Building

At the core of our website creation process lies the Gutenberg blocks. These blocks serve as the elemental units, allowing us to craft cohesive and structured web pages. Examples of core blocks which we have customized include Paragraph, Header, and Image. Custom blocks also will be created for more advanced elements such as search bars, search results, image carousel, and post display.

Our approach centers around predefined patterns, each a carefully curated assembly of these blocks. Every webpage starts by integrating a pre-designed pattern into the Gutenberg editor.

## Block Patterns

Block Patterns are predefined block layouts, available from the patterns tab of the block inserter. Once inserted into content, the blocks are ready for additional or modified content and configuration. [Docs](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-patterns/)

We want block patterns to be an essential part of the page-building process. In this site, any row will be considered a pattern. Patterns may contain just a single block or often multiple blocks.

When building a page, the process should always begin by dragging a pre-defined pattern into the Gutenberg editor. To ensure consistency, if a pattern doesn't exist for the section/row, the pattern should be created before being added to a page.

### Patterns - Build process

The core principle when crafting patterns is ensuring the adaptability of individual blocks while providing a ready-to-use framework. A pattern should allow for easy adjustment of block elements to suit specific requirements. It streamlines the process, requiring only the deletion of unnecessary items and necessary adjustments to settings.

Any section or row diverging significantly from an existing pattern warrants the creation of a new pattern. This holds true even if it's a singular occurrence across the entire website. However, when constructing a new section that bears resemblance to an existing pattern, augmenting the existing pattern with additional blocks is acceptable. Yet, it's crucial to anticipate the potential removal of these blocks during implementation while ensuring the layout remains visually cohesive.

#### Example:

Section A containing:

- Title (Heading, Font size XXL)
- Subtitle (Paragraph, lowercase)
- Image (Aspect ratio 1:1)
- Button (Secondary)

Section B containing:

- Title (Heading, Font size XL)
- Subtitle
- Image (Aspect ratio 2:1)

Section C containing:

- Supertitle (Paragraph, Uppercase)
- Title (Heading)
- Paragraph
- Button (Primary)

All three of the above sections could be built using a pattern consisting of the following blocks:

- Supertitle (Paragraph, Uppercase)
- Title (Heading)
- Subtitle (Paragraph)
- Image
- Paragraph (Paragraph)
- Button

To create the layout of section B, you could add the the pattern described above, then remove the Subtitle and Image blocks. Then ensure the remaining blocks have the settings and content that match the design. The pattern should have been built in a way that removing items leaves the margins/padding in a way that the spacing will look good no matter which items are removed.
