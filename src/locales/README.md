# Translations
Translations are required for ytmusicapi since it relies on parsing user interface text. In some places, for example the search() or get_artist() features, there is no other way to tell which content type is offered other than parsing display text, which depends on the user's language. Changing the API language is desirable, since artist and song titles are also language dependent.

### When Contributing
Please verify the translation is accurate, for example, on de.json, `playlist` is translated as `playlist`, exactly the same, because it displays as such on the YTM API.
It does this for some languages (ie. keeps the english word to display), while othertimes it will correctly translate it. So you'll have to analyze the return results from
various languages in order to make sure it reads the displayed data correctly. 

Also add a test in `./tests/locale.test.ts` checking all of these translations
```
artist
playlist
song
video
videos
station
albums
singles
playlists
related
```
