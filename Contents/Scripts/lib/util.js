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
class Util {
    static _cachedSchemes = null;

    iconForCategory(category) {
        // LaunchBar uses FontAwesome v4 icons: https://fontawesome.com/v4/icons/
        const icons = {
            article: 'font-awesome:fa-newspaper-o',
            email: 'font-awesome:fa-envelope',
            epub: 'font-awesome:fa-book',
            pdf: 'font-awesome:fa-file-pdf-o',
            rss: 'font-awesome:fa-rss',
            tweet: 'font-awesome:fa-twitter',
            video: 'font-awesome:fa-video',
            // These two are currently excluded by the filter in readwise.documentList()
            highlight: 'font-awesome:fa-paint-brush',
            note: 'font-awesome:fa-bookmark',
        };
        return typeof icons[category] !== 'undefined' ? icons[category] : 'font-awesome:fa-browser';
    }

    isAccessibleURL(url) {
        // Some documents will contain inaccessible URLs such as:
        // - `mailto:…` (for documents received by email),
        // - `http://saved.by.reade/` or `http://example.com` (documents saved by Reade),
        // - empty URL (PDFs, ebooks, etc).
        return typeof url === 'string'
            && /^https?:/.test(url)
            && !/^https?:\/\/([\w-]+\.)*(example(\.com)?|saved\.by\.reade|invalid|test|localhost)\//.test(url);
    }

    formattedDate(timestamp) {
        const parsedDate = new Date(isNaN(timestamp) ? timestamp : parseInt(timestamp, 10));
        return isNaN(parsedDate.getTime()) ? '' : parsedDate.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});
    }

    encodeParams(params) {
        return Object.keys(params)
            .flatMap(key => {
                const val = params[key];
                if (Array.isArray(val)) {
                    return val.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
                }
                return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
            })
            .join('&');
    }

    unprefix(str) {
        const [prefix, ...words] = str.replace(/[^\S\r\n]+/g, ' ').trim().split(/\s+/);
        return [prefix, words.join(' ')];
    }

    truncate(str, max_length) {
        return str.length <= max_length ? str : str.substr(0, str.lastIndexOf(' ', max_length)).replace(/[,.!? ]*$/, '').trim() + '…';
    }

    fnv1aHash(str) {
        str = str.trim();
        const FNV_PRIME = 0x01000193;
        const FNV_OFFSET = 0x811c9dc5;
        let hash = FNV_OFFSET;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash *= FNV_PRIME;
        }
        return hash >>> 0;
    }

    slug(str) {
        return str
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    dirname(path) {
        return typeof path === 'undefined' ? '' : path.substring(0, path.lastIndexOf('/') + 1);
    }

    basename(path) {
        return typeof path === 'undefined' ? '' : path.split('/').pop();
    }

    safeFilename(str) {
        if (!str) str = Date.now().toString();
        const hash = this.fnv1aHash(str).toString();
        const slug = this.slug(str).substring(0, 240 - hash.length);
        return `${slug}-${hash}`;
    }

    filenameFromInputString(str, ext, dir_path) {
        if (typeof dir_path === 'undefined') {
            dir_path = Action.cachePath;
        }
        return `${dir_path}/${this.safeFilename(str)}.${ext}`;
    }

    filenameExtension(filename) {
        let parts = filename.split('.');
        return parts.length > 1 ? parts[parts.length - 1] : '';
    }

    saveFile(output_filename, content, type='text') {
        if (!File.createDirectory(this.dirname(output_filename)) || !File.isWritable(this.dirname(output_filename))) {
            LaunchBar.alert(`Unable to write to directory: ${this.dirname(output_filename)}`);
            return false;
        }

        try {
            switch (type) {
            case 'plist':
                File.writePlist(content, output_filename);
                break;
            case 'json':
                File.writeJSON(content, output_filename);
                break;
            case 'text':
            default:
                File.writeText(content, output_filename);
                break;
            case 'data':
                File.writeData(content, output_filename);
                break;
            }
            LaunchBar.debugLog(`Created ${type} file: ${output_filename}`);
        } catch (e) {
            LaunchBar.alert(`Failed to write ${type} file: ${output_filename} (${e})`);
            return false;
        }
        return true;
    }

    openFile(filename) {
        // LaunchBar does not hide after using LaunchBar.openURL(), so use the `open` command instead.
        LaunchBar.debugLog(`filenameExtension: ${this.filenameExtension(filename)}`);
        switch (this.filenameExtension(filename)) {
        case 'txt':
        case 'md':
            LaunchBar.execute('/usr/bin/open', '-t', filename);
            break;
        default:
            LaunchBar.execute('/usr/bin/open', filename);
        }
    }

    getClipboard() {
        let clipboard_text = LaunchBar.getClipboardString();
        if (typeof clipboard_text === 'undefined' || !clipboard_text.length) {
            LaunchBar.debugLog(`Clipboard is empty`);
            return '';
        }
        clipboard_text = clipboard_text.replace(/[^\S\r\n]+/g, ' ').trim();
        const clipboard_response = LaunchBar.alert('Send this clipboard text to Readwise?', `“${this.truncate(clipboard_text, 1000)}”`, 'Ok', 'Cancel');
        switch (clipboard_response) {
        case 0:
            LaunchBar.debugLog(`Input from clipboard: ${clipboard_text}`);
            return clipboard_text;

        case 1:
            return '';
        }
    }

    schemeSupported(scheme = 'wiseread') {
        if (Util._cachedSchemes === null) {
            Util._cachedSchemes = LaunchBar.execute(
                '/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister',
                '-dump',
                'URLSchemeBinding'
            );
        }
        return Util._cachedSchemes ? new RegExp(`^${scheme}:`, 'im').test(Util._cachedSchemes) : false;
    }

    versionCheck() {
        var result = HTTP.getJSON('https://api.github.com/repos/quinncomendant/Reade.lbaction/releases/latest');
        if (typeof result.data !== 'undefined') {
            if (Action.version === result.data.tag_name) {
                LaunchBar.alert(`Reade is up-to-date`, `You have version ${Action.version} which is the latest version available.`);
                return;
            } else if (Action.version > result.data.tag_name) {
                const up_to_date_response = LaunchBar.alert(`Reade is up-to-date`, `You have version ${Action.version} which is newer than the latest version available.`, 'Close', 'Download old version');
                switch (up_to_date_response) {
                case 1:
                    LaunchBar.openURL('https://github.com/quinncomendant/Reade.lbaction/releases');
                    break;
                }
                return;
            } else if (result.data.tag_name > Action.version) {
                const new_version_response = LaunchBar.alert(`Reade has a new version available`, `${result.data.tag_name} is the latest version available. You have version ${Action.version}.`, 'Close', 'Download new version');
                switch (new_version_response) {
                case 1:
                    LaunchBar.openURL('https://github.com/quinncomendant/Reade.lbaction/releases');
                    break;
                }
                return;
            }
        }
        LaunchBar.alert(`Reade version ${Action.version}`, `Failed to check if a new version is available. ${typeof result.error !== 'undefined' ? result.error : ''}`);
    }

    actionOutput(output) {
        if (/^(https?|wiseread):/.test(output)) {
            // URL
            return {
                url: output,
                title: output,
                quickLookURL: output,
            };
        } else {
            // String
            return {
                title: output,
            };
        }
    }
}