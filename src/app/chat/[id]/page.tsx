'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);


  // ✅ 유저 정보 + 기존 메시지 불러오기
  useEffect(() => {
    const fetchChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data } = await supabase
        .from('time_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    };

    fetchChat();

    // ✅ 실시간 메시지 구독
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'time_messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // ✅ 메시지가 바뀔 때마다 자동 스크롤 (핵심)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ 메시지 전송 함수
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!user) return;

    // 화면에 즉시 표시할 임시 메시지
    const tempMessage = {
      id: `temp-${Date.now()}`,
      chat_id: chatId,
      sender_id: user.id,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    const { error } = await supabase.from('time_messages').insert([
      {
        chat_id: chatId,
        sender_id: user.id,
        message: newMessage.trim(),
      },
    ]);

    if (error) {
      console.error('메시지 전송 실패:', error.message);
      return;
    }

    setNewMessage('');
  };

  // ✅ 렌더링
  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* 🗨️ 채팅 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg max-w-[70%] ${
              msg.sender_id === user?.id
                ? 'ml-auto bg-blue-500 text-white'
                : 'mr-auto bg-gray-200 text-gray-800'
            }`}
          >
            {msg.message}
          </div>
        ))}

        {/* 👇 자동 스크롤 기준점 (핵심) */}
        <div ref={messagesEndRef} />
      </div>

      {/* ✉️ 메시지 입력창 */}
      <div className="flex p-3 border-t bg-white">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 border rounded px-3 py-2 mr-2"
          placeholder="메시지를 입력하세요..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          전송
        </button>
      </div>
    </div>
  );
}