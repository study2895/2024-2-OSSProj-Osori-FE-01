/* eslint-disable */
import { createRouter, createWebHashHistory } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue' // 중첩 라우팅의 부모 레이아웃
import PortfolioLayout from '@/components/layout/PortfolioLayout.vue' // 중첩 라우팅의 부모 레이아웃
import store from '@/store'
import FeedLayout from '@/components/layout/FeedLayout.vue'
import akopolioCreate from '@/views/akopolio/create/akopolioCreate.vue'
import akopolioMain from '@/views/akopolio/main/akopolioMain.vue'

// 자동 임포트 함수 (src/views 내의 모든 .vue 파일을 임포트)
function importAllViews() {
  const viewFiles = require.context('@/views', true, /\.vue$/)
  const views = {}

  // 각 파일을 순회하면서 임포트
  viewFiles.keys().forEach((filePath) => {
    const viewName = filePath
      .split('/')
      .pop() // 파일 이름만 추출
      .replace('.vue', '') // .vue 확장자 제거

    // 컴포넌트 이름과 해당 컴포넌트를 맵핑
    views[viewName] = viewFiles(filePath).default
  })

  return views
}

// 자동으로 임포트된 모든 Vue 컴포넌트 객체
const importedViews = importAllViews()

const routes = [
  {
    path: '/',
    name: 'home',
    component: importedViews['HomeView'], // 자동 임포트 적용
    redirect: '/auth/login' // 기본 경로에서 /auth/login으로 리다이렉트
  },
  {
    path: '/about',
    name: 'about',
    component: importedViews['AboutView'] // 자동 임포트 적용
  },
  {
    path: '/auth',
    component: AuthLayout, // 부모 레이아웃
    children: [
      {
        path: 'signup',
        name: 'SignupView',
        component: importedViews['SignupView'] // 자동 임포트 적용
      },
      {
        path: 'login',
        name: 'LoginView',
        component: importedViews['LoginView'] // 자동 임포트 적용
      }
    ]
  },
  {
    path: '/akopolio',
    component: PortfolioLayout, // 공통 레이아웃 컴포넌트
    children: [
      {
        path: 'main',
        name: 'akopolioMain',
        component: importedViews['akopolioMain'] // 자동 임포트 적용
      },
      {
        path: 'create',
        name: 'akopolioCreate',
        component: importedViews['akopolioCreate'] // 자동 임포트 적용
      },
      {
        path: 'detail/:id',
        name: 'akopolioDetail',
        component: importedViews['akopolioDetail'] // 자동 임포트 적용
      },
      {
        path: 'edit/:id',
        name: 'akopolioEdit',
        component: importedViews['akopolioEdit'] // 자동 임포트 적용
      }
    ]
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: importedViews['NotFound'] // 자동 임포트 적용
  },
  {
    path: '/mypage',
    name: 'MypageView',
    component: importedViews['MypageView'] // 자동 임포트 적용
  },
  {
    path: '/main',
    name: 'MainpageView',
    component: importedViews['MainpageView'] // 자동 임포트 적용
  },
  {
    path: '/calendar',
    name: 'CalendarMainView',
    component: importedViews['CalendarMainView'] // 자동 임포트 적용
  },
  {
    path: '/feed',
    component: FeedLayout, // 부모 레이아웃
    children: [
      {
        path: 'ako-stamp-write',
        name: 'AkoStampWriteView',
        component: importedViews['AkoStampWriteView'] // 자동 임포트 적용
      },
      {
        path: 'ako-stamp-board',
        name: 'AkoStampBoard',
        component: importedViews['AkoStampBoard'] // 자동 임포트 적용
      },
      {
        path: 'ako-stamp-follow',
        name: 'AkoStampFollow',
        component: importedViews['AkoStampFollow'] // 자동 임포트 적용
      },
      {
        path: 'main',
        name: 'MainFeedPage',
        component: importedViews['MainFeedPage'] // 자동 임포트 적용
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory('/akoming/'), // Hash 모드를 사용
  routes
})

//라우터 가드 설정
// 글로벌 가드 추가
router.beforeEach(async (to, from, next) => {
  const isAuthPage = to.matched.some((record) =>
    record.path.startsWith('/auth')
  )

  try {
    // 세션 상태 확인 API 호출
    const response = await fetch(
      `${process.env.VUE_APP_BE_API_URL}/api/quests/status`,
      {
        method: 'GET',
        credentials: 'include' // 세션 쿠키 포함
      }
    )

    if (response.ok) {
      if (isAuthPage) {
        next('/main') // 이미 인증된 상태라면 메인 페이지로 이동
      } else {
        next() // 정상적으로 페이지 이동
      }
    } else {
      if (isAuthPage) {
        next() // 인증 경로로는 접근 가능
      } else {
        next('/auth/login') // 인증되지 않았으면 로그인 페이지로 이동
      }
    }
  } catch (error) {
    console.error('Error during authentication check:', error)
    next('/auth/login') // 오류 발생 시 로그인 페이지로 이동
  }
})

export default router
