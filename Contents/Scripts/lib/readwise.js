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
class Readwise {
    //
    // Readwise API
    // https://readwise.io/api_deets
    //
    highlightCreate() {
        if (!parse.get('params')) {
            return;
        }
        const request_body = {
            highlights: [
                {
                    ...(parse.get('params')),
                    title: config.get('title'),
                    image_url: 'https://raw.githubusercontent.com/quinncomendant/Reade.lbaction/refs/heads/main/docs/Reade-256x256.png',
                    source_type: 'Reade',
                }
            ]
        };
        LaunchBar.debugLog(`Request https://readwise.io/api/v2/highlights/: ${JSON.stringify(request_body)}`);
        let result = HTTP.postJSON('https://readwise.io/api/v2/highlights/', {
            headerFields: {'Authorization': `Token ${config.get('token')}`},
            resultType: 'json',
            timeout: config.get('timeout'),
            body: request_body
        });
        if (typeof result.data !== 'undefined') {
            LaunchBar.debugLog(`Response (${result.response.status}) https://readwise.io/api/v2/highlights/: ${JSON.stringify(result.data)}`);
            if (result.response.status !== 200) {
                LaunchBar.alert('The request failed', result.data[0]?.text[0]);
                return;
            }
            if (typeof result.data[0] === 'undefined' || result.data[0].highlights_url === 'undefined' || !result.data[0].highlights_url.length) {
                LaunchBar.alert('Reade is Sorry 💔', 'The response was empty.');
                return '';
            }
            return result.data[0].highlights_url.trim();
        } else if (typeof result.error !== 'undefined') {
            LaunchBar.debugLog(`Response https://readwise.io/api/v2/highlights/ error: ${JSON.stringify(result.error)}`);
            LaunchBar.alert('LaunchBar error', result.error);
        } else {
            LaunchBar.debugLog(`Unknown https://readwise.io/api/v2/highlights/ error: ${JSON.stringify(result)}`);
            LaunchBar.alert('Reade is Sorry 💔', 'An unknown error occurred');
        }
    }

    //
    // Reader API
    // https://readwise.io/reader_api
    //
    documentCreate() {
        const request_body = parse.get('params');
        LaunchBar.debugLog(`Request https://readwise.io/api/v3/save/: ${JSON.stringify(request_body)}`);
        let result = HTTP.postJSON('https://readwise.io/api/v3/save/', {
            headerFields: {'Authorization': `Token ${config.get('token')}`},
            resultType: 'json',
            timeout: config.get('timeout'),
            body: request_body
        });
        if (typeof result.data !== 'undefined') {
            LaunchBar.debugLog(`Response (${result.response.status}) https://readwise.io/api/v3/save/: ${JSON.stringify(result.data)}`);
            if (![200, 201].includes(result.response.status)) {
                if (typeof result.data.detail !== 'undefined' && result.data.detail.length) {
                    LaunchBar.alert('The request failed', result.data.detail);
                } else if (typeof result.data[0] !== 'undefined' && typeof result.data[0].text !== 'undefined' && result.data[0].text[0].length) {
                    LaunchBar.alert('The request failed', result.data[0].text[0]);
                } else if (Object.keys(result.data).length && result.data[Object.keys(result.data)[0]]?.[0]) {
                    LaunchBar.alert('The request failed', result.data[Object.keys(result.data)[0]][0]);
                } else {
                    LaunchBar.alert('Reade is Sorry 💔', 'The request failed and the API response didn’t include an error message.');
                }
                return;
            }
            if (typeof result.data.url === 'undefined' || result.data.url === 'undefined' || !result.data.url.length) {
                LaunchBar.alert('Reade is Sorry 💔', 'The response was empty.');
                return '';
            }
            return util.schemeSupported('wiseread') ? `wiseread://read/${result.data.id}` : result.data.url;
        } else if (typeof result.error !== 'undefined') {
            LaunchBar.debugLog(`Response https://readwise.io/api/v3/save/ error: ${JSON.stringify(result.error)}`);
            LaunchBar.alert('LaunchBar error', result.error);
        } else {
            LaunchBar.debugLog(`Unknown https://readwise.io/api/v3/save/ error: ${JSON.stringify(result)}`);
            LaunchBar.alert('Reade is Sorry 💔', 'An unknown error occurred');
        }
    }

    documentList() {
        const request_params = util.encodeParams(parse.get('params'));
        LaunchBar.debugLog(`Request https://readwise.io/api/v3/list/?${request_params}`);
        let result = HTTP.getJSON(`https://readwise.io/api/v3/list/?${request_params}`, {
            headerFields: {'Authorization': `Token ${config.get('token')}`},
            resultType: 'json',
            timeout: config.get('timeout'),
        });
        if (typeof result.data !== 'undefined') {
            LaunchBar.debugLog(`Response (${result.response.status}) https://readwise.io/api/v3/list/: ${JSON.stringify(result.data)}`);
            if (result.response.status !== 200) {
                LaunchBar.alert('The request failed', result.data[0]?.text[0]);
                return;
            }
            if (typeof result.data.results === 'undefined' || !result.data.results.length) {
                LaunchBar.alert('Reade is Sorry 💔', 'The response was empty.');
                return '';
            }
            // Sort the results?
            // result.data.results.sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at));
            let filtered_results;
            if (request_params.includes('category=highlight') || request_params.includes('category=note')) {
                // Highlights and notes.
                filtered_results = result.data.results.filter(r => !/^\.\w+$/.test(r.content)).map(r => ({
                    title: r.content ?? '',
                    badge: r.created_at ? util.formattedDate(r.created_at) : '',
                    action: 'defaultAction',
                    actionArgument: {
                        document_id: r.id,
                        reader_url: util.schemeSupported('wiseread') ? `wiseread://read/${r.id}` : r.url,
                        source_url: r.source_url,
                    },
                    icon: util.iconForCategory(r.category),
                }));
            } else {
                // All other types.
                // Exclude highlights and notes (they have `parent_id` set).
                filtered_results = result.data.results.filter(r => r.parent_id === null).map(r => ({
                    url: r.url,
                    title: r.title ?? '',
                    ...(r.summary && { subtitle: r.summary.startsWith(r.title) ? r.summary.slice(r.title.length).trim() : r.summary }),
                    ...(r.published_date && { badge: util.formattedDate(r.published_date) }),
                    label: r.reading_progress && 0 !== r.reading_progress ? `${Number(r.reading_progress * 100).toFixed(0)}%` : '',
                    quickLookURL: r.source_url,
                    action: 'defaultAction',
                    actionArgument: {
                        document_id: r.id,
                        reader_url: util.schemeSupported('wiseread') ? `wiseread://read/${r.id}` : r.url,
                        source_url: r.source_url,
                    },
                    icon: util.iconForCategory(r.category),
                }));
            }
            if (!filtered_results.length) {
                LaunchBar.alert('Reade is Sorry 💔', 'There were no items matching your request.');
            }
            return filtered_results;
        } else if (typeof result.error !== 'undefined') {
            LaunchBar.debugLog(`Response https://readwise.io/api/v3/list/ error: ${JSON.stringify(result.error)}`);
            LaunchBar.alert('LaunchBar error', result.error);
        } else {
            LaunchBar.debugLog(`Unknown https://readwise.io/api/v3/list/ error: ${JSON.stringify(result)}`);
            LaunchBar.alert('Reade is Sorry 💔', 'An unknown error occurred');
        }
    }

    documentGet(document_id) {
        const request_params = util.encodeParams({id: document_id, withHtmlContent: true});
        LaunchBar.debugLog(`Request https://readwise.io/api/v3/list/?${request_params}`);
        let result = HTTP.getJSON(`https://readwise.io/api/v3/list/?${request_params}`, {
            headerFields: {'Authorization': `Token ${config.get('token')}`},
            resultType: 'json',
            timeout: config.get('timeout'),
        });
        if (typeof result.data !== 'undefined') {
            LaunchBar.debugLog(`Response (${result.response.status}) https://readwise.io/api/v3/list/: ${JSON.stringify(result.data)}`);
            if (result.response.status !== 200) {
                LaunchBar.alert('The request failed', result.data[0]?.text[0]);
                return;
            }
            if (typeof result.data.results === 'undefined' || !result.data.results.length) {
                LaunchBar.alert('Reade is Sorry 💔', 'The response was empty.');
                return '';
            }
            if (!result.data.results.length) {
                LaunchBar.alert('Reade is Sorry 💔', 'There were no items matching your request.');
            }
            return result.data.results[0];
        } else if (typeof result.error !== 'undefined') {
            LaunchBar.debugLog(`Response https://readwise.io/api/v3/list/ error: ${JSON.stringify(result.error)}`);
            LaunchBar.alert('LaunchBar error', result.error);
        } else {
            LaunchBar.debugLog(`Unknown https://readwise.io/api/v3/list/ error: ${JSON.stringify(result)}`);
            LaunchBar.alert('Reade is Sorry 💔', 'An unknown error occurred');
        }
    }

    documentQuickLookHtmlFile(document_id) {
        const doc = this.documentGet(document_id);
        const file = util.filenameFromInputString(doc.title, 'html');
        util.saveFile(file, this.buildHTML(doc));
        LaunchBar.openQuickLook(`file://${file}`);
    }

    documentOpenHtmlFile(document_id) {
        const doc = this.documentGet(document_id);
        const file = util.filenameFromInputString(doc.title, 'html');
        util.saveFile(file, this.buildHTML(doc));
        util.openFile(file);
    }

    buildHTML(doc) {
        if (!doc.html_content) return null;
        const published_date_tag = doc.published_date ? `<meta property="article:published_time" content="${new Date(doc.published_date).toISOString()}">` : '';
        const published_date = doc.published_date ? `<br><time itemprop="datePublished" datetime="${new Date(doc.published_date).toISOString()}">${util.formattedDate(doc.published_date)}</time>` : '';
        const author = doc.author ? `<br><span itemprop="author">${doc.author}</span>` : '';
        const url = util.isAccessibleURL(doc.source_url) ? doc.source_url : doc.url;
        const html_body = doc.html_content
            // Remove embedded styles.
            .replace(/\s+style="[^"]*"/g,'')
            // Fix broken srcset values, e.g., https://en.m.wikipedia.org/wiki/Kumano_Kod%C5%8D
            .replace(/\s*srcset="([^"]*)"/g, (_, u) => {
                const a = u.replace(/%20(?=\d+(?:\.\d+)?[wx])/g, ' ') // Decode `%201.2x` to ` 1.2x`.
                    .replace(/(?<=\d+(?:\.\d+)?[wx],)%20/g, ' ')      // Decode `1.2x,%20` to `1.2x, `.
                    .split(/\s*,\s*/).filter(i => /^https?:\/\//.test(i.trim().split(/\s+/)[0])); // Remove relative URLs
                return a.length ? ` srcset="${a.join(', ')}"` : '';
            });

        return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${doc.title}</title><link rel="canonical" href="${url}">${published_date_tag}<style>
  body{max-width:65ch;margin:2em auto;padding:0 1em;line-height:1.6;font-family:sans-serif}
  h1,h2,h3,h4,h5,h6{margin:1em 0 0.5em;line-height:1.1;color:#222}
  p,ul,ol,blockquote,figure{margin:1em 0}
  li>p{margin:0}
  ul,ol{padding-left:1.2em}
  blockquote{margin-left:.5em;padding-left:.5em;border-left:5px solid #ddd}
  img,video,iframe,embed,object{max-width:100%;height:auto}
  figcaption,small,sub,sup,caption{font-size:0.8rem}
  table{border-collapse:collapse;width:100%}
  th,td{border:1px solid #ddd;padding:8px;text-align: left;vertical-align:top}
  th{background-color:#f2f2f2}
  .byline {margin-bottom:1.8em}
</style></head><body>
<h1>${doc.title}</h1>
<p class="byline">
  <a href="${url}">${url}</a>
  ${published_date}
  ${author}
</p>
${html_body}
</body></html>`;
    }
}
