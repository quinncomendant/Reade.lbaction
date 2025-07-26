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
class Parse {
    // The private #results object will be populated when process() is run.
    #results = {
        /** @type {boolean} If the user sends a command, this will be set to TRUE. */
        command: undefined,

        /** @type {string} If an action modifier is provided, this will be set. */
        action: undefined,

        /** @type {Object} Parameters appropriate for submitting to the API for the define `action`. */
        params: {},
    };

    process(input_text) {
        // this.commands() returns true if a command is found, false if none found.
        this.#results.command = this.commands(input_text);

        if (this.#results.command) {
            // If a command was given, don't parse actions.
            return this.#results.command;
        }

        // this.actions() returns true on success.
        const actions_result = this.actions(input_text);

        LaunchBar.debugLog(`Parse results: ${JSON.stringify(this.#results)}`);
        return actions_result;
    }

    get(key) {
        key = key.toLowerCase();
        return typeof this.#results[key] !== 'undefined' ? this.#results[key] : undefined;
    }

    commands(input_text) {
        // Intercept command keyword.
        // Collapse `two word` commands to `twoword`.
        let input_text_command = input_text.replace(/^(config) *(delete|export|list|reset|set |get ).*$/, '$1$2').toLowerCase().trim();
        LaunchBar.debugLog(`Parsing command in “${input_text_command}”`);
        switch (input_text_command) {
        case 'config':
        case 'configlist':
            help.config();
            return true;

        case 'configreset': {
            const configreset_response = LaunchBar.alert('Are you sure?', 'This will erase all configuration options (except the API token), resetting them to their default values.', 'Cancel', 'Proceed');
            switch (configreset_response) {
            case 1:
                config.setDefaults(['token']); // Don't reset API token.
                LaunchBar.displayNotification({title: 'Reade', string: 'Configuration reset to default.'});
                break;
            }
            return true;
        }

        case 'configset': {
            const [config_key, ...config_words] = input_text.replace(/^config *set */, '').split(/\s+/);
            const config_val = config_words.join(' ');
            config.set(config_key, config_val);
            return true;
        }

        case 'help':
            help.general();
            return true;

        case 'version':
            util.versionCheck();
            return true;

        default:
            // No command found, return false so we can continue running Reade.
            LaunchBar.debugLog(`Command not found: “${input_text_command}”`);
            return false;
        }
    }

    actions(input_text) {
        let input_text_action;
        [input_text_action, input_text] = util.unprefix(input_text);
        LaunchBar.debugLog(`Parsing action in “${input_text_action}”`);
        switch (input_text_action.toLowerCase()) {
        case 'add': {
            // Add a highlight to Readwise.
            // E.g., `add This is a highlight`,
            this.#results.action = 'highlightCreate';
            this.#results.params.text = input_text;

            // If no text entered, try to use contents of clipboard.
            if (!this.#results.params.text.trim().length) {
                this.#results.params.text = util.getClipboard();
                if (!this.#results.params.text.trim().length) {
                    LaunchBar.alert(`Failed to create highlight`, `The “add” action must be followed by the text of the highlight, e.g., “add This text”.`);
                    return false;
                }
            }

            if (this.#results.params.text.length > 8191) {
                LaunchBar.alert('Failed to create highlight', `That highlight text is too long (${this.#results.params.text.length}); max length 8191.`);
                return false;
            }
            return true;
        }

        case 'save': {
            // Save a URL to Reader.
            // E.g., `save https://example.com/post/123 tag1,tag2,tag3`
            this.#results.action = 'documentCreate';
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const [prefix, rest] = util.unprefix(input_text);
                if (!prefix) break;
                if (/^https?:/.test(prefix)) {
                    this.#results.params.url = prefix;
                    if (rest.length) {
                        this.#results.params.tags = rest.split(',').map(tag => tag.trim());
                    }
                    break;
                }
                input_text = rest;
            }

            // If no text entered, try to use contents of clipboard.
            if (typeof this.#results.params.url === 'undefined' || !this.#results.params.url.length) {
                let clipboard = util.getClipboard();
                if (clipboard.length) {
                    if (/^https?:\S+$/.test(clipboard)) {
                        this.#results.params.url = clipboard;
                        return true;
                    } else {
                        if (!/<\w+>/.test(clipboard)) {
                            // If no HTML tags, convert to HTML by processing as Markdown using https://github.com/PianothShaveck/drawdown
                            include('lib/drawdown.js');
                            // eslint-disable-next-line no-redeclare, no-unused-vars
                            clipboard = `<div>${markdown(clipboard)}</div>`;
                        }
                        // The URL parameter is required, even if the content doesn't have one.
                        // .invalid is a reserved TLD meant for nonexistent hostnames and placeholder URLs.
                        this.#results.params.url = `http://saved.by.reade/${util.fnv1aHash(clipboard)}`;
                        this.#results.params.author = 'Saved by Reade';
                        this.#results.params.html = clipboard;
                        this.#results.params.should_clean_html = true;
                    }
                }
            }

            if (!this.#results.params.url) {
                LaunchBar.alert(`Failed to save`, `The “save” action requires a URL, e.g., “save http://example.com tag1,tag2”. Or, run “save” alone to get the URL or article content from the clipboard.`);
                return false;
            }
            return true;
        }

        case 'list': {
            // Get a list of recently-saved Reader items.
            // E.g., `list unread rss`
            this.#results.action = 'documentList';
            this.#results.params.withHtmlContent = false;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                let [prefix, rest] = util.unprefix(input_text);
                if (!prefix) break;
                switch (prefix) {
                // Filter by location
                case 'new':
                case 'later':
                case 'shortlist':
                case 'archive':
                case 'feed':
                case 'seen': // Not mentioned in the docs, but seems like it should exist?
                case 'unseen': // Not mentioned in the docs, but seems like it should exist?
                    this.#results.params.location = prefix;
                    break;

                // Filter by category
                case 'articles':
                case 'emails':
                case 'epubs':
                case 'highlights':
                case 'notes':
                case 'pdfs':
                case 'tweets':
                case 'videos':
                    // Deplurize plural categories.
                    prefix = prefix.replace(/s$/, '');
                // eslint-disable-next-line no-fallthrough
                case 'article':
                case 'email':
                case 'epub':
                case 'highlight':
                case 'note':
                case 'pdf':
                case 'rss':
                case 'tweet':
                case 'video':
                    this.#results.params.category = prefix;
                    break;

                default:
                    // Filter by tag.
                    this.#results.params.tag = this.#results.params.tag?.length ? this.#results.params.tag : [];
                    // Tags with spaces must be entered as `tag+with+spaces`.
                    prefix = prefix.includes('+') ? prefix.replace(/\+/g, ' ') : prefix;
                    this.#results.params.tag.push(prefix);
                    break;
                }
                input_text = rest;
            }
            return true;
        }

        default:
            LaunchBar.alert('Reade is Sorry 🥺', `I don’t understand what you want me to do. Run with “help” for instructions.`);
            return false;
        }
    }
}
