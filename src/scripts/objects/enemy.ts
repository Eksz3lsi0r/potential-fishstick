export default class Enemy extends Phaser.GameObjects.Rectangle {
  private maxHealth: number
  private currentHealth: number
  private speed: number
  private damage: number
  private xpValue: number
  private goldValue: number
  private targetX: number
  private targetY: number
  public body: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number, type: number = 1) {
    const size = 20 + type * 5
    const color = type === 1 ? 0xff0000 : type === 2 ? 0xff8800 : 0xff00ff
    super(scene, x, y, size, size, color)

    this.targetX = targetX
    this.targetY = targetY

    // Set properties based on type
    this.maxHealth = 20 * type
    this.currentHealth = this.maxHealth
    this.speed = 50 - type * 5
    this.damage = 5 * type
    this.xpValue = 10 * type
    this.goldValue = 5 * type

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body = this.body as Phaser.Physics.Arcade.Body

    // Move towards target
    this.moveTowardsTarget()
  }

  private moveTowardsTarget(): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetX, this.targetY)
    this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed)
  }

  takeDamage(damage: number): boolean {
    this.currentHealth -= damage
    
    // Flash effect when hit - using fillColor instead of setTint
    this.setFillStyle(0xffffff)
    this.scene.time.delayedCall(100, () => {
      // Restore original color based on type
      const originalColor = this.goldValue === 5 ? 0xff0000 : this.goldValue === 10 ? 0xff8800 : 0xff00ff
      this.setFillStyle(originalColor)
    })

    if (this.currentHealth <= 0) {
      return true // Enemy is dead
    }
    return false
  }

  getDamage(): number {
    return this.damage
  }

  getXPValue(): number {
    return this.xpValue
  }

  getGoldValue(): number {
    return this.goldValue
  }

  update(): void {
    // Keep moving towards target (in case target moves)
    this.moveTowardsTarget()
  }
}
