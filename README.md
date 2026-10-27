# The Canon Archive

A single-page site cataloguing every **official-canon** Star Wars film and
series: 13 films (the 9-film Skywalker Saga plus *Rogue One*, *Solo*, the
2008 *Clone Wars* film, and 2026's *The Mandalorian and Grogu*) and 17
series (animated + live-action, including the *Forces of Destiny* shorts).
Legends/Expanded Universe material is excluded, as are stories Lucasfilm
has explicitly placed outside the main continuity (e.g. *Star Wars:
Visions*), and the 1985–86 *Droids* and 1985–87 *Ewoks* cartoons, which
Lucasfilm's own databank still treats as Legends rather than canon.

Entries are sorted by in-universe chronology via the `order` field, not
by release date — so *Rogue One* (3.9) lands immediately before *A New
Hope* (4), and *Solo* (3.4) sits back where it belongs among the early
Imperial years. *Forces of Destiny* is parked at the end (9.9) because it
ranges across every era rather than occupying one slot.

## Timeline view
The site opens on the **Archive** (the card grid). The **Timeline** tab
next to it shows everything in in-universe order. Each film or series is
drawn as one or more spans (main story, flashbacks, crossovers,
epilogues) with its title beside it, and stories that don't overlap share
a row. *The Mandalorian* shows Seasons 1–2, then a gap filled by *The Book
of Boba Fett* (pinned directly underneath, with Chapters 5–7 marked as a
crossover), then Season 3. Above the stories:
- **Canon eras**: Lucasfilm's official named eras.
- **BBY / ABY ruler**: the official dating system. The dropdown in the
  toolbar (or the cards under the timeline) adds a second count under
  each year: years from Endor, years of the Empire, or years from Naboo.
- **Key events**: one row of markers. Major events are always labelled;
  smaller ones get a label when there's room (zoom in) and otherwise show
  their name on hover.

Everything older than 45 BBY (the High Republic) is drawn on a compressed
scale. Use the preset buttons, the zoom slider, or Ctrl/⌘ + scroll to
zoom, and drag to pan. Click any story to open its entry. Spans, events,
and eras are all defined in `data.js` (`SW_SPANS`, `SW_EVENTS`,
`SW_CANON_ERAS`, `SW_SCALES`).

## How to open it
Just open `index.html` in any modern browser. No build step, no server
required (though if your browser blocks local scripts, run a quick local
server: `python3 -m http.server` from this folder, then visit
`http://localhost:8000`).

## Files
- `index.html` — page structure, opening crawl copy
- `style.css` — all visual styling (dark space theme, gold/era color coding)
- `data.js` — every entry's title, year, director/creator, summary, tags
- `script.js` — card grid, filtering, detail modal, opening crawl, tabs
- `timeline.js` — the timeline view
- `media/` — empty on purpose, see below

## Adding the theme music
The crawl now opens on a "Click to Begin" prompt instead of starting on
page load. That click is what unlocks the music — browsers refuse to
autoplay sound before a real interaction, so gating the whole intro
behind one click means it always works, in every browser, no
guessing games:
- Music starts right as the crawl text begins scrolling (a beat after
  the title fades in), not the instant you click.
- The text starts fully below the screen and scrolls at a steady reading
  pace (`SECONDS_PER_LINE` in `script.js`). As soon as the last line has
  receded into the distance, the music and screen fade out together over
  2.5 seconds. Nothing plays after the text is gone.
- Hitting "Skip Intro" cuts it with a quick ~0.4 second fade instead of
  an abrupt stop.

I couldn't include the actual John Williams theme myself (it's
copyrighted), so just drop your own MP3 file into `media/` and name it
`swmt.mp3` — no code changes needed. If the file's missing, the page
still works fine, it just plays silently.

## About the artwork
This build does **not** include real movie posters or stills — those are
copyrighted images owned by Lucasfilm/Disney, and I'm not able to source
and redistribute them for you. Instead, each entry uses an original
icon + era-based color treatment (gold for the prequels, blue for the
originals, red for the sequels, orange for anthology films, green for the
New Republic era, sky-blue for the High Republic).

If you'd like real poster art, drop your own image files into `media/`
and wire them in like this:

1. Add an `image: "media/a-new-hope.jpg"` field to the relevant entry in
   `data.js`.
2. In `script.js`, inside `renderCard()`, swap the icon markup for
   `<img src="${item.image}" alt="${item.title} poster">` when
   `item.image` is set.

## Adding or editing entries
Everything lives in the `SW_DATA` array in `data.js` — each object is one
card. Add a new object with the same shape (`id`, `title`, `year`, `type`,
`era`, `order`, `summary`, `tags`, plus `director`/`runtime` for films or
`creator`/`seasons` for series) and it will automatically appear in the
grid and filters.
