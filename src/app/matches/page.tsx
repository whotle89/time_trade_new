'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/layout/BottomNav';


export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      // ✅ 내가 포함된 매칭 리스트 가져오기
      const { data, error } = await supabase
        .from('time_matches')
        .select(`
          id,
          slot_id,
          user_id,
          partner_id,
          confirmed_at,
          time_slots(title, start_time, end_time, location),
          profiles!time_matches_partner_id_fkey(nickname, profile_image)
        `)
        .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`)
        .order('confirmed_at', { ascending: false });

      if (error) console.error('❌ 매칭 조회 실패:', error.message);
      else setMatches(data || []);

      setLoading(false);
    };

    fetchMatches();
  }, [router]);

  // ✅ 채팅 이동 함수
  const goToChat = async (slotId: string, hostId: string, guestId: string) => {
        // ✅ 채팅방 존재 확인
        const { data: existingChat } = await supabase
        .from('time_chats')
        .select('id')
        .eq('slot_id', slotId)
        .eq('host_id', hostId)
        .eq('guest_id', guestId)
        .single();

        if (existingChat) {
        router.push(`/chat/${existingChat.id}`);
        return;
        }

        // ✅ 없으면 새 채팅방 생성
        const { data: newChat, error } = await supabase
        .from('time_chats')
        .insert([
            {
            slot_id: slotId,
            host_id: hostId,
            guest_id: guestId,
            },
        ])
        .select('id')
        .single();

        if (error) {
        console.error('❌ 채팅방 생성 실패:', error.message);
        alert('채팅방 생성 중 오류 발생');
        return;
        }

        router.push(`/chat/${newChat.id}`);
        };
        
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );

  return (
    <>
    <div className="min-h-screen px-6 py-8 pb-20 bg-zinc-50">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        내 매칭 리스트
      </h1>

      {matches.length === 0 ? (
        <p className="text-center text-gray-500">
          아직 매칭된 거래가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {matches.map((match) => (
            <li
              key={match.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-lg text-gray-800">
                  {match.profiles?.nickname || '상대방'}
                </p>
                <p className="text-sm text-gray-500">
                  {match.time_slots?.title}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(match.confirmed_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() =>
                  goToChat(
                    match.slot_id,
                    match.user_id,
                    match.partner_id
                  )
                }
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
              >
                채팅하기
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
    {/* ✅ 하단 고정 BNB */}
    <BottomNav />
    </>
  );
}
