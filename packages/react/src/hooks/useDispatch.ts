import { dispatch } from '@rxmodel/core';
import { useMemo } from 'react';

export default function useDispatch() {
  return useMemo(() => dispatch, []);
}
