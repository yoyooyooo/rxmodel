import { state$$ } from "@rxmodel/core";
import { useEffect, useMemo, useRef, useState } from "react";

const refEquality = (a, b) => a === b;

export default function useSelector(selector, equalityFn = refEquality) {
  const lastSelectValue = useRef();
  const [selectValue, setSelectValue] = useState(() => {
    const initialSelectValue = selector(state$$.value);
    lastSelectValue.current = initialSelectValue;
    return initialSelectValue;
  });

  useEffect(() => {
    const subscription = state$$.subscribe(state => {
      const nextValue = selector(state);
      if (!equalityFn(nextValue, lastSelectValue.current)) {
        setSelectValue(nextValue);
      }
      lastSelectValue.current = nextValue;
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return selectValue;
}
