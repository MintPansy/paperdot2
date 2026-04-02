interface SidebarItem {
  label: string;
  icon: string;
  activeIcon: string;
  href: string;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "내 문서함",
    icon: "/file-inactive.png",
    activeIcon: "/file-active.png",
    href: "/mypage/mydocument",
  },
  {
    label: "내 계정",
    icon: "/account-inactive.png",
    activeIcon: "/account-active.png",
    href: "/mypage/account",
  },
];
