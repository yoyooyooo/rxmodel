import React, { useMemo } from "react";
import { getApp } from "@rxmodel/core";

export default function useDispatch() {
  return useMemo(getApp, []);
}
