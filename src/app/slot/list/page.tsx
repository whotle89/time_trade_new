'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/layout/BottomNav';

export default function SlotListPage() {
  const router = useRouter();
  const [mySlots, setMySlots] = useState<any[]>([]);
  const [publicSlots, setPublicSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedSlots, setRequestedSlots] = useState<string[]>([]);

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

      // ✅ 내가 이미 신청한 슬롯 ID 리스트 가져오기
      const { data: requested } = await supabase
        .from('time_request')
        .select('slot_id')
        .eq('requester_id', user.id);

      setRequestedSlots(requested?.map((r) => r.slot_id) || []);

      setLoading(false);
    };

    fetchSlots();
  }, [router]);

  // ✅ 신청 처리 함수
  const handleRequest = async (slotId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('time_request').insert([
      {
        slot_id: slotId,
        requester_id: user.id,
        message: '함께하고 싶어요!',
        status: 'pending',
      },
    ]);

    if (error) {
      console.error('❌ 신청 실패:', error.message);
      alert('신청 실패: ' + error.message);
    } else {
      alert('✅ 신청이 완료되었습니다!');
      // ✅ 상태 업데이트
      setRequestedSlots((prev) => [...prev, slotId]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  const goToRequestList = () => {
    router.push('/request'); // ✅ 요청 리스트 페이지로 이동
  };
  const goToSlotCreate = () => {
    router.push('/slot/create'); // ✅ 시간 등록 페이지로 이동
  };
  const goToProfile = () => {
    router.push('/profile'); // ✅ 프로필 페이지로 이동
  };
  // 로그아웃 기능
  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' }); // ✅ 로컬 세션까지 전부 삭제
    localStorage.clear(); // ✅ 혹시 남은 토큰 직접 제거
    sessionStorage.clear();
    router.push('/login');
  };

  return (
    <>
      <div className="min-h-screen px-6 py-8 pb-20 bg-zinc-50">
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

                  {requestedSlots.includes(slot.id) ? (
                    <button
                      disabled
                      className="mt-3 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                    >
                      수락 대기중
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRequest(slot.id)}
                      className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      신청하기
                    </button>
                  )}

                </li>
              ))}
            </ul>
          )}
        </section>
        <div className="flex justify-center">
          <button
            onClick={goToRequestList}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            받은요청 리스트로 이동
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={goToSlotCreate}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            시간등록하기
          </button>
          <button
            onClick={handleLogout}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            로그아웃
          </button>
          <button
            onClick={goToProfile}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            프로필 바로가기
          </button>
        </div>
      </div>
      {/* ✅ 하단 고정 BNB */}
      <BottomNav />
    </>
  );
}
