import { auth } from "@clerk/nextjs/server";
import SignInPage from "./sign-in/[[...sign-in]]/page";
import RecentlyViewedPage from "./(protected)/recently-viewed/page";

export default async function Home() {
  const { userId } = await auth()
  if (!userId) return <SignInPage />

  return <RecentlyViewedPage />
}
