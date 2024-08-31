"use client";

import React, { useRef } from "react";
import { useUser } from "@/context/UserContext";
import KYCForm from "@/components/page/KYCForm";
import ContactManager from "@/components/page/ContactManager";

const Settings = () => {
  const { user, refreshUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const handleAvatarClick = () => {
    fileInputRef.current?.click(); // Use optional chaining to safely access click
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/kyc/upload-avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Avatar updated:", data.avatarUrl);
        refreshUser(); // Refresh user context to update avatar URL
      } else {
        console.error("Failed to upload avatar");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-6 mb-6">
          <div
            className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden relative cursor-pointer"
            onClick={handleAvatarClick}
          >
            <img
              src={user?.avatarUrl || "https://via.placeholder.com/150"}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username}
            </h2>
            <p className="text-gray-600">Member since: {joinDate}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <KYCForm />
          <ContactManager />
        </div>
      </div>
    </div>
  );
};

export default Settings;
