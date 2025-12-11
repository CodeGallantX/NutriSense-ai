/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"

type User = {
  name?: string | undefined
  email?: string | undefined
  avatar?: string | undefined
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | undefined>(undefined)

  // No fetches for user or documents

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <>
        <div
          className={`
            fixed inset-y-0 left-0 z-50 
            lg:sticky lg:top-0 lg:z-auto
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} user={user} />

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}