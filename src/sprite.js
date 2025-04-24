export class Sprite {
  constructor({
    image,
    position,
    velocity,
    context,
    canvas,
    magnification = 1,
    frameDelay = 200,
    loop = true
  }) {
    this.image = image; // list of images
    this.position = position;
    this.velocity = velocity;
    this.c = context;
    this.canvas = canvas;
    this.magnification = magnification;

    this.current_frame = 0;
    this.frame_delay = frameDelay;
    this.loop = loop;
    this.f

  }

  draw() {
    const magnifiedWidth = this.image[this.current_frame].width * this.magnification;
    const magnifiedHeight = this.image[this.current_frame].height * this.magnification;

    this.c.drawImage(
      this.image[this.current_frame],
      this.position.x * this.magnification,
      this.position.y * this.magnification,
      magnifiedWidth,
      magnifiedHeight
    );
  }

  startAnimation() {
    this.frame_interval = setInterval(() => {
      this.current_frame++;
      if (this.current_frame >= this.image.length) {
        this.current_frame = this.loop ? 0 : this.image.length - 1;
      }
    }, this.frame_delay);
  }

  stopAnimation() {
    clearInterval(this.frame_interval);
  }
}
