<template>
  <div class="admin-layout" :class="{ 'sidebar-collapsed': collapsed, 'sidebar-open': mobileOpen }">

    <!-- ── Sidebar ─────────────────────────────────────────────── -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-mark">🛒</div>
        <transition name="fade-text">
          <span v-if="!collapsed" class="logo-text">FreshMart</span>
        </transition>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <div v-for="group in navGroups" :key="group.label" class="nav-group">
          <p v-if="!collapsed" class="nav-group-label">{{ group.label }}</p>
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            :class="{ active: isActive(item.to) }"
            :title="collapsed ? item.label : ''"
            @click="mobileOpen = false"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <transition name="fade-text">
              <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
            </transition>
            <span
              v-if="!collapsed && item.badge"
              class="nav-badge"
              :class="`badge--${item.badgeColor || 'red'}`"
            >{{ item.badge }}</span>
          </router-link>
        </div>
      </nav>

      <!-- Collapse toggle (desktop only) -->
      <button class="collapse-btn" @click="collapsed = !collapsed" :title="collapsed ? 'Kengaytirish' : 'Yig\'ish'">
        <span>{{ collapsed ? '›' : '‹' }}</span>
      </button>
    </aside>

    <!-- Mobile overlay -->
    <div class="mobile-overlay" @click="mobileOpen = false" v-if="mobileOpen"></div>

    <!-- ── Main ────────────────────────────────────────────────── -->
    <div class="main-wrapper">

      <!-- Topbar -->
      <header class="topbar">
        <!-- Left -->
        <div class="topbar-left">
          <button class="mobile-menu-btn" @click="mobileOpen = !mobileOpen">
            <span class="hamburger" :class="{ open: mobileOpen }">
              <i></i><i></i><i></i>
            </span>
          </button>

          <div class="breadcrumb">
            <span class="breadcrumb-home" @click="$router.push('/admin')">Bosh sahifa</span>
            <template v-if="breadcrumbs.length">
              <span class="breadcrumb-sep">›</span>
              <span
                v-for="(crumb, i) in breadcrumbs"
                :key="i"
                class="breadcrumb-item"
                :class="{ last: i === breadcrumbs.length - 1 }"
                @click="crumb.to && $router.push(crumb.to)"
              >{{ crumb.label }}<span v-if="i < breadcrumbs.length - 1" class="breadcrumb-sep">›</span></span>
            </template>
          </div>
        </div>

        <!-- Right -->
        <div class="topbar-right">
          <!-- Search -->
          <div class="topbar-search" :class="{ expanded: searchOpen }">
            <input
              v-if="searchOpen"
              v-model="searchQuery"
              ref="searchInput"
              type="text"
              placeholder="Qidirish..."
              @blur="closeSearch"
              @keydown.esc="closeSearch"
              @keydown.enter="handleSearch"
            />
            <button class="icon-btn" @click="toggleSearch" title="Qidirish">🔍</button>
          </div>

          <!-- Notifications -->
          <div class="notif-wrapper" v-click-outside="() => notifOpen = false">
            <button class="icon-btn notif-btn" @click="notifOpen = !notifOpen" title="Bildirishnomalar">
              🔔
              <span v-if="unreadCount" class="notif-dot">{{ unreadCount }}</span>
            </button>

            <transition name="dropdown">
              <div class="notif-dropdown" v-if="notifOpen">
                <div class="notif-header">
                  <span>Bildirishnomalar</span>
                  <button v-if="notifications.length" @click="markAllRead" class="mark-read-btn">
                    Barchasini o'qildi
                  </button>
                </div>
                <div class="notif-list">
                  <div
                    v-for="n in notifications"
                    :key="n.id"
                    class="notif-item"
                    :class="{ unread: !n.read }"
                  >
                    <span class="notif-icon">{{ n.icon }}</span>
                    <div class="notif-body">
                      <p>{{ n.message }}</p>
                      <small>{{ n.time }}</small>
                    </div>
                  </div>
                  <div v-if="!notifications.length" class="notif-empty">
                    <span>🎉</span>
                    <p>Yangi bildirishnoma yo'q</p>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- User menu -->
          <div class="user-menu-wrapper" v-click-outside="() => userMenuOpen = false">
            <button class="user-btn" @click="userMenuOpen = !userMenuOpen">
              <div class="avatar">{{ userInitials }}</div>
              <transition name="fade-text">
                <div v-if="!collapsed" class="user-info">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-role">{{ user.role }}</span>
                </div>
              </transition>
              <span class="chevron">{{ userMenuOpen ? '▴' : '▾' }}</span>
            </button>

            <transition name="dropdown">
              <div class="user-dropdown" v-if="userMenuOpen">
                <router-link to="/admin/profile" class="dropdown-item" @click="userMenuOpen = false">
                  👤 Profil
                </router-link>
                <router-link to="/admin/settings" class="dropdown-item" @click="userMenuOpen = false">
                  ⚙️ Sozlamalar
                </router-link>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout" @click="handleLogout">
                  🚪 Chiqish
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="page-content">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="admin-footer">
        <span>© {{ new Date().getFullYear() }} FreshMart Admin</span>
        <span class="footer-version">v1.0.0</span>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',

  props: {
    user: {
      type: Object,
      default: () => ({ name: 'Admin', role: 'Super Admin' }),
    },
    breadcrumbs: {
      type: Array,
      default: () => [],
    },
    notifications: {
      type: Array,
      default: () => [
        { id: 1, icon: '📦', message: '5 ta mahsulot qoldiği tugadi', time: '5 daqiqa oldin', read: false },
        { id: 2, icon: '🛒', message: '3 ta yangi buyurtma keldi', time: '20 daqiqa oldin', read: false },
        { id: 3, icon: '⚠️', message: 'Sutli shokolad: 2 ta qoldi', time: '1 soat oldin', read: true },
      ],
    },
  },

  emits: ['logout', 'search'],

  data() {
    return {
      collapsed: false,
      mobileOpen: false,
      notifOpen: false,
      userMenuOpen: false,
      searchOpen: false,
      searchQuery: '',
      localNotifications: [...this.notifications],
    };
  },

  computed: {
    userInitials() {
      return (this.user.name || 'A')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    },
    unreadCount() {
      return this.localNotifications.filter((n) => !n.read).length;
    },
    navGroups() {
      return [
        {
          label: 'Asosiy',
          items: [
            { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
            { to: '/admin/orders', icon: '🛒', label: 'Buyurtmalar', badge: 3, badgeColor: 'red' },
            { to: '/admin/users', icon: '👥', label: 'Foydalanuvchilar' },
          ],
        },
        {
          label: 'Katalog',
          items: [
            { to: '/admin/products', icon: '📦', label: 'Mahsulotlar' },
            { to: '/admin/categories', icon: '🏷️', label: 'Kategoriyalar' },
          ],
        },
        {
          label: 'Boshqaruv',
          items: [
            { to: '/admin/settings', icon: '⚙️', label: 'Sozlamalar' },
          ],
        },
      ];
    },
  },

  watch: {
    notifications(val) {
      this.localNotifications = [...val];
    },
  },

  mounted() {
    // Kichik ekranda default collapsed
    if (window.innerWidth < 1024) {
      this.collapsed = true;
    }
    window.addEventListener('resize', this.handleResize);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },

  directives: {
    'click-outside': {
      mounted(el, binding) {
        el._clickOutside = (e) => {
          if (!el.contains(e.target)) binding.value(e);
        };
        document.addEventListener('mousedown', el._clickOutside);
      },
      unmounted(el) {
        document.removeEventListener('mousedown', el._clickOutside);
      },
    },
  },

  methods: {
    isActive(to) {
      if (to === '/admin/dashboard') return this.$route?.path === '/admin/dashboard' || this.$route?.path === '/admin';
      return this.$route?.path?.startsWith(to);
    },
    markAllRead() {
      this.localNotifications = this.localNotifications.map((n) => ({ ...n, read: true }));
    },
    toggleSearch() {
      this.searchOpen = !this.searchOpen;
      if (this.searchOpen) {
        this.$nextTick(() => this.$refs.searchInput?.focus());
      }
    },
    closeSearch() {
      setTimeout(() => {
        this.searchOpen = false;
        this.searchQuery = '';
      }, 150);
    },
    handleSearch() {
      this.$emit('search', this.searchQuery);
      this.closeSearch();
    },
    handleLogout() {
      this.userMenuOpen = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/signin');
    },
    handleResize() {
      if (window.innerWidth >= 768) this.mobileOpen = false;
    },
  },
};
</script>

<style scoped>
/* ── CSS Tokens ─────────────────────────────────────────── */
.admin-layout {
  --sidebar-w: 240px;
  --sidebar-w-collapsed: 68px;
  --topbar-h: 60px;
  --green: #16a34a;
  --green-dark: #15803d;
  --green-light: #dcfce7;
  --sidebar-bg: #0f1f14;
  --sidebar-text: #a3b8a8;
  --sidebar-active-bg: rgba(22, 163, 74, 0.18);
  --sidebar-active-text: #4ade80;
  --surface: #f5f7f5;
  --white: #ffffff;
  --border: #e5ebe6;
  --text: #1a2e1c;
  --text-muted: #6b7f6d;
  --shadow: 0 2px 12px rgba(0,0,0,0.07);
  --radius: 10px;
  --transition: 0.22s ease;

  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--surface);
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}

/* ── Sidebar ────────────────────────────────────────────── */
.sidebar {
  width: var(--sidebar-w);
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width var(--transition);
  position: relative;
  z-index: 200;
  overflow: hidden;
}

.admin-layout.sidebar-collapsed .sidebar {
  width: var(--sidebar-w-collapsed);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  min-height: var(--topbar-h);
  overflow: hidden;
  white-space: nowrap;
}

.logo-mark {
  font-size: 1.5rem;
  width: 36px;
  height: 36px;
  background: var(--green);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.1rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.01em;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 8px;
  scrollbar-width: none;
}
.sidebar-nav::-webkit-scrollbar { display: none; }

.nav-group { margin-bottom: 6px; }

.nav-group-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(163,184,168,0.5);
  padding: 10px 10px 4px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  transition: background var(--transition), color var(--transition);
  position: relative;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: rgba(255,255,255,0.07);
  color: #e2ede3;
}

.nav-item.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 6px; bottom: 6px;
  width: 3px;
  background: var(--green);
  border-radius: 0 3px 3px 0;
}

.nav-icon { font-size: 1.1rem; width: 22px; text-align: center; flex-shrink: 0; }
.nav-label { flex: 1; }

.nav-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  flex-shrink: 0;
}
.badge--red   { background: #ef4444; color: #fff; }
.badge--green { background: var(--green); color: #fff; }
.badge--orange{ background: #f97316; color: #fff; }

/* Collapse button */
.collapse-btn {
  background: rgba(255,255,255,0.06);
  border: none;
  color: var(--sidebar-text);
  padding: 10px;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition);
  border-top: 1px solid rgba(255,255,255,0.06);
  height: 44px;
}
.collapse-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

/* ── Main wrapper ───────────────────────────────────────── */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* ── Topbar ─────────────────────────────────────────────── */
.topbar {
  height: var(--topbar-h);
  background: var(--white);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  gap: 12px;
  flex-shrink: 0;
  box-shadow: var(--shadow);
  z-index: 100;
}

.topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.topbar-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

/* Hamburger */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}
.hamburger { display: flex; flex-direction: column; gap: 4px; }
.hamburger i { display: block; width: 20px; height: 2px; background: var(--text); border-radius: 2px; transition: var(--transition); }
.hamburger.open i:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
.hamburger.open i:nth-child(2) { opacity: 0; }
.hamburger.open i:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
  overflow: hidden;
  white-space: nowrap;
}
.breadcrumb-home { cursor: pointer; color: var(--text-muted); }
.breadcrumb-home:hover { color: var(--green); }
.breadcrumb-sep { color: #c8d4c9; margin: 0 1px; }
.breadcrumb-item { cursor: pointer; }
.breadcrumb-item:hover:not(.last) { color: var(--green); }
.breadcrumb-item.last { color: var(--text); font-weight: 600; cursor: default; }

/* Icon buttons */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 8px;
  border-radius: 8px;
  position: relative;
  transition: background var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover { background: #f0fdf4; }

/* Search */
.topbar-search {
  display: flex;
  align-items: center;
  border-radius: 8px;
  overflow: hidden;
  transition: width var(--transition), background var(--transition);
}
.topbar-search.expanded { background: #f5f7f5; border: 1.5px solid var(--border); }
.topbar-search input {
  border: none;
  background: transparent;
  padding: 6px 10px;
  font-size: 0.88rem;
  outline: none;
  width: 180px;
  color: var(--text);
}

/* Notifications */
.notif-wrapper { position: relative; }
.notif-btn { position: relative; }
.notif-dot {
  position: absolute;
  top: 4px; right: 4px;
  background: #ef4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  pointer-events: none;
}

.notif-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 320px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  z-index: 300;
  overflow: hidden;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text);
}
.mark-read-btn {
  background: none;
  border: none;
  font-size: 0.78rem;
  color: var(--green);
  cursor: pointer;
  font-weight: 600;
}
.mark-read-btn:hover { text-decoration: underline; }

.notif-list { max-height: 300px; overflow-y: auto; }

.notif-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f7f5;
  transition: background 0.15s;
}
.notif-item:hover { background: #f5f7f5; }
.notif-item.unread { background: #f0fdf4; }
.notif-item.unread:hover { background: #dcfce7; }
.notif-icon { font-size: 1.2rem; flex-shrink: 0; }
.notif-body p { margin: 0 0 2px; font-size: 0.85rem; color: var(--text); line-height: 1.4; }
.notif-body small { font-size: 0.75rem; color: var(--text-muted); }

.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  color: var(--text-muted);
  font-size: 0.88rem;
}
.notif-empty span { font-size: 2rem; }

/* User menu */
.user-menu-wrapper { position: relative; }
.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  padding: 5px 10px 5px 5px;
  cursor: pointer;
  transition: border-color var(--transition), background var(--transition);
}
.user-btn:hover { border-color: var(--green); background: #f0fdf4; }

.avatar {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--green), #86efac);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info { display: flex; flex-direction: column; align-items: flex-start; }
.user-name { font-size: 0.82rem; font-weight: 700; color: var(--text); line-height: 1.1; white-space: nowrap; }
.user-role { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; }
.chevron { font-size: 0.65rem; color: var(--text-muted); }

.user-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 180px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 300;
  overflow: hidden;
  padding: 4px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 7px;
  font-size: 0.88rem;
  color: var(--text);
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  transition: background 0.14s;
}
.dropdown-item:hover { background: #f0fdf4; }
.dropdown-item.logout { color: #ef4444; }
.dropdown-item.logout:hover { background: #fee2e2; }
.dropdown-divider { height: 1px; background: var(--border); margin: 4px 0; }

/* ── Page content ───────────────────────────────────────── */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* ── Footer ─────────────────────────────────────────────── */
.admin-footer {
  padding: 10px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--white);
  flex-shrink: 0;
}
.footer-version { color: #c8d4c9; }

/* ── Animations ─────────────────────────────────────────── */
.fade-text-enter-active,
.fade-text-leave-active { transition: opacity 0.15s, width 0.15s; overflow: hidden; }
.fade-text-enter-from,
.fade-text-leave-to { opacity: 0; width: 0; }

.dropdown-enter-active { transition: opacity 0.14s, transform 0.14s; }
.dropdown-leave-active { transition: opacity 0.1s, transform 0.1s; }
.dropdown-enter-from,
.dropdown-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── Mobile ─────────────────────────────────────────────── */
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    left: 0; top: 0; bottom: 0;
    transform: translateX(-100%);
    transition: transform var(--transition);
    width: var(--sidebar-w) !important;
    z-index: 500;
  }

  .admin-layout.sidebar-open .sidebar {
    transform: translateX(0);
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 400;
  }

  .mobile-menu-btn { display: block; }
  .collapse-btn { display: none; }
  .breadcrumb { display: none; }

  .main-wrapper { width: 100%; }
  .page-content { padding: 14px; }
  .user-info { display: none; }
  .chevron { display: none; }
}

@media (min-width: 768px) {
  .mobile-overlay { display: none; }
  .mobile-menu-btn { display: none; }
}
</style>