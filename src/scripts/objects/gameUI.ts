export default class GameUI {
  private scene: Phaser.Scene
  private healthText: Phaser.GameObjects.Text
  private xpText: Phaser.GameObjects.Text
  private goldText: Phaser.GameObjects.Text
  private waveText: Phaser.GameObjects.Text
  private upgradeButton: Phaser.GameObjects.Rectangle
  private upgradeButtonText: Phaser.GameObjects.Text
  private upgradeMenuVisible: boolean = false
  private upgradeMenu: Phaser.GameObjects.Container

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    // Create UI elements
    this.healthText = scene.add.text(20, 20, 'Health: 100/100', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    })

    this.xpText = scene.add.text(20, 60, 'XP: 0', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    })

    this.goldText = scene.add.text(20, 100, 'Gold: 0', {
      fontSize: '24px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    })

    this.waveText = scene.add
      .text(scene.cameras.main.width / 2, 20, 'Wave: 1', {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      })
      .setOrigin(0.5, 0)

    // Upgrade button
    this.upgradeButton = scene.add
      .rectangle(scene.cameras.main.width - 100, 60, 150, 50, 0x4a90e2)
      .setInteractive()
      .on('pointerdown', () => this.toggleUpgradeMenu())

    this.upgradeButtonText = scene.add
      .text(scene.cameras.main.width - 100, 60, 'UPGRADES', {
        fontSize: '20px',
        color: '#ffffff'
      })
      .setOrigin(0.5)

    // Create upgrade menu (initially hidden)
    this.createUpgradeMenu()
  }

  private createUpgradeMenu(): void {
    this.upgradeMenu = this.scene.add.container(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2)
    this.upgradeMenu.setVisible(false)

    // Background
    const bg = this.scene.add.rectangle(0, 0, 500, 400, 0x000000, 0.9)
    this.upgradeMenu.add(bg)

    // Title
    const title = this.scene.add
      .text(0, -170, 'UPGRADES', {
        fontSize: '32px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
    this.upgradeMenu.add(title)

    // Close button
    const closeBtn = this.scene.add
      .rectangle(220, -170, 40, 40, 0xff0000)
      .setInteractive()
      .on('pointerdown', () => this.toggleUpgradeMenu())
    const closeText = this.scene.add
      .text(220, -170, 'X', {
        fontSize: '24px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
    this.upgradeMenu.add(closeBtn)
    this.upgradeMenu.add(closeText)

    // Upgrade buttons will be added dynamically
    this.upgradeMenu.setDepth(100)
  }

  public addUpgradeOption(
    name: string,
    description: string,
    cost: number,
    yOffset: number,
    callback: () => void
  ): void {
    const btn = this.scene.add
      .rectangle(0, yOffset, 450, 60, 0x4a90e2)
      .setInteractive()
      .on('pointerdown', callback)
      .on('pointerover', () => btn.setFillStyle(0x5aa0f2))
      .on('pointerout', () => btn.setFillStyle(0x4a90e2))

    const text = this.scene.add.text(-210, yOffset - 20, `${name} - ${cost} Gold`, {
      fontSize: '20px',
      color: '#ffffff'
    })

    const desc = this.scene.add.text(-210, yOffset + 5, description, {
      fontSize: '14px',
      color: '#cccccc'
    })

    this.upgradeMenu.add(btn)
    this.upgradeMenu.add(text)
    this.upgradeMenu.add(desc)
  }

  public toggleUpgradeMenu(): void {
    this.upgradeMenuVisible = !this.upgradeMenuVisible
    this.upgradeMenu.setVisible(this.upgradeMenuVisible)
  }

  public hideUpgradeMenu(): void {
    this.upgradeMenuVisible = false
    this.upgradeMenu.setVisible(false)
  }

  public updateHealth(current: number, max: number): void {
    this.healthText.setText(`Health: ${Math.floor(current)}/${Math.floor(max)}`)
  }

  public updateXP(xp: number): void {
    this.xpText.setText(`XP: ${Math.floor(xp)}`)
  }

  public updateGold(gold: number): void {
    this.goldText.setText(`Gold: ${Math.floor(gold)}`)
  }

  public updateWave(wave: number): void {
    this.waveText.setText(`Wave: ${wave}`)
  }

  public destroy(): void {
    this.healthText.destroy()
    this.xpText.destroy()
    this.goldText.destroy()
    this.waveText.destroy()
    this.upgradeButton.destroy()
    this.upgradeButtonText.destroy()
    this.upgradeMenu.destroy()
  }
}
