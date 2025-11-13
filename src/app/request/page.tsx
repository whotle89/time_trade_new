'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ 신청 내역 조회
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }


      // ✅ 내가 등록한 슬롯 가져오기
      const { data: mySlots, error: slotError } = await supabase
        .from('time_slots')
        .select('id')
        .eq('user_id', user.id);

      if (slotError) {
        console.error('❌ 슬롯 조회 실패:', slotError.message);
        setLoading(false);
        return;
      }

      const mySlotIds = mySlots?.map((s) => s.id) || [];
      if (mySlotIds.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // ✅ 내 슬롯에 들어온 요청들 (대기중만)
      const { data, error } = await supabase
        .from('time_request')
        .select(`
          id,
          slot_id,
          requester_id,
          message,
          status,
          created_at,
          time_slots(title, start_time, end_time, location),
          profiles(nickname, profile_image)
        `)
        .in('slot_id', mySlotIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) console.error('❌ 요청 조회 실패:', error.message);
      else setRequests(data || []);

      setLoading(false);
    };

    fetchRequests();
  }, [router]);

  // ✅ 요청 상태 업데이트 + 매칭/채팅 생성
  const updateRequestStatus = async (
    reqId: string,
    newStatus: 'approved' | 'rejected',
    slotId: string,
    requesterId: string
  ): Promise<void> => {
    // ✅ 1️⃣ 요청 상태 업데이트
    const { error: updateError } = await supabase
      .from('time_request')
      .update({ status: newStatus })
      .eq('id', reqId);

    if (updateError) {
      console.error('❌ 상태 변경 실패:', updateError.message);
      alert('변경 실패: ' + updateError.message);
      return;
    }

    // ✅ 2️⃣ 수락 시: 매칭 및 채팅 자동 생성
    if (newStatus === 'approved') {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // time_matches 생성
      const { data: matchData, error: matchError } = await supabase
        .from('time_matches')
        .insert([
          {
            slot_id: slotId,
            user_id: user.id,
            partner_id: requesterId,
            confirmed_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (matchError) {
        console.error('❌ 매칭 생성 실패:', matchError.message);
        alert('매칭 생성 실패: ' + matchError.message);
        return;
      }

      // time_chats 생성
      const { error: chatError } = await supabase.from('time_chats').insert([
        {
          slot_id: slotId,
          host_id: user.id,
          guest_id: requesterId,
          created_at: new Date().toISOString(),
        },
      ]);

      if (chatError) {
        console.error('❌ 채팅 생성 실패:', chatError.message);
        alert('채팅 생성 실패: ' + chatError.message);
        return;
      }

      console.log('✅ 매칭/채팅 생성 완료:', matchData);
    }

    // ✅ 3️⃣ UI 즉시 반영 (리스트에서 제거)
    setRequests((prev) => prev.filter((r) => r.id !== reqId));

    alert(
      newStatus === 'approved'
        ? '✅ 요청이 수락되어 매칭이 생성되었습니다.'
        : '❌ 요청이 거절되었습니다.'
    );
  };
  const goTolist = () => {
    router.push('/slot/list'); // ✅ 시간 리스트 페이지로 이동
  };

  // ✅ 로딩 중 표시
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 bg-zinc-50">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        내 슬롯에 들어온 신청 내역
      </h1>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500">
          아직 들어온 신청이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {requests.map((req) => (
            <li
              key={req.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    {req.profiles?.nickname || '알 수 없는 사용자'}
                  </p>
                  <p className="text-sm text-gray-600">{req.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p className="font-medium">{req.time_slots?.title}</p>
                  <p>
                    🕒{' '}
                    {new Date(req.time_slots?.start_time).toLocaleTimeString()} ~{' '}
                    {new Date(req.time_slots?.end_time).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() =>
                    updateRequestStatus(
                      req.id,
                      'approved',
                      req.slot_id,
                      req.requester_id
                    )
                  }
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  수락
                </button>
                <button
                  onClick={() =>
                    updateRequestStatus(
                      req.id,
                      'rejected',
                      req.slot_id,
                      req.requester_id
                    )
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  거절
                </button>
              </div>
            </li>
            
          ))}
        </ul>
      )}
      <div className="flex justify-center">
      <button
          onClick={goTolist}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          리스트로 돌아가기
        </button>
      </div>
    </div>
  );
}
