import { createRouter, createWebHistory } from "vue-router";

import HomePage from "../views/HomePage.vue";
import CartPage from "../views/CartPage.vue";
import FavoritesPage from "../views/FavoritesPage.vue";
import AboutPage from "../views/AboutPage.vue";
import ContactPage from "../views/ContactPage.vue";
import NotFoundPage from "../views/NotFoundPage.vue";
import ProductPage from "../views/ProductPage.vue";
import CheckoutPage from "../views/CheckoutPage.vue";
import SignInPage from "../pages/SignInPage.vue";
import SignUpPage from "../pages/SignUpPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/signin" },
    {
      path: "/signin",
      name: "signin",
      component: SignInPage,
    },
    {
      path: "/signup",
      name: "signup",
      component: SignUpPage,
    },
    { path: "/home", component: HomePage },
    { path: "/cart", component: CartPage },
    { path: "/favorites", component: FavoritesPage },
    { path: "/about", component: AboutPage },
    { path: "/contact", component: ContactPage },
    { path: "/product/:id", component: ProductPage },
    { path: "/checkout", component: CheckoutPage },
    { path: "/:pathMatch(.*)*", component: NotFoundPage },
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;