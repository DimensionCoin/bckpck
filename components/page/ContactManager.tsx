"use client";

import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { FaCheckCircle, FaTrashAlt } from "react-icons/fa";
import { GrUserNew } from "react-icons/gr";


interface Contact {
  id: number;
  contactUsername: string;
  contactWalletAddress: string;
  isFavorite: boolean;
  avatarUrl?: string;
}

const ContactManager = () => {
  const { user } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactUsername, setContactUsername] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user?.username }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleAddContact = async () => {
    try {
      const response = await fetch("/api/contacts/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactUsername,
          isFavorite,
        }),
      });

      if (response.ok) {
        const newContact = await response.json();
        setContacts((prevContacts) => [...prevContacts, newContact.contact]);
        setContactUsername("");
        setIsFavorite(false);
      } else {
        console.error("Failed to add contact");
      }
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  const handleRemoveContact = async (contactId: number) => {
    try {
      const response = await fetch("/api/contacts/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactId }),
      });

      if (response.ok) {
        setContacts((prevContacts) =>
          prevContacts.filter((contact) => contact.id !== contactId)
        );
      } else {
        console.error("Failed to remove contact");
      }
    } catch (error) {
      console.error("Error removing contact:", error);
    }
  };

  useEffect(() => {
    if (user && user.username) {
      // Only fetch contacts if the user is loaded and has a username
      fetchContacts();
    }
  }, [user]);

  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <Button
            variant="outline"
            className="bg-[#2b2b2b] text-white px-4 py-2 rounded-lg shadow-md gap-2"
          >
            <GrUserNew />
            Contacts
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Manage Contacts
          </h3>
          {/* Section to add a new contact */}
          <div className="border-b pb-4 mb-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">
              Add a New Contact
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                value={contactUsername}
                onChange={(e) => setContactUsername(e.target.value)}
                placeholder="Contact Username"
                className="input input-bordered w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300 transition duration-300"
              />
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={() => setIsFavorite(!isFavorite)}
                  className="mr-2"
                />
                <span className="text-sm">Mark as Favorite</span>
              </label>
              <Button
                onClick={handleAddContact}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
              >
                Add Contact
              </Button>
            </div>
          </div>

          {/* Section to list existing contacts */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3">
              Your Contacts
            </h4>
            <ul className="space-y-2">
              {contacts.map((contact) => (
                <li
                  key={contact.id}
                  className="flex justify-between items-center p-3 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition duration-300"
                >
                  <div className="flex items-center">
                    {contact.avatarUrl ? (
                      <img
                        src={contact.avatarUrl}
                        alt={`${contact.contactUsername}'s avatar`}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                        <span className="text-sm text-white">
                          {contact.contactUsername.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-800">
                      {contact.contactUsername}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {contact.isFavorite && (
                      <FaCheckCircle className="text-green-500" />
                    )}
                    <FaTrashAlt
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleRemoveContact(contact.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ContactManager;
