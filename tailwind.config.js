/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 레퍼런스 이미지 기반 커스텀 컬러 팔레트
      colors: {
        dark: {
          bg: '#0F111A',       // 가장 어두운 배경
          card: '#1A1C2A',     // 카드 배경
          ui: '#252836',       // 입력창 등 UI 요소
        },
        brand: {
          primary: '#7F5AF0',  // 보라색 (L1, 메인 포인트)
          secondary: '#2CB67D',// 민트/초록색 (진행바, L2)
          tertiary: '#FF8906', // 주황색 (L4 등)
        },
        text: {
          primary: '#FFFFFE',  // 하얀색 텍스트
          secondary: '#94A1B2',// 회색 보조 텍스트
        }
      },
      fontFamily: {
        // 구글 폰트에서 'Inter'나 'Noto Sans KR' 등을 가져와서 적용하면 더 예쁩니다.
        sans: ['Inter', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}