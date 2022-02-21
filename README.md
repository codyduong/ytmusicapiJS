# ytmusicapiJS: Unofficial API for YouTube Music

ytmusicapiJS is a JS/TS implementation of the Python 3 library [`ytmusicapi`](https://github.com/sigma67/ytmusicapi)

It emulates YouTube Music web client requests using the user's cookie data for authentication.

This library is intended to carry the same functionality as the library it is inspired by. As such, unless the need becomes great enough for a specific feature in this library, I recommend all API specific changes be directed to [`ytmusicapi`](https://github.com/sigma67/ytmusicapi) instead. 

## Features
More comprehensive list and explanation [here in the original repo](https://github.com/sigma67/ytmusicapi#features) or check out [the docs for the original repo](ytmusicapi.readthedocs.io/)

✅ - Implemented

🐣 - Partially implemented

❌ - Not implemented

<!--
|Feature|Implementation Status|ytmusicapi version parity
|---|---|---|
|**Browsing**|🐣|0.20.0|
|search (w/ filters)|✅|0.20.0|
|get artist info|✅|0.20.0|
|get user info|✅|0.20.0|
|get albums|✅|0.20.0|
|get song metadata|✅|0.20.0|
|get watch playlists|❌|0.20.0|
|get song lyrics|✅|0.20.0|
|**Exploring**|❌|0.20.0|
|get moods/genres|❌|0.20.0|
|get latest charts|❌|0.20.0|
|**Library Management**|❌|0.20.0|
|get library contents|❌|0.20.0|
|add/remove library content|❌|0.20.0|
|**Playlists**|❌|0.20.0|
|create/delete playlists|❌|0.20.0|
|get playlist contents|❌|0.20.0|
|**Uploads**|❌|0.20.0|
|upload/remove songs|❌|0.20.0|
|list uploaded songs|❌|0.20.0|
-->
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
        <tr><td>search (w/ filters)</td><td>✅</td><td>0.20.0</td></tr>
        <tr><td>get artist info</td><td>✅</td><td>0.20.0</td></tr>
        <tr><td>get user info</td><td>✅</td><td>0.20.0</td></tr>
        <tr><td>get albums</td><td>✅</td><td>0.20.0</td></tr>
        <tr><td>get song metadata</td><td>✅</td><td>0.20.0</td></tr>
        <tr><td>get watch playlists</td><td>🐣</td><td>0.20.0</td></tr>
        <tr><td>get song lyrics</td><td>✅</td><td>0.20.0</td></tr>
        <tr>
            <td colspan=3 align="center">Exploring</td>
        </tr>
        <tr><td>get moods/genres playlists</td><td>✅</td><td>0.20.0</td></tr>
        <tr><td>get latest charts</td><td>✅</td><td>0.20.0</td></tr>
        <tr>
            <td colspan=3 align="center">Library Management</td>
        </tr>
        <tr><td>get library contents</td><td>🐣</td><td>0.20.0</td></tr>
        <tr><td>add/remove library content</td><td>🐣</td><td>0.20.0</td></tr>
        <tr>
            <td colspan=3 align="center">Playlists</td>
        </tr>
        <tr><td>create/delete playlists</td><td>❌</td><td>0.20.0</td></tr>
        <tr><td>modify playlists</td><td>❌</td><td>0.20.0</td></tr>
        <tr><td>get playlist contents</td><td>🐣</td><td>0.20.0</td></tr>
        <tr>
            <td colspan=3 align="center">Uploads</td>
        </tr>
        <tr><td>upload/remove songs</td><td>❌</td><td>0.20.0</td></tr>
        <tr><td>list uploaded songs</td><td>❌</td><td>0.20.0</td></tr>
        <tr>
            <td colspan=3 align="center">Other</td>
        </tr>
        <tr><td>locale</td><td>❌</td><td>0.20.0</td></tr>
    </tbody>
</table>

## Setup and Usage
This library is not yet available on npm and is still being worked on.

The pace of work thus far has been relatively fast, and is expected to parity to the original API by March or April

See the [Documentation for the Python 3 API](https://ytmusicapi.readthedocs.io/en/latest/usage.html) for reference.

## Contributing
**I am currently not accepting PRs**, but will take issues into consideration if they are between a discrepancy between this library and the Python3 library. PR's are likely to open once I have finished implemented all the 0.20.0 versions

The library is intended to keep features within the same scope of the original Python 3 library. This may/may not change at my discretion.

<!--Pull requests are welcome, esp. with regards to resolving any API differences that occured through mistakes or otherwise.-->

The source code is structured almost identically to the Python 3 Library. I've also mocked some other dependencies, this is to maintain readability and ease of changes between the two APIs. 

## Acknowledgements
A majority of this codebase is possible thanks to the work done by [sigma67](https://github.com/sigma67)
