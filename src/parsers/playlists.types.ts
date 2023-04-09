import { Rating } from '../mixins/library.types';
import { thumbnails } from '../types';
import {
  parseSongAlbumReturn,
  parseSongArtistsReturn,
  parseSongMenuTokensReturn,
} from './songs';

export type parsePlaylistItemsReturn = {
  videoId: string;
  title: string;
  artists?: parseSongArtistsReturn;
  album?: parseSongAlbumReturn;
  likeStatus: Rating;
  thumbnails: thumbnails;
  isAvailable: boolean;
  isExplicit: boolean;
  videoType: string;
  feedbackTokens: parseSongMenuTokensReturn;
  setVideoId?: string;
}[];
