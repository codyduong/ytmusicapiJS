import * as parser_bT from './browsing.types';
import { parseLikeStatusReturn, parseSongRunsReturn } from './songs';

export type parseAlbumHeaderReturn = {
  title: string;
  type: string;
  thumbnails: string;
  description?: undefined | string;
  trackCount: number;
  duration: string;
  audioPlaylistId: null | string;
  likeStatus?: undefined | parseLikeStatusReturn;
  otherVersions?: undefined | parser_bT.parseAlbumReturn[];
} & parseSongRunsReturn;
