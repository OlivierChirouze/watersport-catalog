export enum LinkType {
  instagram = "instagram",
  facebook = "facebook",
  youtube = "youtube",
  twitter = "twitter",
  vimeo = "vimeo"
}

export interface Link {
  type: LinkType;
  url: string;
}

export const guessLinkType = (link: string): LinkType | undefined => {
  // "https://www.youtube.com/channel/UCKF5AYr4WtwStFN1PoqZfEg"
  if (link.match("youtube.com")) {
    return LinkType.youtube;
  }
  // "https://www.instagram.com/patrikwindsurf/"
  if (link.match("instagram.com")) {
    return LinkType.instagram;
  }
  // "https://www.facebook.com/patrikwindsurf/", not "http://strikable.com/facebook-page-plugin-likebox-for-wordpress/"
  if (link.match("facebook.com")) {
    return LinkType.facebook;
  }
  // https://twitter.com/fanaticcom
  if (link.match("twitter.com")) {
    return LinkType.twitter;
  }
  // http://vimeo.com/channels/fanaticinternational
  if (link.match("vimeo.com")) {
    return LinkType.vimeo;
  }
};

export interface Brand {
  name: string;
  motto?: { [language: string]: string };
  description?: { [language: string]: string };
  links: Link[];
  infoUrl?: string;
  homePageUrl?: string;
  logo?: string;
  pictures: string[];
}
