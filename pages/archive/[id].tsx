import {useRouter} from 'next/router';
import {apiCall} from '@/utils/api-call';
import {useEffect, useState} from 'react';
import {useToggle} from 'react-use';

import 'placeholder-loading/dist/css/placeholder-loading.css';
import {useToasts} from 'react-toast-notifications';

type Props = {
  archive_stat: 'pending' | 'archived';
};

const Archive: React.FC<Props> = () => {
  const router = useRouter();
  const id = router.query.id!;
  const [html, setHTML] = useState('');
  const [loading, toggleLoading] = useToggle(true);
  const toast = useToasts();
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
          try {
            const resp = await apiCall(`/api/links/archive/${id}`, {
              method: 'POST'
            });
            const data = await resp.json();
            toggleLoading(false);
            setHTML(data.html);
          } catch (error) {
            const data = await error.response.json();
            toast.addToast(data.error, {
              appearance: 'error',
              autoDismiss: false
            });
          }
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
            {[...Array.from({length: 3}).keys()].map((key) => (
              <div key={key} className="h-1/3">
                <div className="ph-picture" />
                <div className="ph-row">
                  <div className="ph-col-6 big" />
                  <div className="ph-col-4 empty big" />
                  <div className="ph-col-2 big" />
                  <div className="ph-col-4" />
                  <div className="ph-col-8 empty" />
                  <div className="ph-col-6" />
                  <div className="ph-col-6 empty" />
                  <div className="ph-col-12" />
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
