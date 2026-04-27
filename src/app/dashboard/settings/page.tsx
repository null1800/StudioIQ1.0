import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your profile, security, and preferences.</p>
      </div>

      <div className="clerk-dark-mode-container bg-dark-800 rounded-xl border border-dark-700 p-6 flex justify-center">
        <UserProfile 
          appearance={{
            elements: {
              card: "shadow-none bg-transparent",
              navbar: "hidden",
              pageScrollBox: "p-0",
            }
          }}
        />
      </div>
    </div>
  );
}
