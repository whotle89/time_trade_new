"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import Link from "next/link"

export default function ReminderListPage() {
    const searchParams = useSearchParams()
    const filter = searchParams.get("filter")
    const [reminders, setReminders] = useState<any[]>([])

    const filterLabel =
        filter === "today"
            ? "오늘 일정"
            : filter === "upcoming"
                ? "예정 일정"
                : filter === "important"
                    ? "중요 일정"
                    : filter === "done"
                        ? "완료 일정"
                        : "전체 일정"

    // ✅ 일정 데이터 불러오기
    const fetchReminders = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split("T")[0]
        // ✅ 공통 기본 쿼리 (완료 제외)
        let query = supabase
            .from("reminders")
            .select("*")
            .eq("user_id", user.id)
            .neq("status", "done")

        if (filter === "today") query = query.eq("date", today)
        if (filter === "upcoming") query = query.gt("date", today)
        if (filter === "important") query = query.eq("status", "important")
        if (filter === "done")
            query = supabase
                .from("reminders")
                .select("*")
                .eq("user_id", user.id)
                .eq("status", "done") // 완료 탭일 땐 done만 따로 불러오기

        const { data, error } = await query.order("date", { ascending: true })
        if (error) console.error(error)
        else setReminders(data || [])
    }

    useEffect(() => {
        fetchReminders()
    }, [filter])

    // ✅ 완료 처리 함수
    const handleMarkDone = async (id: string) => {
        const { error } = await supabase
            .from("reminders")
            .update({ status: "done" })
            .eq("id", id)

        if (error) {
            console.error("업데이트 실패:", error)
            alert("업데이트 중 오류가 발생했습니다.")
        } else {
            alert("✅ 일정이 완료로 변경되었습니다.")
            // ✅ 완료 탭이면 다시 불러오기, 아니면 즉시 제거
            if (filter === "done") {
                fetchReminders()
            } else {
                setReminders((prev) => prev.filter((r) => r.id !== id))
            }
        }
    }


    return (
        <div className="min-h-screen bg-[#F8F9FB] p-6">
            <h1 className="text-xl font-semibold mb-4 text-[var(--brand-primary)]">
                {filterLabel}
            </h1>

            {reminders.length === 0 ? (
                <p className="text-gray-500 text-sm">해당 일정이 없습니다.</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {reminders.map((r) => (
                        <li
                            key={r.id}
                            className="bg-white rounded-xl shadow p-4 flex flex-col gap-2"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{r.content}</p>
                                    <p className="text-sm text-gray-500">
                                        📅 {r.date} / 상태: {r.status}
                                    </p>
                                </div>

                                {/* ✅ 완료 버튼 */}
                                {r.status !== "done" && (
                                    <button
                                        onClick={() => handleMarkDone(r.id)}
                                        className="text-xs bg-[#FE398E] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition"
                                    >
                                        완료하기
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Link
                href="/"
                className="block mt-8 text-center text-sm text-gray-500 hover:text-[var(--brand-primary)]"
            >
                ← 홈으로 돌아가기
            </Link>
        </div>
    )
}