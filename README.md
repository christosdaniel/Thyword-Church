# Thyword International Worship Centre: Website

**The House of Possibilities.** Head Pastor: Bishop Dr. Fiifi Mensah Greatman.

A responsive church website (phones, tablets and computers) with these pages:

| Page | File | What it shows |
|---|---|---|
| Home | `index.html` | Welcome banner (slideshow/video), service times, upcoming events with countdown, words from the pastor, pictures, videos, social links and email sign-up |
| Pictures | `pictures.html` | Photo gallery with albums and a full-screen viewer |
| Watch Sermons | `sermons.html` | Featured sermon plus the full library of sermons from the YouTube channel; watch on the website or open on YouTube |
| Videos | `videos.html` | Uploaded clips plus YouTube and Facebook videos (and the latest YouTube uploads, once an API key is set) |
| Watch Live | `live.html` | YouTube and Facebook live player, live status, Facebook page feed |
| Branches & Pastors | `branches.html` | Headquarters first, then every branch: pastor (photo and bio), about, service times, activities, upcoming programmes, contacts; plus the Board of Trustees |
| Bible School | `bibleschool.html` | About the school, key details, how to enroll, downloadable forms, recent pictures |
| Give | `give.html` | Tithes, offerings and donations to Headquarters (My Week of Promotion, Mission Support, Church Offering, Tithe) or any branch, by MTN MoMo, Telecel Cash or bank transfer, plus a giving confirmation by WhatsApp or email |
| Contact | `contact.html` | Phone, WhatsApp, email, map, message form and all branches |

Every page has the logo at the top left (it links back to Home), a red **"WE ARE LIVE"** banner whenever a stream is on, a WhatsApp chat button, and a footer listing all branches.

---

## 1. Put the website online (GitHub Pages, free)

The contact form and email sign-up **only work on the published website** (an `https://` address). They do not work when the HTML files are opened directly on a computer or phone.

1. On GitHub, open the repository, then **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**. Pick the branch the website is on (at the moment `claude/amazing-newton-rx7ekz`, or `main` if you merge it), pick `/ (root)`, then **Save**.
3. After a minute or two the site is live at `https://christosdaniel.github.io/Thyword-Church/`. You can attach your own domain on the same page.

## 2. The admin tool (kept separate from the website)

The admin tool is **one standalone file**: `_admin/Thyword-Admin.html`. It is **not published** on the website. GitHub Pages skips the `_admin` folder (see `_config.yml`), so members cannot reach it.

Keep the file on the administrator's computer or phone and open it in a web browser (Chrome works best). To get it, open `_admin/Thyword-Admin.html` on GitHub, click **Download raw file**, and save it.

1. **Log in** with the admin password. The starting password is `Thyword@2026` (capital **T**). Change it in **Settings → Admin Password**, then click **Save & Publish**.
2. **First time only: connect GitHub** in the **Settings** tab:
   1. Create a token at <https://github.com/settings/personal-access-tokens/new>.
   2. Under *Repository access*, choose only `Thyword-Church`. Under *Permissions → Contents*, choose **Read and write**.
   3. Paste the token. Username and repository are already filled in. Leave *Branch* empty and it is detected automatically. Click **Connect & load content**.

   The token is saved only on that device. Never share it. The token is the real lock: without it nobody can change the website.

**Each day:**
- **Live & Notice**: switch "We are LIVE on YouTube/Facebook" on when a service starts and off when it ends. You can also paste the live video link. Edit the gold announcement bar here.
- **Events**: add the flyer, date, time and venue. When the date passes, the event moves to the **Past Events** tab on the home page by itself. Past events stay at least 7 days, then until you delete them (or set *Remove past events after (days)* in Settings).
- **Pastor's Words**: add new quotes. The newest one shows first.
- **Pictures**: choose an album name, then select many photos at once. Large photos are resized automatically.
- **Videos**: upload short clips (up to 50 MB, MP4 is best), or add YouTube/Facebook links for full sermons.
- **Branches**: each branch's pastor (name, photo, bio), about, contacts, service times, activities, upcoming programmes and its own MoMo/Telecel/bank details. Tick *This is the Headquarters* for the HQ.
- **Board of Trustees**: name, position and photo.
- **Bible School**: details, how to enroll, enrollment forms (upload PDF/Word) and pictures.
- **Giving**: Headquarters MoMo, Telecel Cash and bank details, offering types, and an optional online-payment link.
- **Home & About**, **Service Times**, **Contact**: change any text, photo or phone number.

Then click **Save & Publish**. Changes appear on the website within 1–2 minutes.

All content lives in **`data/content.js`**, so you can also edit that file by hand on GitHub.

*For developers:* the admin tool is built from `_admin/admin.template.html`, `_admin/admin.js` and `assets/css/style.css`. After changing them, run `python3 _admin/build.py`. It rebuilds both the single file and the phone app (bump `VERSION` in `build.py` so installed apps update).

### Admin app for iPhone (and Android)

The admin is also available as an app you add to your phone's Home Screen. It opens full-screen with the church logo as its icon, stays logged in, and stays connected to GitHub after you add the token once.

App address (unlisted; nothing on the website links to it):
**https://christosdaniel.github.io/Thyword-Church/tiwc-admin-9k2x/**

**Install on iPhone (one time):**
1. Open the address above in **Safari** (it must be Safari).
2. Tap the **Share** button (the square with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**, then **Add**.
4. Open **TIWC Admin** from your Home Screen. Log in with the admin password, keeping **Keep me logged in on this device** ticked.
5. The **Settings** tab opens. Paste your GitHub token and tap **Connect & load content**.

From then on, tap the icon and you go straight in, already connected. Use **Log out** if you ever hand the phone to someone else.

*Note:* the Home Screen app keeps its own storage, separate from Safari. Enter the token **inside the app** (step 5), not in Safari.

*Android:* open the address in Chrome, tap the **⋮** menu, then **Add to Home screen** / **Install app**.

## 3. Contact form and email sign-ups

Requests from the contact form (name, email, phone number and the request) and email sign-ups go to **thywordintlworshipcentre@gmail.com**. Visitors can use any email provider (Gmail, Yahoo, Outlook and others). Delivery is handled by the free [FormSubmit](https://formsubmit.co) service.

**Members choose how to send.** After filling in the contact form and pressing **Send to Church**, or entering their email and pressing **Subscribe**, a pop-up asks *"Send with"*:
- **Gmail**, **Outlook / Hotmail** or **Yahoo Mail**: opens that service (the app on iPhone if it's installed, otherwise the website) with the church address, subject and message already filled in. The member just presses **Send**.
- **Other email app**: opens the phone's or computer's own email app (iPhone Mail, Samsung Email and others).
- **Send from this website**: sent for them through FormSubmit. No email app needed.

The option the member used last time is marked **Last used**.

**One-time activation (required):**
1. Open the **published** website (the `https://` address) and send one test request from the Contact page.
2. Within a few minutes FormSubmit emails **thywordintlworshipcentre@gmail.com** with the subject *"Action Required: Activate FormSubmit"*. Look in **Spam/Promotions** too.
3. Click **Activate Form**. From then on every request arrives in the inbox.

If the form service can't be reached, or the form is not activated yet, the website opens the visitor's own email app with the request already written and addressed to the church, so the message still reaches you. To use [Formspree](https://formspree.io) instead, paste its form URL in **Admin → Settings → Custom form endpoint**.

## 3b. Sermons from YouTube (automatic)

The **Watch Sermons** page, the gold **Watch Sermons** button at the top right of every page, and the sermon card on the home page banner all show videos from the YouTube channel (`youtubeUrl` in Admin → Settings).

- A GitHub Action (`.github/workflows/youtube-videos.yml`) runs every 4 hours. It reads the channel's latest videos (no API key needed) and saves them in `data/youtube.js`. Videos already saved are kept, so the library grows over time (up to 60).
- To update straight away: on GitHub, open **Actions → Update YouTube sermons → Run workflow**.
- The featured sermon changes after every 2 page loads on the same device.
- Each sermon plays on the website and has a **Watch on YouTube** link.
- YouTube links you add in **Admin → Videos** also appear in the sermon list.
- If the action can't find the channel, add the **YouTube channel ID** (starts with `UC`) in **Admin → Settings**.

## 4. Live stream detection

- **Facebook and YouTube (manual):** switch live on/off in **Admin → Live & Notice**. A banner then appears on every page and the Watch Live page plays the stream.
- **YouTube (automatic, optional):** in **Admin → Settings**, add your **YouTube channel ID** (starts with `UC`; YouTube → your channel → *Share → Copy channel ID*) and a free **YouTube Data API v3 key** from <https://console.cloud.google.com>. Restrict the key to your website address. The site then detects YouTube live streams on its own and lists your latest uploads on the Videos page.
- Visitors can turn on **browser alerts** on the Watch Live page. These work while the site is open in their browser.

## Folder layout

```
index.html, pictures.html, videos.html, live.html, contact.html
_admin/Thyword-Admin.html  ← the private admin tool, single file (not published)
tiwc-admin-9k2x/           ← the admin as a phone app (unlisted address)
data/content.js          ← all website text, events, photos, videos, branches
data/youtube.js          ← sermons collected from YouTube (updated automatically)
scripts/fetch_youtube.py ← collects them (run by .github/workflows/youtube-videos.yml)
assets/css/style.css     ← design (colours taken from the church logo)
assets/js/main.js        ← builds the pages from content.js
assets/images/           ← logo, pastor photos, gallery, event flyers
assets/videos/           ← starter video clip
assets/uploads/          ← files uploaded from the Admin page go here
```

To preview on your own computer, run `python3 -m http.server` in this folder and open <http://localhost:8000>.
