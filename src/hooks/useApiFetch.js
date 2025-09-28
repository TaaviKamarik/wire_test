import { useState, useEffect } from 'react';

export function useApiFetch(endpoint, params = {}, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (options.skip) return;

    const url = new URL(`https://dti.tlu.ee/errlinked/wire/api/${endpoint}`);

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(val => url.searchParams.append(`${key}[]`, val));
      } else if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    setLoading(true);
    setError(null);

    fetch(url.toString())
      .then(res => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [endpoint, JSON.stringify(params), options.skip]);

  return { data, loading, error };
}
