import React, { useMemo } from "react";
import { dispatch } from "@rxmodel/core";

export default function useDispatch() {
  return useMemo(() => {
    return dispatch;
  }, []);
}
