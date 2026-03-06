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
        const response = LaunchBar.alert('Reade is a cute Readwise API client for LaunchBar', `Interact with the Readwise API and receive responses in LaunchBar. Reade can add highlights to Readwise, save URLs and text to Reader, and list Reader items.

*Actions* are keywords that trigger specific functionality.

⚡️  “add TEXT”: Create a new highlight in Readwise with the entered TEXT and return its URL.
⚡️  “add”: Create a new highlight in Readwise with text from the clipboard and return its URL
⚡️  “save URL [TAGS]”: Save a URL to Reader. Any words after the URL (comma-delimited) will be added as tags, e.g., “tag one, tag two”.
⚡️  “save”: Save to Reader using a URL or text from the clipboard. The clipboard can contain raw HTML, text, or Markdown. If the clipboard contains Markdown, it will be converted to HTML. This mode doesn’t support adding tags.
⚡️  “open URL|DOCUMENT_ID”: Open a read.readwise.io URL or document ID in the Reader desktop app (if installed).
⚡️  “list [CATEGORY] [LOCATION] [TAG [TAG…]]”: List recent Reader items, optionally filtered by CATEGORY, LOCATION, and TAGs.

- CATEGORY can be one of: article, email, epub, highlight, note, pdf, rss, tweet, video.
- LOCATION can be one of: new, later, shortlist, archive, feed.
- TAG can be used up to five times. Multi-word tags must be separated+with+plusses.

For example, the command “list rss archive business case+study” will list all archived RSS items tagged ‘business’ and ‘case study’.

*Keyboard shortcuts* for Reader items:

✨  ↵ (return)  Open the item in Reader.
✨  ⌘↵ (command + return)  Open the source URL in your browser (fall back to distilled HTML if no URL).
✨  ⌥ ↵ (option + return)  Open distilled HTML in your browser.
✨  ⌃↵ (control + return) (or ⌘Y)  Open the source URL in Quick Look (fall back to distilled HTML if no URL).
✨  ⇧↵ (shift + return)  Insert the source URL at the current cursor position.

*Commands* manage settings:

⚡️  “config” list: Show current configuration settings.
⚡️  “config” reset: Reset all configuration options to default.
⚡️  “config” set OPTION VALUE: Set the configuration OPTION to VALUE, e.g., config set default_action alert.
⚡️  “help”: Display this user guide.
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