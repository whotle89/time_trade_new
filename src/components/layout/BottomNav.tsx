"use client"

import { usePathname, useRouter } from "next/navigation"

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const menus = [
    { label: "홈", icon: "home", path: "/" },
    { label: "시간구매", icon: "schedule", path: "/slot/list" },
    { label: "채팅", icon: "chat_bubble", path: "/matches" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-50">
      {menus.map((item) => {
        const active = pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center justify-center text-xs transition-colors ${
              active ? "text-[var(--brand-primary)] font-semibold" : "text-gray-500"
            }`}
          >
            <span className="material-symbols-rounded text-[24px] mb-0.5">
              {item.icon}
            </span>
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
