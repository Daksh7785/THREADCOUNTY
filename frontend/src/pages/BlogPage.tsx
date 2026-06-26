import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, User, ArrowRight, Tag, Search } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Understanding Thread Density Analysis with AI',
    excerpt: 'Learn how artificial intelligence is revolutionizing the way textile professionals measure and analyze thread density in fabric samples.',
    author: 'Dr. Ananya Sharma',
    date: '2026-06-20',
    readTime: '8 min read',
    category: 'AI & Technology',
    image: '🔬',
    content: 'Thread density analysis has traditionally been a manual process requiring trained technicians and optical microscopes. With the advent of computer vision and deep learning, platforms like ThreadCounty can now automate this process with remarkable accuracy...'
  },
  {
    id: 2,
    title: 'The Complete Guide to Weave Structures',
    excerpt: 'From plain weave to complex jacquard patterns — a comprehensive overview of fabric weave types and how they affect textile properties.',
    author: 'Prof. Rahul Mehta',
    date: '2026-06-15',
    readTime: '12 min read',
    category: 'Textile Science',
    image: '🧵',
    content: 'Weave structure is one of the fundamental properties of any woven fabric. It determines the fabric\'s texture, strength, drape, and appearance...'
  },
  {
    id: 3,
    title: 'Quality Control Best Practices in Textile Manufacturing',
    excerpt: 'Discover the essential quality control procedures every textile manufacturer should implement to ensure consistent product quality.',
    author: 'Priya Patel',
    date: '2026-06-10',
    readTime: '6 min read',
    category: 'Manufacturing',
    image: '🏭',
    content: 'Quality control in textile manufacturing encompasses everything from raw material inspection to finished product testing...'
  },
  {
    id: 4,
    title: 'How Computer Vision Detects Fabric Defects',
    excerpt: 'An in-depth look at how convolutional neural networks identify weaving defects, stains, and irregularities in real-time.',
    author: 'Dr. Vikram Singh',
    date: '2026-06-05',
    readTime: '10 min read',
    category: 'AI & Technology',
    image: '👁️',
    content: 'Fabric defect detection is a critical step in textile quality assurance. Traditional methods rely on human inspectors who must examine vast lengths of fabric under controlled lighting conditions...'
  },
  {
    id: 5,
    title: 'Sustainable Textiles: The Future of Eco-Friendly Fabrics',
    excerpt: 'Exploring how sustainable practices and AI-driven optimization are shaping the next generation of environmentally conscious textiles.',
    author: 'Meera Joshi',
    date: '2026-05-28',
    readTime: '7 min read',
    category: 'Sustainability',
    image: '🌱',
    content: 'The textile industry is one of the largest polluters globally. However, a new wave of sustainable practices, powered by technology and AI, is changing the landscape...'
  },
  {
    id: 6,
    title: 'Getting Started with ThreadCounty: A Beginner\'s Guide',
    excerpt: 'Step-by-step tutorial on how to upload your first fabric image, run AI analysis, and interpret the results like a pro.',
    author: 'ThreadCounty Team',
    date: '2026-05-20',
    readTime: '5 min read',
    category: 'Tutorials',
    image: '📖',
    content: 'Welcome to ThreadCounty! This guide will walk you through the entire process of analyzing your first fabric sample using our platform...'
  }
];

const CATEGORIES = ['All', 'AI & Technology', 'Textile Science', 'Manufacturing', 'Sustainability', 'Tutorials'];

export const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
            <BookOpen className="h-3.5 w-3.5" />
            Knowledge Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ThreadCounty Blog
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Explore the latest insights in textile technology, AI-powered analysis, and industry best practices.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <article 
              key={post.id} 
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Card Image Area */}
              <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 flex items-center justify-center text-6xl">
                {post.image}
              </div>

              <div className="p-5 flex flex-col flex-1">
                {/* Category Tag */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                    <Tag className="h-2.5 w-2.5" />
                    {post.category}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-1">
                  {expandedPost === post.id ? post.content : post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-3 transition-all"
                >
                  {expandedPost === post.id ? 'Show Less' : 'Read More'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-500">No articles found</h3>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
