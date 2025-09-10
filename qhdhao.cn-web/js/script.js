// 全局变量
let currentSection = 'home';
let galleryData = [];
let articlesData = [];
let videosData = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadData();
    setupEventListeners();
});

// 初始化应用
function initializeApp() {
    // 设置导航点击事件
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);
            updateActiveNav(this);
        });
    });

    // 设置汉堡菜单
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // 设置相册筛选
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterGallery(filter);
            updateActiveFilter(this);
        });
    });

    // 设置表单提交
    setupFormHandlers();
}

// 显示指定部分
function showSection(sectionId) {
    // 隐藏所有部分
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // 显示目标部分
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
    }

    // 关闭移动端菜单
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.remove('active');
}

// 更新活动导航
function updateActiveNav(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// 更新活动筛选按钮
function updateActiveFilter(activeBtn) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

// 加载数据
async function loadData() {
    try {
        // 加载统计数据
        await loadStats();
        
        // 加载最新动态
        await loadRecentUpdates();
        
        // 加载相册数据
        await loadGallery();
        
        // 加载文章数据
        await loadArticles();
        
        // 加载视频数据
        await loadVideos();
    } catch (error) {
        console.error('加载数据失败:', error);
        showNotification('数据加载失败，请稍后重试', 'error');
    }
}

// 加载统计数据
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        if (response.ok) {
            const stats = await response.json();
            updateStatsDisplay(stats);
        } else {
            // 使用模拟数据
            updateStatsDisplay({
                photos: 12,
                articles: 8,
                videos: 5
            });
        }
    } catch (error) {
        // 使用模拟数据
        updateStatsDisplay({
            photos: 12,
            articles: 8,
            videos: 5
        });
    }
}

// 更新统计显示
function updateStatsDisplay(stats) {
    animateNumber('photo-count', stats.photos);
    animateNumber('article-count', stats.articles);
    animateNumber('video-count', stats.videos);
}

// 数字动画
function animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let currentNumber = 0;
    const increment = targetNumber / 50;
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= targetNumber) {
            currentNumber = targetNumber;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentNumber);
    }, 30);
}

// 加载最新动态
async function loadRecentUpdates() {
    try {
        const response = await fetch('/api/recent');
        if (response.ok) {
            const updates = await response.json();
            displayRecentUpdates(updates);
        } else {
            // 使用模拟数据
            displayRecentUpdates(getMockRecentUpdates());
        }
    } catch (error) {
        displayRecentUpdates(getMockRecentUpdates());
    }
}

// 显示最新动态
function displayRecentUpdates(updates) {
    const container = document.getElementById('recent-updates');
    if (!container) return;

    container.innerHTML = '';
    updates.forEach(update => {
        const updateCard = createUpdateCard(update);
        container.appendChild(updateCard);
    });
}

// 创建动态卡片
function createUpdateCard(update) {
    const card = document.createElement('div');
    card.className = 'update-card';
    
    card.innerHTML = `
        <img src="${update.image || '/images/placeholder.jpg'}" alt="${update.title}">
        <h4>${update.title}</h4>
        <p>${update.description}</p>
        <div class="update-meta">
            <span class="update-type">${update.type}</span>
            <span class="update-date">${formatDate(update.date)}</span>
        </div>
    `;
    
    return card;
}

// 加载相册数据
async function loadGallery() {
    try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
            const gallery = await response.json();
            galleryData = gallery;
            displayGallery(gallery);
        } else {
            // 使用模拟数据
            const mockGallery = getMockGalleryData();
            galleryData = mockGallery;
            displayGallery(mockGallery);
        }
    } catch (error) {
        const mockGallery = getMockGalleryData();
        galleryData = mockGallery;
        displayGallery(mockGallery);
    }
}

// 显示相册
function displayGallery(gallery) {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    container.innerHTML = '';
    gallery.forEach(item => {
        const galleryItem = createGalleryItem(item);
        container.appendChild(galleryItem);
    });
}

// 创建相册项目
function createGalleryItem(item) {
    const itemElement = document.createElement('div');
    itemElement.className = `gallery-item ${item.category}`;
    
    itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <div class="overlay">
            <h4>${item.title}</h4>
            <p>${item.description}</p>
            <span class="category">${getCategoryName(item.category)}</span>
        </div>
    `;
    
    return itemElement;
}

// 筛选相册
function filterGallery(filter) {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        if (filter === 'all' || item.classList.contains(filter)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// 加载文章数据
async function loadArticles() {
    try {
        const response = await fetch('/api/articles');
        if (response.ok) {
            const articles = await response.json();
            articlesData = articles;
            displayArticles(articles);
        } else {
            // 使用模拟数据
            const mockArticles = getMockArticlesData();
            articlesData = mockArticles;
            displayArticles(mockArticles);
        }
    } catch (error) {
        const mockArticles = getMockArticlesData();
        articlesData = mockArticles;
        displayArticles(mockArticles);
    }
}

// 显示文章
function displayArticles(articles) {
    const container = document.getElementById('articles-list');
    if (!container) return;

    container.innerHTML = '';
    articles.forEach(article => {
        const articleCard = createArticleCard(article);
        container.appendChild(articleCard);
    });
}

// 创建文章卡片
function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    
    card.innerHTML = `
        <h3>${article.title}</h3>
        <div class="article-meta">
            <span>${formatDate(article.date)}</span>
            <span>•</span>
            <span>${article.readTime} 分钟阅读</span>
        </div>
        <div class="article-excerpt">${article.excerpt}</div>
        <div class="article-tags">
            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    `;
    
    return card;
}

// 加载视频数据
async function loadVideos() {
    try {
        const response = await fetch('/api/videos');
        if (response.ok) {
            const videos = await response.json();
            videosData = videos;
            displayVideos(videos);
        } else {
            // 使用模拟数据
            const mockVideos = getMockVideosData();
            videosData = mockVideos;
            displayVideos(mockVideos);
        }
    } catch (error) {
        const mockVideos = getMockVideosData();
        videosData = mockVideos;
        displayVideos(mockVideos);
    }
}

// 显示视频
function displayVideos(videos) {
    const container = document.getElementById('videos-grid');
    if (!container) return;

    container.innerHTML = '';
    videos.forEach(video => {
        const videoCard = createVideoCard(video);
        container.appendChild(videoCard);
    });
}

// 创建视频卡片
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    card.innerHTML = `
        <video controls>
            <source src="${video.url}" type="video/mp4">
            您的浏览器不支持视频播放。
        </video>
        <div class="video-info">
            <h3>${video.title}</h3>
            <p>${video.description}</p>
        </div>
    `;
    
    return card;
}

// 设置表单处理器
function setupFormHandlers() {
    // 上传表单
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }

    // 写文章表单
    const writeForm = document.getElementById('writeForm');
    if (writeForm) {
        writeForm.addEventListener('submit', handleWriteArticle);
    }
}

// 处理上传
async function handleUpload(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const uploadType = document.getElementById('uploadTitle').textContent.includes('照片') ? 'image' : 'video';
    
    try {
        showNotification('正在上传...', 'info');
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showNotification('上传成功！', 'success');
            closeUploadModal();
            e.target.reset();
            // 重新加载数据
            if (uploadType === 'image') {
                loadGallery();
            } else {
                loadVideos();
            }
        } else {
            throw new Error('上传失败');
        }
    } catch (error) {
        showNotification('上传失败，请重试', 'error');
    }
}

// 处理写文章
async function handleWriteArticle(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const articleData = {
        title: formData.get('title'),
        content: formData.get('content'),
        tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    try {
        showNotification('正在发布...', 'info');
        
        const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(articleData)
        });
        
        if (response.ok) {
            showNotification('文章发布成功！', 'success');
            closeWriteModal();
            e.target.reset();
            loadArticles();
        } else {
            throw new Error('发布失败');
        }
    } catch (error) {
        showNotification('发布失败，请重试', 'error');
    }
}

// 打开上传模态框
function openUploadModal(type) {
    const modal = document.getElementById('uploadModal');
    const title = document.getElementById('uploadTitle');
    const fileInput = document.getElementById('fileInput');
    
    if (type === 'image') {
        title.textContent = '上传照片';
        fileInput.accept = 'image/*';
    } else {
        title.textContent = '上传视频';
        fileInput.accept = 'video/*';
    }
    
    modal.style.display = 'block';
}

// 关闭上传模态框
function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.style.display = 'none';
}

// 打开写文章模态框
function openWriteModal() {
    const modal = document.getElementById('writeModal');
    modal.style.display = 'block';
}

// 关闭写文章模态框
function closeWriteModal() {
    const modal = document.getElementById('writeModal');
    modal.style.display = 'none';
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 3000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 设置事件监听器
function setupEventListeners() {
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        const uploadModal = document.getElementById('uploadModal');
        const writeModal = document.getElementById('writeModal');
        
        if (e.target === uploadModal) {
            closeUploadModal();
        }
        if (e.target === writeModal) {
            closeWriteModal();
        }
    });
}

// 工具函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getCategoryName(category) {
    const categoryNames = {
        'nature': '自然',
        'travel': '旅行',
        'daily': '日常'
    };
    return categoryNames[category] || category;
}

// 模拟数据函数
function getMockRecentUpdates() {
    return [
        {
            title: '春日樱花',
            description: '公园里的樱花盛开，粉色的花瓣在微风中飘舞',
            type: '照片',
            date: '2024-03-15',
            image: 'https://via.placeholder.com/300x200/FFB6C1/FFFFFF?text=樱花'
        },
        {
            title: '关于生活的思考',
            description: '记录一些关于生活的小感悟和思考',
            type: '文章',
            date: '2024-03-14',
            image: 'https://via.placeholder.com/300x200/87CEEB/FFFFFF?text=思考'
        },
        {
            title: '旅行vlog',
            description: '记录一次美好的旅行经历',
            type: '视频',
            date: '2024-03-13',
            image: 'https://via.placeholder.com/300x200/98FB98/FFFFFF?text=旅行'
        }
    ];
}

function getMockGalleryData() {
    return [
        {
            id: 1,
            title: '春日樱花',
            description: '公园里的樱花盛开',
            image: 'https://via.placeholder.com/250x200/FFB6C1/FFFFFF?text=樱花',
            category: 'nature',
            date: '2024-03-15'
        },
        {
            id: 2,
            title: '城市夜景',
            description: '夜晚的城市灯火辉煌',
            image: 'https://via.placeholder.com/250x200/4169E1/FFFFFF?text=夜景',
            category: 'daily',
            date: '2024-03-14'
        },
        {
            id: 3,
            title: '山间小径',
            description: '徒步旅行中的美丽风景',
            image: 'https://via.placeholder.com/250x200/228B22/FFFFFF?text=山径',
            category: 'travel',
            date: '2024-03-13'
        },
        {
            id: 4,
            title: '咖啡时光',
            description: '悠闲的下午茶时光',
            image: 'https://via.placeholder.com/250x200/8B4513/FFFFFF?text=咖啡',
            category: 'daily',
            date: '2024-03-12'
        }
    ];
}

function getMockArticlesData() {
    return [
        {
            id: 1,
            title: '关于生活的思考',
            excerpt: '生活就像一本书，每一页都记录着我们的成长和感悟。在这个快节奏的时代，我们需要学会慢下来，感受生活的美好...',
            content: '完整文章内容...',
            tags: ['生活', '思考', '感悟'],
            date: '2024-03-14',
            readTime: 5
        },
        {
            id: 2,
            title: '旅行中的收获',
            excerpt: '每一次旅行都是一次心灵的洗礼，让我们在陌生的环境中重新认识自己，发现生活的无限可能...',
            content: '完整文章内容...',
            tags: ['旅行', '成长', '发现'],
            date: '2024-03-10',
            readTime: 8
        }
    ];
}

function getMockVideosData() {
    return [
        {
            id: 1,
            title: '春日踏青',
            description: '记录一次美好的春日踏青之旅',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            date: '2024-03-13'
        },
        {
            id: 2,
            title: '城市漫步',
            description: '在城市中漫步，发现隐藏的美好',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
            date: '2024-03-10'
        }
    ];
}
