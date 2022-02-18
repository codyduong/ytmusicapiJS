type Track = {
  title: string;
  byline: string;
  length: string;
  videoId: string;
  thumbnail: [
    {
      url: string;
      width: number;
      height: number;
    }
  ];
  feedbackTokens: Array<any>;
  likeStatus: string;
  //@codyduong there are some more props. todo discovery
};
export type getWatchPlaylistReturn = {
  tracks: Track[];
  playlistId: string | null;
  lyrics: string | null;
};
export type response = {
  contents: {
    singleColumnMusicWatchNextResultsRenderer: {
      tabbedRenderer: {
        watchNextTabbedResultsRenderer: watchNextRenderer;
      };
    };
  };
};
export type watchNextRenderer = {
  tabs: tab[];
};
export type tab = {
  tabRenderer: {
    unselectable: unknown;
    endpoint: {
      browseEndpoint: {
        browseId: string;
      };
    };
    content: {
      musicQueueRenderer: {
        content: {
          playlistPanelRenderer: results;
        };
      };
    };
  };
};
export type results = {
  contents: {
    playlistPanelVideoRenderer: {
      navigationEndpoint: {
        watchEndpoint: {
          playlistId: string;
        };
      };
    };
  }[];
};
export type parseWatchPlaylistTrack = Omit<
  Track,
  'byline' | 'feedbackTokens' | 'likeStatus'
> & {
  byline?: string;
  feedbackTokens: Array<any> | null;
  likeStatus: string | null;
};
