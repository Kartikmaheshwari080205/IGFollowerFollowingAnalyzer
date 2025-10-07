class InstagramAnalyzer {
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
    
    const userQueryRes = await fetch(`https://www.instagram.com/web/search/topsearch/?query=${this.currentUser}`);
    
    if (!userQueryRes.ok) {
      throw new Error('Failed to search for user');
    }
    
    const userQueryJson = await userQueryRes.json();
    const user = userQueryJson.users?.map(u => u.user)?.find(u => u.username === this.currentUser);
    
    if (!user) {
      throw new Error(`User ${this.currentUser} not found in search results`);
    }
    
    this.userId = user.pk;
  }

  async fetchFollowers() {
    let after = null;
    let has_next = true;

    while (has_next) {
      const response = await fetch(
        `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=` +
          encodeURIComponent(
            JSON.stringify({
              id: this.userId,
              include_reel: true,
              fetch_mutual: true,
              first: 50,
              after: after,
            })
          )
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch followers: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data?.user?.edge_followed_by) {
        has_next = data.data.user.edge_followed_by.page_info.has_next_page;
        after = data.data.user.edge_followed_by.page_info.end_cursor;
        
        const newFollowers = data.data.user.edge_followed_by.edges.map(({ node }) => ({
          username: node.username,
          full_name: node.full_name
        }));
        
        this.followers = this.followers.concat(newFollowers);
      } else {
        throw new Error('Invalid response format for followers');
      }
    }
  }

  async fetchFollowing() {
    let after = null;
    let has_next = true;

    while (has_next) {
      const response = await fetch(
        `https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=` +
          encodeURIComponent(
            JSON.stringify({
              id: this.userId,
              include_reel: true,
              fetch_mutual: true,
              first: 50,
              after: after,
            })
          )
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch following: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data?.user?.edge_follow) {
        has_next = data.data.user.edge_follow.page_info.has_next_page;
        after = data.data.user.edge_follow.page_info.end_cursor;
        
        const newFollowing = data.data.user.edge_follow.edges.map(({ node }) => ({
          username: node.username,
          full_name: node.full_name
        }));
        
        this.following = this.following.concat(newFollowing);
      } else {
        throw new Error('Invalid response format for following');
      }
    }
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

      const response = await fetch(`https://www.instagram.com/web/search/topsearch/?query=${username}`);
      if (response.ok) {
        const data = await response.json();
        const user = data.users?.find(u => u.user.username === username);
        if (user && user.user.profile_pic_url) {
          return user.user.profile_pic_url;
        }
      }

      return null;

    } catch (error) {
      return null;
    }
  }
}

new InstagramAnalyzer();