"use client"

import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import { supabase } from "../../../lib/supabaseClient"
import { format, isSameDay, parseISO } from "date-fns"
import { ko } from "date-fns/locale/ko"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { useRouter } from "next/navigation"

export default function ReminderCalendarPage() {
    const [reminders, setReminders] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newContent, setNewContent] = useState("")
    const [isImportant, setIsImportant] = useState(false)
    const router = useRouter()

    // ✅ ⬇️ 여기에 handleSaveReminder 함수 추가
    const handleSaveReminder = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!newContent.trim()) {
            alert("일정 내용을 입력하세요.");
            return;
        }

        const date = selectedDate
            ? format(selectedDate, "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd");

        const { error } = await supabase.from("reminders").insert({
            user_id: user.id,
            date,
            content: newContent,
            status: isImportant ? "important" : "pending",
        });

        if (error) {
            console.error("❌ 일정 저장 실패:", error.message);
            alert("일정 저장에 실패했습니다.");
        } else {
            alert("✅ 일정이 추가되었습니다!");

            // ✅ 로컬 상태에 즉시 반영
            const newReminder = {
                user_id: user.id,
                date,
                content: newContent,
                status: isImportant ? "important" : "pending",
            };
            setReminders((prev) => [...prev, newReminder]);

            setIsDialogOpen(false);
            setNewContent("");
            setIsImportant(false);
        }
    };

    useEffect(() => {
        const fetchReminders = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from("reminders")
                .select("*")
                .eq("user_id", user.id)
                .neq("status", "done") // 완료 일정 제외
                .order("date", { ascending: true })

            if (error) console.error(error)
            else setReminders(data || [])
        }

        fetchReminders()
    }, [])

    const dailyReminders = reminders.filter((r) =>
        isSameDay(parseISO(r.date), selectedDate)
    )

    return (
        <div className="min-h-screen bg-[#F8F9FB] p-6">
            <h1 className="text-xl font-semibold mb-4 text-[var(--brand-primary)]">
                일정 캘린더
            </h1>

            {/* ✅ 달력 영역 */}
            <div className="flex justify-center mb-6 overflow-visible">
                <Calendar
                    onChange={(value) => setSelectedDate(value as Date)}
                    value={selectedDate}
                    locale="ko"
                    tileContent={({ date, view }) => {
                        if (view === "month") {
                            const daily = reminders.filter((r) => isSameDay(parseISO(r.date), date))
                            if (daily.length > 0) {
                                // 상태에 따라 색상 구분
                                const color = daily.some((r) => r.status === "important")
                                    ? "#FFD966" // 중요
                                    : daily.some((r) => r.status === "done")
                                        ? "#A0A0A0" // 완료
                                        : "#FE398E" // 일반
                                return (
                                    <div
                                        className="w-2 h-2 mt-1 mx-auto rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                )
                            }
                        }
                    }}
                    tileClassName={({ date, view }) => {
                        if (isSameDay(date, selectedDate)) return "bg-[#FFE6EE] rounded-lg"
                    }}
                    className="rounded-lg shadow-md bg-white p-4"
                />
            </div>

            {/* ✅ 선택된 날짜의 일정 표시 */}
            <div>
                <h2 className="text-lg font-medium mb-2">
                    {format(selectedDate, "M월 d일 (E)", { locale: ko })} 일정
                </h2>

                {dailyReminders.length === 0 ? (
                    <p className="text-gray-500 text-sm">등록된 일정이 없습니다.</p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {dailyReminders.map((r) => (
                            <li
                                key={r.id}
                                className="bg-white rounded-xl shadow p-4 flex flex-col gap-1"
                            >
                                <p className="font-semibold">{r.content}</p>
                                <p className="text-sm text-gray-500">
                                    📅 {r.date} / 상태: {r.status}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <Button
                className="w-full bg-[#FE398E] text-white rounded-lg mt-4"
                onClick={() => setIsDialogOpen(true)}
            >
                일정 추가하기
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md w-[90%] bg-white rounded-xl shadow-xl p-6 border border-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-gray-800">일정 추가</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-2">
                        <Input
                            placeholder="일정 내용을 입력하세요"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={isImportant}
                                onChange={(e) => setIsImportant(e.target.checked)}
                                className="accent-[#FE398E]"
                            />
                            중요 일정으로 표시
                        </label>
                    </div>

                    <DialogFooter>
                        <Button
                            className="w-full bg-[#FE398E] text-white rounded-lg mt-4 hover:opacity-90"
                            onClick={handleSaveReminder}
                        >
                            저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Button
                className="w-full bg-[#dbdbdb] text-white rounded-lg mt-4"
                onClick={() => router.push("/")}
            >
                홈으로 돌아가기
            </Button>
        </div>
    )
}
