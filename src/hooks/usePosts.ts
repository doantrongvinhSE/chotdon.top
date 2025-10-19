import { useState, useEffect, useRef, useCallback } from 'react';
import { RunningPost, ApiPost } from '../types/posts';
import { mapApiPostToRunningPost } from '../utils/posts';

export function usePosts(showToastMessage?: (message: string) => void) {
  const [items, setItems] = useState<RunningPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingPost, setAddingPost] = useState(false);
  const [addingBulk, setAddingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Realtime polling states
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true); // Auto enable
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const POLLING_INTERVAL = 7000; // 7 giây

  const fetchPosts = async (isPolling = false) => {
    try {
      if (!isPolling) {
        setLoading(true);
      }
      setIsPolling(true);
      
      const response = await fetch('http://160.250.133.235/posts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiPosts: ApiPost[] = await response.json();
      
      const mappedPosts: RunningPost[] = apiPosts.map(mapApiPostToRunningPost);
      // Sort by updatedAt descending (newest first)
      mappedPosts.sort((a, b) => {
        if (!a.lastCommentAt && !b.lastCommentAt) return 0;
        if (!a.lastCommentAt) return 1;
        if (!b.lastCommentAt) return -1;
        return b.lastCommentAt.getTime() - a.lastCommentAt.getTime();
      });
      
      setItems(mappedPosts);
      setTotalItems(mappedPosts.length);
      setTotalPages(Math.ceil(mappedPosts.length / itemsPerPage));
      if (!isPolling) {
        setCurrentPage(1);
      }
      setError(null);
      setLastPollTime(new Date());
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Không thể tải dữ liệu từ server');
      // Set empty data when API fails
      setItems([]);
      setTotalItems(0);
      setTotalPages(1);
      if (!isPolling) {
        setCurrentPage(1);
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
      setIsPolling(false);
    }
  };

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(() => {
      fetchPosts(true);
    }, POLLING_INTERVAL);
  }, []);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Toggle realtime polling
  const toggleRealtime = () => {
    if (isRealtimeEnabled) {
      stopPolling();
      setIsRealtimeEnabled(false);
    } else {
      startPolling();
      setIsRealtimeEnabled(true);
    }
  };

  useEffect(() => {
    fetchPosts();
    
    // Auto start polling
    startPolling();
    
    // Cleanup polling on unmount
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  const addPost = async (newPost: Omit<RunningPost, 'id'>) => {
    try {
      setAddingPost(true);
      const response = await fetch('http://160.250.133.235/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPost.title,
          link: newPost.url,
          id_user: 1
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.message === 'Post created successfully' && result.data) {
        const apiPost = result.data;
        const mappedPost: RunningPost = {
          id: apiPost.id.toString(),
          url: apiPost.link,
          title: apiPost.name,
          isVisible: apiPost.is_running,
          commentCountToday: 0,
          lastCommentAt: new Date(apiPost.updatedAt),
          status: apiPost.is_running ? 'Đang chạy' : 'Tạm dừng',
        };
        
        setItems(prev => [mappedPost, ...prev]);
        
        if (showToastMessage) {
          showToastMessage('Đã thêm bài viết thành công!');
        }
      } else {
        throw new Error(result.message || 'Tạo bài viết thất bại');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (showToastMessage) {
        showToastMessage('Không thể tạo bài viết. Vui lòng thử lại.');
      }
    } finally {
      setAddingPost(false);
    }
  };

  const addBulkPosts = async (newPosts: Omit<RunningPost, 'id'>[]) => {
    setAddingBulk(true);
    setBulkProgress({ current: 0, total: newPosts.length });
    const createdPosts: RunningPost[] = [];
    const errors: string[] = [];

    for (let i = 0; i < newPosts.length; i++) {
      const post = newPosts[i];
      setBulkProgress({ current: i + 1, total: newPosts.length });
      
      try {
        const response = await fetch('http://160.250.133.235/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: post.title,
            link: post.url,
            id_user: 1
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.message === 'Post created successfully' && result.data) {
          const apiPost = result.data;
          const mappedPost: RunningPost = {
            id: apiPost.id.toString(),
            url: apiPost.link,
            title: apiPost.name,
            isVisible: apiPost.is_running,
            commentCountToday: 0,
            lastCommentAt: new Date(apiPost.updatedAt),
            status: apiPost.is_running ? 'Đang chạy' : 'Tạm dừng',
          };
          createdPosts.push(mappedPost);
        } else {
          errors.push(`Bài viết ${i + 1}: ${result.message || 'Tạo thất bại'}`);
        }
      } catch (error) {
        console.error(`Error creating post ${i + 1}:`, error);
        errors.push(`Bài viết ${i + 1}: Không thể tạo bài viết`);
      }
      
      // Add delay between requests (1000-2000ms)
      if (i < newPosts.length - 1) {
        const delay = Math.random() * 1000 + 1000; // 1000-2000ms
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Add successfully created posts to the list
    if (createdPosts.length > 0) {
      setItems(prev => [...createdPosts, ...prev]);
    }

    // Show toast with results
    if (showToastMessage) {
      if (errors.length === 0) {
        showToastMessage(`Đã thêm ${createdPosts.length} bài viết thành công!`);
      } else if (createdPosts.length > 0) {
        showToastMessage(`Đã thêm ${createdPosts.length}/${newPosts.length} bài viết. ${errors.length} bài viết thất bại.`);
      } else {
        showToastMessage(`Không thể thêm bài viết nào. Vui lòng thử lại.`);
      }
    }
    
    setAddingBulk(false);
    setBulkProgress({ current: 0, total: 0 });
  };

  const toggleItemVisibility = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;

    const newIsRunning = !item.isVisible;
    
    try {
      const response = await fetch(`http://160.250.133.235/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_running: newIsRunning
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setItems(prev =>
          prev.map(item => 
            item.id === id 
              ? { 
                  ...item, 
                  isVisible: newIsRunning,
                  status: newIsRunning ? 'Đang chạy' : 'Tạm dừng'
                } 
              : item
          )
        );
        // Show success toast
        if (showToastMessage) {
          showToastMessage(newIsRunning ? 'Đã bật bài viết thành công!' : 'Đã tắt bài viết thành công!');
        }
      } else {
        throw new Error(result.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating post status:', error);
      // Revert UI state on error
      setItems(prev =>
        prev.map(item => 
          item.id === id 
            ? { 
                ...item, 
                isVisible: item.isVisible, // Keep original state
                status: item.status // Keep original status
              } 
            : item
        )
      );
      // Show error toast
      if (showToastMessage) {
        showToastMessage('Không thể cập nhật trạng thái. Vui lòng thử lại.');
      }
    }
  };

  const toggleSelectAll = (selectAll: boolean) => {
    setItems(prev => prev.map(item => ({ ...item, selected: selectAll })));
  };

  const toggleSelectOne = (id: string) => {
    setItems(prev =>
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const deletePost = async (id: string) => {
    try {
      const response = await fetch(`http://160.250.133.235/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setItems(prev => prev.filter(item => item.id !== id));
        if (showToastMessage) {
          showToastMessage('Đã xóa bài viết thành công!');
        }
      } else {
        throw new Error(result.message || 'Xóa thất bại');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      if (showToastMessage) {
        showToastMessage('Không thể xóa bài viết. Vui lòng thử lại.');
      }
    }
  };

  const updatePost = async (id: string, data: { name: string; link: string }) => {
    try {
      const response = await fetch(`http://160.250.133.235/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Check if the response indicates success
      if (result.success && result.data) {
        // Update the item in the local state with the returned data
        setItems(prev => prev.map(item => 
          item.id === id 
            ? { 
                ...item, 
                title: result.data.name, 
                url: result.data.link,
                lastCommentAt: new Date(result.data.updatedAt)
              }
            : item
        ));

        if (showToastMessage) {
          showToastMessage('Cập nhật bài viết thành công!');
        }
      } else {
        throw new Error(result.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      if (showToastMessage) {
        showToastMessage('Không thể cập nhật bài viết. Vui lòng thử lại.');
      }
      throw error;
    }
  };

  const deleteSelectedPosts = async () => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) return;

    const deletePromises = selectedItems.map(item =>
      fetch(`http://160.250.133.235/posts/${item.id}`, {
        method: 'DELETE',
      })
    );

    try {
      const responses = await Promise.all(deletePromises);
      
      // Check if all requests were successful
      const allSuccessful = responses.every(response => response.ok);
      
      if (allSuccessful) {
        setItems(prev => prev.filter(item => !item.selected));
        if (showToastMessage) {
          showToastMessage(`Đã xóa ${selectedItems.length} bài viết thành công!`);
        }
      } else {
        throw new Error('Một số bài viết không thể xóa');
      }
    } catch (error) {
      console.error('Error deleting selected posts:', error);
      if (showToastMessage) {
        showToastMessage('Không thể xóa một số bài viết. Vui lòng thử lại.');
      }
    }
  };

  // Get paginated items
  const getPaginatedItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  return {
    items: getPaginatedItems(),
    allItems: items,
    loading,
    error,
    addingPost,
    addingBulk,
    bulkProgress,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    addPost,
    addBulkPosts,
    updatePost,
    toggleItemVisibility,
    toggleSelectAll,
    toggleSelectOne,
    deletePost,
    deleteSelectedPosts,
    fetchPosts,
    setCurrentPage,
    // Realtime polling
    isRealtimeEnabled,
    isPolling,
    lastPollTime,
    toggleRealtime,
  };
}
