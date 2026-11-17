# 컬렉터 (Collector)

모든 수집품을 한곳에서 관리하고 수집가들과 소통할 수 있는 트렌디한 커뮤니티 플랫폼입니다.

## 주요 기능

- 🎯 **컬렉션 관리**: 피규어, LP, 트레이딩 카드 등 다양한 수집품을 체계적으로 관리
- 💎 **희귀도 분석**: 수집품의 희귀도와 가치 추이 분석
- 🤝 **커뮤니티**: 수집가들과의 정보 교류 및 소통
- 🔒 **안전한 인증**: Supabase 기반 사용자 인증 시스템

## 기술 스택

- **프론트엔드**: Next.js 15, React 19, TypeScript
- **스타일링**: Tailwind CSS 4
- **상태관리**: Zustand
- **백엔드**: Supabase
- **패키지 매니저**: pnpm
- **배포**: Vercel

## 개발 환경 설정

### 1. 저장소 클론

```bash
git clone [repository-url]
cd collector
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 데이터베이스 설정

Supabase에서 `database/schema.sql` 파일을 실행하여 필요한 테이블을 생성하세요.

### 5. 개발 서버 실행

```bash
pnpm dev
```

http://localhost:3000에서 앱을 확인할 수 있습니다.

## 빌드 및 배포

### 로컬 빌드

```bash
pnpm build
pnpm start
```

### Vercel 배포

1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 자동 배포 완료

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── collections/        # 컬렉션 관리 페이지
│   ├── community/          # 커뮤니티 페이지
│   └── auth/              # 인증 관련 페이지
├── components/             # 재사용 가능한 컴포넌트
├── hooks/                  # 커스텀 React 훅
├── lib/                    # 라이브러리 설정
├── store/                  # Zustand 상태 관리
└── types/                  # TypeScript 타입 정의
```

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
