import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import ChatInterface from "./components/layout/ChatInterface";
import Dashboard from "./components/layout/Dashboard";
import LoginButton from "./components/ui/LoginButton";
import LoginCallback from "./pages/LoginCallback";

// 🎮 메인 게임 화면 (대시보드 + 채팅창)
const GameScreen = () => {
  // 1. 현재 모드 상태: 'talk'(스몰토크) vs 'quest'(시험)
  const [mode, setMode] = useState<'talk' | 'quest'>('talk');
  
  // 2. 대시보드 새로고침 신호 (이 숫자가 바뀌면 대시보드가 API를 다시 호출함)
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.reload();
  };

  // 3. 퀘스트 완료 시 실행될 함수 (ChatInterface에서 호출)
  const handleQuestComplete = () => {
    console.log("🎉 퀘스트 완료 신호 수신! 대시보드를 갱신합니다.");
    setRefreshKey(prev => prev + 1); // 대시보드 새로고침 트리거
    
    // 3초 뒤 스몰토크 모드로 자동 전환
    setTimeout(() => {
      setMode('talk');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-dark-bg p-8 md:p-16 flex items-center justify-center relative">
      {/* 로그아웃 버튼 */}
      <button 
        onClick={handleLogout}
        className="absolute top-4 right-4 text-text-secondary hover:text-white text-sm underline transition-colors"
      >
        로그아웃
      </button>

      {/* 2단 레이아웃 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-6xl items-start">
        
        {/* 왼쪽: 채팅창 */}
        {/* mode: 현재 상태, setMode: 상태 변경 함수, onQuestComplete: 완료 알림 함수 전달 */}
        <ChatInterface 
          mode={mode} 
          setMode={setMode} 
          onQuestComplete={handleQuestComplete} 
        />
        
        {/* 오른쪽: 대시보드 */}
        {/* onStartQuest: 퀘스트 시작 시 모드 변경, refreshKey: 데이터 갱신 신호 */}
        <div className="md:sticky md:top-16">
          <Dashboard 
            onStartQuest={() => setMode('quest')} 
            refreshKey={refreshKey} 
          />
        </div>

      </div>
    </div>
  );
};

// 🚪 로그인 화면 컴포넌트
const LoginScreen = () => {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-6xl font-bold text-brand-primary mb-4 tracking-tighter drop-shadow-lg">
          VERILINGUA
        </h1>
        <p className="text-text-secondary text-xl">AI Tutor & Blockchain Certification</p>
      </div>
      <div className="w-full max-w-md">
        <LoginButton />
      </div>
    </div>
  );
};

// 🔒 보호된 라우트 (토큰 체크)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인 경로 (보호됨) */}
        <Route path="/" element={
          <ProtectedRoute>
            <GameScreen />
          </ProtectedRoute>
        } />
        
        {/* 로그인 경로 */}
        <Route path="/login" element={<LoginScreen />} />
        
        {/* OAuth 콜백 경로 */}
        <Route path="/oauth/callback" element={<LoginCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;