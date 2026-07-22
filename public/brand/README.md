# Brand assets

Key identity files. Use these exact names so the site (and future pages)
can reference them without code changes:

    logo.png        full logo with wordmark, transparent background
    logo-mark.png   square icon-only mark, transparent background
    wordmark.png    text-only wordmark, transparent background
    key-art.jpg     main promotional art (wide)

Two files live OUTSIDE this folder because Next.js picks them up by
convention, zero config:

    app/icon.png             the favicon. Square PNG, 512x512 or bigger.
    app/opengraph-image.png  the social share card. Exactly 1200x630.

After adding files, run publish-site.cmd in the repo root to deploy.
