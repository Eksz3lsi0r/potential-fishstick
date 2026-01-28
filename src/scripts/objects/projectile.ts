import * as Phaser from 'phaser'

export default class Projectile extends Phaser.GameObjects.Rectangle {
  private speed: number
  private damage: number
  public body: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number, damage: number) {
    super(scene, x, y, 8, 8, 0xffff00)

    this.speed = 300
    this.damage = damage

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body = this.body as Phaser.Physics.Arcade.Body

    // Calculate direction and set velocity
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY)
    this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed)
  }

  getDamage(): number {
    return this.damage
  }

  update(): void {
    // Destroy if out of bounds
    if (
      this.x < -50 ||
      this.x > this.scene.cameras.main.width + 50 ||
      this.y < -50 ||
      this.y > this.scene.cameras.main.height + 50
    ) {
      this.destroy()
    }
  }
}
