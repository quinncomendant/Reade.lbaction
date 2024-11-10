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
class Config {
    #defaults = {};

    constructor(defaults) {
        this.#defaults = defaults;
        LaunchBar.debugLog(`Previously saved config: (${typeof Action.preferences.config}) ${JSON.stringify(Action.preferences.config)}`);
        if (typeof Action.preferences.config === 'undefined' || !Object.keys(Action.preferences.config).length) {
            this.setDefaults();
        }

        if (!this.get('token').length) {
            // Try to get token from shell environment variable READWISE_TOKEN.
            // The get_token.sh script just echos the READWISE_TOKEN defined in the shell environment.
            const token_env = LaunchBar.execute('./get_token.sh', 'READWISE_TOKEN').trim();
            if (/^.{50}$/.test(token_env)) {
                this.set('token', token_env);
            }
        }
    }

    setDefaults(keys_to_retain=[]) {
        let retained_options = {};
        keys_to_retain.forEach(key => {
            retained_options[key] = this.get(key);
        });
        Action.preferences.config = retained_options;
        Object.entries(this.#defaults).forEach(([key, val]) => {
            if (!keys_to_retain.includes(key)) {
                LaunchBar.debugLog(`Setting default config: “${key}” = “${val}”`);
                Action.preferences.config[key] = val;
            }
        });
    }

    requireVal(key, val) {
        if (typeof val === 'undefined' || !val.length) {
            LaunchBar.alert(`Failed to set configuration`, `“${key}” must not be empty.`);
            return false;
        }
        return true;
    }

    requireValidOption(key, val, valid_options) {
        if (!valid_options.includes(val)) {
            LaunchBar.alert(`Failed to set configuration`, `“${key}” must contain one of the following values:\n\n${valid_options.join('\n')}`);
            return false;
        }
        return true;
    }

    requireInt(key, val) {
        if (!/^\d+$/.test(val)) {
            LaunchBar.alert(`Failed to set configuration`, `“${key}” must be an integer.`);
            return false;
        }
        return true;
    }

    requireMatch(key, val, regex) {
        if (!regex.test(val)) {
            LaunchBar.alert(`Failed to set configuration`, `“${key}” failed the regex ${regex.toString()}.`);
            return false;
        }
        return true;
    }

    set(key, val) {
        switch (key) {
        case 'token':
            if (!this.requireVal(key, val)) {
                return false;
            }
            if (!/^[a-zA-Z0-9]{50}$/.test(val)) {
                LaunchBar.alert(`Failed to set configuration`, `Not a valid API token.`);
                return false;
            }
            Action.preferences.config[key] = val;
            if (key === 'token') {
                val = `${val.substring(0, 7)}…`;
            }
            break;

        case 'timeout':
            if (!this.requireInt(key, val)) {
                return false;
            }
            Action.preferences.config[key] = parseFloat(val);
            break;

        case 'title':
            if (!this.requireVal(key, val)) {
                return false;
            }
            if (!this.requireMatch(key, val, /^.{1,511}$/)) {
                return false;
            }
            Action.preferences.config[key] = val;
            break;

        default:
            LaunchBar.alert(`“${key}” is not a valid configuration option. To view all configuration options use the “config” command.`);
            return false;
        }

        LaunchBar.displayNotification({
            title: 'Reade configuration saved',
            string: `“${key}” has been set to “${val}”`
        });
    }

    get(key) {
        return typeof Action.preferences.config[key] !== 'undefined' ? Action.preferences.config[key] : '';
    }

    show() {
        return Object.entries(Action.preferences.config).sort().map(([key, val]) => {
            if (key === 'token') {
                val = `${val.substring(0, 7)}…`;
            }
            return `${key}: ${val}\n`;
        }).join('\n');
    }
}
