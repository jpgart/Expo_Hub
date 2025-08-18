import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'AI',
    url: '/dashboard/ai',
    icon: 'brain',
    isActive: false,
    shortcut: ['i', 'a'],
    items: [] // No child items - AI features
  },
  {
    title: 'Exporters',
    url: '/dashboard/exporters',
    icon: 'chartBar',
    isActive: false,
    shortcut: ['e', 'x'],
    items: [] // No child items
  },
  {
    title: 'Importers',
    url: '/dashboard/importers',
    icon: 'chartLine',
    isActive: false,
    shortcut: ['i', 'm'],
    items: [] // No child items - Importers module
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: 'chartPie',
    isActive: false,
    shortcut: ['a', 'n'],
    items: [] // No child items - Advanced analytics
  }
  // Temporarily disabled sections - keep for future activation
  /*
  {
    title: 'Shipments',
    url: '/dashboard/shipments',
    icon: 'truck',
    shortcut: ['s', 's'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Master Data',
    url: '#',
    icon: 'database',
    isActive: false,
    items: [
      {
        title: 'Species & Varieties',
        url: '/dashboard/master/species',
        icon: 'leaf',
        shortcut: ['m', 's']
      },
      {
        title: 'Importers & Exporters',
        url: '/dashboard/master/companies',
        icon: 'building',
        shortcut: ['m', 'c']
      },
      {
        title: 'Ports & Transport',
        url: '/dashboard/master/logistics',
        icon: 'truck',
        shortcut: ['m', 'l']
      }
    ]
  },
  {
    title: 'Account',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,
    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Login',
        shortcut: ['l', 'l'],
        url: '/',
        icon: 'login'
      }
    ]
  },
  {
    title: 'Kanban',
    url: '/dashboard/kanban',
    icon: 'kanban',
    shortcut: ['k', 'k'],
    isActive: false,
    items: [] // No child items
  }
  */
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
