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
    const originalRequest = error.config || {};

    // 서버 응답 자체가 없는 경우 (연결 실패, CORS, 타임아웃 등)
    if (!error.response) {
      console.error("네트워크 오류 또는 서버에 연결할 수 없습니다:", error.message);
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${BACKEND_URL}/api/auth/refresh`, {
          email: "user@example.com", // TODO
        });
        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;