# Checked Out

*Checkout was at 11. In 1962.*

A haunted-hotel management game for Android and the browser. You're Mortimer, a ghost stuck in The Shelley, a hotel
that's going broke. Keep the guests scared enough to pay, but not so scared they run. (When the sign's lights fail,
The Shelley reads HELL.)

## Play the prototype
Open `game/index.html` in a browser (phone-sized works best). No build step.

- Pick a scare card, then tap a room or the elevator.
- Each guest has a fear bar: grey = bored, green = paying, red = they run screaming (and panic spreads).
- Guests check in at the desk, ride the elevator between floors, eat in the restaurant, and check out with a tip and a review.
- Scares cost presence, which refills over time. The same scare works less on a guest each time.
- The night runs 9 PM to 6 AM (3 minutes). `1x/2x` speeds it up.

Test hooks: `?skip` skips the intro, `?bot` plays itself, `?bot=wild` plays recklessly, `?speed=6` runs faster.

## Layout
```
game/        the prototype: index.html, art.js (all art, drawn in code as SVG), game.js
mockups/     art test sheet (index.html) and screenshots (shots/)
```
