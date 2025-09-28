Hello Professor,

ReadME and Heuristic Report are located in docs/

if zip: 
cd to /AI
npm install
npm run dev

## Tech Stack
For this project I implemented React, Typescript, Next.JS and Tailwind CSS to create the front end and render all the necessary UI.

## UI Library, Icons and Premade Components
For the UI Library I utilized [ShadcnUI](https://ui.shadcn.com/).
For the File Upload Logic I utilized a reusable components taken from [21st.dev](https://21st.dev/flower0wine/file-upload/default).
For the Icons I used [LucideReact](https://lucide.dev/)

## Overview
Upload or Select a sample image, when you upload the image it comes shuffled but you can click on the shuffle button to shuffle it again. Reset button turns it back to the original state of the image meaning it gets solved.

I implemented three algorithms, A* Search with Manhattan Distance, BFS, and DFS for comparison.

*Solve Puzzle* OnClick()=> toggles the algorithm shows the stats for the answer including length, nodes expanded, time, and the max depth i allocated to each algorithm.

You can use solution playback in order to pause, go back and view different steps that the algorithm takes.
