import rxmodel from '@rxmodel/core';

let app = null;

export function createApp () {
  app = rxmodel({
    <%= ExtendDvaConfig %>
  });
  if(process.env.ENV_NODE === 'development'){
    app.use(require('@rxmodel/devtools').default());
  }
  <%= RegisterPlugins %>
  <%= RegisterModels %>
  app.start();

  return app;
}


export function getApp(){
  return app;
}