import { auth } from '@clerk/nextjs/server';
import { AuthenticatedDataGate } from '../authenticated-data-gate';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
  }

  return <AuthenticatedDataGate>{children}</AuthenticatedDataGate>;
}
