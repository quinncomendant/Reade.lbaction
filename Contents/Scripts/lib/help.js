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
        const response = LaunchBar.alert('Reade is a cute Readwise API client', `Interact with the Readwise API and receive responses in LaunchBar.

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