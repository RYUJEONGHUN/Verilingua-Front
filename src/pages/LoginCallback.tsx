import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. URL에서 accessToken 추출
    const params = new URLSearchParams(window.location.search);
    const token = params.get("accessToken");

    if (token) {
      console.log("토큰 획득 성공:", token);
      // 2. 로컬 스토리지에 저장 (새로고침해도 로그인 유지)
      localStorage.setItem("accessToken", token);
      
      // 3. 메인 페이지로 이동
      navigate("/");
    } else {
      console.error("토큰이 없습니다.");
      navigate("/"); // 실패 시에도 메인으로
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">로그인 처리 중...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
      </div>
    </div>
  );
};

export default LoginCallback;