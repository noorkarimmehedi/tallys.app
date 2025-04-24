import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import FormsGrid from "@/components/dashboard/FormsGrid";

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Your Forms</h2>
          <p className="mt-1 text-sm text-gray-500">Create and manage all your forms</p>
        </div>
        <div className="flex gap-3">
          <Link href="/form-builder">
            <Button className="bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
              <i className="ri-file-list-3-line mr-2"></i>
              Create Form
            </Button>
          </Link>
          <Link href="/event-builder/new">
            <Button className="bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
              <i className="ri-calendar-line mr-2"></i>
              Create Event
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Forms Grid */}
      <FormsGrid />
    </div>
  );
}
