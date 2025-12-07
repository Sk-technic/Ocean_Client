export const optimizeUrl = (url: string, q: number) => {
  if (!url) return url;

  if (url.includes("lh3.googleusercontent.com")) {
    return url.replace(/=s\d+-c$/, "=s400-c");
  }

  const isCloudinary = url.includes("res.cloudinary.com");

  if (!isCloudinary) {
    return url;
  }

  if (!url.includes("/upload/")) {
    return url;
  }

  return url.replace("/upload/", `/upload/w_${q},q_auto,f_auto/`);
};
