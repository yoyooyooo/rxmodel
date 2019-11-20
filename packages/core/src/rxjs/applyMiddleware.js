import { pipe, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export default function applyMiddleware(
  middlewares = [],
  middlewareApi,
  next = () => input$ => input$,
  nextConfig = {}
) {
  const chain = middlewares.map(middleware => middleware(middlewareApi));
  function goNext(config) {
    let operator = pipe();
    if (chain.length) {
      const head = chain.shift();
      operator = head(nextConfig => {
        config =
          typeof nextConfig === 'undefined'
            ? config
            : typeof nextConfig === 'function'
            ? nextConfig(config)
            : nextConfig;
        return goNext(config);
      });
    } else {
      operator = pipe(operator, next(config));
    }
    return operator;
  }
  return goNext(nextConfig);
}
