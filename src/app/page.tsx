'use client';

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import Image from "next/image";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Calendar, Bell } from "lucide-react"
import { useUserProfile } from "../hook/useUserProfile"
import BottomNav from "../components/layout/BottomNav";

console.log("✅ Supabase 연결 성공:", supabase);

export default function HomePage() {
  const router = useRouter()
  const { profile, loading } = useUserProfile()
  const [mySlots, setMySlots] = useState<any[]>([]);
  const [publicSlots, setPublicSlots] = useState<any[]>([]);
  const [requestedSlots, setRequestedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const goToSlotCreate = () => {
    router.push('/slot/create'); // ✅ 시간 등록 페이지로 이동
  };
  const goToMatches = () => {
    router.push("/matches")
  }

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);

      // 현재 로그인한 유저 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      // ✅ 내가 등록한 슬롯
      const { data: myData, error: myError } = await supabase
        .from('time_slots')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (myError) console.error('❌ 내 슬롯 조회 실패:', myError.message);
      else setMySlots(myData || []);

      // ✅ 내가 이미 신청한 슬롯 ID 리스트 가져오기
      const { data: requested } = await supabase
        .from('time_request')
        .select('slot_id')
        .eq('requester_id', user.id);

      setRequestedSlots(requested?.map((r) => r.slot_id) || []);

      setIsLoading(false);
    };
    fetchSlots();
  }, [router]);

  return (
    <>
    <main className="min-h-screen bg-[#F8F9FB] flex flex-col pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/Logo.png" // 로고 이미지 경로
            alt="로고"
            width={120}
            height={40}
          />
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          {/* 캘린더 아이콘 (시간등록) */}
          <Button
            variant="default"
            size="small"
            className="w-9 h-9 rounded-full bg-[#FEF1F6] hover:bg-[#FEDEE9] transition-colors"
          >
            <Calendar className="w-5 h-5 text-[#FE398E]" />
          </Button>

          {/* 종 아이콘 (예약내역) */}
          <Button
            variant="default"
            size="small"
            className="w-9 h-9 rounded-full bg-[#F2F4F7] hover:bg-[#E6E8EA] transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
          </Button>

          {/* 마이페이지 썸네일 */}
          <button
            onClick={() => router.push("/profile")}
            className="w-9 h-9 rounded-full overflow-hidden border border-gray-200"
          >
            {loading ? (
              <div className="w-9 h-9 bg-gray-100 animate-pulse" />
            ) : profile?.profile_image ? (
              <Image
                src={profile.profile_image}
                alt="프로필 이미지"
                width={36}
                height={36}
                className="object-cover"
              />
            ) : (
              <div className="w-9 h-9 flex items-center justify-center text-gray-400 text-xs bg-gray-100">
                N/A
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Banner Section */}
      <section className="px-6 py-4">
        <div className="w-full bg-gradient-to-r from-[#FFD6E8] to-[#FFEEF5] rounded-2xl p-6">
          <p className="text-[#FE398E] font-bold text-xl mb-2 h-15">
            첫 초대 모임, 우리가 응원해요 🎁
          </p>
          <p className="text-gray-600 text-sm">
            모임을 등록시 특별한 선물 증정
          </p>
        </div>
      </section>

      {/* 내 시간 등록 버튼 */}
      <section className="px-6 mt-2">
        <Button
          onClick={goToSlotCreate}
          className="w-full h-14 rounded-xl bg-[var(--brand-primary)] text-white font-semibold text-lg shadow-md hover:opacity-90"
        >
          내 시간 등록하기
        </Button>
      </section>

      {/* 리마인더 영역 */}
      <section className="flex-1 px-6 py-6">
        <h2 className="text-lg font-bold mb-4">리마인더</h2>

        {/* 상단 4개 상태 카드 */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { title: "오늘", color: "bg-[#FE398E]" },
            { title: "예정", color: "bg-[#739EEC]" },
            { title: "중요", color: "bg-[#FFD966]" },
            { title: "완료", color: "bg-[#A0C4FF]" },
          ].map((item) => (
            <div
              key={item.title}
              className={`flex flex-col items-center justify-center h-20 rounded-xl ${item.color} bg-opacity-20 text-gray-700 font-semibold`}
            >
              <span>{item.title}</span>
              <span className="text-lg mt-1 font-bold">0</span>
            </div>
          ))}
        </div>
        <Button
          onClick={goToSlotCreate}
          className="w-full h-14 rounded-xl bg-[var( --brand-secondary)] text-black font-semibold text-lg shadow-md hover:opacity-90"
        >
          + 내 일정 기록하기
        </Button>
      </section>
      <section className="mt-2">
        {/* ✅ 내 슬롯 목록 */}
        <section className="mb-10 px-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-green-600">내가 등록한 시간</h2>
            {/* ✅ 신청자 확인하기 버튼 */}
            <button
              onClick={goToMatches}
              className="text-sm bg-[var(--brand-primary)] text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-colors"
            >
              신청자 확인하기
            </button>
          </div>
          {mySlots.length === 0 ? (
            <p className="text-gray-500 text-sm">등록한 시간이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {mySlots.map((slot) => (
                <li
                  key={slot.id}
                  className="w-full h-auto rounded-xl p-4 flex flex-col justify-between
                bg-[var(--cta-primary)]
                text-black
                font-semibold
                text-lg
                shadow-md
                hover:opacity-90"
                >
                  <h3 className="font-semibold text-lg">{slot.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{slot.description}</p>
                  <p className="text-sm text-gray-500">
                    🕒{" "}
                    {new Date(slot.start_time).toLocaleString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ~{" "}
                    {new Date(slot.end_time).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm text-gray-500">📍 {slot.location || '장소 미정'}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  {/* ✅ 하단 고정 네비게이션 */ }
  <BottomNav />
  </>
  )
}