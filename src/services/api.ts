import axios from 'axios';


const BACKEND_URL =
  import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8080";

const api = axios.create({
  // 모든 API 호출은 /api 밑으로 간다고 가정
  baseURL: `${BACKEND_URL}/api`,
});

// 요청 보낼 때마다 토큰 낚아채서 헤더에 넣기 (인터셉터)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 아직 재시도 안 한 요청이라면
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 재발급 요청 (이메일 등 필요 정보 전달 방식은 백엔드 구현에 따름)
        // 보통은 쿠키에 리프레시 토큰이 있거나, 로컬 스토리지 값을 보냄
        const res = await axios.post(`${BACKEND_URL}/api/auth/refresh`, {
          email: "user@example.com", // TODO: replace with real email from token or storage
        });
        
        const newAccessToken = res.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        
        // 헤더 업데이트 후 원래 요청 다시 실행
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // 재발급도 실패하면 진짜 로그아웃 처리
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
export default api;