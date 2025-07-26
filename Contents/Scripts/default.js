//
// Reade – a LaunchBar Action to interact with the Readwise API.
// https://github.com/quinncomendant/Reade.lbaction
//
// Requires a Readwise API token from https://readwise.io/access_token
// Enter this command to set your API token:
//  ┌─────────────────────────────────────────────┐
//  │ config set token ××××××××××××××××××××××××   │
//  └─────────────────────────────────────────────┘
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

include('lib/config.js');
// eslint-disable-next-line no-redeclare, no-unused-vars
const config = new Config({
    token: '',
    timeout: 10,
    title: 'Highlights saved by Reade'
});

include('lib/parse.js');
// eslint-disable-next-line no-redeclare, no-unused-vars
const parse = new Parse();

include('lib/help.js');
// eslint-disable-next-line no-redeclare, no-unused-vars
const help = new Help();

include('lib/util.js');
// eslint-disable-next-line no-redeclare, no-unused-vars
const util = new Util();

include('lib/readwise.js');
// eslint-disable-next-line no-redeclare, no-unused-vars
const provider = new Readwise();

// This function must remain global. It is the returned item's `action` function (return key).
// eslint-disable-next-line no-unused-vars
function defaultAction(item) {
    if (LaunchBar.options.controlKey && item.source_url) {
        // ⌃-enter: Quick Look the URL.
        if (!util.isAccessibleURL(item.source_url)) {
            // Fall back to the distilled HTML.
            provider.documentQuickLookHtmlFile(item.document_id);
        } else {
            LaunchBar.openQuickLook(item.source_url);
        }
    } else if (LaunchBar.options.commandKey) {
        // ⌘-enter: Open the original source URL.
        if (!util.isAccessibleURL(item.source_url)) {
            // Fall back to the distilled HTML.
            provider.documentOpenHtmlFile(item.document_id);
        } else {
            LaunchBar.openURL(item.source_url);
        }
    } else if (LaunchBar.options.shiftKey && item.source_url) {
        // ⇧-enter: Insert the original URL.
        if (!util.isAccessibleURL(item.source_url)) {
            LaunchBar.alert('Reade is Sorry 💔', `Source URL is inaccessible: ${item.source_url}`);
            return;
        }
        LaunchBar.paste(item.source_url);
    } else if (LaunchBar.options.alternateKey && item.source_url) {
        // ⌥-enter: Open the document as a HTML file.
        provider.documentOpenHtmlFile(item.document_id);
    } else {
        // Open the Reader URL.
        LaunchBar.openURL(item.reader_url);
    }
    LaunchBar.hide();
    return;
}

// This function is called by LaunchBar when the user passes text to the action.
// eslint-disable-next-line no-redeclare, no-unused-vars
function runWithString(argument) {
    // Parse the user input, demanding success.
    if (!parse.process(argument.replace(/[^\S\r\n]+/g, ' ').trim())) {
        return;
    }

    // If a command was entered, run it.
    if (parse.get('command')) {
        return parse.get('command');
    }

    // Ensure the token is set.
    if (!config.get('token').length) {
        help.apiKey();
        return;
    }


    // Run the requested action.
    switch (parse.get('action')) {
    case 'highlightCreate':
        return util.actionOutput(provider.highlightCreate());
    case 'documentCreate':
        return util.actionOutput(provider.documentCreate());
    case 'documentList':
        return provider.documentList();
    }
}


// This is the default function called by LaunchBar. If the user just runs the action without any argument, or there is an argument but none of the more specific function are implemented, this function will be called.
// eslint-disable-next-line no-redeclare, no-unused-vars
function run(argument) {
    if (typeof argument === 'undefined') {
        help.general();
        return;
    }
    LaunchBar.alert(`I don’t know how to handle this type of input: ${JSON.stringify(argument)}`);
}
