"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuickAddModal } from "./QuickAddModal";

/**
 * Quick Add Card Component
 *
 * Provides a prominent CTA button to quickly add new contacts
 * Opens the QuickAddModal when clicked
 */
export function QuickAddCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-green-900 dark:text-green-100">Quick Add</CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Add a new contact to your network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            data-testid="quick-add-button"
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Quick Add Contact
          </Button>
        </CardContent>
      </Card>

      <QuickAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
