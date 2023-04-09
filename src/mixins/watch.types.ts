import { parseWatchPlaylistReturn } from '../parsers/watch';

export type response = {
  contents: {
    singleColumnMusicWatchNextResultsRenderer: {
      tabbedRenderer: {
        watchNextTabbedResultsRenderer: watchNextRenderer;
      };
    };
  };
};
type watchNextRenderer = {
  tabs: tab[];
};
type tab = {
  tabRenderer: {
    unselectable: any;
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
export type getWatchPlaylistOptions =
  | {
      videoId: string;
      playlistId: string;
      limit?: number;
      radio?: boolean;
      shuffle?: boolean;
    }
  | {
      videoId?: string;
      playlistId: string;
      limit?: number;
      radio?: boolean;
      shuffle?: boolean;
    }
  | {
      videoId: string;
      playlistId?: string;
      limit?: number;
      radio?: boolean;
      shuffle?: false;
    };

export type getWatchPlaylistReturn = {
  tracks: parseWatchPlaylistReturn;
  playlistId: string | null;
  lyrics: string | null;
  related: string;
};
