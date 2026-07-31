export type EventItem = {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  time: string | null;
  notes: string;
  done: boolean;
  createdAt: string;
};

export type ListSummary = {
  id: number;
  name: string;
  icon: string;
  itemCount: number;
  checkedCount: number;
  createdAt: string;
};

export type ListItem = {
  id: number;
  listId: number;
  text: string;
  quantity: string | null;
  checked: boolean;
  position: number;
  createdAt: string;
};

export const LIST_ICONS = ["list", "shopping-cart", "plane", "home", "briefcase", "heart"] as const;
export type ListIcon = (typeof LIST_ICONS)[number];
