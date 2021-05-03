import metaParser from 'metascraper';
import metascraperUrl from 'metascraper-url';
import metascraperDescription from 'metascraper-description';
import metascraperTitle from 'metascraper-title';
import helper from '@metascraper/helpers';
const {$filter, toRule, title, memoizeOne} = helper;
const toTitle = toRule(title)
const toUrl = toRule(helper.url);
const REGEX_NOTION_URL = /https?:\/\/www\.notion\.so/i
const isValidUrl = memoizeOne(url => REGEX_NOTION_URL.test(url))
const metaNotion = () => {
  const rules = {
    url: [
      toUrl(($) => $('link[rel="canonical"]').attr('href')),
      ({url}) => url
    ],
    title: [
      toTitle(($) => $filter($, $('title')))
    ],
    description: [
      toTitle(($) => $filter($, $('title')))
    ]
  };
  rules.test = ({url}) => isValidUrl(url);
  return rules
};

export const metascraper = metaParser([
  metaNotion(),
  metascraperUrl(),
  metascraperDescription(),
  metascraperTitle()
]);
