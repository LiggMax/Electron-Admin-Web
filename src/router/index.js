import {createRouter, createWebHistory} from "vue-router";


const router = createRouter({
    // history模式
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/Login.vue'),
            meta: {
                title: '登录'
            }
        },
        {
            path: '/',
            name: 'layout',
            component: () => import('../views/Layout.vue'),
            meta: {
                title: '后台管理系统'
            },
            children: [
                {
                    path: '',
                    name: 'publicBar',
                    component: () => import('../views/Home.vue'),
                    meta: {
                        title: '公共栏管理'
                    }
                },
                {
                    path: 'customer',
                    name: 'customer',
                    component: () => import('../views/Home.vue'),
                    meta: {
                        title: '客户管理'
                    }
                },
                {
                    path: 'merchant',
                    name: 'merchant',
                    component: () => import('../views/Home.vue'),
                    meta: {
                        title: '卡商管理'
                    }
                },
                {
                    path: 'phone',
                    name: 'phone',
                    component: () => import('../views/Home.vue'),
                    meta: {
                        title: '号码管理'
                    }
                },
                {
                    path: 'project',
                    name: 'project',
                    component: () => import('../views/Home.vue'),
                    meta: {
                        title: '项目管理'
                    }
                },
                {
                    path: 'material',
                    name: 'material',
                    component: () => import('../views/Home.vue'),
                    meta: {
                        title: '资料管理'
                    }
                }
            ]
        }
    ]
})

// 全局前置守卫，根据路由meta信息设置页面标题
router.beforeEach((to, from, next) => {
    // 设置页面标题
    if (to.meta.title) {
        document.title = to.meta.title;
    }
    next();
});

export default router