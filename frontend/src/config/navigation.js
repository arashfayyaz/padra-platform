export const navigationItems = [
  {
    id: 'home',
    label: 'خانه',
    path: '/',
    icon: 'bi-house',
    public: true,
  },
  {
    id: 'search',
    label: 'جستجوی بلیط',
    path: '/search',
    icon: 'bi-search',
    public: true,
  },
  {
    id: 'bookings',
    label: 'رزروهای من',
    path: '/my-bookings',
    icon: 'bi-ticket-perforated',
    requiresAuth: true,
  },
  {
    id: 'admin',
    label: 'مدیریت',
    path: '/admin',
    icon: 'bi-speedometer2',
    requiresAuth: true,
    requiresAdmin: true,
  },
];

export function getVisibleNavigation({ user, isAdmin }) {
  return navigationItems.filter((item) => {
    if (item.requiresAuth && !user) return false;
    if (item.requiresAdmin && !isAdmin) return false;

    return true;
  });
}
