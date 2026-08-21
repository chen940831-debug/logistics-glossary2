"""Create a publishable DOCX copy with personal metadata removed."""

from __future__ import annotations

import argparse
import re
import zipfile
from pathlib import Path

PUBLISHER = b"Logistics Glossary Training"


def scrub_xml(name: str, content: bytes) -> bytes | None:
    if name == "docProps/custom.xml":
        return None

    if name == "docProps/core.xml":
        content = re.sub(rb"(<dc:creator(?:\s[^>]*)?>).*?(</dc:creator>)", rb"\g<1>" + PUBLISHER + rb"\g<2>", content)
        return re.sub(rb"(<cp:lastModifiedBy(?:\s[^>]*)?>).*?(</cp:lastModifiedBy>)", rb"\g<1>" + PUBLISHER + rb"\g<2>", content)

    if name.endswith(".xml") and name.startswith("word/"):
        return re.sub(rb"\s+w:rsid[^=\s]*=(?:\"[^\"]*\"|'[^']*')", b"", content)

    return content


def sanitize(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(source, "r") as original, zipfile.ZipFile(destination, "w", zipfile.ZIP_DEFLATED) as cleaned:
        for item in original.infolist():
            content = scrub_xml(item.filename, original.read(item.filename))
            if content is not None:
                cleaned.writestr(item, content)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    sanitize(args.source, args.destination)
