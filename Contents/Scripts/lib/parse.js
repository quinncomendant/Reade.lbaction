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
        // Raw input text, provided via LaunchBar input or copied from the clipboard.
        input_text: '',

        /** @type {boolean} If the user sends a command, this will be set to TRUE. */
        command: undefined,

        // The user message is the input text with modifiers removed (string).
        // This is what will be sent to the API as the most recent user message.
        /** @type {string} */
        user_message: undefined,

        /** @type {string} If an action modifier is provided, this will be set. */
        action: '',

        /** @type {Object} Parameters appropriate for submitting to the API for the define `action`. */
        params: {},
    };

    process(input_text) {
        // this.commands() returns true if a command is found, false if none found.
        this.#results.command = this.commands(input_text);
        // If a command was given, don't bother parsing modifiers, which can result in confusion, e.g., `clear` alone will prompt the user if they want to submit their clipboard.
        this.#results.user_message = this.#results.command ? '' : this.modifiers(input_text);

        LaunchBar.debugLog(`Parse results: ${JSON.stringify(this.#results)}`);
    }

    get(key) {
        key = key.toLowerCase();
        return typeof this.#results[key] !== 'undefined' ? this.#results[key] : undefined;
    }

    commands(input_text) {
        // Intercept command keyword.
        // Collapse `two word` commands to `twoword`.
        let input_text_command = input_text.replace(/^(config) *(delete|export|list|reset|set |get ).*$/, '$1$2').trim().toLowerCase();
        LaunchBar.debugLog(`Running command “${input_text_command}”`);
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

        default:
            // No command found, return false so we can continue running Reade.
            LaunchBar.debugLog(`Command not found: “${input_text_command}”`);
            return false;
        }
    }

    modifiers(input_text) {
        // To start, the raw input_text and user_message are the same; modifiers will be removed from the user_message as they are parsed.
        this.#results.input_text = input_text.replace(/[^\S\r\n]+/g, ' ').trim();
        let user_message = this.#results.input_text;

        // Modifiers customizes behavior.
        // eslint-disable-next-line no-control-regex
        let input_text_modifiers = this.#results.input_text.toLowerCase().trim().split(/\s+/);
        LaunchBar.debugLog(`Begin scanning modifiers in: ${JSON.stringify(input_text_modifiers)}`);
        input_text_modifiers.some(modifier => {
            // The some() function exits on the first `return true`, i.e., the first non-modifier word.
            switch (modifier) {
            case 'list': {
                // Get a list of recently-saved Reader items.
                this.#results.action = 'document_list';
                while (true) {
                    const [prefix, rest] = util.unprefix(user_message);
                    if (!prefix) break;
                    switch (prefix) {
                        case 'new':
                        case 'later':
                        case 'shortlist':
                        case 'archive':
                        case 'feed':
                            this.#results.params.location = prefix;
                            break;

                        case 'article':
                        case 'email':
                        case 'rss':
                        case 'highlight':
                        case 'note':
                        case 'pdf':
                        case 'epub':
                        case 'tweet':
                        case 'video':
                            this.#results.params.category = prefix;
                            break;
                    }
                    user_message = rest;
                }
                break;
            }

            case 'add': {
                // Add a highlight to Readwise.
                this.#results.action = 'create_highlight';
                user_message = util.unprefix(user_message)[1];
            }

            default:
                // - The end of the modifiers, stop scanning.
                LaunchBar.debugLog(`Done scanning modifiers`);
                return true;
            }

            // The modifier matched a keyword, continue with the next word.
            LaunchBar.debugLog(`Scanned modifier: “${modifier}”`);
            return false;
        });

        // If no text entered, try to use contents of clipboard.
        if (!user_message.trim().length && ['create_highlight'].includes(this.#results.action)) {
            user_message = util.getClipboard();
        }

        if (user_message.length > 8191) {
            LaunchBar.alert('Failed to create highlight', `That highlight text is too long (${user_message.length}); max length 8191.`);
            return;
        }

        return user_message;
    }
}
