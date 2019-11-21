import { Observable, OperatorFunction, pipe, UnaryFunction } from 'rxjs';

export type Middleware<I, O, S = any> = (
  store?: S
) => UnaryFunction<
  (...args: any[]) => OperatorFunction<I, O>,
  (input$: Observable<I>) => Partial<OperatorFunction<I, O>>
>;

export default function applyMiddleware<I, O, S = any, C = {}>(
  middlewares: Middleware<I, O>[] = [],
  middlewareApi?: S,
  next: (config?: C) => OperatorFunction<I, I | O> = () => input$ => input$,
  nextConfig: C = {} as C
) {
  const chain = middlewares.map(middleware => middleware(middlewareApi));
  function goNext(config: C) {
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
        return goNext(config) as OperatorFunction<I, O>;
      });
    } else {
      operator = pipe(operator, next(config));
    }
    return operator;
  }
  return goNext(nextConfig) as OperatorFunction<I, O>;
}
