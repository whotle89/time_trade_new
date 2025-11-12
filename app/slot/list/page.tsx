'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SlotListPage() {
  const router = useRouter();
  const [mySlots, setMySlots] = useState<any[]>([]);
  const [publicSlots, setPublicSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);

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

      // ✅ 다른 사람들의 공개 슬롯
      const { data: publicData, error: publicError } = await supabase
        .from('time_slots')
        .select('*')
        .neq('user_id', user.id)
        .eq('is_active', true)
        .order('start_time', { ascending: true });

      if (publicError) console.error('❌ 공개 슬롯 조회 실패:', publicError.message);
      else setPublicSlots(publicData || []);

      setLoading(false);
    };

    fetchSlots();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 bg-zinc-50">
      <h1 className="text-2xl font-semibold mb-6 text-center">시간 리스트</h1>

      {/* ✅ 내 슬롯 목록 */}
      <section className="mb-10">
        <h2 className="text-lg font-medium mb-3 text-green-600">내가 등록한 시간</h2>
        {mySlots.length === 0 ? (
          <p className="text-gray-500 text-sm">등록한 시간이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {mySlots.map((slot) => (
              <li
                key={slot.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200"
              >
                <h3 className="font-semibold text-lg">{slot.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{slot.description}</p>
                <p className="text-sm text-gray-500">
                  🕒 {new Date(slot.start_time).toLocaleString()} ~{' '}
                  {new Date(slot.end_time).toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-500">📍 {slot.location || '장소 미정'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ✅ 공개 슬롯 목록 */}
      <section>
        <h2 className="text-lg font-medium mb-3 text-blue-600">공개된 시간 슬롯</h2>
        {publicSlots.length === 0 ? (
          <p className="text-gray-500 text-sm">아직 공개된 슬롯이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {publicSlots.map((slot) => (
              <li
                key={slot.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200"
              >
                <h3 className="font-semibold text-lg">{slot.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{slot.description}</p>
                <p className="text-sm text-gray-500">
                  🕒 {new Date(slot.start_time).toLocaleString()} ~{' '}
                  {new Date(slot.end_time).toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-500">📍 {slot.location || '장소 미정'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
