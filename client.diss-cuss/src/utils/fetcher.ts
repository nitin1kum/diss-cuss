export const fetcher = (url: string, options?: RequestInit) => {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
      ...options,
      credentials : 'include'
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          reject(errorData.message || "Some unknown error occurred");
        }
        const data: any = await res.json();
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
