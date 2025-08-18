// Temporarily disabled Clerk authentication
// import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  // Temporarily bypass authentication - redirect directly to dashboard
  // const { userId } = await auth();

  // if (!userId) {
  //   return redirect('/auth/sign-in');
  // } else {
  //   redirect('/dashboard/overview');
  // }

  // Direct redirect to dashboard for now
  redirect('/dashboard/overview');
}
