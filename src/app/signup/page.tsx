'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const nicknameRegex = /^[A-Za-z0-9가-힣]{2,8}$/;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nicknameRegex.test(nickname)) {
      alert('닉네임은 2~8자의 한글, 영어, 숫자만 가능합니다 (공백 불가)');
      return;
    }

    setLoading(true);

    // 1️⃣ Supabase Auth - 회원가입
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ 회원가입 실패:', error.message);
      alert('회원가입 실패: ' + error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      alert('회원 생성에 실패했습니다.');
      setLoading(false);
      return;
    }

    console.log('✅ 회원가입 성공:', user.id);

    let imageUrl = '';

    // 2️⃣ 파일 업로드
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_image')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ 이미지 업로드 실패:', uploadError.message);
        alert('이미지 업로드 실패: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('profile_image')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData?.publicUrl || '';
      console.log('✅ 업로드된 이미지 URL:', imageUrl);
    }

    // 3️⃣ profiles 테이블에 데이터 삽입
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: user.id,
        nickname,
        bio, 
        profile_image: imageUrl,
      },
    ]);

    if (profileError) {
      console.error('❌ 프로필 생성 실패:', profileError.message);
      alert('프로필 생성 실패: ' + profileError.message);
    } else {
      console.log('✅ 프로필 생성 완료');
      alert('회원가입 완료!');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-xl font-semibold">회원가입</h1>
      <form onSubmit={handleSignUp} className="flex flex-col gap-2 w-64">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="닉네임 (2~8자, 공백 불가)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <textarea
          placeholder="한 줄 소개"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="border p-2 rounded resize-none"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </div>
  );
}
