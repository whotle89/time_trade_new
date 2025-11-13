"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"

export default function ReminderCreatePage() {
  const router = useRouter()
  const [date, setDate] = useState("")
  const [content, setContent] = useState("")
  const [isImportant, setIsImportant] = useState(false)

  const handleSubmit = async () => {
    if (!date || !content.trim()) {
      alert("날짜와 내용을 입력해주세요.")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      alert("로그인이 필요합니다.")
      router.push("/login")
      return
    }

    const { error } = await supabase.from("reminders").insert([
      {
        user_id: user.id,
        date,
        content,
        status: isImportant ? "important" : "normal", // ✅ 중요 일정 여부 반영
      },
    ])

    if (error) {
      console.error("❌ 일정 등록 실패:", error.message)
      alert("등록 중 오류가 발생했습니다.")
    } else {
      alert("✅ 일정이 등록되었습니다.")
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-[#F8F9FB]">
      <h1 className="text-2xl font-semibold mb-6 text-center text-[var(--brand-primary)]">
        일정 등록하기
      </h1>

      {/* 날짜 선택 */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
      />

      {/* 일정 내용 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="일정 내용을 입력하세요"
        className="border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full max-w-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
      />

      {/* 중요 체크 */}
      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={isImportant}
          onChange={(e) => setIsImportant(e.target.checked)}
          className="w-4 h-4 accent-[var(--brand-primary)]"
        />
        <span className="text-sm text-gray-700 font-medium">중요 일정으로 등록</span>
      </label>

      {/* 저장 버튼 */}
      <button
        onClick={handleSubmit}
        className="bg-[var(--brand-primary)] text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 w-full max-w-sm"
      >
        저장하기
      </button>
    </div>
  )
}
