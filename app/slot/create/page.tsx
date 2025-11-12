'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CreateSlotPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('time_slots').insert([
      {
        user_id: user.id,
        title,
        description,
        location,
        start_time: startTime,
        end_time: endTime,
        is_active: true,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error('❌ 시간 등록 실패:', error.message);
      alert('등록 실패: ' + error.message);
    } else {
      alert('✅ 시간 등록 완료!');
      router.push('/profile'); // 등록 후 이동할 경로 (원하면 /slot/list로 변경 가능)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">시간 등록</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <textarea
          placeholder="설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded resize-none"
        />
        <input
          type="text"
          placeholder="장소"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 rounded"
        />
        <label className="flex flex-col text-sm text-gray-700">
          시작 시간
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border p-2 rounded"
            required
          />
        </label>
        <label className="flex flex-col text-sm text-gray-700">
          종료 시간
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border p-2 rounded"
            required
          />
        </label>

        <button
          type="submit"
          className="bg-green-500 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </form>
    </div>
  );
}
