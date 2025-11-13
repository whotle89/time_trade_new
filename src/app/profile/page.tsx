'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // 로그인된 유저 세션 가져오기
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      setUser(user);

      // profiles 테이블에서 유저 정보 불러오기
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, bio, profile_image')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ 프로필 불러오기 실패:', error.message);
      } else {
        console.log('✅ 프로필 데이터:', data);
        setProfile(data);
      }
    };

    getUser();
  }, [router]);

  // 로그아웃 기능
  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' }); // ✅ 로컬 세션까지 전부 삭제
    localStorage.clear(); // ✅ 혹시 남은 토큰 직접 제거
    sessionStorage.clear();
    router.push('/login');
  };

  const goToSlotCreate = () => {
    router.push('/slot/create'); // ✅ 시간 등록 페이지로 이동
  };
  const goToRequestList = () => {
    router.push('/request'); // ✅ 요청 리스트 페이지로 이동
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-semibold mb-4">내 프로필</h1>

      {profile.profile_image ? (
        <Image
          src={profile.profile_image}
          alt="프로필 이미지"
          width={120}
          height={120}
          className="rounded-full border"
        />
      ) : (
        <div className="w-[120px] h-[120px] bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}

      <div className="text-center">
        <p className="text-lg font-medium">{profile.nickname}</p>
        <p className="text-gray-500 text-sm">{profile.bio || '소개가 없습니다.'}</p>
      </div>

      <button
          onClick={goToRequestList}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          받은요청 리스트로 이동
      </button>

      <div className="flex justify-center">
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        로그아웃
      </button>

      <button
        onClick={goToSlotCreate}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        시간등록하기
      </button>
      </div>
    </div>
  );
}
