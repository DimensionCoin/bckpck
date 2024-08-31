"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import toast, { Toaster } from "react-hot-toast";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"; // Import drawer components from Shadcn
import { Button } from "@/components/ui/button"; // Assuming there's a Button component in your Shadcn setup
import { GrUserNew } from "react-icons/gr";

const KYCForm = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    address: "",
    city: "",
    stateOrProvince: "",
    postalOrZipCode: "",
    country: "",
    ssnOrSin: "",
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/kyc/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("KYC information updated successfully");
        setIsDrawerOpen(false); // Close the drawer on successful update
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update KYC information");
      }
    } catch (error) {
      console.error("Error updating KYC information:", error);
      toast.error("Failed to update KYC information");
    }
  };

  return (
    <div>
      <Toaster />
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger className="">
          <Button
            variant="outline"
            className="bg-[#2b2b2b] text-white px-4 py-2 rounded-lg shadow-md gap-2"
          >
            <GrUserNew />
            Update info
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Update KYC Information</DrawerTitle>
            <DrawerDescription>
              Fill in your details below to update your KYC information.
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-2 py-1 mt-1 border text-xs rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-2 py-1 mt-1 border text-xs rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-xs font-medium text-gray-700"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-2 py-1 mt-1 border text-xs rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-xs font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-2 py-1 mt-1 border text-xs rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-xs font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-2 py-1 mt-1 border text-xs rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="block text-xs font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-2 py-1 mt-1 border text-xs rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label
                  htmlFor="stateOrProvince"
                  className="block text-xs font-medium text-gray-700"
                >
                  State/Province
                </label>
                <input
                  type="text"
                  id="stateOrProvince"
                  name="stateOrProvince"
                  value={formData.stateOrProvince}
                  onChange={handleChange}
                  className="w-full px-2 py-1 mt-1 border text-xs rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label
                  htmlFor="postalOrZipCode"
                  className="block text-xs font-medium text-gray-700"
                >
                  Postal/ZIP Code
                </label>
                <input
                  type="text"
                  id="postalOrZipCode"
                  name="postalOrZipCode"
                  value={formData.postalOrZipCode}
                  onChange={handleChange}
                  className="w-full px-2 py-1 mt-1 border text-xs rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="country"
                  className="block text-xs font-medium text-gray-700"
                >
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-2 py-1 mt-1 border text-xs rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label
                  htmlFor="ssnOrSin"
                  className="block text-xs font-medium text-gray-700"
                >
                  SSN/SIN
                </label>
                <input
                  type="text"
                  id="ssnOrSin"
                  name="ssnOrSin"
                  value={formData.ssnOrSin}
                  onChange={handleChange}
                  className="w-full px-2 py-1 mt-1 border text-xs rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
              >
                Update KYC
              </Button>
              <DrawerClose>
                <Button variant="outline" className="mt-4">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default KYCForm;
