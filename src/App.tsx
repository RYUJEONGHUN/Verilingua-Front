// App.tsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import ChatInterface from "./components/layout/ChatInterface";
import Dashboard from "./components/layout/Dashboard";
import LoginButton from "./components/ui/LoginButton";

// 🎮 메인 게임 화면 (대시보드 + 채팅창)
const GameScreen = () => {
  // 1. 현재 모드 상태: 'talk'(스몰토크) vs 'quest'(시험)
  const [mode, setMode] = useState<"talk" | "quest">("talk");

  // 2. 대시보드 새로고침 신호 (이 숫자가 바뀌면 대시보드가 API를 다시 호출함)
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.reload();
  };

  // 3. 퀘스트 완료 시 실행될 함수 (ChatInterface에서 호출)
  const handleQuestComplete = () => {
    console.log("🎉 퀘스트 완료 신호 수신! 대시보드를 갱신합니다.");
    setRefreshKey((prev) => prev + 1); // 대시보드 새로고침 트리거

    // 3초 뒤 스몰토크 모드로 자동 전환
    setTimeout(() => {
      setMode("talk");
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
        <ChatInterface mode={mode} setMode={setMode} onQuestComplete={handleQuestComplete} />

        {/* 오른쪽: 대시보드 */}
        <div className="md:sticky md:top-16">
          <Dashboard onStartQuest={() => setMode("quest")} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
};

// 🚪 로그인 화면 컴포넌트 (+ OAuth 콜백 처리까지 같이)
const LoginScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1) URL 쿼리에서 accessToken 꺼내기
    const params = new URLSearchParams(window.location.search);
    const token = params.get("accessToken");

    if (token) {
      // 2) 토큰 로컬스토리지에 저장
      localStorage.setItem("accessToken", token);

      // 3) /login?accessToken=... -> /login 으로 주소 정리 (쿼리 제거)
      const cleanUrl = `${window.location.origin}/login`;
      window.history.replaceState({}, "", cleanUrl);

      // 4) 메인 화면으로 이동
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-6xl font-bold text-brand-primary mb-4 tracking-tighter drop-shadow-lg">
          VERILINGUA
        </h1>
        <p className="text-text-secondary text-xl">AI Tutor &amp; Blockchain Certification</p>
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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <GameScreen />
            </ProtectedRoute>
          }
        />

        {/* 로그인 경로 (OAuth 콜백도 같이 처리) */}
        <Route path="/login" element={<LoginScreen />} />

        {/* 기타 주소는 전부 메인으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
