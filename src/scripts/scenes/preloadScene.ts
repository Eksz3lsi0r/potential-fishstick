import * as Phaser from 'phaser'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    // Add any assets here if needed
  }

  create() {
    this.scene.start('MainScene')
  }
}
