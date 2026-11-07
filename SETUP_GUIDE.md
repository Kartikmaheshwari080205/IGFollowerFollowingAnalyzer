# Installation & Setup Guide

Follow these steps to install and use the Instagram Follower Analyzer Chrome Extension.

## Prerequisites

- **Google Chrome Browser** (Version 88 or higher)
- **Instagram Account** (you must be logged in)
- **Basic computer knowledge** (loading Chrome extensions)

## Step-by-Step Installation

### Step 1: Prepare the Extension Files

1. **Download or clone** this repository to your computer
2. **Extract** if downloaded as ZIP file
3. **Note the folder location** - you'll need this path


**Quick Icon Solution:**
- Create simple colored squares with "IG" text
- Or download placeholder icons from any free icon site
- Or use any PNG files temporarily (rename them to the required names)

### Step 2: Enable Developer Mode in Chrome

1. **Open Chrome** and navigate to `chrome://extensions/`
2. **Toggle "Developer mode"** in the top-right corner (it should turn blue/enabled)
3. You should now see additional buttons like "Load unpacked"

### Step 3: Load the Extension

1. **Click "Load unpacked"** button
2. **Navigate and select** the folder containing your extension files
   - Select the main folder (the one containing `manifest.json`)
3. **Click "Select Folder"**
4. The extension should now appear in your extensions list

### Step 4: Pin the Extension (Recommended)

1. **Click the puzzle piece icon** in Chrome's toolbar
2. **Find "Instagram Follower Analyzer"** in the dropdown
3. **Click the pin icon** to pin it to your toolbar for easy access

## How to Use

### Simple Usage Process

1. **Open Instagram**:
   - Go to [instagram.com](https://instagram.com)
   - **Make sure you're logged in** to your account

2. **Open the Extension**:
   - **Click the extension icon** in your Chrome toolbar
   - You'll see a popup with instructions

3. **Start Analysis**:
   - **Click "Start Analysis"** button in the popup
   - The extension will automatically fetch your data using Instagram's API

### What Happens During Analysis

**Automatic Process:**
- Extension reads the profile ID from the loaded Instagram page, then uses authenticated friendship endpoints for follower and following lists
- Fetches your complete followers list
- Fetches your complete following list
- Processes the data locally in your browser
- Calculates mutual followers and differences
- Attempts to load profile pictures for each user

**Timeline:**
- Small accounts (< 1000): 5-10 seconds
- Medium accounts (1000-5000): 10-20 seconds  
- Large accounts (5000+): 20-60 seconds

### Viewing Results

1. **Stats Overview**:
   - Total followers and following counts
   - Mutual followers count
   - "Don't follow back" count

2. **Interactive Sections**:
   - **Don't Follow Me Back**: People you follow who don't follow you back
   - **I Don't Follow Back**: Your followers you don't follow back
   - **All Followers**: Complete followers list with profile pictures
   - **All Following**: Complete following list with profile pictures

3. **Click Features**:
   - **Click any username** to open their Instagram profile
   - **Expand/collapse sections** to organize your view
   - **Profile pictures** load automatically (with letter fallbacks)

### Advanced Features

- **Profile Pictures**: Real Instagram profile pictures when available
- **Smart Fallbacks**: Generated letter avatars when profile pics can't be loaded
- **Data Persistence**: Results save locally and persist between sessions
- **Clickable Links**: Direct navigation to any user's Instagram profile

## Troubleshooting

### Extension Won't Load
- **Check file structure**: Make sure `manifest.json` is in the main folder
- **Add icon files**: Extension needs the three icon files to load properly
- **Check Chrome version**: Need Chrome 88+ for Manifest V3 support

### "Analysis Failed" Error
- **Make sure you're logged into Instagram** in the same browser
- **Go to any Instagram page** before clicking "Start Analysis"
- **Refresh Instagram** and wait a moment before trying again
- **Check browser console**: Press F12, look for any error messages

### Popup Shows "Ready to Analyze" 
- **Click "Start Analysis"** button in the popup
- **Make sure you're on instagram.com** (any Instagram page works)
- **Verify you're logged in** to Instagram
- **Wait a moment** after loading Instagram before starting analysis

### Analysis Takes Too Long or Fails
- **Be patient**: Large accounts take longer (up to 60 seconds for 5000+ followers)
- **Don't close Instagram**: Keep the Instagram tab open during analysis
- **Stable internet**: Ensure good internet connection for API calls
- **Try during off-peak hours**: Instagram's API works better with less traffic
- **Check for rate limiting**: If it fails, wait 5-10 minutes before retrying

### No Profile Pictures Showing
- **Wait for loading**: Profile pictures load after the main interface
- **Normal behavior**: Instagram blocks many profile picture requests
- **Fallback design**: Letter avatars show when profile pics can't be loaded
- **Not a bug**: This is expected behavior due to Instagram's CORS policies

### No Results Showing
- **Wait for completion**: Make sure analysis finished successfully
- **Refresh extension popup**: Click the extension icon again
- **Check storage**: Extension saves data locally in Chrome

## Advanced Configuration

### For Developers

**Enable Extension Debugging:**
1. Go to `chrome://extensions/`
2. Click "Details" on the extension
3. Enable "Collect errors"
4. Check "Developer mode" errors in the console

**Modify Extension:**
1. Make changes to the files
2. Click "Reload" button on the extension card
3. Test changes on Instagram

### Storage Management

**Clear Extension Data:**
- Go to `chrome://extensions/`
- Click "Details" on Instagram Follower Analyzer  
- Click "Extension options" (if available)
- Or manually: Chrome Settings > Privacy > Site Settings > View permissions and data stored across sites

## Understanding Results

### Categories Explained

- **Followers**: Complete list of people who follow your account
- **Following**: Complete list of accounts you follow  
- **Mutual**: People who follow you AND you follow them back
- **Don't Follow Me Back**: People you follow who don't follow you back
- **I Don't Follow Back**: Your followers that you don't follow back

### Interface Features

- **Profile Pictures**: Real Instagram avatars when available, letter fallbacks otherwise
- **Clickable Usernames**: Click any @username to open their Instagram profile
- **Expandable Sections**: Click section headers to expand/collapse user lists
- **Count Disclaimer**: "*Counts may differ slightly due to disabled accounts"

### Data Accuracy

- **Real-time snapshots**: Data reflects your account status when analysis was run
- **API accuracy**: Uses Instagram's authenticated native APIs for reliable data
- **Small count differences**: 2-3 account differences are normal (disabled/suspended accounts)
- **Profile picture availability**: Depends on Instagram's CORS policies and user privacy settings
- **Best practices**: Run analysis during off-peak hours for optimal performance

## Privacy & Safety

### What the Extension Does
-  **Uses Instagram's authenticated friendship API** (the current follower-list surface)
-  **Stores data locally** in your browser only
-  **Fetches profile pictures** when Instagram allows
-  **Provides clickable user links** for easy profile access
-  **Works entirely in popup** - no page modifications

### What the Extension Does NOT Do
-  **Send data to external servers** - everything stays in your browser
-  **Store passwords or login info** - uses existing Instagram session
-  **Modify Instagram pages** - only works through popup interface
-  **Access private data** - only gets data you can normally see
-  **Bypass Instagram limits** - respects all Instagram API policies

---

## Success Checklist

Before considering the extension "working":

- [ ] Extension loads without errors in `chrome://extensions/`
- [ ] Extension icon appears in toolbar when pinned
- [ ] Popup opens when clicking the extension icon
- [ ] "Start Analysis" button appears in popup when on Instagram
- [ ] Analysis completes successfully (shows stats in popup)
- [ ] Results appear with follower/following lists
- [ ] Usernames are clickable and open Instagram profiles
- [ ] Profile pictures load (or show letter fallbacks)
- [ ] Data persists when reopening popup

If all items are checked, your extension is working correctly!