import rxmodel from '@rxmodel/core';

let app = null;

export function createApp () {
  app = rxmodel({
    <%= ExtendDvaConfig %>
  });
  <%= RegisterPlugins %>
  <%= RegisterModels %>
  app.start();

  return app;
}


export function getApp(){
  return app;
}