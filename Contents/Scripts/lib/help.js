//
// Copyright 2024 Quinn Comendant
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

// eslint-disable-next-line no-redeclare, no-unused-vars
class Help {
    general() {
        const response = LaunchBar.alert('Reade is a cute Readwise API client for LaunchBar', `Interact with the Readwise API and receive responses in LaunchBar.

*Actions* are keywords that trigger specific functionality.

⚡️  “add TEXT”: Create a new highlight in Readwise with the entered TEXT and return its URL (TEXT will come from the clipboard if not entered into LaunchBar).
⚡️  “save URL [TAGS]”: Save a URL to Reader. Any words after the URL (comma-delimited) will be added as tags, e.g., “tag one, tag two”.
⚡️  “list [CATEGORY[ LOCATION]]”: List recent Reader items, optionally filtered by CATEGORY and/or LOCATION (which can be specified in either order).

→ CATEGORY can be one of: article, email, epub, highlight, note, pdf, rss, tweet, video.
→ LOCATION can be one of: new, later, shortlist, archive, feed.

For example, to list all unread RSS items enter “list unread rss” into Reade.

*Keyboard shortcuts* for Reader items:

✨  ↵ (return)  Open the item in Reader.
✨  ⌘↵ (command + return)  Open the source URL in your browser.
✨  ⌃↵ (control + return)  Open the source URL in Quick Look (or ⌘Y).
✨  ⇧↵ (shift + return)  Insert the source URL at the current cursor position.

*Commands* manage settings:

⚡️  “help”: Display a short user guide.
⚡️  “config” list: Show current configuration settings.
⚡️  “config” reset: Reset all configuration options to default.
⚡️  “config” set OPTION VALUE: Set the configuration OPTION to VALUE, e.g., config set default_action alert.
⚡️  “version”: Display Reade version and check if a new version is available.

Reade was created by by Quinn Comendant.

`, 'Close', '💾 View on GitHub', '🐘 Follow on Mastodon', '☕️ Support on Ko-fi');
        switch (response) {
        case 1:
            LaunchBar.openURL('https://github.com/quinncomendant/Reade.lbaction');
            break;
        case 2:
            LaunchBar.openURL('https://mastodon.social/@com');
            break;
        case 3:
            LaunchBar.openURL('https://ko-fi.com/strangecode');
            break;
        }
    }

    apiKey() {
        const response = LaunchBar.alert('Reade requires a Readwise API token', `1. Create a Readwise account at https://readwise.io/.
2. Get an API token at https://readwise.io/access_token.
3. Invoke Reade and send this command to save your API token in LaunchBar:

👉    config set token ×××××××××××××××××××
`, 'Close', 'Open URL for API token', 'Open URL to create account');

        switch (response) {
        case 1:
            LaunchBar.openURL('https://readwise.io/access_token');
            break;
        case 2:
            LaunchBar.openURL('https://readwise.io/accounts/signup/');
            break;
        }
    }

    config() {
        const response = LaunchBar.alert('Reade configuration', `To change any of the following values, use the “config set” command, e.g., “config set title My Highlights”.

⎯

${config.show()}`, 'Close', 'View the docs');

        switch (response) {
        case 1:
            LaunchBar.openURL('https://github.com/quinncomendant/Reade.lbaction#options');
            break;
        }
    }
}