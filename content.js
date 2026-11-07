class InstagramAnalyzer {
  static FRIENDSHIPS_URL = 'https://www.instagram.com/api/v1/friendships';
  static IG_APP_ID = '936619743392459';

  constructor() {
    this.followers = [];
    this.following = [];
    this.dontFollowMeBack = [];
    this.iDontFollowBack = [];
    this.isAnalyzing = false;
    this.currentUser = null;
    this.userId = null;
    
    this.init();
  }

  async init() {
    if (window.location.hostname !== 'www.instagram.com') {
      return;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'startAnalysis') {
        this.startAnalysis().then((result) => {
          sendResponse({ success: true, data: result });
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }
      
      if (request.action === 'getProfilePic') {
        this.getProfilePicture(request.username).then((result) => {
          sendResponse({ success: true, profilePicUrl: result });
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }
    });
  }

  async startAnalysis() {
    if (this.isAnalyzing) {
      throw new Error('Analysis already in progress');
    }
    
    this.isAnalyzing = true;
    
    try {
      await this.getCurrentUserInfo();
      
      if (!this.currentUser || !this.userId) {
        throw new Error('Could not determine current user or user ID');
      }

      this.followers = [];
      this.following = [];
      this.dontFollowMeBack = [];
      this.iDontFollowBack = [];
      
      await this.fetchFollowers();
      
      await this.fetchFollowing();
      
      this.calculateDifferences();

      const analysis = {
        timestamp: Date.now(),
        followers: this.followers,
        following: this.following,
        dontFollowMeBack: this.dontFollowMeBack,
        iDontFollowBack: this.iDontFollowBack,
        stats: {
          totalFollowers: this.followers.length,
          totalFollowing: this.following.length,
          dontFollowMeBackCount: this.dontFollowMeBack.length,
          iDontFollowBackCount: this.iDontFollowBack.length,
          mutualFollows: this.followers.length - this.iDontFollowBack.length
        }
      };
      
      await this.saveResults(analysis);
      
      this.isAnalyzing = false;
      
      return analysis;
      
    } catch (error) {
      this.isAnalyzing = false;
      throw error;
    }
  }

  async getCurrentUserInfo() {
    const urlMatch = window.location.pathname.match(/^\/([^\/]+)\/?$/);
    if (urlMatch) {
      this.currentUser = urlMatch[1];
    }
    
    if (!this.currentUser) {
      const profileLinks = document.querySelectorAll('a[href^="/"][href$="/"]');
      for (const link of profileLinks) {
        const href = link.getAttribute('href');
        if (href && href.match(/^\/[^\/]+\/?$/)) {
          const username = href.replace(/^\/|\/$/g, '');
          if (username && username.length > 0) {
            this.currentUser = username;
            break;
          }
        }
      }
    }
    
    if (!this.currentUser) {
      throw new Error('Could not determine current username');
    }
    
    this.userId = this.findUserIdInPage();
    if (!this.userId) {
      throw new Error(
        `Could not find the Instagram ID for ${this.currentUser}. Open that profile page, refresh it, and try again.`
      );
    }
  }

  findUserIdInPage() {
    const username = this.currentUser.toLowerCase();
    const visited = new Set();
    const findInValue = (value) => {
      if (!value || typeof value !== 'object' || visited.has(value)) {
        return null;
      }
      visited.add(value);

      if (Array.isArray(value)) {
        for (const item of value) {
          const result = findInValue(item);
          if (result) return result;
        }
        return null;
      }

      const objectUsername = typeof value.username === 'string'
        ? value.username.toLowerCase()
        : '';
      if (objectUsername === username) {
        const id = value.pk ?? value.id;
        if (id !== undefined && id !== null) {
          return String(id);
        }
      }

      for (const item of Object.values(value)) {
        const result = findInValue(item);
        if (result) return result;
      }
      return null;
    };

    for (const script of document.scripts) {
      const text = script.textContent || '';
      if (!text || !text.toLowerCase().includes(username)) {
        continue;
      }
      try {
        const result = findInValue(JSON.parse(text));
        if (result) return result;
      } catch (error) {
        const usernamePattern = this.createUserIdPatterns();
        for (const pattern of usernamePattern) {
          const match = text.match(pattern);
          if (match) return match[1];
        }
      }
    }

    const pageText = document.documentElement.innerHTML;
    for (const pattern of this.createUserIdPatterns()) {
      const match = pageText.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  createUserIdPatterns() {
    const username = this.escapeRegExp(this.currentUser);
    const id = '"(?:pk|id)"\\s*:\\s*"?([0-9]+)"?';
    return [
      new RegExp(`"username"\\s*:\\s*"${username}"[\\s\\S]{0,500}?${id}`, 'i'),
      new RegExp(`${id}[\\s\\S]{0,500}?"username"\\s*:\\s*"${username}"`, 'i')
    ];
  }

  escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async fetchFollowers() {
    this.followers = await this.fetchFriendshipList('followers');
  }

  async fetchFollowing() {
    this.following = await this.fetchFriendshipList('following');
  }

  async fetchFriendshipList(relation) {
    const users = [];
    let maxId = null;

    while (true) {
      const params = new URLSearchParams({
        count: '50'
      });
      if (maxId) {
        params.set('max_id', maxId);
      }

      const response = await fetch(
        `${InstagramAnalyzer.FRIENDSHIPS_URL}/${this.userId}/${relation}/?${params}`,
        {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-IG-App-ID': InstagramAnalyzer.IG_APP_ID,
          'X-ASBD-ID': '129477',
          'X-IG-WWW-Claim': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': this.getCsrfToken()
        },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${relation}: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data.users)) {
        throw new Error(`Invalid response format for ${relation}`);
      }

      users.push(...data.users.map(user => ({
        username: user.username,
        full_name: user.full_name
      })));

      const nextMaxId = data.next_max_id;
      if (!nextMaxId || nextMaxId === maxId) {
        return users;
      }
      maxId = nextMaxId;
    }
  }

  getCsrfToken() {
    return document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1] || '';
  }

  calculateDifferences() {
    this.dontFollowMeBack = this.following.filter((following) => {
      return !this.followers.find(
        (follower) => follower.username === following.username
      );
    });

    this.iDontFollowBack = this.followers.filter((follower) => {
      return !this.following.find(
        (following) => following.username === follower.username
      );
    });
  }

  async saveResults(analysis) {
    try {
      await chrome.runtime.sendMessage({
        action: 'saveAnalysisData',
        data: analysis
      });
    } catch (error) {
      throw error;
    }
  }

  async getProfilePicture(username) {
    try {
      const currentUrl = window.location.href;
      if (currentUrl.includes(`instagram.com/${username}`)) {
        const profileImg = document.querySelector('img[alt*="profile picture"], header img, article img[alt]');
        if (profileImg && profileImg.src) {
          return profileImg.src;
        }
      }

      return null;

    } catch (error) {
      return null;
    }
  }
}

new InstagramAnalyzer();