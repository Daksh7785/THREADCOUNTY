import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Clock, User, Send, Filter, TrendingUp, Pin, MessageCircle } from 'lucide-react';

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  avatar: string;
  date: string;
  likes: number;
  replies: number;
  category: string;
  pinned?: boolean;
  tags: string[];
}

const FORUM_POSTS: ForumPost[] = [
  {
    id: 1,
    title: 'Tips for capturing better fabric macro shots for analysis',
    content: 'I\'ve been experimenting with different lighting setups and camera distances to get the best results from ThreadCounty\'s AI analysis. Here are my top 5 tips for getting accurate thread density readings...',
    author: 'TextilePro_Sarah',
    avatar: '👩‍🔬',
    date: '2026-06-25',
    likes: 24,
    replies: 8,
    category: 'Tips & Tricks',
    pinned: true,
    tags: ['photography', 'best-practices']
  },
  {
    id: 2,
    title: 'Plain weave vs Twill weave — AI detection accuracy comparison',
    content: 'Has anyone compared the AI confidence scores between plain weave and twill weave samples? I\'m finding that plain weaves consistently score 95%+ while twill samples hover around 88%...',
    author: 'WeaveMaster_Raj',
    avatar: '👨‍💻',
    date: '2026-06-24',
    likes: 15,
    replies: 12,
    category: 'Analysis Discussion',
    tags: ['accuracy', 'weave-types']
  },
  {
    id: 3,
    title: 'How I used ThreadCounty for my textile engineering thesis',
    content: 'Just submitted my thesis on automated fabric quality inspection using AI. ThreadCounty was instrumental in generating over 200 analysis reports for my research dataset. Here\'s how I set up my workflow...',
    author: 'StudentResearcher',
    avatar: '🎓',
    date: '2026-06-22',
    likes: 42,
    replies: 15,
    category: 'Research & Academia',
    tags: ['thesis', 'case-study']
  },
  {
    id: 4,
    title: 'Feature request: Batch upload for production line QC',
    content: 'We process around 500 fabric samples per day at our manufacturing facility. It would be incredibly helpful to have a batch upload feature that queues multiple images for sequential analysis...',
    author: 'QCManager_Anil',
    avatar: '🏭',
    date: '2026-06-20',
    likes: 31,
    replies: 6,
    category: 'Feature Requests',
    tags: ['batch-upload', 'enterprise']
  },
  {
    id: 5,
    title: 'Understanding warp and weft count differences in denim',
    content: 'I\'ve been analyzing different denim samples and noticed interesting patterns in warp vs weft counts. Heavier denim (14oz+) tends to show a much tighter warp density. Anyone else seeing similar results?',
    author: 'DenimEnthusiast',
    avatar: '👖',
    date: '2026-06-18',
    likes: 19,
    replies: 9,
    category: 'Analysis Discussion',
    tags: ['denim', 'thread-count']
  },
  {
    id: 6,
    title: 'New to textile analysis — where should I start?',
    content: 'Hi everyone! I\'m a fashion design student and just discovered ThreadCounty. I\'m completely new to fabric analysis. What are the most important metrics I should pay attention to when analyzing my fabric samples?',
    author: 'FashionNewbie',
    avatar: '✨',
    date: '2026-06-15',
    likes: 8,
    replies: 20,
    category: 'Getting Started',
    tags: ['beginner', 'help']
  }
];

const CATEGORIES = ['All', 'Tips & Tricks', 'Analysis Discussion', 'Research & Academia', 'Feature Requests', 'Getting Started'];

export const ForumPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [posts, setPosts] = useState(FORUM_POSTS);

  const filteredPosts = posts.filter(post => 
    selectedCategory === 'All' || post.category === selectedCategory
  );

  const handleLike = (postId: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleNewPost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const newPost: ForumPost = {
      id: Date.now(),
      title: newPostTitle,
      content: newPostContent,
      author: 'You',
      avatar: '🧑',
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      replies: 0,
      category: 'Getting Started',
      tags: ['new']
    };
    setPosts(prev => [newPost, ...prev]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPost(false);
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold">
            <MessageSquare className="h-3.5 w-3.5" />
            Community
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Community Forum
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Connect with textile professionals, share your analysis results, and learn from the community.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Threads', value: posts.length, icon: MessageCircle },
            { label: 'Active Members', value: '1.2K', icon: User },
            { label: 'Trending Topics', value: '15', icon: TrendingUp },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <stat.icon className="h-5 w-5 mx-auto text-purple-500 mb-1" />
              <p className="text-xl font-extrabold">{stat.value}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* New Post Button + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-slate-400 mt-1.5" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowNewPost(!showNewPost)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
          >
            <Send className="h-3.5 w-3.5" />
            New Thread
          </button>
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <div className="mb-8 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/40 rounded-2xl p-6 space-y-4 shadow-lg">
            <h3 className="font-bold text-sm">Create a New Thread</h3>
            <input
              type="text"
              placeholder="Thread title..."
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <textarea
              placeholder="Share your thoughts, questions, or findings..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
            />
            <div className="flex gap-3">
              <button onClick={handleNewPost} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all">
                Post Thread
              </button>
              <button onClick={() => setShowNewPost(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Forum Posts List */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div 
              key={post.id} 
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-purple-500/5 ${
                post.pinned 
                  ? 'border-purple-300 dark:border-purple-800/60' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="text-3xl flex-shrink-0">{post.avatar}</div>
                
                <div className="flex-1 min-w-0">
                  {/* Title Row */}
                  <div className="flex items-start gap-2 mb-1">
                    {post.pinned && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded mt-0.5">
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </span>
                    )}
                    <h3 className="font-bold text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                  </div>

                  {/* Content Preview */}
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 line-clamp-2">
                    {post.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer Meta */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 hover:text-purple-500 transition-colors"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {post.likes}
                      </button>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.replies} replies
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-500">No threads found</h3>
            <p className="text-slate-400 text-sm mt-1">Be the first to start a discussion in this category!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage;
