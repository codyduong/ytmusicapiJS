# Archived

ytmusicapiJS was a library I started as an idea to help me make a cli-based YT Music user interface with JavaScript/TypeScript. However, this was also one of the first proper libraries I ever properly attempted to bundle and publish to npm, as well as maintain some semblance of SemVer. It also heavily leaned on the [`ytmusicapi`](https://github.com/sigma67/ytmusicapi) codebase, and should've been more decoupled. This has led to a variety of issues with supporting many environments, working/tested only in NodeJS, and probably rarely works as the average user expects it to (IE. in the browser).

I no longer have the time/willingness to maintain this library, and there are much better alternatives that have popped up since I have started ytmusicapiJS. As such I have decided to archive this repository, so as not to mislead anybody about its development status.

#### Please check out [vixalien/muse](https://github.com/vixalien/muse) as an alternative to ytmusicapiJS

----

[![Downloads](https://img.shields.io/npm/dm/@codyduong/ytmusicapi?style=flat-square)](https://www.npmjs.com/package/@codyduong/ytmusicapi)
[![Code coverage](https://img.shields.io/codecov/c/github/codyduong/ytmusicapijs?style=flat-square)](https://codecov.io/gh/codyduong/ytmusicapiJS)
[![Latest release](https://img.shields.io/github/v/release/codyduong/ytmusicapijs?style=flat-square)](https://github.com/codyduong/ytmusicapiJS/releases)
[![Commits since latest release](https://img.shields.io/github/commits-since/codyduong/ytmusicapijs/latest?style=flat-square)](https://github.com/codyduong/ytmusicapiJS/releases)
# ytmusicapiJS: Unofficial API for YouTube Music

ytmusicapiJS is a TypeScript implementation of the Python 3 library [`ytmusicapi`](https://github.com/sigma67/ytmusicapi) for **NodeJS**

It emulates YouTube Music web client requests using the user's cookie data for authentication.

This library is intended to carry the same functionality as the library it is inspired by. As such, unless the need becomes great enough for a specific feature in this library, I recommend all API specific changes be directed to [`ytmusicapi`](https://github.com/sigma67/ytmusicapi) instead.

# Features
See API here https://codyduong.github.io/ytmusicapiJS/

# Setup and Usage
| npm  | yarn |
| ------------- | ------------- |
| `npm install @codyduong/ytmusicapi`  | `yarn add @codyduong/ytmusicapi` |

## For authenticated requests
To run authenticated requests, set it up by first copying your request headers from an authenticated POST request in your browser.
To do so, follow these steps:

* Open a new tab
* Open the developer tools (Ctrl-Shift-I) and select the “Network” tab
* Go to https://music.youtube.com and ensure you are logged in
* Find an authenticated POST request. The simplest way is to filter by /browse using the search bar of the developer tools. If you don’t see the request, try scrolling down a bit or clicking on the library button in the top bar.

A sample headers.json is provided below:
```json
{
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Content-Type": "application/json",
    "X-Goog-AuthUser": "0",
    "x-origin": "https://music.youtube.com",
    "Cookie" : "PASTE_COOKIE"
}
```
Either point to this file when instantiating YTMusic, or load the file with JSON.parse ahead of time and pass in the object.
```ts
const ytm = new YTMusic({auth: 'path/to/headers.json'})
const ytm = new YTMusic({auth: JSON.parse('path/to/headers.json')}
// Or even a raw string object is accepted
const ytm = new YTMusic({auth: fs.readFileSync('path/to/file', {encoding: 'utf-8'})}
```

## Quick Usage
Quick Usage Snippet
```ts
import YTMusic from '@codyduong/ytmusicapi';

const ytm = new YTMusic()

const results = await ytm.search('Rickroll')
```
results
```js
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

For more demos, look in `tests/index.test.ts`

# Contributing
The library is intended to keep features within the same scope of the original Python 3 library. This may/may not change at my discretion.

Pull requests are welcome, esp. with regards to resolving any API differences that occured through mistakes or otherwise. However, note that I would
like to remain with similar API to the original library, so it is unlikely new API features will be approved (unless strictly relevant to the JS/TS version).

The source code is structured almost identically to the Python 3 Library. I've also mocked some other dependencies, this is to maintain readability and ease of changes between the two APIs. 

## Acknowledgements
A majority of this codebase is possible thanks to the work done by [sigma67](https://github.com/sigma67)
