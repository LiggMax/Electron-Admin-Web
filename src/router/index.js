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
            path: '/download',
            name: 'download',
            component: () => import('../views/electronapp/Download.vue'),
            meta: {
                title: '长虹国际下'
            }
        },
        {
            path: '/',
            name: 'layout',
            component: () => import('../views/layout/Layout.vue'),
            redirect: '/', // 重定向到账单管理页面
            meta: {
                title: '后台管理系统'
            },
            children: [
                {
                    path: '',
                    name: 'bill',
                    component: () => import('../views/Bill.vue'),
                    meta: {
                        title: '账单管理'
                    }
                },
                {
                    path: 'announcement',
                    name: 'announcement',
                    component: () => import('../views/Announcement.vue'),
                    meta: {
                        title: '公共栏管理'
                    }
                },
                {
                    path: 'customer',
                    name: 'customer',
                    component: () => import('../views/Customer.vue'),
                    meta: {
                        title: '客户管理'
                    }
                },
                {
                    path: 'merchant',
                    name: 'merchant',
                    component: () => import('../views/Merchant.vue'),
                    meta: {
                        title: '卡商管理'
                    }
                },
                {
                    path: 'phone',
                    name: 'phone',
                    component: () => import('../views/Phone.vue'),
                    meta: {
                        title: '号码管理'
                    }
                },
                {
                    path: 'project',
                    name: 'project',
                    component: () => import('../views/Project.vue'),
                    meta: {
                        title: '项目管理'
                    }
                },
                {
                    path: 'region',
                    name: 'region',
                    component: () => import('../views/Region.vue'),
                    meta: {
                        title: '地区管理'
                    }
                },
                {
                    path: 'material',
                    name: 'material',
                    component: () => import('../views/Material.vue'),
                    meta: {
                        title: '资料管理'
                    }
                },
                {
                    path: 'order',
                    name: 'order',
                    component: () => import('../views/Order.vue'),
                    meta: {
                        title: '订单管理'
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