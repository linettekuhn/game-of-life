export type MenuItem = {
  label: string;
  type?: string;
  action?: () => void;
  checked?: boolean;
  submenu?: MenuItem[];
};
