import { fetcher } from "@/utils/fetcher";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getUser() {
  const res = await fetch(`${BACKEND_URL}/api/auth/authenticate`);
  console.log(res)
  if (!res.ok) return null;

  return await res.json();
}

export async function logoutUser() {
  try {
    const res = await fetcher(`/api/auth/logout`);
    return res;
  } catch (error) {
    console.log(error)
  }
}
