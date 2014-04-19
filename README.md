XBMC Node Console
=================

A very simple command line console for accessing XBMC via RPC.

Currently provides three main functions related to playing media:

 * Skip forward and backward by a pre-set, but changeable, arbitrary amount.
 * Attempt to find the end of a block of adverts by performing a binary search.
 * Toggle play/pause by pressing *p*

By John McKerrell, licensed under the WTFPL http://www.wtfpl.net

## Basic Skipping

Skips forward by a user selectable amount, 20 seconds by default. To change the period, simply type in numbers and then press enter.
To skip, press:
 * Backwards: *<* *,* *F7* (on Macs at least)
 * Forwards: *>* *.* *F9* (on Macs at least)

## Advert Skipping

Allows you to perform a binary search for the end of a block of adverts.

 1. When the adverts begin, press *a*, the video will skip forwards by 250 seconds (just over 4 minutes).
 2. If the adverts are still on, press *a* again, the video will skip forwards another 250 seconds.
 3. If the show is now on, press *s* again, the video will skip backwards by 125 seconds.
 4. Continue pressing *a* and *s* until you reach a point that you're happy to play from.
 5. Press *r* when finished to reset the skip period back to 250 seconds.
     
Once you have reached the show the first time, each skip will half in duration, to a minimum of 10 seconds. 

