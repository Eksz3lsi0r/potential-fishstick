import Base from '../objects/base'
import Enemy from '../objects/enemy'
import Projectile from '../objects/projectile'
import GameUI from '../objects/gameUI'

export default class MainScene extends Phaser.Scene {
  private base: Base
  private enemies: Phaser.GameObjects.Group
  private projectiles: Phaser.GameObjects.Group
  private ui: GameUI

  // Game stats
  private xp: number = 0
  private gold: number = 50
  private wave: number = 1
  private enemiesInWave: number = 0
  private enemiesKilled: number = 0

  // Upgrade stats
  private baseDamage: number = 10
  private fireRate: number = 1000 // milliseconds between shots
  private projectileRange: number = 400
  private lastShotTime: number = 0

  // Enemy spawning
  private spawnTimer: Phaser.Time.TimerEvent
  private enemiesSpawned: number = 0

  // Game state
  private gameOver: boolean = false

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#1a1a2e')

    // Create base at center bottom
    const baseX = this.cameras.main.width / 2
    const baseY = this.cameras.main.height - 100
    this.base = new Base(this, baseX, baseY)

    // Create groups
    this.enemies = this.add.group()
    this.projectiles = this.add.group()

    // Setup collisions
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.handleProjectileEnemyCollision as any,
      undefined,
      this
    )
    this.physics.add.overlap(this.base, this.enemies, this.handleBaseEnemyCollision as any, undefined, this)

    // Create UI
    this.ui = new GameUI(this)
    this.setupUpgradeMenu()

    // Start first wave
    this.startWave()

    // Game over text (hidden initially)
    this.createGameOverText()
  }

  private setupUpgradeMenu(): void {
    this.ui.addUpgradeOption('Increase Damage', '+5 damage per shot', 30, -80, () => {
      if (this.gold >= 30) {
        this.gold -= 30
        this.baseDamage += 5
        this.ui.updateGold(this.gold)
        this.ui.hideUpgradeMenu()
      }
    })

    this.ui.addUpgradeOption('Fire Rate', 'Shoot 20% faster', 40, -10, () => {
      if (this.gold >= 40) {
        this.gold -= 40
        this.fireRate *= 0.8
        this.ui.updateGold(this.gold)
        this.ui.hideUpgradeMenu()
      }
    })

    this.ui.addUpgradeOption('Max Health', '+50 max health', 50, 60, () => {
      if (this.gold >= 50) {
        this.gold -= 50
        this.base.increaseMaxHealth(50)
        this.ui.updateHealth(this.base.getHealth(), this.base.getMaxHealth())
        this.ui.updateGold(this.gold)
        this.ui.hideUpgradeMenu()
      }
    })

    this.ui.addUpgradeOption('Heal', 'Restore 30 health', 25, 130, () => {
      if (this.gold >= 25) {
        this.gold -= 25
        this.base.heal(30)
        this.ui.updateHealth(this.base.getHealth(), this.base.getMaxHealth())
        this.ui.updateGold(this.gold)
        this.ui.hideUpgradeMenu()
      }
    })
  }

  private startWave(): void {
    this.wave++
    this.ui.updateWave(this.wave)

    // Calculate enemies for this wave
    this.enemiesInWave = 5 + (this.wave - 1) * 3
    this.enemiesSpawned = 0
    this.enemiesKilled = 0

    // Spawn enemies over time
    this.spawnTimer = this.time.addEvent({
      delay: 2000 - Math.min(this.wave * 50, 1000), // Spawn faster as waves progress
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    })
  }

  private spawnEnemy(): void {
    if (this.enemiesSpawned >= this.enemiesInWave) {
      this.spawnTimer.remove()
      return
    }

    // Random spawn position on edges
    let x, y
    const side = Math.floor(Math.random() * 4)
    switch (side) {
      case 0: // Top
        x = Math.random() * this.cameras.main.width
        y = -20
        break
      case 1: // Right
        x = this.cameras.main.width + 20
        y = Math.random() * this.cameras.main.height
        break
      case 2: // Bottom
        x = Math.random() * this.cameras.main.width
        y = this.cameras.main.height + 20
        break
      case 3: // Left
        x = -20
        y = Math.random() * this.cameras.main.height
        break
    }

    // Enemy type based on wave
    let enemyType = 1
    if (this.wave > 3) enemyType = Math.random() > 0.7 ? 2 : 1
    if (this.wave > 6) enemyType = Math.random() > 0.8 ? 3 : Math.random() > 0.5 ? 2 : 1

    const enemy = new Enemy(this, x, y, this.base.x, this.base.y, enemyType)
    this.enemies.add(enemy)
    this.enemiesSpawned++
  }

  private handleProjectileEnemyCollision(projectile: any, enemy: any): void {
    const isDead = (enemy as Enemy).takeDamage((projectile as Projectile).getDamage())
    projectile.destroy()

    if (isDead) {
      this.xp += (enemy as Enemy).getXPValue()
      this.gold += (enemy as Enemy).getGoldValue()
      this.ui.updateXP(this.xp)
      this.ui.updateGold(this.gold)
      enemy.destroy()
      this.enemies.remove(enemy)

      this.enemiesKilled++

      // Check if wave is complete
      if (this.enemiesKilled >= this.enemiesInWave) {
        this.time.delayedCall(2000, () => {
          if (!this.gameOver) this.startWave()
        })
      }
    }
  }

  private handleBaseEnemyCollision(base: any, enemy: any): void {
    this.base.takeDamage((enemy as Enemy).getDamage())
    this.ui.updateHealth(this.base.getHealth(), this.base.getMaxHealth())
    enemy.destroy()
    this.enemies.remove(enemy)

    this.enemiesKilled++

    if (this.base.isDestroyed()) {
      this.endGame()
    }
  }

  private shootAtNearestEnemy(): void {
    const now = this.time.now
    if (now - this.lastShotTime < this.fireRate) return

    // Find nearest enemy
    let nearestEnemy: any = undefined
    let minDistance = this.projectileRange

    this.enemies.getChildren().forEach((enemyObj: any) => {
      const enemy = enemyObj as Enemy
      const distance = Phaser.Math.Distance.Between(this.base.x, this.base.y, enemy.x, enemy.y)
      if (distance < minDistance) {
        minDistance = distance
        nearestEnemy = enemy
      }
    })

    if (nearestEnemy && nearestEnemy.x !== undefined) {
      const projectile = new Projectile(this, this.base.x, this.base.y, nearestEnemy.x, nearestEnemy.y, this.baseDamage)
      this.projectiles.add(projectile)
      this.lastShotTime = now
    }
  }

  private createGameOverText(): void {
    // This will be shown when game ends
  }

  private endGame(): void {
    this.gameOver = true
    if (this.spawnTimer) this.spawnTimer.remove()

    // Display game over
    const gameOverBg = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      600,
      400,
      0x000000,
      0.9
    )
    const gameOverText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, 'GAME OVER', {
        fontSize: '64px',
        color: '#ff0000'
      })
      .setOrigin(0.5)

    const statsText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 20,
        `Wave: ${this.wave}\nXP: ${Math.floor(this.xp)}\nGold: ${Math.floor(this.gold)}`,
        {
          fontSize: '32px',
          color: '#ffffff',
          align: 'center'
        }
      )
      .setOrigin(0.5)

    const restartBtn = this.add
      .rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 + 120, 200, 60, 0x4a90e2)
      .setInteractive()
      .on('pointerdown', () => this.scene.restart())

    const restartText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 120, 'RESTART', {
        fontSize: '28px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
  }

  update() {
    if (this.gameOver) return

    // Update enemies
    this.enemies.getChildren().forEach((enemyObj: any) => {
      ;(enemyObj as Enemy).update()
    })

    // Update projectiles
    this.projectiles.getChildren().forEach((projectileObj: any) => {
      ;(projectileObj as Projectile).update()
    })

    // Auto-shoot at enemies
    this.shootAtNearestEnemy()

    // Update UI
    this.ui.updateHealth(this.base.getHealth(), this.base.getMaxHealth())
  }
}
