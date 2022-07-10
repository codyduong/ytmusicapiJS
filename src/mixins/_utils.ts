import { re } from '../pyLibraryMock';

// @CODYDUONG TODO type better
export function prepareLikeEndpoint(rating: any): string | null {
  if (rating === 'LIKE') {
    return 'like/like';
  } else if (rating === 'DISLIKE') {
    return 'like/dislike';
  } else if (rating === 'INDIFFERENT') {
    return 'like/removelike';
  } else {
    return null;
  }
}

export function validateOrderParameters(order: string | undefined): void {
  const orders = ['a_to_z', 'z_to_a', 'recently_added'];
  if (order && !orders.includes(order)) {
    throw Error(
      'Invalid order provided. Please use one of the following orders or leave out the parameter: ' +
        orders.join(', ')
    );
  }
}

// @CODYDUONG TODO type better
export function prepareOrderParams(order: any): string | undefined {
  const orders = ['a_to_z', 'z_to_a', 'recently_added'];
  if (order) {
    // determine order_params via `.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[1].itemSectionRenderer.header.itemSectionTabbedHeaderRenderer.endItems[1].dropdownRenderer.entries[].dropdownItemRenderer.onSelectCommand.browseEndpoint.params` of `/youtubei/v1/browse` response
    const orderParams = ['ggMGKgQIARAA', 'ggMGKgQIARAB', 'ggMGKgQIABAB'];
    return orderParams[orders.indexOf(order)];
  }
}

export function htmlToText(htmlText: string): any {
  const tags = re.findall(/<[^>]+>/, htmlText);
  for (const tag in tags) {
    htmlText = htmlText.replace(tag, '');
  }
  return htmlText;
}

export function getDatestamp(): any {
  return Math.floor(Date.now() / 8.64e7);
}
