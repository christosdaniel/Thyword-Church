# Thyword International Worship Centre: Website

**The House of Possibilities.** Head Pastor: Bishop Dr. Fiifi Mensah Greatman.

A responsive church website (phones, tablets and computers) with these pages:

| Page | File | What it shows |
|---|---|---|
| Home | `index.html` | Welcome banner (slideshow/video), service times, upcoming events with countdown, words from the pastor, pictures, videos, social links and email sign-up |
| Pictures | `pictures.html` | Photo gallery with albums and a full-screen viewer |
| Videos | `videos.html` | Uploaded clips plus YouTube and Facebook videos (and the latest YouTube uploads, once an API key is set) |
| Watch Live | `live.html` | YouTube and Facebook live player, live status, Facebook page feed |
| Contact | `contact.html` | Phone, WhatsApp, email, map, message form and all branches |
| Admin | `admin.html` | Where you update the website, every day if you like |

Every page has the logo at the top left (it links back to Home), a red **"WE ARE LIVE"** banner whenever a stream is on, a WhatsApp chat button, and a footer listing all branches.

---

## 1. Put the website online (GitHub Pages, free)

1. Merge this branch into `main` on GitHub.
2. On GitHub, open the repository, then **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute the site is live at `https://<your-username>.github.io/<repository-name>/`. You can attach your own domain on the same page.

## 2. Update the website every day (Admin page)

There is **no public link** to the admin area, so members won't see it. To open it from the website:
- tap the **©** symbol at the very bottom of any page **5 times quickly**, or
- press **Ctrl + Shift + A** on a computer, or
- go straight to `https://<your-site>/admin.html`.

The admin page then asks for the **admin password**. The starting password is `Thyword@2026`. Change it straight away in **Admin → Settings → Admin Password**, then click **Save & Publish**. Publishing also needs the GitHub token, which only administrators have, so even someone who guesses the page address cannot change the website.

**First time only:** go to the **Settings** tab and connect GitHub:
1. Create a token at <https://github.com/settings/personal-access-tokens/new>.
2. Under *Repository access*, choose only this repository. Under *Permissions → Contents*, choose **Read and write**.
3. Paste the token, your GitHub username, the repository name and branch `main`, then click **Connect & load content**.

The token is saved only in that browser. Never share it.

**Each day:**
- **Live & Notice**: switch "We are LIVE on YouTube/Facebook" on when a service starts and off when it ends. You can also paste the live video link. Edit the gold announcement bar here.
- **Events**: add the flyer, date, time and venue. Past events hide on their own.
- **Pastor's Words**: add new quotes. The newest one shows first.
- **Pictures**: choose an album name, then select many photos at once. Large photos are resized automatically.
- **Videos**: upload short clips (up to 50 MB, MP4 is best), or add YouTube/Facebook links for full sermons.
- **Home & About**, **Service Times**, **Contact & Branches**: change any text, photo, phone number or branch.

Then click **Save & Publish**. Changes appear on the website within 1–2 minutes.

> No token? You can still edit, click **Download file**, and replace `data/content.js` with the downloaded file.

All content lives in **`data/content.js`**, so you can also edit that file by hand on GitHub.

## 3. Email sign-ups and contact messages

The church email `thywordinternationalworshipcentre@gmail.com` is set as the **Admin email** (you can change it in **Admin → Settings**). Visitors can use any email provider (Gmail, Yahoo, Outlook and others). The contact form asks for name, email, phone number and the request. Sign-ups ("Get upcoming event & live service alerts") and contact-form messages are delivered there by the free [FormSubmit](https://formsubmit.co) service. The first time someone submits, FormSubmit sends a one-time **activation email** to that address. Click the link in it. If you prefer [Formspree](https://formspree.io), paste its form URL in *Custom form endpoint*.

Until an email is set, the contact form falls back to WhatsApp.

## 4. Live stream detection

- **Facebook and YouTube (manual):** switch live on/off in **Admin → Live & Notice**. A banner then appears on every page and the Watch Live page plays the stream.
- **YouTube (automatic, optional):** in **Admin → Settings**, add your **YouTube channel ID** (starts with `UC`; YouTube → your channel → *Share → Copy channel ID*) and a free **YouTube Data API v3 key** from <https://console.cloud.google.com>. Restrict the key to your website address. The site then detects YouTube live streams on its own and lists your latest uploads on the Videos page.
- Visitors can turn on **browser alerts** on the Watch Live page. These work while the site is open in their browser.

## Folder layout

```
index.html, pictures.html, videos.html, live.html, contact.html, admin.html
data/content.js          ← all website text, events, photos, videos, branches
assets/css/style.css     ← design (colours taken from the church logo)
assets/js/main.js        ← builds the pages from content.js
assets/js/admin.js       ← the Admin page
assets/images/           ← logo, pastor photos, gallery, event flyers
assets/videos/           ← starter video clip
assets/uploads/          ← files uploaded from the Admin page go here
```

To preview on your own computer, run `python3 -m http.server` in this folder and open <http://localhost:8000>.
