import metaParser from 'metascraper';
import metascraperUrl from 'metascraper-url';
import metascraperDescription from 'metascraper-description';
import metascraperTitle from 'metascraper-title';

export const metascraper = metaParser([
  metascraperUrl(),
  metascraperDescription(),
  metascraperTitle()
]);
