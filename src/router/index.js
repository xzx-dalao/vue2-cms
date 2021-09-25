import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const login = () => import('../components/login')
const home = () => import('../views/home/home')
const welcome = () => import('../views/home/homechild/welcome')
const users = () => import('../views/home/homechild/user/users')
const rights = () => import('../views/home/homechild/power/rights')
const role = () => import('../views/home/homechild/power/role')
const routes = [{
  path: '',
  redirect: '/login'
},
{
  path: '/login',
  component: login
},

{
  path: '/home',
  component: home,
  redirect: '/welcome',
  children: [
    {
      path: '/welcome',
      component: welcome
    }, {
      path: '/users',
      component: users
    }, {
      path: '/roles',
      component: role
    },
    {
      path: '/rights',
      component: rights
    }
  ]
},

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
router.beforeEach((to, form, next) => {
  // console.log(store.state.token)
  if (to.path === '/login') return next();
  const tokenstr = window.sessionStorage.getItem('token')
  if (!tokenstr) return next('/login')
  next()
})
export default router
