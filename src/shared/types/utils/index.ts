export type ObjectKeyPrefix<T, P extends string = '$'> = {
  [k in keyof T as `${P}${Extract<k, string | number>}`]: T[k];
};
