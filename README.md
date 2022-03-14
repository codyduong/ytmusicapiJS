[![Downloads](https://img.shields.io/npm/dm/@codyduong/ytmusicapi?style=flat-square)](https://www.npmjs.com/package/@codyduong/ytmusicapi)
[![Code coverage](https://img.shields.io/codecov/c/github/codyduong/ytmusicapijs?style=flat-square)](https://codecov.io/gh/codyduong/ytmusicapiJS)
[![Latest release](https://img.shields.io/github/v/release/codyduong/ytmusicapijs?style=flat-square)](https://github.com/codyduong/ytmusicapiJS/releases)
[![Commits since latest release](https://img.shields.io/github/commits-since/codyduong/ytmusicapijs/latest?style=flat-square)](https://github.com/codyduong/ytmusicapiJS/releases)
# ytmusicapiJS: Unofficial API for YouTube Music

ytmusicapiJS is a TypeScript implementation of the Python 3 library [`ytmusicapi`](https://github.com/sigma67/ytmusicapi)

It emulates YouTube Music web client requests using the user's cookie data for authentication.

This library is intended to carry the same functionality as the library it is inspired by. As such, unless the need becomes great enough for a specific feature in this library, I recommend all API specific changes be directed to [`ytmusicapi`](https://github.com/sigma67/ytmusicapi) instead. 

## Features
See API here https://codyduong.github.io/ytmusicapiJS/

<details title="Feature Parity">
<summary>Feature Parity</summary>

✅ - Implemented

🐣 - Partially implemented

❌ - Not implemented

<table style="overflow: hidden;">
    <thead>
        <tr>
            <th>Feature</tH>
            <th>Implementation Status</tH>
            <th>ytmusicapi version parity</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan=3 align="center">Browsing</td>
        </tr>
        <tr><td>search (w/ filters)</td><td>✅</td><td>0.21.0</td></tr>
        <tr><td>get artist info</td><td>✅</td><td>0.21.0</td></tr>
        <tr><td>get user info</td><td>✅</td><td>0.21.0</td></tr>
        <tr><td>get albums</td><td>✅</td><td>0.21.0</td></tr>
        <tr><td>get song metadata</td><td>✅</td><td>0.21.0</td></tr>
        <tr><td>get watch playlists</td><td>✅</td><td>0.21.0</td></tr>
        <tr><td>get song lyrics</td><td>✅</td><td>0.21.0</td></tr>
        <tr>
            <td colspan=3 align="center">Exploring</td>
        </tr>
        <tr><td>get moods/genres playlists</td><td>✅</td><td>0.21.0</td></tr>
        <tr><td>get latest charts</td><td>✅</td><td>0.21.0</td></tr>
        <tr>
            <td colspan=3 align="center">Library Management</td>
        </tr>
        <tr><td>get library contents</td><td>✅</td><td>0.21.0</td></tr>
        <tr><td>add/remove library content</td><td>✅</td><td>0.21.0</td></tr>
        <tr>
            <td colspan=3 align="center">Playlists</td>
        </tr>
        <tr><td>create/delete playlists</td><td>✅</td><td>0.21.0</td></tr>
        <tr><td>modify playlists</td><td>✅</td><td>0.21.0</td></tr>
        <tr><td>get playlist contents</td><td>✅</td><td>0.21.0</td></tr>
        <tr>
            <td colspan=3 align="center">Uploads</td>
        </tr>
        <tr><td>upload/remove songs</td><td>✅</td><td>0.21.0</td></tr>
        <tr><td>list uploaded songs</td><td>✅</td><td>0.21.0</td></tr>
        <tr>
            <td colspan=3 align="center">Other</td>
        </tr>
        <tr><td>locale</td><td>✅</td><td>0.21.0</td></tr>
    </tbody>
</table>
</details>

## Setup and Usage
| npm  | yarn |
| ------------- | ------------- |
| `npm install @codyduong/ytmusicapi`  | `yarn add @codyduong/ytmusicapi` |

Quick Usage Snippet
```ts
import YTMusic from '@codyduong/ytmusicapi';

const ytm = new YTMusic()

const results = await ytm.search('Rickroll')
```
results
```hjson
[
  {
    category: 'Top result',
    resultType: 'video',
    title: 'Never Gonna Give You Up',
    views: null,
    videoId: 'dQw4w9WgXcQ',
    duration: null,
    year: null,
    artists: [ [Object], [Object] ],
    thumbnails: [ [Object] ]
  },
  {
    category: 'Songs',
    resultType: 'song',
    title: 'Never Gonna Give You Up',
    album: null,
    feedbackTokens: { add: null, remove: null },
    videoId: 'lYBUbBu4W08',
    duration: null,
    year: null,
    artists: [ [Object], [Object] ],
    isExplicit: false,
    thumbnails: [ [Object], [Object] ]
  },
  {
    category: 'Songs',
    resultType: 'song',
    title: 'Rickroll',
    album: null,
    feedbackTokens: { add: null, remove: null },
    videoId: 'oBKeQItWbnA',
    duration: null,
    year: null,
    artists: [ [Object], [Object], [Object] ],
    isExplicit: false,
    thumbnails: [ [Object], [Object] ]
  },
  ...
]
```

[Documentation](https://codyduong.github.io/ytmusicapiJS/)

See the [Documentation for the Python 3 API](https://ytmusicapi.readthedocs.io/en/latest/usage.html) for reference.

## Contributing
The library is intended to keep features within the same scope of the original Python 3 library. This may/may not change at my discretion.

Pull requests are welcome, esp. with regards to resolving any API differences that occured through mistakes or otherwise. However, note that I would
like to remain with similar API to the original library, so it is unlikely new API features will be approved (unless strictly relevant to the JS/TS version).

The source code is structured almost identically to the Python 3 Library. I've also mocked some other dependencies, this is to maintain readability and ease of changes between the two APIs. 

## Acknowledgements
A majority of this codebase is possible thanks to the work done by [sigma67](https://github.com/sigma67)
