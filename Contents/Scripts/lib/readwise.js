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
    create_highlight() {
        if (!parse.get('user_message')) {
            return;
        }
        const request_body = {
            highlights: [
                {
                    text: parse.get('user_message'),
                    title: config.get('title'),
                    image_url: 'https://raw.githubusercontent.com/quinncomendant/Reade.lbaction/refs/heads/main/docs/Reade-icon.png',
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
            LaunchBar.debugLog(`Response https://readwise.io/api/v2/highlights/: ${JSON.stringify(result.data)}`);
            if (result.response.status !== 200) {
                LaunchBar.alert('The request failed', result.data[0].text[0]);
                return;
            }
            if (typeof result.data[0] === 'undefined' || result.data[0].highlights_url === 'undefined' || !result.data[0].highlights_url.length) {
                LaunchBar.alert('The response was empty.');
                return '';
            }
            return result.data[0].highlights_url.trim();
        } else if (typeof result.error !== 'undefined') {
            LaunchBar.debugLog(`Response https://readwise.io/api/v2/highlights/ error: ${JSON.stringify(result.error)}`);
            LaunchBar.alert('LaunchBar error', result.error);
        } else {
            LaunchBar.debugLog(`Unknown https://readwise.io/api/v2/highlights/ error: ${JSON.stringify(result)}`);
            LaunchBar.alert('An unknown error occurred');
        }
    }

    //
    // Reader API
    // https://readwise.io/reader_api
    //
    document_list() {
        const request_params = util.encodeParams(parse.get('params'));
        LaunchBar.debugLog(`Request https://readwise.io/api/v3/list/?${request_params}`);
        let result = HTTP.getJSON(`https://readwise.io/api/v3/list/?${request_params}`, {
            headerFields: {'Authorization': `Token ${config.get('token')}`},
            resultType: 'json',
            timeout: config.get('timeout'),
        });
        if (typeof result.data !== 'undefined') {
            LaunchBar.debugLog(`Response https://readwise.io/api/v3/list/: ${JSON.stringify(result.data)}`);
            if (result.response.status !== 200) {
                LaunchBar.alert('The request failed', result.data[0].text[0]);
                return;
            }
            if (typeof result.data.results === 'undefined' || !result.data.results.length) {
                LaunchBar.alert('The response was empty.');
                return '';
            }
            return result.data.results
            .filter(r => r.parent_id === null) // Exclude highlights and notes (they have `parent_id` set).
            .map(r => ({
                url: r.url,
                title: r.title,
                subtitle: r.summary,
                badge: util.formattedDate(r.published_date),
                label: `${Number(r.reading_progress * 100).toFixed(0)}%`,
                quickLookURL: r.source_url,
                action: 'defaultAction',
                actionArgument: {
                    reader_url: r.url,
                    source_url: r.source_url,
                },
                icon: util.iconForCategory(r.category),
            }));
            return result.data[0].highlights_url.trim();
        } else if (typeof result.error !== 'undefined') {
            LaunchBar.debugLog(`Response https://readwise.io/api/v3/list/ error: ${JSON.stringify(result.error)}`);
            LaunchBar.alert('LaunchBar error', result.error);
        } else {
            LaunchBar.debugLog(`Unknown https://readwise.io/api/v3/list/ error: ${JSON.stringify(result)}`);
            LaunchBar.alert('An unknown error occurred');
        }
    }
}
