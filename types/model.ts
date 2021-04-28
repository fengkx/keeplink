export type Link = {
  id: number;
  link_id?: number;
  title: string | null;
  description: string | null;
  url: string;
  createdAt?: Date | string | number;
  archive_stat: 'archived' | 'pending';
  tags: Tag[];
};
export type Tag = {
  id: number;
  tag: string;
  alias: string[];
};
