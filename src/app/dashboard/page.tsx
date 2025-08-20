// import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // Temporarily disabled Clerk authentication
  // const { userId } = await auth();

  // if (!userId) {
  //   return redirect('/auth/sign-in');
  // } else {
  //   redirect('/dashboard/overview');
  // }

  // Direct redirect to overview since Clerk is disabled
  redirect('/dashboard/overview');
}
