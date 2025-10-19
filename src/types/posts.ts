export type RunningPost = {
  id: string;
  url: string;
  title: string;
  isVisible: boolean;
  commentCountToday: number;
  lastCommentAt: Date | null;
  status: 'Đang chạy' | 'Tạm dừng' | 'Lỗi';
  selected?: boolean;
  feedback?: string;
};

export type ApiPost = {
  id: number;
  name: string;
  link: string;
  feedback: string;
  before_content: string;
  updatedAt: string;
  is_running: boolean;
  id_user: number;
};

export type CommentStatus = 'normal' | 'fail' | 'success';

export type Comment = {
  id: string;
  uid: string;
  fb_name: string;
  content: string;
  phone: string | null;
  timestamp: string;
  status: CommentStatus;
  id_post: string;
  post: {
    id: number;
    name: string;
    link: string;
  };
};

export type CommentsResponse = {
  success: boolean;
  data: Comment[];
};

export type Order = {
  id: number;
  product_name: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string;
  createdAt: string;
};

export type OrdersResponse = {
  success: boolean;
  data: Order[];
};