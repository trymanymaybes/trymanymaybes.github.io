# Printable sheets and new possibilities

Run `python scripts/build_printables_and_possibilities.py` from a Python environment with reportlab, svglib and qrcode. The generator reads the challenge catalogue and original SVG geometry, writes the five added two-page A4 PDFs and submission QR PNGs, and rebuilds twelve vector examples for 07-10. It preserves earlier catalogue examples.

QR targets are `https://trymanymaybes.github.io/submit.html?challenge=NN`. Printed URLs provide an alternative to scanning. All original starter geometry is retained verbatim in illustrations; Challenge 10 repeats it identically in two panels. Each catalogue example includes alt text and an explanation. New published examples are automatically included by the gallery preview.

The static gallery fallback and challenges download list should be updated alongside future content additions. Existing PDFs 01 and 03-06 remain unchanged.
