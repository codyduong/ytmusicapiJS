//Equivalent to __init__.py
export const RUN_TEXT = ['runs', 0, 'text'] as const;
export const TAB_CONTENT = ['tabs', 0, 'tabRenderer', 'content'] as const;
export const SINGLE_COLUMN_TAB = [
  'contents',
  'singleColumnBrowseResultsRenderer',
  ...TAB_CONTENT,
] as const;
export const SECTION_LIST = ['sectionListRenderer', 'contents'] as const;
export const SECTION_LIST_ITEM = [
  'sectionListRenderer',
  'contents',
  0,
] as const;
export const ITEM_SECTION = ['itemSectionRenderer', 'contents', 0] as const;
export const MUSIC_SHELF = ['musicShelfRenderer'] as const;
export const GRID = ['gridRenderer'] as const;
export const GRID_ITEMS = [...GRID, 'items'] as const;
export const MENU = ['menu', 'menuRenderer'] as const;
export const MENU_ITEMS = [...MENU, 'items'] as const;
export const MENU_LIKE_STATUS = [
  ...MENU,
  ...['topLevelButtons', 0, 'likeButtonRenderer', 'likeStatus'],
] as const;
export const MENU_SERVICE = [
  'menuServiceItemRenderer',
  'serviceEndpoint',
] as const;
export const TOGGLE_MENU = 'toggleMenuServiceItemRenderer' as const;
export const PLAY_BUTTON = [
  'overlay',
  'musicItemThumbnailOverlayRenderer',
  'content',
  'musicPlayButtonRenderer',
] as const;
export const NAVIGATION_BROWSE = [
  'navigationEndpoint',
  'browseEndpoint',
] as const;
export const NAVIGATION_BROWSE_ID = [...NAVIGATION_BROWSE, 'browseId'] as const;
export const PAGE_TYPE = [
  'browseEndpointContextSupportedConfigs',
  'browseEndpointContextMusicConfig',
  'pageType',
] as const;
export const NAVIGATION_VIDEO_ID = [
  'navigationEndpoint',
  'watchEndpoint',
  'videoId',
] as const;
export const NAVIGATION_PLAYLIST_ID = [
  'navigationEndpoint',
  'watchEndpoint',
  'playlistId',
] as const;
export const NAVIGATION_WATCH_PLAYLIST_ID = [
  'navigationEndpoint',
  'watchPlaylistEndpoint',
  'playlistId',
] as const;
export const HEADER_DETAIL = ['header', 'musicDetailHeaderRenderer'] as const;
export const DESCRIPTION = ['description', ...RUN_TEXT] as const;
export const CAROUSEL = ['musicCarouselShelfRenderer'] as const;
export const CAROUSEL_CONTENTS = [...CAROUSEL, 'contents'] as const;
export const CAROUSEL_TITLE = [
  'header',
  'musicCarouselShelfBasicHeaderRenderer',
  'title',
  'runs',
  0,
] as const;
export const FRAMEWORK_MUTATIONS = [
  'frameworkUpdates',
  'entityBatchUpdate',
  'mutations',
];
export const TITLE = ['title', 'runs', 0] as const;
export const TITLE_TEXT = ['title', ...RUN_TEXT] as const;
export const TEXT_RUNS = ['text', 'runs'] as const;
export const TEXT_RUN = [...TEXT_RUNS, 0] as const;
export const TEXT_RUN_TEXT = [...TEXT_RUN, 'text'] as const;
export const SUBTITLE = ['subtitle', ...RUN_TEXT] as const;
export const SUBTITLE2 = ['subtitle', 'runs', 2, 'text'] as const;
export const SUBTITLE3 = ['subtitle', 'runs', 4, 'text'] as const;
export const THUMBNAIL = ['thumbnail', 'thumbnails'] as const;
export const THUMBNAILS = [
  'thumbnail',
  'musicThumbnailRenderer',
  ...THUMBNAIL,
] as const;
export const THUMBNAIL_RENDERER = [
  'thumbnailRenderer',
  'musicThumbnailRenderer',
  ...THUMBNAIL,
] as const;
export const THUMBNAIL_CROPPED = [
  'thumbnail',
  'croppedSquareThumbnailRenderer',
  THUMBNAIL,
] as const;
export const FEEDBACK_TOKEN = ['feedbackEndpoint', 'feedbackToken'] as const;
export const BADGE_LABEL = [
  'badges',
  0,
  'musicInlineBadgeRenderer',
  'accessibilityData',
  'accessibilityData',
  'label',
] as const;
export const RELOAD_CONTINUATION = [
  'continuations',
  0,
  'reloadContinuationData',
  'continuation',
] as const;
export const CATEGORY_TITLE = [
  'musicNavigationButtonRenderer',
  'buttonText',
  ...RUN_TEXT,
] as const;
export const CATEGORY_PARAMS = [
  'musicNavigationButtonRenderer',
  'clickCommand',
  'browseEndpoint',
  'params',
] as const;
export const MRLIR = 'musicResponsiveListItemRenderer' as const;
export const MTRIR = 'musicTwoRowItemRenderer' as const;
