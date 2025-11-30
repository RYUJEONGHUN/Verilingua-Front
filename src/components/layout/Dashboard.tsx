import { useEffect, useState } from 'react';
import api from '../../services/api';

// 사용자 정보 타입 정의
interface UserInfo {
  name: string;
  walletAddress: string;
  l1TokenCount: number;
  etherscanUrl: string;
}

// Props 정의
interface DashboardProps {
  onStartQuest: () => void; // 퀘스트 시작 알림
  refreshKey: number;       // 데이터 갱신 신호
}

const Dashboard = ({ onStartQuest, refreshKey }: DashboardProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [, setLoading] = useState(false);

  // 1. 내 정보 가져오기 (refreshKey 의존성 추가)
  const fetchUserInfo = async () => {
    try {
      const res = await api.get('/users/me');
      setUserInfo(res.data);
    } catch (err: any) {
      console.error("정보 로드 실패:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [refreshKey]);

  // 2. 레벨 도전 핸들러
  const handleStartLevel = async (level: number) => {
    if (level === 2 && (userInfo?.l1TokenCount || 0) < 3) {
      alert("🔒 L2 퀘스트는 L1 토큰이 3개 이상 필요합니다!");
      return;
    }

    if (confirm(`Level ${level} 도전을 시작하시겠습니까? (진행 중인 퀘스트는 초기화됩니다)`)) {
      setLoading(true);
      try {
        await api.post(`/quests/start/${level}`);
        alert("퀘스트 모드로 전환됩니다! 채팅창을 확인하세요.");
        onStartQuest();
      } catch (error) {
        alert("도전 시작 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  const isL2Unlocked = (userInfo?.l1TokenCount || 0) >= 3;

  return (
    <div className="bg-dark-card p-8 rounded-3xl border border-gray-800 w-full max-w-lg shadow-2xl transition-all duration-300">
      {/* 헤더 */}
      <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
        VERILINGUA QUEST
      </h1>
      <p className="text-text-secondary mb-8">
        Welcome, <span className="text-brand-primary font-bold">{userInfo?.name || 'Guest'}</span>!
      </p>

      {/* 레벨 카드 그리드 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Level 1 카드 */}
        <div
          onClick={() => handleStartLevel(1)}
          className="bg-dark-ui p-6 rounded-2xl border-2 border-brand-primary flex flex-col items-center cursor-pointer hover:bg-opacity-80 transition-all active:scale-95 shadow-[0_0_20px_rgba(127,90,240,0.15)]"
        >
          <div className="text-5xl mb-3">👾</div>
          <span className="font-bold text-brand-primary text-lg">L1 QUEST</span>
          <span className="text-text-secondary text-xs mt-1">Beginner (3문제)</span>
        </div>

        {/* Level 2 카드 */}
        <div
          onClick={() => handleStartLevel(2)}
          className={`p-6 rounded-2xl border-2 flex flex-col items-center transition-all
            ${isL2Unlocked
              ? "bg-dark-ui border-brand-secondary cursor-pointer hover:bg-opacity-80 shadow-[0_0_20px_rgba(44,182,125,0.15)] active:scale-95"
              : "bg-dark-ui/50 border-gray-700 opacity-50 cursor-not-allowed"
            }`}
        >
          <div className="text-5xl mb-3">{isL2Unlocked ? "⚔️" : "🔒"}</div>
          <span className={`font-bold text-lg ${isL2Unlocked ? "text-brand-secondary" : "text-text-secondary"}`}>
            {isL2Unlocked ? "L2 QUEST" : "L2 LOCKED"}
          </span>
          <span className="text-text-secondary text-xs mt-1">
            {isL2Unlocked ? "Master (3문제)" : "Need 3 Tokens"}
          </span>
        </div>
      </div>

      {/* 하단 정보 패널 (지갑 & 토큰) */}
      <div className="grid grid-cols-2 gap-4">
        {/* 지갑 주소 (클릭 시 이더스캔 이동) */}
        <a
          href={userInfo?.etherscanUrl}
          target="_blank"
          rel="noreferrer"
          className="bg-dark-ui p-4 rounded-xl border border-gray-700 hover:border-brand-primary transition-colors group block"
        >
          <div className="flex items-center gap-2 mb-1 text-brand-secondary">
            <span>🔗</span> <span className="font-bold text-sm">On-chain Tx</span>
          </div>
          <div className="text-text-secondary text-xs truncate group-hover:text-white">
            {userInfo?.walletAddress || '지갑 생성 중...'}
          </div>
        </a>

        {/* 보유 토큰 개수 + IPFS 메타데이터 링크 */}
        <div className="bg-dark-ui p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-1 text-brand-primary">
            <span>💎</span> <span className="font-bold text-sm">My Tokens</span>
          </div>
          <div className="text-2xl font-bold text-white transition-all duration-500">
            {userInfo?.l1TokenCount ?? 0} <span className="text-sm text-text-secondary"> SBT</span>
          </div>

          {/* ✅ L1 토큰이 있을 때만 IPFS 메타데이터 링크 노출 */}
          {(userInfo?.l1TokenCount || 0) > 0 && (
            <a
              href="http://3.34.194.242:8080/ipfs/QmSxJGPMzwJ4CsdTTT11V2a7K21s5v46YskbYUaBmzK3R5"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-brand-primary underline hover:text-brand-secondary"
            >
              View L1 Badge Metadata (IPFS)
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
