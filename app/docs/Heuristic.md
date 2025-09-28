# 8‑Puzzle: A* Heuristic Write‑Up

## Implementation
Manhattan can be found in /lib/heuristics.ts
Search Algorithm are found in /lib/search-algorithms.ts

## What I built
I made an 8‑puzzle solver where the main algorithm is A*. I also added BFS and DFS so I could compare them with A*. For A*, I use one heuristic: Manhattan distance.

## How I represent the puzzle
- Tiles are 1..8 and the blank is 0.
- I store a board as a 1D array of 9 entries in row‑major order.
- The goal state is `[1,2,3,4,5,6,7,8,0]`.
- A move slides the blank up/down/left/right when that’s valid. Every move costs 1.

## How A* works 
A* picks the next board to explore based on `f(n) = g(n) + h(n)`. Here `g(n)` is how many moves we made to reach the state, and `h(n)` is our estimate of how many moves are left. If `h` is admissible and consistent, A* will return an optimal solution.

## My heuristic: Manhattan distance
- What it is: For each non‑blank tile, count how many grid steps (up/down/left/right) it is away from its goal position. Add those up.
- Formula: `H(s) = Σ |r_i − r*_i| + |c_i − c*_i|` over non‑blank tiles.
- Why it’s admissible: You can’t move a tile closer without spending at least one move per grid step, so this never overestimates.
- Why it’s consistent: A single move changes the Manhattan total by at most 1, so the triangle inequality holds.
- Why I chose it: It’s the standard pick for the 8‑puzzle. It’s simple, fast, and gives much better guidance than very simple counts.

## Why I also kept BFS and DFS
I implemented DFS and BFS for comparison for speed and steps

## What I noticed while testing
On typical scrambled boards, A* with Manhattan finds optimal solutions while expanding far fewer states compared to BFS. Overall, A* + Manhattan gave the best balance of speed and solution quality for me. Sometimes DFS wouldn't solve it because it took too many steps.
