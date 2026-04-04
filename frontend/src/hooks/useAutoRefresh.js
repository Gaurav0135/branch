import { useEffect, useRef, useState } from 'react';

const useAutoRefresh = (refreshFn, options = {}) => {
  const {
    enabled = true,
    intervalMs = 10000,
    refreshOnFocus = true,
    refreshOnVisible = true
  } = options;

  const refreshRef = useRef(refreshFn);
  const [lastRefreshAt, setLastRefreshAt] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshRef.current = refreshFn;
  }, [refreshFn]);

  useEffect(() => {
    if (!enabled || typeof refreshRef.current !== 'function') return;

    const runRefresh = async () => {
      try {
        setIsRefreshing(true);
        await refreshRef.current?.();
        setLastRefreshAt(Date.now());
      } finally {
        setIsRefreshing(false);
      }
    };

    const intervalId = window.setInterval(runRefresh, intervalMs);

    const onFocus = () => {
      if (refreshOnFocus) runRefresh();
    };

    const onVisibilityChange = () => {
      if (refreshOnVisible && document.visibilityState === 'visible') {
        runRefresh();
      }
    };

    if (refreshOnFocus) {
      window.addEventListener('focus', onFocus);
    }

    if (refreshOnVisible) {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    return () => {
      window.clearInterval(intervalId);

      if (refreshOnFocus) {
        window.removeEventListener('focus', onFocus);
      }

      if (refreshOnVisible) {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
    };
  }, [enabled, intervalMs, refreshOnFocus, refreshOnVisible]);

  return {
    lastRefreshAt,
    isRefreshing
  };
};

export default useAutoRefresh;
