export const optimizeUrl = (url: string,q:number) =>
  url.replace("/upload/", `/upload/w_${q},q_auto,f_auto/`);