import { Game } from "./game.js";
const townAudio = document.getElementById("townAudio");

// Initialize the game class
// document.documentElement.requestFullscreen();
const game = new Game();

function loop() {
  // Runs the game at the same framerate as the display
  requestAnimationFrame(loop);

  //Main game loop
  // game.background.startAnimation();
  game.moveAndCollide();
  game.background.draw();
  // game.collisionMaskImageSprite.draw();
  game.player.draw();
}
//Initial call to the game loop
loop();

//Event listners
window.addEventListener("keydown", (event) => {
  townAudio.play();
  if (event.key === "s" || event.key === "ArrowDown") {
    game.makefalse();
    game.actionState.down = true;
  } else if (event.key === "w" || event.key === "ArrowUp") {
    game.makefalse();
    game.actionState.up = true;
  } else if (event.key === "a" || event.key === "ArrowLeft") {
    game.makefalse();
    game.actionState.left = true;
  } else if (event.key === "d" || event.key === "ArrowRight") {
    game.makefalse();
    game.actionState.right = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "s" || event.key === "ArrowDown") {
    game.actionState.down = false;
  }
  if (event.key === "w" || event.key === "ArrowUp") {
    game.actionState.up = false;
  }
  if (event.key === "a" || event.key === "ArrowLeft") {
    game.actionState.left = false;
  }
  if (event.key === "d" || event.key === "ArrowRight") {
    game.actionState.right = false;
  }
});
