import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  status?: 'normal' | 'success' | 'fail' | 'error'; // ★ 색 결정용
}

interface Quest {
  id: number;
  title: string;
  content: string;
}

interface ChatInterfaceProps {
  mode: 'talk' | 'quest';
  setMode: (mode: 'talk' | 'quest') => void;
  onQuestComplete: () => void;
}

const ChatInterface = ({ mode, setMode, onQuestComplete }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "안녕하세요! VeriBot입니다. 👋\n자유롭게 대화하거나, 오른쪽에서 퀘스트를 선택해 도전해보세요!", 
      sender: 'bot',
      status: 'normal'
    }
  ]);
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 모드 변경 감지
  useEffect(() => {
    if (mode === 'quest') {
      fetchCurrentQuest();
    } else {
      setCurrentQuest(null);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "💬 [스몰토크 모드] 편하게 영어로 대화해요!", 
        sender: 'bot',
        status: 'normal'
      }]);
    }
  }, [mode]);

  // 스크롤 자동 하단 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 디버깅용 (원하면 잠깐 켜서 확인)
  // useEffect(() => {
  //   console.log('messages 상태:', messages);
  // }, [messages]);

  // 현재 퀘스트 가져오기
  const fetchCurrentQuest = async () => {
    try {
      const res = await api.get('/quests/current');
      
      if (res.data) {
        const quest: Quest = res.data;
        setCurrentQuest(quest);
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: `📝 [${quest.title}]\n\n${quest.content}`, 
          sender: 'bot',
          status: 'normal'
        }]);
      } else {
        setCurrentQuest(null);
      }
    } catch (error) {
      console.error("퀘스트 로드 실패", error);
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { 
      id: Date.now() + Math.random(), 
      text: userMsg, 
      sender: 'user',
      status: 'normal'
    }]);
    setLoading(true);

    try {
      if (mode === 'talk') {
        // --- 스몰토크 ---
        const res = await api.post('/chat/talk', { message: userMsg });
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          text: res.data.reply, 
          sender: 'bot',
          status: 'normal'
        }]);
      
      } else if (mode === 'quest' && currentQuest) {
        // --- 퀘스트 제출 ---
        const res = await api.post(`/quests/${currentQuest.id}/submit`, { user_answer: userMsg });
        const { result, feedback } = res.data;
        const isPass = result === "PASS";

        // AI 피드백 메시지
        setMessages(prev => [...prev, { 
          id: Date.now() + Math.random(), 
          text: `[${result}] ${feedback}`, 
          sender: 'bot',
          status: isPass ? 'success' : 'fail'
        }]);

        if (isPass) {
          const isCompleted =
            feedback.includes("🏆") ||
            feedback.includes("축하합니다") ||
            feedback.includes("SBT");

          if (isCompleted) {
            console.log("✅ 퀘스트 완료 감지! 대시보드 업데이트 요청");
            onQuestComplete();

            setTimeout(() => {
              setMessages(prev => [...prev, { 
                id: Date.now() + Math.random(), 
                text: "🎉 모든 퀘스트 완료! 보상이 지급되었습니다.\n3초 뒤 스몰토크 모드로 돌아갑니다.", 
                sender: 'bot',
                status: 'success'
              }]);
            }, 1000);
          } else {
            // 다음 문제 로드
            setTimeout(() => fetchCurrentQuest(), 1500);
          }
        } else {
          // FAIL
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              id: Date.now() + Math.random(), 
              text: "🚫 오답입니다! 해당 레벨의 도전이 종료됩니다.", 
              sender: 'bot',
              status: 'fail'
            }]);
            setMode('talk');
          }, 1000);
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "⚠️ 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", 
        sender: 'bot',
        status: 'error'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 말풍선 스타일
  const getMessageStyle = (msg: Message) => {
  // 사용자 메시지 (그대로 유지)
  if (msg.sender === 'user') {
    return 'bg-brand-primary text-white rounded-tr-none';
  }

  // ✅ 상태별로 "완전히" 다른 클래스 세트 사용
  if (msg.status === 'success') {
    // PASS
    return 'bg-brand-secondary/10 text-text-primary border-2 border-brand-secondary rounded-tl-none';
  }

  if (msg.status === 'fail' || msg.status === 'error') {
    // FAIL / ERROR
    return 'bg-red-500/10 text-text-primary border-2 border-red-500 rounded-tl-none';
  }

  // 기본 봇 메시지
  return 'bg-dark-ui text-text-primary border border-gray-700 rounded-tl-none';
  };

  return (
    <div className="bg-dark-card p-8 rounded-3xl border border-gray-800 w-full max-w-lg shadow-2xl flex flex-col h-[700px] transition-all duration-300">
      
      {/* 프로필 영역 */}
      <div className="flex flex-col items-center mb-4 border-b border-gray-800 pb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 border transition-colors duration-300
          ${mode === 'quest' ? 'bg-brand-primary/20 border-brand-primary' : 'bg-brand-secondary/20 border-brand-secondary'}`}>
          <span className="text-3xl animate-bounce">{mode === 'quest' ? '👾' : '🤖'}</span>
        </div>
        <h2 className="text-xl font-bold text-white">VeriBot</h2>
        <span className={`text-xs px-3 py-1 rounded-full font-medium transition-colors duration-300 ${mode === 'quest' ? 'bg-brand-primary text-white' : 'bg-gray-700 text-gray-300'}`}>
          {mode === 'quest' ? 'QUEST MODE 🔥' : 'Free Talk Mode'}
        </span>
      </div>

      {/* 채팅 리스트 */}
      <div className="flex-1 overflow-y-auto space-y-4 p-2 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-all shadow-md animate-fade-in ${getMessageStyle(msg)}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-text-secondary text-xs ml-4 animate-pulse">VeriBot is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 입력 영역 */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'quest' ? "정답을 입력하세요..." : "자유롭게 대화하세요..."}
            className="flex-1 bg-dark-ui border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary disabled:opacity-50 transition-all"
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-brand-primary hover:bg-opacity-90 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-all transform active:scale-95"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
};

export default ChatInterface;
