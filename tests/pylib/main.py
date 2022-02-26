from save import writeToFile
from ytmusicapi import YTMusic


def main():
    ytm = YTMusic()
    # Search
    query = "edm playlist"
    writeToFile("Search#1", ytm.search(query))
    writeToFile(
        "Search#2",
        ytm.search("Martin Stig Andersen - Deteriation", ignore_spelling=True),
    )
    writeToFile("Search#3", ytm.search(query, filter="songs"))
    writeToFile("Search#4", ytm.search(query, filter="videos"))
    writeToFile("Search#5", ytm.search(query, filter="albums", limit=40))
    writeToFile(
        "Search#6", ytm.search("project-2", filter="artists", ignore_spelling=True)
    )
    writeToFile("Search#7", ytm.search("classical music", filter="playlists"))
    writeToFile(
        "Search#8",
        ytm.search("classical music", filter="playlists", ignore_spelling=True),
    )
    writeToFile(
        "Search#9",
        ytm.search("clasic rock", filter="community_playlists", ignore_spelling=True),
    )
    writeToFile("Search#10", ytm.search("hip hop", filter="featured_playlists"))


if __name__ == "__main__":
    main()
