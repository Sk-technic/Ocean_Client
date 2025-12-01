// pages/SettingsPage.tsx
import React from "react";

const SettingsPage: React.FC = () => {
  return (
    <div className="theme-bg-primary min-h-screen p-6 flex flex-col items-center">
      {/* Page Header */}
      <div className="w-full max-w-5xl mb-6">
        <h1 className="text-3xl font-semibold theme-text-primary tracking-tight">
          Settings
        </h1>
        <p className=" text-[var(--text-secondary)] text-sm mt-1">
          Manage your preferences and personalize your experience.
        </p>
      </div>

      {/* Appearance Section */}
      <section className="theme-bg-card theme-shadow rounded-2xl p-6 border theme-border w-full max-w-5xl transition-all duration-300">
        <h2 className="text-xl font-medium theme-text-primary mb-3">
          Appearance
        </h2>
        <p className=" text-[var(--text-secondary)] mb-5 text-sm">
          Switch between light and dark themes to suit your environment.
        </p>

      </section>

    </div>
  );
};

export default SettingsPage;
