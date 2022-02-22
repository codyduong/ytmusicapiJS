export type getMoodCategoriesResponse = {
  contents: {
    singleColumnBrowseResultsRenderer: {
      tabs: Array<{
        tabRenderer: {
          content: {
            sectionListRenderer: {
              contents: Array<{
                gridRenderer: {
                  items: Array<any>;
                  header: {
                    gridHeaderRenderer: {
                      title: {
                        runs: Array<{ text: string }>;
                      };
                    };
                  };
                };
              }>;
            };
          };
        };
      }>;
    };
  };
};
export type getMoodSectionNav =
  getMoodCategoriesResponse['contents']['singleColumnBrowseResultsRenderer']['tabs'][number]['tabRenderer']['content']['sectionListRenderer']['contents'];
export type getMoodTitle =
  getMoodSectionNav[number]['gridRenderer']['header']['gridHeaderRenderer']['title']['runs'][number]['text'];
export type getMoodGridItems =
  getMoodSectionNav[number]['gridRenderer']['items'];
export type getMoodPlaylists = getMoodCategoriesResponse;
export type getMoodPlaylistsNav = getMoodSectionNav;
