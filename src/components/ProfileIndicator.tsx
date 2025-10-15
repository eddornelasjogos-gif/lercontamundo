"use client";

import React from "react";

const ProfileIndicator: React.FC = () => {
  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 h-40 w-2 bg-orange-700/60 rounded-full" aria-label="profile-indicator-track">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-orange-800 shadow animate-bounce-vertical" />
    </div>
  );
};

export default ProfileIndicator;