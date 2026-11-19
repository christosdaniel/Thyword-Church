"""Builds the standalone admin tool: _admin/Thyword-Admin.html

Run from the repository root:  python3 _admin/build.py
The result is a single file (styles, script and logo inside it) that you keep
on your own computer/phone. It is NOT published on the public website, because
GitHub Pages skips folders whose names start with an underscore.
"""
import base64, io, os
from PIL import Image

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
here = os.path.join(root, "_admin")

logo = Image.open(os.path.join(root, "assets/images/logo.png"))
logo.thumbnail((120, 120))
buf = io.BytesIO(); logo.save(buf, "PNG", optimize=True)
logo_uri = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

html = open(os.path.join(here, "admin.template.html"), encoding="utf-8").read()
html = (html.replace("{{SITE_CSS}}", open(os.path.join(root, "assets/css/style.css"), encoding="utf-8").read())
            .replace("{{ADMIN_JS}}", open(os.path.join(here, "admin.js"), encoding="utf-8").read())
            .replace("{{LOGO}}", logo_uri))
out = os.path.join(here, "Thyword-Admin.html")
open(out, "w", encoding="utf-8").write(html)
print("Wrote", out, len(html) // 1024, "KB")
