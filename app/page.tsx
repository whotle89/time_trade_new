'use client';

import Image from "next/image";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

console.log("✅ Supabase 연결 성공:", supabase);

export default function Home() {
  useEffect(() => {
    const fetchUsers = async () => {
      // ✅ 새 유저 추가
      await supabase.from("users").insert([{ nickname: "멜론맛백설기기" }]);

      // ✅ 유저 전체 조회      
      const { data, error } = await supabase.from("users").select("*");
      if (error) console.error("❌ 오류 발생:", error);
      else console.log("✅ users 데이터:", data);
    };
    fetchUsers();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <h1>Supabase 연결 + 데이터 테스트</h1>
    </div>
  );
}