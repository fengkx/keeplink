import { apiCall } from '@/utils/api-call';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useToggle } from '@react-hookz/web';

import { supabase } from '@/db/supabase';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { chakra, Box, SkeletonCircle, SkeletonText, useToast } from '@chakra-ui/react';

type Props = {
  archive_stat: 'pending' | 'archived';
};

const Archive: React.FC<Props> = () => {
  const router = useRouter();
  const id = router.query.id!;
  const [html, setHTML] = useState('');
  const [loading, toggleLoading] = useToggle(true);
  const toast = useToast();
  useEffect(() => {
    const fetcher = async () => {
      if (!id) {
        return;
      }

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
            method: 'POST',
          });
          const data = await resp.json();
          if (loading) {
            toggleLoading(false);
            if (data.redirect_link_id) {
              await router.replace(`/archive/${data.redirect_link_id}`);
            } else {
              setHTML(data.html);
            }
          }
        } catch (error: any) {
          const data = await error.response.json();
          toast({
            description: data.error,
            status: 'error',
            duration: null,
            isClosable: true,
          });
        }
      }
    };

    fetcher().catch((error) => {
      if (error.message === '404') {
        void router.push('/404');
      }
    });
  }, [id]);

  useEffect(() => {
    const subscription: RealtimeSubscription = supabase
      .from(`links:id=eq.${id}`)
      .on('UPDATE', (payload) => {
        toggleLoading(false);
        setHTML(payload.new.archive);
      })
      .subscribe();
    return () => {
      if (subscription) {
        void supabase.removeSubscription(subscription);
      }
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container h-screen mx-auto">
        <div className="ph-item h-full">
          <div className="ph-col-12">
            {[...Array.from({ length: 4 }).keys()].map((key) => (
              <Box key={key} padding="6" boxShadow="lg" bg="white">
                <SkeletonCircle size="10" />
                <SkeletonText mt="4" noOfLines={4} spacing="4" />
              </Box>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <chakra.iframe
      w='full'
      h='100vh'
      sandbox="allow-top-navigation allow-orientation-lock allow-scripts"
      srcDoc={html}
  ></chakra.iframe>
  );
};

export default Archive;
