//Equivalent to __init__.py
export const RUN_TEXT = ['runs', 0, 'text'];
export const TAB_CONTENT = ['tabs', 0, 'tabRenderer', 'content'];
export const SINGLE_COLUMN_TAB = [
  'contents',
  'singleColumnBrowseResultsRenderer',
  ...TAB_CONTENT,
];
export const SECTION_LIST = ['sectionListRenderer', 'contents'];
export const SECTION_LIST_ITEM = ['sectionListRenderer', 'contents', 0];
export const ITEM_SECTION = ['itemSectionRenderer', 'contents', 0];
export const MUSIC_SHELF = ['musicShelfRenderer'];
export const GRID = ['gridRenderer'];
export const GRID_ITEMS = [...GRID, 'items'];
export const MENU = ['menu', 'menuRenderer'];
export const MENU_ITEMS = [...GRID, 'items'];
export const MENU_LIKE_STATUS = [
  ...MENU,
  ...['topLevelButtons', 0, 'likeButtonRenderer', 'likeStatus'],
];
export const MENU_SERVICE = ['menuServiceItemRenderer', 'serviceEndpoint'];
export const TOGGLE_MENU = 'toggleMenuServiceItemRenderer';
export const PLAY_BUTTON = [
  'overlay',
  'musicItemThumbnailOverlayRenderer',
  'content',
  'musicPlayButtonRenderer',
];
export const NAVIGATION_BROWSE_ID = [
  'navigationEndpoint',
  'browseEndpoint',
  'browseId',
];
export const NAVIGATION_VIDEO_ID = [
  'navigationEndpoint',
  'watchEndpoint',
  'videoId',
];
export const NAVIGATION_PLAYLIST_ID = [
  'navigationEndpoint',
  'watchEndpoint',
  'playlistId',
];
export const NAVIGATION_WATCH_PLAYLIST_ID = [
  'navigationEndpoint',
  'watchPlaylistEndpoint',
  'playlistId',
];
export const HEADER_DETAIL = ['header', 'musicDetailHeaderRenderer'];
export const DESCRIPTION = ['description', ...RUN_TEXT];
export const CAROUSEL = ['musicCarouselShelfRenderer'];
export const CAROUSEL_CONTENTS = [...CAROUSEL, 'contents'];
export const CAROUSEL_TITLE = [
  'header',
  'musicCarouselShelfBasicHeaderRenderer',
  'title',
  'runs',
  0,
];
export const FRAMEWORK_MUTATIONS = [
  'frameworkUpdates',
  'entityBatchUpdate',
  'mutations',
];
export const TITLE = ['title', 'runs', 0];
export const TITLE_TEXT = ['title', ...RUN_TEXT];
export const TEXT_RUN = ['text', 'runs', 0];
export const TEXT_RUN_TEXT = ['text', 'runs', 0, 'text'];
export const SUBTITLE = ['subtitle', ...RUN_TEXT];
export const SUBTITLE2 = ['subtitle', 'runs', 2, 'text'];
export const SUBTITLE3 = ['subtitle', 'runs', 4, 'text'];
export const THUMBNAIL = ['thumbnail', 'thumbnails'];
export const THUMBNAILS = ['thumbnail', 'musicThumbnailRenderer', ...THUMBNAIL];
export const THUMBNAIL_RENDERER = [
  'thumbnailRenderer',
  'musicThumbnailRenderer',
  ...THUMBNAIL,
];
export const THUMBNAIL_CROPPED = [
  'thumbnail',
  'croppedSquareThumbnailRenderer',
  THUMBNAIL,
];
export const FEEDBACK_TOKEN = ['feedbackEndpoint', 'feedbackToken'];
export const BADGE_LABEL = [
  'badges',
  0,
  'musicInlineBadgeRenderer',
  'accessibilityData',
  'accessibilityData',
  'label',
];
export const RELOAD_CONTINUATION = [
  'continuations',
  0,
  'reloadContinuationData',
  'continuation',
];
export const CATEGORY_TITLE = [
  'musicNavigationButtonRenderer',
  'buttonText',
  ...RUN_TEXT,
];
export const CATEGORY_PARAMS = [
  'musicNavigationButtonRenderer',
  'clickCommand',
  'browseEndpoint',
  'params',
];
export const MRLIR = 'musicResponsiveListItemRenderer';
export const MTRIR = 'musicTwoRowItemRenderer';
