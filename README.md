# PuzzleCylinder
Re-creating The 3D Mode from [Pokemon Puzzle League](https://en.wikipedia.org/wiki/Pok%C3%A9mon_Puzzle_League) in Three JS

## [Click Here To Play The Latest Version](https://jakesiegers.github.io/PuzzleCylinder/)
 [Or, perhaps you'd like to view the dev branch?](https://github.com/JakeSiegers/PuzzleCylinder/tree/dev)

## How to Play
Match blocks in groups of 3 or more vertically or horizontally to destroy blocks and earn points!

The tower slowly moves up, adding more blocks as the game goes on.

You keep playing until you're overrun with blocks, and the tower reaches the top of the cylinder.

### Desktop Controls
* **Arrow Keys** - Move Cursor 
* **Spacebar** - Swap Blocks
* **X** - Speeds Up Tower

### Mobile Controls
* **Swipe Left / Right / Up / Down** - Move Cursor
* **Double Tap** - Swap Blocks 

![Game Screenshot](readme/2017-02-04 13_18_35-Jake's Puzzle Cylinder.png)


## Setting Up Development Environment
(These are mainly notes for myself, you may not be working in the same environment)
* Clone Repo
* Run `npm install` to get all the required babel binaries
* Set up PHPStorm / WebStorm to auto-compile with babel javascript to dist with "file watchers"