import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CommunitySupport.css';
import FloatingDecorations from './FloatingDecorations';
import GradualBlur from './GradualBlur';

interface User {
  id: number | null;
  username: string;
}

interface Comment {
  id: number;
  content: string;
  user: User | null;
  is_anonymous: boolean;
  like_count: number;
  user_liked: boolean;
  created_at: string;
  parent_comment_id: number | null;
}

interface Post {
  id: number;
  content: string;
  user: User | null;
  is_anonymous: boolean;
  like_count: number;
  comment_count: number;
  share_count: number;
  user_liked: boolean;
  created_at: string;
  moderation_status: string;
}

const CommunitySupport: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [newComment, setNewComment] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check login status from backend session
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch('/api/check-auth', { credentials: 'include' });
        const data = await res.json();
        setIsLoggedIn(data.logged_in === true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/community/posts', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const fetchComments = async (postId: number) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setComments(prev => ({ ...prev, [postId]: data.comments }));
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleNewPost = () => {
    if (!isLoggedIn) {
      alert('Please log in to share your story');
      navigate('/login');
      return;
    }
    setShowNewPost(true);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: newPostContent,
          is_anonymous: isAnonymous
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewPostContent('');
        setShowNewPost(false);
        setErrorMessage(null);
        fetchPosts();
      } else {
        setErrorMessage(data.error || 'Your post could not be published.');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to submit post:', err);
      setErrorMessage('Error submitting post. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!isLoggedIn) {
      setErrorMessage('Please log in to like posts');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, like_count: data.like_count, user_liked: data.action === 'liked' }
            : p
        ));
      }
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  const handleShare = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    const url = `${window.location.origin}/community-support#post-${postId}`;
    const shareText = post?.content?.substring(0, 100) || 'Check out this story on Women Safety Community';

    try {
      // Update share count on backend
      await fetch(`/api/community/posts/${postId}/share`, {
        method: 'POST',
        credentials: 'include'
      });

      // Try native Web Share API first (works on mobile and some desktops)
      if (navigator.share) {
        await navigator.share({
          title: 'Women Safety Community',
          text: shareText + '...',
          url: url
        });
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, share_count: p.share_count + 1 } : p
        ));
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(url);
        setErrorMessage(null);
        // Show success message using a temporary state
        const successDiv = document.createElement('div');
        successDiv.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#10b981;color:white;padding:12px 24px;border-radius:12px;font-weight:500;z-index:9999;box-shadow:0 4px 12px rgba(16,185,129,0.3)';
        successDiv.textContent = '✅ Link copied to clipboard!';
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 2000);

        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, share_count: p.share_count + 1 } : p
        ));
      }
    } catch (err) {
      // User cancelled share or error occurred
      console.log('Share cancelled or error:', err);
    }
  };

  const handleExpandPost = async (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        await fetchComments(postId);
      }
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!newComment.trim()) return;

    if (!isLoggedIn) {
      setErrorMessage('Please log in to comment');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment,
          is_anonymous: commentAnonymous
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewComment('');
        setErrorMessage(null);
        fetchComments(postId);
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p
        ));
      } else {
        console.log('Comment rejected:', data);
        setErrorMessage(data.error || 'Your comment could not be posted.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      setErrorMessage('Error adding comment. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    // Backend stores UTC time, append 'Z' to parse as UTC
    const date = new Date(dateStr.replace(' ', 'T') + 'Z');
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Button styles matching Dock aesthetic
  const glassBtn = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,248,245,0.98) 100%)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 20px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    color: '#2d1b69',
    transition: 'all 0.2s ease'
  };

  const primaryBtn = {
    ...glassBtn,
    background: 'linear-gradient(135deg, #c9a961 0%, #d4af37 100%)',
    color: 'white',
    boxShadow: '0 4px 16px rgba(201,169,97,0.3)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fbeff6 0%, #fff8f4 100%)',
      padding: '40px 20px',
      paddingBottom: '120px'
    }}>
      <FloatingDecorations />
      <GradualBlur position="bottom" height="11.475rem" strength={2.5} divCount={6} curve="ease-out" target="page" animated="scroll" />

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '32px', color: '#2d1b69', fontWeight: 800 }}>
              🤝 Community
            </h1>
            <p style={{ margin: 0, color: '#6b5b8d', fontSize: '14px' }}>
              Share stories, support each other
            </p>
          </div>
          <button onClick={handleNewPost} style={primaryBtn}>
            ✍️ Share Story
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            border: '1px solid #f87171',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(248, 113, 113, 0.2)'
          }}>
            <span style={{ fontSize: '20px' }}>🚫</span>
            <span style={{ color: '#991b1b', fontWeight: 500, fontSize: '14px' }}>
              {errorMessage}
            </span>
            <button
              onClick={() => setErrorMessage(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#991b1b',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* New Post Form */}
        {showNewPost && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#2d1b69' }}>Share Your Story</h3>
            <form onSubmit={handlePostSubmit}>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind? Share your experience, ask for advice, or offer support..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e5e5',
                  fontSize: '15px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ color: '#6b5b8d', fontSize: '14px' }}>🔒 Post anonymously</span>
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setShowNewPost(false)} style={glassBtn}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} style={primaryBtn}>
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b5b8d' }}>
            Loading stories...
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ margin: '0 0 8px', color: '#2d1b69' }}>No stories yet</h3>
            <p style={{ margin: 0, color: '#6b5b8d' }}>Be the first to share your experience!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                id={`post-${post.id}`}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(240,230,246,0.5)'
                }}
              >
                {/* Post Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: post.is_anonymous
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                      : 'linear-gradient(135deg, #c9a961 0%, #d4af37 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '16px'
                  }}>
                    {post.is_anonymous ? '?' : (post.user?.username?.[0]?.toUpperCase() || 'U')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 600,
                      color: post.is_anonymous ? '#6b7280' : '#2d1b69',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {post.is_anonymous ? 'Anonymous' : post.user?.username || 'User'}
                      {post.is_anonymous && (
                        <span style={{
                          fontSize: '11px',
                          background: '#f3f4f6',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          color: '#6b7280'
                        }}>
                          🔒 Anonymous
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {formatTimeAgo(post.created_at)}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p style={{
                  margin: '0 0 16px',
                  color: '#374151',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {post.content}
                </p>

                {/* Engagement Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  borderTop: '1px solid #f3f4f6',
                  paddingTop: '12px'
                }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{
                      ...glassBtn,
                      padding: '8px 16px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: post.user_liked
                        ? 'rgba(239, 68, 68, 0.1)'
                        : glassBtn.background,
                      color: post.user_liked ? '#ef4444' : '#6b7280'
                    }}
                  >
                    {post.user_liked ? '❤️' : '🤍'} {post.like_count}
                  </button>

                  <button
                    onClick={() => handleExpandPost(post.id)}
                    style={{
                      ...glassBtn,
                      padding: '8px 16px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#6b7280'
                    }}
                  >
                    💬 {post.comment_count}
                  </button>

                  <button
                    onClick={() => handleShare(post.id)}
                    style={{
                      ...glassBtn,
                      padding: '8px 16px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#6b7280'
                    }}
                  >
                    🔗 Share
                  </button>
                </div>

                {/* Comments Section */}
                {expandedPost === post.id && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                    {/* Add Comment */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a supportive comment..."
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid #e5e5e5',
                          fontSize: '14px'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                        <input
                          type="checkbox"
                          checked={commentAnonymous}
                          onChange={(e) => setCommentAnonymous(e.target.checked)}
                        />
                        🔒
                      </label>
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={submittingComment}
                        style={{
                          ...primaryBtn,
                          padding: '10px 16px',
                          fontSize: '13px'
                        }}
                      >
                        Reply
                      </button>
                    </div>

                    {/* Comments List */}
                    {comments[post.id]?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {comments[post.id].map((comment) => (
                          <div
                            key={comment.id}
                            style={{
                              background: '#f9fafb',
                              borderRadius: '10px',
                              padding: '12px 16px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span style={{
                                fontWeight: 600,
                                fontSize: '13px',
                                color: comment.is_anonymous ? '#6b7280' : '#2d1b69'
                              }}>
                                {comment.is_anonymous ? '🔒 Anonymous' : comment.user?.username || 'User'}
                              </span>
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                {formatTimeAgo(comment.created_at)}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                              {comment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                        No comments yet. Be the first to show support! 💜
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitySupport;
