import { pipe } from "rxjs";

function waringLog(condition, format, ...rest) {
  if (process.env.NODE_ENV !== "production") {
    if (condition) {
      return pipe();
    } else {
      return pipe(
        tap(() => {
          let argIndex = 0;
          throw new Error(
            format.replace(/%s/g, function() {
              return rest[argIndex++];
            })
          );
        })
      );
    }
  } else {
    return pipe();
  }
}
