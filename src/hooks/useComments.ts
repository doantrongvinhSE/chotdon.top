import { useState, useEffect, useRef, useCallback } from 'react';
import { Comment, CommentStatus } from '../types/posts';

export function useComments(showToastMessage?: (message: string) => void) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
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
  const itemsPerPage = 10;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchComments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch('http://chotdon.ddnsking.com/comments?timestamp=true');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.success && result.data) {
        setAllComments(result.data);
        
        // Chỉ reset page khi không phải silent refresh (polling)
        if (!silent) {
          setCurrentPage(1);
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
  };

  const fetchTodayCount = async () => {
    try {
      const response = await fetch('http://chotdon.ddnsking.com/comments/count-today');
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
  }, []);

  // Real-time polling effect
  useEffect(() => {
    if (isRealTime) {
      intervalRef.current = setInterval(() => {
        fetchComments(true); // Silent refresh
        fetchTodayCount(); // Fetch today count
      }, 5000); // Poll every 5 seconds
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
  }, [isRealTime]);

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
      const response = await fetch('http://chotdon.ddnsking.com/comments/update', {
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

  // Get paginated comments
  const getPaginatedComments = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return comments.slice(startIndex, endIndex);
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

  // Apply date filter to comments
  const applyDateFilter = useCallback((commentsToFilter: Comment[]) => {
    if (!dateFilter) return commentsToFilter;
    
    return commentsToFilter.filter(comment => {
      const commentDate = new Date(comment.timestamp);
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);
      
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      return commentDate >= start && commentDate <= end;
    });
  }, [dateFilter]);

  // Apply phone filter to comments
  const applyPhoneFilter = useCallback((commentsToFilter: Comment[]) => {
    if (!phoneFilter) return commentsToFilter;
    
    return commentsToFilter.filter(comment => comment.phone && comment.phone.trim() !== '');
  }, [phoneFilter]);

  // Filter comments by date range
  const filterCommentsByDate = (startDate: string, endDate: string) => {
    setDateFilter({ startDate, endDate });
  };

  const clearDateFilter = () => {
    setDateFilter(null);
  };

  const togglePhoneFilter = () => {
    const newValue = !phoneFilter;
    setPhoneFilter(newValue);
    localStorage.setItem('comments-phone-filter', JSON.stringify(newValue));
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

  // Apply filter when dateFilter, phoneFilter or allComments change
  useEffect(() => {
    let filtered = allComments;
    
    // Apply date filter first
    if (dateFilter) {
      filtered = applyDateFilter(filtered);
    }
    
    // Apply phone filter
    if (phoneFilter) {
      filtered = applyPhoneFilter(filtered);
    }
    
    setComments(filtered);
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [dateFilter, phoneFilter, allComments, applyDateFilter, applyPhoneFilter]);

  // Check for new comments and play notification sound
  useEffect(() => {
    if (allComments.length > previousCommentCount && previousCommentCount > 0) {
      // New comment detected, play notification sound
      playNotificationSound();
    }
    setPreviousCommentCount(allComments.length);
  }, [allComments.length, previousCommentCount, playNotificationSound]);

  return {
    comments: getPaginatedComments(),
    allComments: comments,
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
    setCurrentPage,
    toggleRealTime,
    filterCommentsByDate,
    clearDateFilter,
    togglePhoneFilter,
    notificationsEnabled,
    toggleNotifications,
  };
}
