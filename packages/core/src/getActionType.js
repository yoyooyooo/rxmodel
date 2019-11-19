export default (models, action, namespace) => {
  if (typeof namespace === "undefined") {
    namespace = action.type.split("/")[0];
  }

  const model = models.find(a => namespace === a.namespace);
  let type;
  if (!model) {
    type = "unknown";
  } else {
    if (Object.keys(model.reducers || {}).some(key => key === action.type)) {
      type = "reducer";
    }
    if (Object.keys(model.effects || {}).some(key => key === action.type)) {
      type = "effect";
    }
    if (
      Object.keys(model.subscriptions || {}).some(key => key === action.type)
    ) {
      type = "subscription";
    }
  }

  // let actionType;
  // if (action.type.startsWith("@@")) {
  //   type = "internal";
  // }
  // if (action.type.startsWith("$$")) {
  //   type = "plugin";
  // }
  return type;
};
