# click — 배포 가이드 (Claude API 버전)

이 폴더는 "click" 앱을 실제로 인터넷에 배포할 수 있는 형태예요.

```
click-backend/
├── index.html        ← 프론트엔드 (지금까지 만든 화면 전체 — 캘린더, 채팅목록, PDF업로드, 성향설정 다 포함)
├── api/
│   └── claude.js      ← 백엔드 (Claude API 키를 안전하게 대신 호출하는 프록시)
├── package.json
└── README.md
```

**핵심 구조**: 브라우저(index.html)는 Claude API 키를 전혀 몰라요. 대신 우리 서버(`/api/claude.js`)에만 물어보고, 그 서버가 대신 Claude에게 물어봐서 결과를 돌려줘요. 이렇게 해야 키가 안전하게 숨겨져요.

---

## 배포 순서 (5단계)

### 1. Claude API 키 발급
- `platform.claude.com` 접속 → 로그인 → **Billing**에서 카드 등록 + 소액 충전(예: $10~20)
- **API Keys** → **Create Key** → `sk-ant-`로 시작하는 키 복사

### 2. GitHub에 이 폴더 올리기
- github.com에서 새 저장소(Repository) 생성 (예: `click-app`)
- 이 폴더(`click-backend`) 전체를 그 저장소에 업로드
  - GitHub 웹사이트에서 "Add file → Upload files"로 드래그해서 올려도 됩니다

### 3. Vercel 가입 & 프로젝트 연결
- `vercel.com` 접속 → **GitHub 계정으로 가입**
- **Add New → Project** → 방금 만든 `click-app` 저장소 선택 → **Import**
- 다른 설정은 그대로 두고 **Deploy** 클릭 (아직 키를 안 넣어서 사진 분석은 에러가 날 수 있어요, 다음 단계에서 해결됩니다)

### 4. API 키를 환경변수로 등록 (제일 중요한 단계!)
- Vercel 프로젝트 화면 → **Settings** → **Environment Variables**
- Key: `ANTHROPIC_API_KEY`
- Value: 1단계에서 복사해둔 `sk-ant-...` 키
- **Save**
- 그 다음 **Deployments** 탭 → 제일 최근 배포 옆 점 3개(⋯) → **Redeploy** (환경변수는 재배포해야 적용돼요)

### 5. 완료!
- Vercel이 자동으로 만들어준 주소(예: `click-app.vercel.app`)로 접속
- 회원가입 → 사진/PDF 업로드까지 눌러서, 실제로 Claude가 분석한 결과가 나오는지 확인

---

## 나중에 도메인(click.com 같은 주소) 연결하려면
Vercel 프로젝트 → **Settings → Domains**에서 구매한 도메인을 연결하면 돼요. (도메인은 가비아, Google Domains 등에서 별도로 구매해야 해요.)

## 문제가 생기면
- 분석이 안 될 때: **Deployments → 최근 배포 → Functions → claude** 로그를 확인하면 에러 메시지가 보여요
- "ANTHROPIC_API_KEY가 없다"는 에러가 뜨면: 4단계(환경변수 등록 + Redeploy)를 다시 확인하세요
- 결제/크레딧 문제면: platform.claude.com의 **Billing**에서 크레딧이 남아있는지 확인하세요

## 참고: 지금 이 프론트엔드가 저장하는 데이터는 전부 "메모리"예요
회원 정보, 채팅 기록, 캘린더 일정이 전부 새로고침하면 사라져요 (실제 데이터베이스가 아직 없어요). 이건 다음 단계 작업이고, 필요해지면 그때 Supabase나 Firebase 같은 걸 연결하면 돼요 — 지금은 배포해서 "진짜로 작동하는지" 먼저 확인하는 게 목적이에요.
