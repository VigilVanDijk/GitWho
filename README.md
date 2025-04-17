# GitWho README

GitWho is a VS Code extension that helps you track and highlight the changes made by specific authors in your project. Using the power of git blame, GitWho allows you to select an author and highlights their changes in the code. It also shows those changes in the minimap, making it easier to track contributions throughout your codebase.

## Features

Author Selection: Quickly select an author from a list of contributors to highlight their changes.

Git Blame Integration: Highlights lines modified by the selected author using git blame.

Minimap Highlights: Highlights the author's changes in the VS Code minimap for easy tracking.

Randomized Color Highlights: Changes are highlighted with pastel colors that change every time you select a new author.

Sidebar Integration: Displays a custom sidebar view like GitLens, giving you a more intuitive overview of author contributions.



## Requirements

Prerequisites
1) VS Code: Make sure you have Visual Studio Code installed.

2) Git: The extension requires Git to be installed in your system, as it uses git blame to fetch commit information.

## Extension Settings

1) Open the VS Code Marketplace.

2) Search for GitWho and install the extension.

Alternatively, you can install the extension locally by opening the VS Code command palette and running the following command:

    ext install <your-publisher-name>.<extension-name>


## Versions

v0.0.1 (launched 15/04/2025) - The extension searches for all authors that have contributed to this file and allows the user to see all of their changes

v0.1.0 (launched 17/04/2025) - Added a better way of disabling/un-highlighting the code 

v0.1.1 (launched 17/04/2024) - Changelog and Readme Updated

v0.2.0 (launched 17/04/2025) - Added an option on the status bar to un-highlight the code

## Known Issues

The extension requires the user to use the command pallete to launch it, there should be a more accessible way to do that