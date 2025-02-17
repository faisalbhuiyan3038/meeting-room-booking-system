import { auth, currentUser } from "@clerk/nextjs/server";
import SignInPage from "./sign-in/[[...sign-in]]/page";

export default async function Home() {
  const { userId } = await auth()
  const user = await currentUser()
  if (!userId) return <SignInPage />

  return <h1>Hello, {user?.firstName}</h1>
}
