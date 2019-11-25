import React, { useEffect } from 'react';
import { useSelector, useDispatch } from '@rxmodel/react';
import styles from './index.css';

export default function() {
  const dispatch = useDispatch();
  const n = useSelector(state => state.counter.n);

  return (
    <div className={styles.normal}>
      <button
        onClick={e => {
          dispatch({ type: 'counter/minus' });
        }}
      >
        -
      </button>
      <button
        onClick={e => {
          dispatch({ type: 'counter/add' });
        }}
      >
        +
      </button>
      {n}
    </div>
  );
}
