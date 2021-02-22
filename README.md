ARCHIVE.ORG MUSIC DOWNLOADER
===============================================================
by Jake Herman

A script that downloads music from archive.org pages

***DESCRIPTION:  ***
This script consumes a list of archive.org music page URLs from argv or a JSON file
and downloads all of the music from the from those pages. It can download music from
normal archive.org music pages and those that are "stream only". The music will be
downloaded to sub directories of a destination directory passed to argv, each page
will automatically create sub-directory to download the music files in to. 

NOTE: The use of this script to download music from "stream only" pages is unethical
and potentially illegal!!! This script was created purely as an intellectual execercise
and is being shared publicly with intent to only be a portfolio item. Do not use this script
for unethical purposes!

***REQUIREMENTS:  ***
- nodejs v14.15.4 (other versions may also work)
- npm 6.14.2 (other versions may also work)

***INSTALLATION:  ***
>cd < project root directory >

>npm install

***USAGE:  ***
Every command in this section is executed from the package root directory.

Display command line help:
./get-music-from-page.js -h

Note: --dest is a required argument that is the relative path to a folder in which to download the 
music files to.

Get music from a list of page passed to command line:
./get-music-from-page.js --dest <dest dir> --queue <url #1> <url #2> ... <url #N>

Get music from a JSON file that holds an array of url strings:
./get-music-from-page.js --dest <dest dir> --queue-json-file <relative path to json file>

***ADDITIONAL CONSIDERATIONS:   ***
This script is not hardened to all possible music file names. Special charecters can and do
cause problems when trying to save the file to the file system. Starting on line 76 of there
are some statements that take care of some common special charecters. If you want to make a mod
for new problems you may encounter this would be the place to do it.