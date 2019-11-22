import { useMemo } from 'react';
import { store } from '@rxmodel/core';

export default function useDispatch() {
  return useMemo(() => store, []);
}
