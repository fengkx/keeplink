import {useRouter} from 'next/router';
import {apiCall} from '@/utils/api-call';
import {useEffect, useState} from 'react';
import {useToggle} from 'react-use';

import 'placeholder-loading/dist/css/placeholder-loading.css';

type Props = {
  archive_stat: 'pending' | 'archived';
};

const Archive: React.FC<Props> = () => {
  const router = useRouter();
  const id = router.query.id!;
  const [html, setHTML] = useState('');
  const [loading, toggleLoading] = useToggle(true);
  useEffect(() => {
    const fetcher = async () => {
      if (id) {
        const resp = await apiCall(`/api/links/archive/${id}`);
        const text = await resp.text();
        if (resp.status === 401) {
          void router.push('/signin');
          return;
        }

        if (text.length > 0) {
          setHTML(text);
          toggleLoading(false);
        } else {
          toggleLoading(true);
          void apiCall(`/api/links/archive/${id}`, {method: 'POST'}).then(
            () => {
              router.reload();
            }
          );
        }
      }
    };

    fetcher().catch((error) => {
      if (error.message === '404') {
        void router.push('/404');
      }
    });
  }, [id]);

  if (loading) {
    return (
      <div className="container h-screen mx-auto">
        <div className="ph-item h-full">
          <div className="ph-col-12">
            {[...Array.from({length: 3}).keys()].map(() => (
              <div className="h-1/3">
                <div className="ph-picture" />
                <div className="ph-row">
                  <div className="ph-col-6 big" />
                  <div className="ph-col-4 empty big"></div>
                  <div className="ph-col-2 big"></div>
                  <div className="ph-col-4"></div>
                  <div className="ph-col-8 empty"></div>
                  <div className="ph-col-6"></div>
                  <div className="ph-col-6 empty"></div>
                  <div className="ph-col-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (html) {
    return (
      <div id="archive-content" dangerouslySetInnerHTML={{__html: html}} />
    );
  }

  return <div>Archive {id}</div>;
};

export default Archive;
