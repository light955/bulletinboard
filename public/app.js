const postForm = document.getElementById('postForm');
const postsList = document.getElementById('postsList');
const submitBtn = document.getElementById('submitBtn');

// Date formatter
function formatDate(dateString) {
  const options = { 
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('ja-JP', options);
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}

// UI state update
function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
  } else {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

// Fetch and display all posts
async function loadPosts() {
  postsList.innerHTML = '<div class="glass-panel text-center"><div class="loader" style="display: inline-block; border-top-color: var(--primary-color);"></div> &nbsp; 読み込み中...</div>';
  
  try {
    const res = await fetch('/api/posts');
    if (!res.ok) throw new Error('Failed to load posts');
    
    const posts = await res.json();
    postsList.innerHTML = '';

    if (posts.length === 0) {
      postsList.innerHTML = '<div class="glass-panel empty-state">まだ投稿がありません。最初のメッセージを送りましょう！</div>';
      return;
    }

    posts.forEach((post, index) => {
      const delay = Math.min(index * 0.08, 1.5); // Staggered animation, cap at 1.5s avoid excessive waiting
      appendPostToDOM(post, delay);
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    postsList.innerHTML = '<div class="glass-panel text-center" style="color: var(--error-color);">投稿の読み込みに失敗しました。</div>';
  }
}

// Append a single post to the DOM
function appendPostToDOM(post, animationDelay = 0, isNew = false) {
  const card = document.createElement('div');
  card.className = `post-card ${isNew ? 'new' : ''}`;
  card.style.animationDelay = `${animationDelay}s`;
  
  card.innerHTML = `
    <div class="post-header">
      <div class="post-author">${escapeHTML(post.name)}</div>
      <div class="post-date">${formatDate(post.created_at)}</div>
    </div>
    <div class="post-content">${escapeHTML(post.content)}</div>
  `;
  
  if (isNew) {
    if (postsList.querySelector('.empty-state') || document.querySelector('.error-color')) {
      postsList.innerHTML = '';
    }
    postsList.insertBefore(card, postsList.firstChild);
  } else {
    postsList.appendChild(card);
  }
}

// Handle form submission
postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('nameInput').value.trim();
  const content = document.getElementById('messageInput').value.trim();
  
  if (!name || !content) return;

  setLoading(true);

  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to post');
    }

    const newPost = await res.json();
    
    // Clear form content (but keep name for convenience)
    document.getElementById('messageInput').value = '';
    
    // Add new post
    appendPostToDOM(newPost, 0, true);
    
    // Scroll to top of posts list smoothly
    window.scrollTo({
      top: document.querySelector('.posts-section').offsetTop - 20,
      behavior: 'smooth'
    });
    
  } catch (error) {
    console.error('Error creating post:', error);
    alert(`投稿に失敗しました: ${error.message}`);
  } finally {
    setLoading(false);
  }
});

// Initial load
loadPosts();
