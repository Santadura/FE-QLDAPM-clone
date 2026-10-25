import { useEffect, useState } from 'react';
import { employeeApi } from '../../../services/employeeApi';

export function useEmployeeRecords(id, resource, weekStart, revision) {
  const [state, setState] = useState(null);
  const [retry, setRetry] = useState(0);
  const key = `${id}:${resource}:${weekStart}:${revision}:${retry}`;
  useEffect(() => {
    let active = true;
    employeeApi[resource](id, weekStart)
      .then((rows) => { if (active) setState({ key, rows }); })
      .catch((error) => { if (active) setState({ key, error: error.message }); });
    return () => { active = false; };
  }, [id, resource, weekStart, key]);
  return {
    rows: state?.key === key ? state.rows || [] : [],
    error: state?.key === key ? state.error : '',
    loading: state?.key !== key,
    retry: () => setRetry((v) => v + 1),
  };
}
