import axios from 'axios';

const api = axios.create({
  baseURL: 'http://verilingua.kro.kr:8080/api', // 백엔드 주소 (API 프리픽스 확인 필요)
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
        const res = await axios.post('http://verilingua.kro.kr:8080/api/auth/refresh', { 
            email: "user@example.com" // 실제로는 토큰에서 파싱하거나 저장된 값 사용
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