import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <SignIn fallbackRedirectUrl="/dashboard" />
      </div>
    </main>
  );
}
