import {
  DashboardOutlined,
  FolderOutlined,
  ChecklistOutlined,
  InventoryOutlined,
  ArticleOutlined,
  PeopleOutline,
  LeaderboardOutlined,
  NotificationsOutlined,
  PeopleAltOutlined,
  VpnKeyOutlined,
  FeedbackOutlined,
  EmailOutlined,
  SettingsOutlined,
  CalendarMonth,
  AdminPanelSettingsOutlined,
  BusinessOutlined,
} from '@mui/icons-material';

// --------------------
// SUPER ADMIN BASE ITEMS
// --------------------
export const superUserItems = [
    // {
    //   title: 'Projects',
    //   icon: <FolderOutlined fontSize="small" />,
    //   key: 'projects',
    // },
    // {
    //   title: 'Staff Management',
    //   icon: <PeopleOutline fontSize="small" />,
    //   key: 'team',
    // },
    // {
    //   title: 'Email Templates',
    //   icon: <EmailOutlined fontSize="small" />,
    //   key: 'email-templates',
    // },
    // {
    //   title: 'Invoices',
    //   icon: <InventoryOutlined fontSize="small" />,
    //   key: 'invoices',
    // },
    // {
    //   title: 'Contracts',
    //   icon: <ArticleOutlined fontSize="small" />,
    //   key: 'contracts',
    // },
    // {
    //   title: 'Reports',
    //   icon: <LeaderboardOutlined fontSize="small" />,
    //   key: 'reports',
    // },
    // {
    //   title: 'Notifications',
    //   icon: <NotificationsOutlined fontSize="small" />,
    //   key: 'notifications',
    // },
    // {
    //   title: 'Client Management',
    //   icon: <PeopleAltOutlined fontSize="small" />,
    //   key: 'clients',
    // },
    // {
    //   title: 'Roles & Permissions',
    //   icon: <VpnKeyOutlined fontSize="small" />,
    //   key: 'permissions',
    // },
    // {
    //   title: 'Calendar',
    //   icon: <CalendarMonth fontSize="small" />,
    //   key: 'calendar',
    // },
    // {
    //   title: 'Support',
    //   icon: <FeedbackOutlined fontSize="small" />,
    //   key: 'support',
    // },
    // {
    //   title: 'Settings',
    //   icon: <SettingsOutlined fontSize="small" />,
    //   key: 'settings',
    // },
  ];

  // --------------------
  // ADMIN (NO ORG / PLANS)
  // --------------------
  export const adminItems = (() => {
    const filteredItems = superUserItems.filter(
      (item) => !['', 'manage-apis', 'email-templates', 'permissions'].includes(item.key)
    );

    const projectsItem = filteredItems.find(item => item.key === 'projects');
    const otherItems = filteredItems.filter(item => item.key !== 'projects');
    const staffManagementIndex = otherItems.findIndex(item => item.key === 'team');

    const itemsWithDepartment: any[] = [];

    if (projectsItem) itemsWithDepartment.push(projectsItem);

    itemsWithDepartment.push(...otherItems.slice(0, staffManagementIndex + 1));

    itemsWithDepartment.push({
      title: 'Department',
      icon: <BusinessOutlined fontSize="small" />,
      key: 'admin/departments',
    });

  itemsWithDepartment.push(...otherItems.slice(staffManagementIndex + 1));

  itemsWithDepartment.push({
    title: 'Admin',
    icon: <AdminPanelSettingsOutlined fontSize="small" />,
    key: 'admin',
    children: [],
  });

  return itemsWithDepartment;
})();

// --------------------
// SUPER ADMIN (WITH ORG + PLANS)
// --------------------
export const superUserItemsWithAdmin = (() => {
  const projectsItem = superUserItems.find(item => item.key === 'projects');
  const otherItems = superUserItems.filter(item => item.key !== 'projects');
  const staffManagementIndex = otherItems.findIndex(item => item.key === 'team');

  const itemsWithAdmin: any[] = [];

  if (projectsItem) itemsWithAdmin.push(projectsItem);

  itemsWithAdmin.push(...otherItems.slice(0, staffManagementIndex + 1));

  // itemsWithAdmin.push({
  //   title: 'Department',
  //   icon: <BusinessOutlined fontSize="small" />,
  //   key: 'admin/departments',
  // });

  itemsWithAdmin.push(...otherItems.slice(staffManagementIndex + 1));

  // ✅ SUPER ADMIN ONLY
  itemsWithAdmin.push({
    title: 'Organization',
    icon: <BusinessOutlined fontSize="small" />,
    key: 'organization',
  });

  itemsWithAdmin.push({
    title: 'Plans',
    icon: <ChecklistOutlined fontSize="small" />,
    key: 'plans',
  });

  // itemsWithAdmin.push({
  //   title: 'Admin',
  //   icon: <AdminPanelSettingsOutlined fontSize="small" />,
  //   key: 'admin',
  //   children: [],
  // });

  return itemsWithAdmin;
})();

// --------------------
// REGULAR USERS
// --------------------
export const regularItems = adminItems.filter(
  (item) =>
    ![
      '',
      'admin',
      'admin/departments',
      'admin/organization',
      'plans',
      'manage-apis',
      'permissions',
      'clients',
      'contracts',
      'reports',
      'email-templates',
      'invoices',
      'team',
    ].includes(item.key)
);
