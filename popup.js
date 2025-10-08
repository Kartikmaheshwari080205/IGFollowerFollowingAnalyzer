class PopupManager {
  constructor() {
    this.data = null;
    this.init();
  }
  
  async init() {
    await this.loadData();
    this.render();
    this.attachEventListeners();
  }
  
  async loadData() {
    try {
      const dataResponse = await chrome.runtime.sendMessage({ action: 'getAnalysisData' });
      this.data = dataResponse.followersData;
      this.lastUpdated = dataResponse.lastUpdated;
    } catch (error) {
      this.data = null;
    }
  }
  
  render() {
    const content = document.getElementById('content');
    
    if (!this.data) {
      content.innerHTML = this.renderNoDataState();
      return;
    }
    
    content.innerHTML = this.renderAnalysisResults();
    
    setTimeout(() => {
      this.loadProfilePictures();
    }, 100);
  }
  
  renderNoDataState() {
    return `
      <div class="status no-data">
        📊 Ready to analyze!
      </div>
      <div class="instructions">
        <p><strong>How to use:</strong></p>
        <ol>
          <li><strong>Make sure you're on Instagram</strong><br/>
              <small>Go to any Instagram page and make sure you're logged in</small></li>
          <li><strong>Click the "Start Analysis" button below</strong><br/>
              <small>The extension will automatically fetch your data</small></li>
          <li><strong>Wait for completion</strong><br/>
              <small>This may take a few seconds to complete</small></li>
        </ol>
      </div>
      <button class="button" id="startAnalysis">
        📊 Start Analysis
      </button>
      <button class="button secondary" id="openInstagram">
        🔗 Open Instagram
      </button>
    `;
  }
  
  renderAnalysisResults() {
    const { stats } = this.data;
    
    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${stats.totalFollowers}</div>
          <div class="stat-label">Followers</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.totalFollowing}</div>
          <div class="stat-label">Following</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.mutualFollows}</div>
          <div class="stat-label">Mutual</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.dontFollowMeBackCount}</div>
          <div class="stat-label">Don't Follow Back</div>
        </div>
      </div>
      
      ${this.renderSection('Don\'t Follow Me Back', this.data.dontFollowMeBack, 'dontFollowMeBack', '😞')}
      ${this.renderSection('I Don\'t Follow Back', this.data.iDontFollowBack, 'iDontFollowBack', '🤷‍♂️')}
      ${this.renderSection('All Followers', this.data.followers, 'followers', '👥')}
      ${this.renderSection('All Following', this.data.following, 'following', '➡️')}
      
      <div class="last-updated">
        Last updated: ${this.formatDate(this.lastUpdated)}
      </div>
      
      <button class="button" id="refreshAnalysis">
        Refresh Analysis
      </button>
      
      <div class="disclaimer">
        * Counts may differ slightly due to disabled accounts
      </div>
    `;
  }


  
  renderSection(title, users, sectionId, emoji) {
    if (!users || users.length === 0) {
      return `
        <div class="section">
          <div class="section-header">
            <span>${emoji} ${title} (0)</span>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="section">
        <div class="section-header" data-section="${sectionId}">
          <span>${emoji} ${title} (${users.length})</span>
          <span class="chevron">▼</span>
        </div>
        <div class="section-content" id="${sectionId}">
          ${users.length > 0 ? this.renderUserList(users) : '<div class="empty-state">No users found</div>'}
        </div>
      </div>
    `;
  }
  
  renderUserList(users) {
    return `
      <ul class="user-list">
        ${users.map(user => {
          const username = typeof user === 'string' ? user : user.username;
          const fullName = typeof user === 'object' && user.full_name ? user.full_name : '';
          return `
            <li class="user-item clickable-user" data-username="${username}">
              <div class="user-avatar">
                <img class="profile-pic" 
                     src="https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0095f6&color=fff&size=32&font-size=0.6" 
                     data-username="${username}" 
                     alt="${username}" 
                     style="display: block;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="avatar-fallback" style="display: none;">${username.charAt(0).toUpperCase()}</div>
              </div>
              <div class="user-info">
                <div class="user-name">@${username}</div>
                ${fullName ? `<div class="user-fullname">${fullName}</div>` : ''}
              </div>
              <div class="external-link">🔗</div>
            </li>
          `;
        }).join('')}
      </ul>
    `;
  }

  async loadProfilePictures() {
    const profilePics = document.querySelectorAll('.profile-pic');
    
    for (const img of profilePics) {
      const username = img.dataset.username;
      try {
        const response = await this.fetchInstagramProfilePic(username);
        if (response) {
          img.src = response;
          img.style.display = 'block';
          img.nextElementSibling.style.display = 'none';
        } else {
          throw new Error('No profile pic found');
        }
      } catch (error) {
        img.style.display = 'none';
        img.nextElementSibling.style.display = 'flex';
      }
    }
  }

  async fetchInstagramProfilePic(username) {
    try {
      const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
      const response = await fetch(apiUrl, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.user?.profile_pic_url;
      }
    } catch (error) {}

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url.includes('instagram.com')) {
        const result = await chrome.tabs.sendMessage(tab.id, { 
          action: 'getProfilePic', 
          username: username 
        });
        if (result && result.profilePicUrl) {
          return result.profilePicUrl;
        }
      }
    } catch (error) {}

    return null;
  }
  
  formatDate(timestamp) {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  }
  
  attachEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.section-header, .section-header *')) {
        const header = e.target.closest('.section-header');
        const sectionId = header.dataset.section;
        if (sectionId) {
          this.toggleSection(sectionId);
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.matches('.clickable-user, .clickable-user *')) {
        const userItem = e.target.closest('.clickable-user');
        const username = userItem.dataset.username;
        if (username) {
          chrome.tabs.create({ url: `https://www.instagram.com/${username}/` });
        }
      }
    });
    
  // Use delegated click handling for buttons so handlers survive re-rendering
  document.addEventListener('click', async (e) => {
      // Start Analysis button in no-data state
      if (e.target.matches('#startAnalysis, #startAnalysis *')) {
        e.preventDefault();
        await this.clearUIAndStorage();
        // start analysis after clearing
        this.startAnalysis();
        return;
      }

      // Open Instagram
      if (e.target.matches('#openInstagram, #openInstagram *')) {
        e.preventDefault();
        chrome.tabs.create({ url: 'https://www.instagram.com/' });
        return;
      }

      // Refresh Analysis button in analysis results
      if (e.target.matches('#refreshAnalysis, #refreshAnalysis *')) {
        e.preventDefault();
        await this.clearUIAndStorage();
        this.startAnalysis();
        return;
      }
    });
  }

  async clearUIAndStorage() {
    // Clear in-memory data and UI immediately
    this.data = null;
    const content = document.getElementById('content');
    if (content) {
      content.innerHTML = this.renderNoDataState();
    }

    // Clear any profile pictures shown in the popup DOM immediately
    try {
      const imgs = document.querySelectorAll('.profile-pic');
      imgs.forEach(img => {
        try {
          img.src = '';
        } catch (e) {}
        img.style.display = 'none';
        const fallback = img.nextElementSibling;
        if (fallback && fallback.classList && fallback.classList.contains('avatar-fallback')) {
          fallback.style.display = 'flex';
        }
      });
    } catch (e) {
      // ignore
    }

    // Clear stored data in background/storage and wait for confirmation
    try {
      await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'clearAnalysisData' }, (resp) => {
          // resolve regardless of success to avoid blocking UI indefinitely
          resolve(resp);
        });
      });
    } catch (e) {
      // ignore
    }
  }
  
  toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    const header = document.querySelector(`[data-section="${sectionId}"]`);
    const chevron = header.querySelector('.chevron');
    
    if (content && header) {
      content.classList.toggle('expanded');
      chevron.classList.toggle('expanded');
    }
  }

  async startAnalysis() {
    const startBtn = document.getElementById('startAnalysis');
    const refreshBtn = document.getElementById('refreshAnalysis');
    
    if (startBtn) {
      startBtn.textContent = '🔄 Analyzing...';
      startBtn.disabled = true;
    }
    if (refreshBtn) {
      refreshBtn.textContent = '🔄 Analyzing...';
      refreshBtn.disabled = true;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('instagram.com')) {
        throw new Error('Please open an Instagram tab first');
      }

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'startAnalysis' });
      
      if (!response.success) {
        throw new Error(response.error || 'Analysis failed');
      }

      await this.loadData();
      this.render();

    } catch (error) {
      alert(`Analysis failed: ${error.message}\n\nMake sure you're on an Instagram page and logged in.`);
      
      if (startBtn) {
        startBtn.textContent = '📊 Start Analysis';
        startBtn.disabled = false;
      }
      if (refreshBtn) {
        refreshBtn.textContent = 'Refresh Analysis';
        refreshBtn.disabled = false;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});