import React, { useEffect } from 'react';
import styles from './index.css';
import { useSelector, useDispatch } from '@rxmodel/react';

export default function() {
  const dispatch = useDispatch();
  const n = useSelector(state => state.counter.n);

  useEffect(() => {
    dispatch({ type: 'counter/add' });
  }, []);

  return <div className={styles.normal}>{n}</div>;
}
