import * as Phaser from 'phaser'

export default class Base extends Phaser.GameObjects.Rectangle {
  private maxHealth: number
  private currentHealth: number
  private healthBar: Phaser.GameObjects.Graphics
  public scene: Phaser.Scene

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 80, 80, 0x4a90e2)
    this.scene = scene
    this.maxHealth = 100
    this.currentHealth = this.maxHealth

    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Create health bar
    this.healthBar = scene.add.graphics()
    this.updateHealthBar()
  }

  takeDamage(damage: number): void {
    this.currentHealth -= damage
    if (this.currentHealth < 0) this.currentHealth = 0
    this.updateHealthBar()
  }

  heal(amount: number): void {
    this.currentHealth += amount
    if (this.currentHealth > this.maxHealth) this.currentHealth = this.maxHealth
    this.updateHealthBar()
  }

  increaseMaxHealth(amount: number): void {
    this.maxHealth += amount
    this.currentHealth += amount
    this.updateHealthBar()
  }

  getHealth(): number {
    return this.currentHealth
  }

  getMaxHealth(): number {
    return this.maxHealth
  }

  isDestroyed(): boolean {
    return this.currentHealth <= 0
  }

  private updateHealthBar(): void {
    this.healthBar.clear()
    const barWidth = 100
    const barHeight = 10
    const barX = this.x - barWidth / 2
    const barY = this.y - 50

    // Background
    this.healthBar.fillStyle(0x000000)
    this.healthBar.fillRect(barX, barY, barWidth, barHeight)

    // Health
    const healthWidth = (this.currentHealth / this.maxHealth) * barWidth
    const healthColor =
      this.currentHealth > this.maxHealth * 0.5
        ? 0x00ff00
        : this.currentHealth > this.maxHealth * 0.25
        ? 0xffff00
        : 0xff0000
    this.healthBar.fillStyle(healthColor)
    this.healthBar.fillRect(barX, barY, healthWidth, barHeight)

    // Border
    this.healthBar.lineStyle(2, 0xffffff)
    this.healthBar.strokeRect(barX, barY, barWidth, barHeight)
  }

  destroy(): void {
    this.healthBar.destroy()
    super.destroy()
  }
}
