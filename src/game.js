import { Sprite } from "./sprite.js";
export class Game {
  constructor() {
    // Window variables
    this.canvas = document.querySelector("canvas");
    this.c = this.canvas.getContext("2d");
    this.canvas.width = 1920;
    this.canvas.height = 1080;

    // Movement variables
    this.actionState = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.velocity = 1;

    // Sprites
    // Background
    const background_img = new Image();
    background_img.src = "./assets/world_map.gif";

    // World
    const magnification = 3;
    this.world_width = background_img.width * magnification;
    this.world_height = background_img.height * magnification;
    this.background = new Sprite({
      // image: background_img,
      image: [background_img, background_img, background_img, background_img],
      position: {
        // x: this.world_width - this.canvas.width,
        x: 0,
        // y: this.world_height - this.canvas.height,
        y: 0,
      },
      // position: { x: 0, y: 0 },
      velocity: this.velocity,
      context: this.c,
      canvas: this.canvas,
      magnification: magnification,
    });
    // World Mask

    this.collisionMaskImage = new Image();
    this.collisionMaskImage.src = "assets/mapMask.png";
    this.collisionMaskImageSprite = new Sprite({
      image: [this.collisionMaskImage],
      position: {
        // x: this.world_width - this.canvas.width,
        x: 0,
        // y: this.world_height - this.canvas.height,
        y: 0,
      },
      // position: { x: 0, y: 0 },
      velocity: this.velocity,
      context: this.c,
      canvas: this.canvas,
      magnification: magnification,
    });

    // Player
    const player_img = new Image();
    this.player_default_pos = {
      x: this.canvas.width / 8,
      y: this.canvas.height / 12,
    };
    player_img.src = "./assets/Player/player-down-1.png";
    this.player = new Sprite({
      image: [player_img],
      position: {
        x: this.player_default_pos.x,
        y: this.player_default_pos.y,
      },
      // position: { x: 0, y: 0 },
      velocity: this.velocity,
      context: this.c,
      canvas: this.canvas,
      magnification: 4,
    });
  }

  // Helper function for movement, resets the value of the actionState to default
  makefalse() {
    this.actionState.down = false;
    this.actionState.up = false;
    this.actionState.left = false;
    this.actionState.right = false;
  }

  AreaEnteredSignal(x, y) {
    // this.c.drawImage(
    //   this.collisionMaskImage,
    //   this.background.position.x,
    //   this.background.position.y,
    //   768,
    //   768,
    //   this.background.position.x,
    //   this.background.position.y,
    //   this.canvas.width * this.magnification,
    //   this.canvas.height * this.magnification
    // );

    const data = this.c.getImageData(x, y, 1, 1).data;
    // console.log(data);

    // Clear the canvas after checking the data
    // this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (data[0] === 255 && data[1] === 255 && data[2] === 255) {
      return "n"; // Walkable area (white)
    }
    if (data[0] === 0 && data[1] === 0 && data[2] === 0) {
      return "w"; // Wall (black)
    }
    if (data[0] === 0 && data[1] === 0 && data[2] === 255) {
      return "b";
    }
    if (data[0] === 255 && data[1] === 0 && data[2] === 0) {
      return "r";
    }

    return "n";
  }

  moveAndCollide() {
    // Cache player position before starting updates
    let cachedPlayerPosition = { ...this.player.position };

    // Down
    if (this.actionState.down) {
      const newY = this.background.position.y - this.background.velocity;
      const lowerLimit = -480;
      if (this.player.position.y < this.player_default_pos.y) {
        cachedPlayerPosition.y += this.background.velocity;
      } else if (newY >= lowerLimit) {
        this.background.position.y = newY;
      } else if (this.player.position.y < 180) {
        cachedPlayerPosition.y += this.velocity;
      }
    }

    // Up
    if (this.actionState.up) {
      const newY = this.background.position.y + this.background.velocity;
      if (this.player.position.y > this.player_default_pos.y) {
        cachedPlayerPosition.y -= this.background.velocity;
      } else if (newY <= 0) {
        this.background.position.y = newY;
      } else if (this.player.position.y > -12) {
        cachedPlayerPosition.y -= this.background.velocity;
      }
    }

    // Left
    if (this.actionState.left) {
      const newX = this.background.position.x + this.background.velocity;
      if (this.player.position.x > this.player_default_pos.x) {
        cachedPlayerPosition.x -= this.velocity;
      } else if (newX <= 0) {
        this.background.position.x = newX;
      } else if (this.player.position.x > 0) {
        cachedPlayerPosition.x -= this.background.velocity;
      }
    }

    // Right
    if (this.actionState.right) {
      const newX = this.background.position.x - this.background.velocity;
      const rightLimit = -263;
      if (this.player.position.x < this.player_default_pos.x) {
        cachedPlayerPosition.x += this.background.velocity;
      } else if (newX >= rightLimit) {
        this.background.position.x = newX;
      }
      if (newX < rightLimit && this.player.position.x < 360) {
        cachedPlayerPosition.x += this.velocity;
      }
    }

    this.collisionMaskImageSprite.position = this.background.position;

    const playerPositionX = -this.background.position.x + cachedPlayerPosition.x;
    const playerPositionY = -this.background.position.y + cachedPlayerPosition.y;

    // Check if player is colliding with the walls
    if (
      this.AreaEnteredSignal(playerPositionX, playerPositionY) !==
      "b"
    ) {
      this.player.position = cachedPlayerPosition;
    }
  }
}
