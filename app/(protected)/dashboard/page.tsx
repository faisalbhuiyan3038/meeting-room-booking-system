import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
    const user = await currentUser();

    return <h1>Hello, {user?.firstName}</h1>

}
