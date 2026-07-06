
import { createRouter, createWebHistory, RouterView } from "vue-router";

import HomePage from "../views/HomePage.vue";
import CartPage from "../views/CartPage.vue";
import FavoritesPage from "../views/FavoritesPage.vue";
import AboutPage from "../views/AboutPage.vue";
import ContactPage from "../views/ContactPage.vue";
import NotFoundPage from "../views/NotFoundPage.vue";
import ProductPage from "../views/ProductPage.vue";
import CheckoutPage from "../views/CheckoutPage.vue";
import SignInPage from "./pages/SignInPage.vue"; 
import SignUpPage from "./pages/SignUpPage.vue";   
import AdminPanel from "../views/AdminPanel.vue";
import products from "../data/products";



import Products from "../views/Products.vue";




const router = createRouter({
  history: createWebHistory(),
  routes: [
    
    { path: "/", redirect: "/home" },
    { path: "/signin", name: "signin", component: SignInPage },
    { path: "/signup", name: "signup", component: SignUpPage },
    { path: "/admin", name: "admin", component: AdminPanel, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: "/home", component: HomePage },
    { path: "/cart", component: CartPage },
    { path: "/favorites", component: FavoritesPage },
    { path: "/about", component: AboutPage },
    { path: "/contact", component: ContactPage },
    { path: "/checkout", component: CheckoutPage, meta: { requiresAuth: true } },

   
    {
      path: "/product/:id",
      name: "product",
      component: ProductPage,
    },

  

    // ✅ 404 — eng oxirida
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundPage },
  ],

  scrollBehavior() {
    return { top: 0 };
  },
});


const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const isAuthenticated = () => {
  const user = getAuthUser();
  const token = localStorage.getItem("token");
  return Boolean(user.id && token);
};

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const requiresAdmin = to.meta.requiresAdmin;
  const user = getAuthUser();

  if (requiresAuth && !isAuthenticated()) {
    next({ path: "/signin", query: { redirect: to.fullPath } });
    return;
  }

  if (requiresAdmin && user.role !== 'admin') {
    next({ path: "/home" });
    return;
  }

  next();
});

export default router;


