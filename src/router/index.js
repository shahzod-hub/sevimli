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
import products from "../data/products";


import Dashboard from "../views/Dashboard.vue";
import Products from "../views/Products.vue";
import AddProduct from "../views/admin/AddProduct.vue";
import EditProduct from "../views/admin/EditProduct.vue";
import Categories from "../views/admin/Categories.vue";
import Orders from "../views/admin/Orders.vue";
import Users from "../views/admin/Users.vue";
import Settings from "../views/admin/Settings.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/signin" },
    { path: "/signin", name: "signin", component: SignInPage },
    { path: "/signup", name: "signup", component: SignUpPage },
    { path: "/home", component: HomePage },
    { path: "/cart", component: CartPage },
    { path: "/favorites", component: FavoritesPage },
    { path: "/about", component: AboutPage },
    { path: "/contact", component: ContactPage },
    { path: "/checkout", component: CheckoutPage },

   
    {
      path: "/product/:id",
      name: "product",
      component: ProductPage,
    },

    {
      path: "/admin",
      component: RouterView,
      meta: { requiresAdmin: true },   
      redirect: "/admin/dashboard",
      children: [
        { path: "dashboard", name: "admin-dashboard", component: Dashboard },
        { path: "products", name: "admin-products", component: Products },
        { path: "products/add", name: "admin-products-add", component: AddProduct },
        { path: "products/edit/:id", name: "admin-products-edit", component: EditProduct },
        { path: "categories", name: "admin-categories", component: Categories },
        { path: "orders", name: "admin-orders", component: Orders },
        { path: "users", name: "admin-users", component: Users },
        { path: "settings", name: "admin-settings", component: Settings },
      ],
    },

    // ✅ 404 — eng oxirida
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundPage },
  ],

  scrollBehavior() {
    return { top: 0 };
  },
});

// ✅ Admin guard vaqtincha o'chirilgan (test rejimi)
router.beforeEach((to, from, next) => {
  next();
});

export default router;