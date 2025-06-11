export const infiniteFetcher = (url: string) => {
  if (!url) return Promise.resolve(null);

  return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
      credentials : 'include'
    })
      .then(async (res) => {
        if (!res.ok) {
          console.log(await res.json() || "Some unknown error occurred");
          throw new Error(await res.json());
        }
        return await res.json();
  });
};
