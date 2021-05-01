import React, {useEffect, useRef, useState} from 'react';
// @ts-expect-error
import Tags from '@yaireo/tagify/dist/react.tagify';
import '@yaireo/tagify/dist/tagify.css';
import {apiCall} from '@/utils/api-call';
import {useDebounce} from 'react-use';
import {Tag} from '@prisma/client';
import {useToasts} from 'react-toast-notifications';

export function TagsInput({
  className,
  value,
  onBlur,
  name,
  settings,
  onChange
}: any) {
  const [suggestList, setSuggestList] = useState(settings.whitelist ?? []);
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  useDebounce(
    () => {
      setDebouncedInput(input);
    },
    300,
    [input]
  );
  useEffect(() => {
    async function fetcher() {
      try {
        const resp = await apiCall(`/api/tags?start=${debouncedInput}`);
        const tags = await resp.json();
        setSuggestList(tags.map((t: Tag) => t.tag));
      } catch (error) {
        console.error(error);
      }
    }

    if (debouncedInput.length > 0) {
      fetcher();
    }
  }, [debouncedInput]);
  useEffect(() => {
    const tagify = tagifyRef.current;
    const whitelist = tagify.settings.whitelist;
    tagify.settings.whitelist.splice(0, whitelist.length, ...suggestList);
    tagify.loading(false).dropdown.show.call(tagify, debouncedInput);
  }, [suggestList]);
  const tagifyRef = useRef<any>();
  useEffect(() => {
    if (tagifyRef.current) {
      async function onInput(ev: CustomEvent) {
        const input = ev.detail.value;
        setInput(input);
      }

      tagifyRef.current.on('input', onInput);
    }
  }, [tagifyRef]);

  return (
    <Tags
      className={className}
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      value={value}
      tagifyRef={tagifyRef}
    />
  );
}
