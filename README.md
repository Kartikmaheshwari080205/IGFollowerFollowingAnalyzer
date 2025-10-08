# Instagram Follower Analyzer

A Chrome Extension that analyzes your Instagram followers and following lists using Instagram's GraphQL API - entirely locally, no data transmission to external servers, completely client-side.

## Features

- **100% Local & Private**: All analysis happens in your browser - no data leaves your device
- **Fast GraphQL API**: Uses Instagram's native API endpoints for speed and accuracy
- **Complete User Data**: Shows usernames, full names, and profile pictures
- **Profile Pictures**: Attempts to fetch actual Instagram profile pictures with smart fallbacks
- **Popup-Only Interface**: Clean, non-intrusive popup interface - no page modifications
- **Comprehensive Analysis**: 
  - People who don't follow you back
  - People you don't follow back
  - Mutual followers
  - Complete statistics with exact counts
- **Clickable Usernames**: Click any username to open their Instagram profile
- **Local Storage**: Results are saved locally for quick access
- **One-Click Analysis**: Simple "Start Analysis" button in the popup

## Installation

### Option 1: Install from Chrome Web Store
*Coming soon - extension will be published to the Chrome Web Store*

### Option 2: Manual Installation (Developer Mode)

1. **Download the extension**:
   - Download this repository as ZIP
   - Extract to a folder on your computer

2. **Enable Developer Mode**:
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the extracted folder containing the extension files
   - The extension should now appear in your extensions list

4. **Pin the extension**:
   - Click the puzzle piece icon in Chrome's toolbar
   - Pin the "Instagram Follower Analyzer" extension for easy access

## Usage

### Simple 3-Step Process:

1. **Open Instagram**:
   - Go to [instagram.com](https://instagram.com) and make sure you're logged in

2. **Click the Extension**:
   - Click the Instagram Follower Analyzer icon in your Chrome toolbar
   - Click the **"Start Analysis"** button in the popup

3. **View Results**:
   - The extension will automatically fetch your follower/following data using Instagram's GraphQL API
   - Results appear in the popup with interactive sections:
     - **Don't Follow Me Back**: People you follow who don't follow you back
     - **I Don't Follow Back**: Your followers that you don't follow back
     - **All Followers**: Complete list of your followers
     - **All Following**: Complete list of accounts you follow

### Features in Action:

- **Real-time Stats**: See exact follower/following counts and mutual connections
- **Profile Pictures**: View actual Instagram profile pictures (when available)
- **Quick Access**: Click any username to open their Instagram profile in a new tab
- **Clean Interface**: Everything happens in a clean popup - no page modifications
- **Fast Loading**: Uses Instagram's native APIs for speed and accuracy

## Privacy & Security

- **No Data Transmission**: Your data never leaves your browser
- **No External APIs**: No communication with external servers
- **No Account Access**: Extension only reads public information visible to you
- **Local Storage Only**: All data is stored locally in your browser
- **No Screenshots**: Extension doesn't capture or store any images
- **Session-Based**: Data is automatically cleared when you log out


## Technical Details

- **Manifest Version**: 3 (Latest Chrome Extension standard)
- **Permissions**: 
  - `storage` - To save analysis results locally
  - `cookies` - To detect Instagram login status
  - `activeTab` - To analyze the current Instagram page
  - `scripting` - To inject the analysis script
- **Host Permissions**: `https://www.instagram.com/*` only

## Development

### File Structure
```
instagram-follower-analyzer/
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content.js            # Content script for Instagram pages
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
└── README.md             # This file
```

### How It Works

1. **Popup Interface**: Extension works entirely through a popup interface - no page modifications
2. **GraphQL API**: Uses Instagram's native GraphQL endpoints for data fetching
3. **Authentication**: Leverages your existing Instagram login session
4. **Data Processing**: 
   - Fetches followers using query hash `c76146de99bb02f6415203be841dd25a`
   - Fetches following using query hash `d04b0a864b4b54837c0d870b0e77e076`
   - Processes data locally in your browser
5. **Profile Pictures**: Attempts to fetch real Instagram profile pictures with fallback to generated avatars
6. **Storage**: Saves results using Chrome's local storage API
7. **Display**: Clean popup interface with clickable usernames and expandable sections

### Building

No build process required - this is a pure JavaScript Chrome extension.

## Troubleshooting

### Common Issues

**"Analysis failed" error**:
- Make sure you're logged into Instagram in the same browser
- Try refreshing the Instagram page and wait a moment before trying again
- Ensure you're on any Instagram page when clicking "Start Analysis"

**Extension popup shows "Ready to analyze"**:
- Click the "Start Analysis" button in the popup
- Make sure you're on an Instagram page (instagram.com)
- Check that you're logged into Instagram

**No profile pictures showing**:
- Profile pictures load after the main interface
- Instagram may block some profile picture requests
- Fallback letter avatars will show when profile pictures can't be loaded

**Analysis takes a while**:
- This is normal for accounts with many followers/following
- The extension fetches data through Instagram's API
- Large accounts may take 10-30 seconds to complete

**Count discrepancies**:
- Small differences (2-3 accounts) are normal
- Usually caused by deactivated or suspended accounts
- The disclaimer at the bottom explains this

### Technical Issues

- Check browser console for error messages
- Ensure you're using a recent version of Chrome
- Disable other Instagram-related extensions that might interfere

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Setup
1. Clone the repository
2. Make your changes
3. Load the extension in Chrome's developer mode
4. Test on Instagram (be respectful of rate limits)
5. Submit a pull request

## Disclaimer

- This extension is not affiliated with Instagram or Meta
- Use responsibly and respect Instagram's terms of service
- The extension works by automating normal browser interactions
- Always comply with Instagram's rate limits and usage policies
- Your account security is your responsibility

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Look for existing issues in the GitHub repository
3. Create a new issue with detailed information about your problem

---
