'use client';

import { supabase } from '../../lib/supabaseClient';
import { useEffect } from 'react';

export default function TestSlotInsert() {
  useEffect(() => {
    const insertTestSlot = async () => {
      // 로그인한 유저 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ 로그인 필요');
        return;
      }

      // time_slots 테이블에 등록
      const { data, error } = await supabase.from('time_slots').insert([
        {
          user_id: user.id,
          title: '☕ 카페에서 아이디어 브레인스토밍',
          description: '같이 커피 마시며 사이드프로젝트 아이디어 얘기해요',
          start_time: '2025-11-13T14:00:00+09:00',
          end_time: '2025-11-13T15:30:00+09:00',
          location: '성수 카페거리',
          is_active: true,
        },
      ]);

      if (error) console.error('❌ 슬롯 등록 실패:', error.message);
      else console.log('✅ 슬롯 등록 성공:', data);
    };

    insertTestSlot();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-xl font-semibold">슬롯 등록 테스트 중...</h1>
    </div>
  );
}
