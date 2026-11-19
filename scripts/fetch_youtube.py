"""Collects the church's YouTube videos into data/youtube.js for the website.

Run by the GitHub Action in .github/workflows/youtube-videos.yml (every few
hours), so new sermons appear on the website automatically. No API key needed:
it reads the channel's public RSS feed (latest 15 videos) and, as a bonus, the
channel's /videos page. Videos already saved are kept, so the list grows over
time. Run locally with:  python3 scripts/fetch_youtube.py
"""
import html, json, os, re, sys, urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "data", "content.js")
OUT = os.path.join(ROOT, "data", "youtube.js")
MAX_VIDEOS = 60
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9", "Cookie": "CONSENT=YES+1"}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def settings():
    text = open(CONTENT, encoding="utf-8").read()
    start = text.index("{", text.index("SITE_CONTENT"))
    return json.loads(text[start:text.rindex("}") + 1]).get("settings", {})


def load_existing():
    if not os.path.exists(OUT):
        return {}
    text = open(OUT, encoding="utf-8").read()
    try:
        return json.loads(text[text.index("{"):text.rindex("}") + 1])
    except ValueError:
        return {}


def channel_id_from_page(page):
    for pat in (r'<link rel="canonical" href="https://www\.youtube\.com/channel/(UC[\w-]{22})"',
                r'"externalId":"(UC[\w-]{22})"',
                r'<meta itemprop="(?:identifier|channelId)" content="(UC[\w-]{22})"',
                r'"browseId":"(UC[\w-]{22})"'):
        m = re.search(pat, page)
        if m:
            return m.group(1)
    return ""


def parse_feed(xml_text):
    ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015",
          "media": "http://search.yahoo.com/mrss/"}
    root = ET.fromstring(xml_text)
    videos = []
    for e in root.findall("a:entry", ns):
        vid = e.findtext("yt:videoId", default="", namespaces=ns)
        if not vid:
            continue
        desc = e.findtext("media:group/media:description", default="", namespaces=ns) or ""
        videos.append({
            "id": vid,
            "title": (e.findtext("a:title", default="", namespaces=ns) or "").strip(),
            "date": (e.findtext("a:published", default="", namespaces=ns) or "")[:10],
            "description": re.sub(r"\s+", " ", desc).strip()[:220],
        })
    return videos


def videos_from_page(page):
    """Best effort: pull extra videos (id + title) from the channel's /videos page."""
    m = re.search(r"var ytInitialData\s*=\s*(\{.*?\});\s*</script>", page, re.S)
    if not m:
        return []
    try:
        data = json.loads(m.group(1))
    except ValueError:
        return []
    found, seen = [], set()

    def text_of(t):
        if isinstance(t, dict):
            if "simpleText" in t:
                return t["simpleText"]
            if "runs" in t:
                return "".join(r.get("text", "") for r in t["runs"])
            if "content" in t:
                return t["content"]
        return t if isinstance(t, str) else ""

    def walk(o):
        if isinstance(o, dict):
            vid = o.get("videoId")
            title = text_of(o.get("title"))
            if isinstance(vid, str) and len(vid) == 11 and title and vid not in seen:
                seen.add(vid)
                found.append({"id": vid, "title": html.unescape(title).strip(), "date": "", "description": ""})
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(data)
    return found


def main():
    s = settings()
    existing = load_existing()
    channel_id = (s.get("youtubeChannelId") or existing.get("channelId") or "").strip()
    channel_url = (s.get("youtubeUrl") or "").strip().rstrip("/")

    page = ""
    if channel_url:
        try:
            page = get(channel_url + "/videos")
        except Exception as e:  # noqa: BLE001
            print("Could not open channel page:", e)
    if not channel_id and page:
        channel_id = channel_id_from_page(page)
    if not channel_id:
        print("Channel ID not found. Add it in Admin > Settings > YouTube channel ID.")
        return 1
    print("Channel:", channel_id)

    fresh = []
    try:
        fresh = parse_feed(get("https://www.youtube.com/feeds/videos.xml?channel_id=" + channel_id))
    except Exception as e:  # noqa: BLE001
        print("Could not read RSS feed:", e)
    extra = videos_from_page(page) if page else []

    merged, index = [], {}
    for v in fresh + extra + existing.get("videos", []):
        if v["id"] in index:
            old = index[v["id"]]
            for k in ("title", "date", "description"):
                if not old.get(k) and v.get(k):
                    old[k] = v[k]
            continue
        index[v["id"]] = dict(v)
        merged.append(index[v["id"]])
    # Newest first; videos without a date (from the page) follow in page order
    dated = sorted([v for v in merged if v.get("date")], key=lambda v: v["date"], reverse=True)
    undated = [v for v in merged if not v.get("date")]
    videos = (dated + undated)[:MAX_VIDEOS]

    if not videos and not existing:
        print("No videos found.")
    data = {"channelId": channel_id, "channelUrl": channel_url,
            "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "videos": videos}
    if existing and existing.get("videos") == videos and existing.get("channelId") == channel_id:
        print("No change.")
        return 0
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* Generated automatically from the church YouTube channel by\n"
                " * scripts/fetch_youtube.py (GitHub Action). Do not edit by hand. */\n"
                "window.YOUTUBE_FEED = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n")
    print("Saved", len(videos), "videos")
    return 0


if __name__ == "__main__":
    sys.exit(main())
