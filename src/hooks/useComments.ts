import { useState, useEffect, useRef, useCallback } from 'react';
import { Comment, CommentStatus } from '../types/posts';
import { API_ENDPOINTS } from '../config/api';

export function useComments(showToastMessage?: (message: string) => void) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isRealTime, setIsRealTime] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [todayCount, setTodayCount] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string } | null>(null);
  const [phoneFilter, setPhoneFilter] = useState<boolean>(() => {
    const saved = localStorage.getItem('comments-phone-filter');
    return saved ? JSON.parse(saved) : false;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('comments-notifications');
    return saved ? JSON.parse(saved) : false;
  });
  const [previousCommentCount, setPreviousCommentCount] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPageRef = useRef<number>(currentPage);

  const fetchComments = useCallback(async (silent = false, page = currentPage) => {
    try {
      if (!silent) setLoading(true);
      
      // Tạo query parameters
      const params = new URLSearchParams({
        sort: 'timestamp',
        page: page.toString(),
        limit: itemsPerPage.toString()
      });
      
      // Thêm filter parameters nếu có
      if (dateFilter) {
        params.append('startDate', dateFilter.startDate);
        params.append('endDate', dateFilter.endDate);
      }
      
      if (phoneFilter) {
        params.append('phoneFilter', 'true');
      }
      
      const response = await fetch(`${API_ENDPOINTS.COMMENTS}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.success && result.data) {
        // API trả về dữ liệu đã được phân trang
        setComments(result.data); // result.data là array comments
        setTotalItems(result.pagination?.totalItems || result.data.length);
        const apiItemsPerPage = result.pagination?.itemsPerPage || itemsPerPage;
        setTotalPages(result.pagination?.totalPages || Math.ceil((result.pagination?.totalItems || result.data.length) / apiItemsPerPage));
        
        // Cập nhật itemsPerPage từ API response
        if (result.pagination?.itemsPerPage) {
          setItemsPerPage(result.pagination.itemsPerPage);
        }
        
        // Chỉ reset page khi không phải silent refresh (polling)
        if (!silent) {
          setCurrentPage(page);
        }
        
        setError(null);
        setLastUpdate(new Date());
      } else {
        throw new Error('Không thể tải dữ liệu comment');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      if (!silent) {
        setError('Không thể tải dữ liệu từ server');
        setComments([]);
        setTotalItems(0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentPage, dateFilter, phoneFilter, itemsPerPage]);

  const fetchTodayCount = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.COMMENTS}/count-today`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.success && typeof result.data === 'number') {
        setTodayCount(result.data);
      }
    } catch (err) {
      console.error('Error fetching today count:', err);
    }
  };

  useEffect(() => {
    fetchComments();
    fetchTodayCount();
  }, [fetchComments]);

  // Cập nhật currentPageRef khi currentPage thay đổi
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Real-time polling effect
  useEffect(() => {
    if (isRealTime) {
      intervalRef.current = setInterval(() => {
        fetchComments(true, currentPageRef.current); // Silent refresh với trang hiện tại từ ref
        fetchTodayCount(); // Fetch today count
      }, 1500); // Poll every 5 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRealTime, fetchComments]); // Thêm fetchComments vào dependency

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const updateCommentStatus = async (commentId: string, newStatus: CommentStatus) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.COMMENTS}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: commentId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Cập nhật comment với dữ liệu mới từ server
        setComments(prev =>
          prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, ...result.data }
              : comment
          )
        );
        
        if (showToastMessage) {
          const statusText = {
            'normal': 'Bình thường',
            'success': 'Chốt thành công', 
            'fail': 'Chốt thất bại'
          }[newStatus];
          showToastMessage(`Đã cập nhật trạng thái thành: ${statusText}`);
        }
      } else {
        throw new Error(result.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
      if (showToastMessage) {
        showToastMessage('Không thể cập nhật trạng thái. Vui lòng thử lại.');
      }
    }
  };

  // Comments đã được phân trang từ API, không cần phân trang client-side nữa
  const getPaginatedComments = () => {
    return comments;
  };

  const toggleRealTime = () => {
    setIsRealTime(!isRealTime);
  };

  const formatLastUpdate = () => {
    return lastUpdate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Các hàm filter client-side đã được loại bỏ vì API xử lý filter

  // Filter comments by date range
  const filterCommentsByDate = (startDate: string, endDate: string) => {
    setDateFilter({ startDate, endDate });
    setCurrentPage(1); // Reset về trang 1 khi filter
    currentPageRef.current = 1; // Cập nhật ref
    fetchComments(false, 1); // Gọi API với filter mới
  };

  const clearDateFilter = () => {
    setDateFilter(null);
    setCurrentPage(1); // Reset về trang 1 khi clear filter
    currentPageRef.current = 1; // Cập nhật ref
    fetchComments(false, 1); // Gọi API không có filter
  };

  const togglePhoneFilter = () => {
    const newValue = !phoneFilter;
    setPhoneFilter(newValue);
    localStorage.setItem('comments-phone-filter', JSON.stringify(newValue));
    setCurrentPage(1); // Reset về trang 1 khi toggle filter
    currentPageRef.current = 1; // Cập nhật ref
    fetchComments(false, 1); // Gọi API với filter mới
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('comments-notifications', JSON.stringify(newValue));
  };

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!notificationsEnabled) return;
    
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, [notificationsEnabled]);

  // Không cần filter client-side nữa vì API đã xử lý filter
  // Logic filter đã được chuyển vào các hàm filterCommentsByDate, clearDateFilter, togglePhoneFilter

  // Check for new comments and play notification sound
  useEffect(() => {
    if (comments.length > previousCommentCount && previousCommentCount > 0) {
      // New comment detected, play notification sound
      playNotificationSound();
    }
    setPreviousCommentCount(comments.length);
  }, [comments.length, previousCommentCount, playNotificationSound]);

  // Hàm để thay đổi trang và gọi API
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    currentPageRef.current = page; // Cập nhật ref ngay lập tức
    fetchComments(false, page);
  };

  return {
    comments: getPaginatedComments(),
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    isRealTime,
    lastUpdate: formatLastUpdate(),
    todayCount,
    dateFilter,
    phoneFilter,
    updateCommentStatus,
    fetchComments,
    setCurrentPage: handlePageChange,
    toggleRealTime,
    filterCommentsByDate,
    clearDateFilter,
    togglePhoneFilter,
    notificationsEnabled,
    toggleNotifications,
  };
}
