import React, { useEffect, useRef, useState } from 'react';
import Tags, { TagifyBaseReactProps } from '@yaireo/tagify/dist/react.tagify';
import '@yaireo/tagify/dist/tagify.css';
import { apiCall } from '@/utils/api-call';
import { useDebounce } from 'react-use';
import { Tag } from '@prisma/client';
import Tagify from '@yaireo/tagify';

export function TagsInput({
  className,
  value,
  onBlur,
  name,
  settings,
  onChange,
}: TagifyBaseReactProps) {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  useDebounce(
    () => {
      setDebouncedInput(input);
    },
    300,
    [input]
  );
  const tagifyRef = useRef<Tagify<Tagify.TagData>>();
  useEffect(() => {
    async function fetcher() {
      try {
        const resp = await apiCall(`/api/tags?start=${debouncedInput}`);
        const tags = await resp.json();
        const tagify = tagifyRef.current;
        if (tagify) {
          const whitelist = tagify.settings.whitelist ?? [];
          tagify?.settings?.whitelist?.splice(
            0,
            whitelist.length,
            ...tags.map((t: Tag) => t.tag)
          );
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (debouncedInput.length > 0) {
      void fetcher();
    }
  }, [debouncedInput]);
  useEffect(() => {
    const onInput = (ev: CustomEvent) => {
      const input = ev.detail.value;
      setInput(input);
    };

    if (tagifyRef.current) {
      tagifyRef.current.on('input', onInput);
    }
  }, [tagifyRef]);

  return (
    <Tags
      className={className}
      onChange={onChange}
      settings={settings}
      onBlur={onBlur}
      name={name}
      value={value}
      tagifyRef={tagifyRef}
    />
  );
}
