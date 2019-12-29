function _update() {
    __activeScene.update()
}

function _render() {
    __activeScene.draw()
}

class Scene {
    constructor(entities) {
        this.entities = []
        this.entitiesToPop = []
        entities.forEach(entity => {
            const entityName = entity[0]
            const entityArgs = entity[1]
            this.entities.push(new entityName(...entityArgs, this))
        });
        this.groomEntities()
    }

    draw() {
        this.entities.forEach(entity => {
            if (!entity.isActive()) {
                return
            }
            _draw(entity)
        });
        this.groomEntities()
    }

    update() {
        this.entities.forEach(entity => {
            if (!entity.isActive()) {
                return
            }
            entity.update()
        });
    }

    groomEntities() {
        this.entities.sort((a, b) => a.zIndex > b.zIndex)
    }
}

class GameScene extends Scene {
    constructor(entities) {
        super(entities)
        _playMusic('saymyname')
    }

    draw() {
        super.draw()
        _writeText("A~TEENAGERSNAKE~Z", 0, 0, TILE_SIZE, 'white')
        let scoreText = playerScore.toString()
        let scorePos = __gameWidth - (TILE_SIZE * scoreText.length)
        let hiScoreText = 'HI-SCORE:'
        _writeText(scoreText, scorePos, TILE_SIZE * 2, TILE_SIZE, 'white')
        _writeText(hiScoreText, 0, TILE_SIZE * 2, TILE_SIZE, 'white')
        _writeText(hiScore, hiScoreText.length * TILE_SIZE, TILE_SIZE * 2, TILE_SIZE, 'white')
    }
}

class IntroScene extends Scene {
    draw() {
        super.draw()
        __mainContext.fillStyle = 'black'
        __mainContext.fillRect(0, 0, __gameWidth, __gameHeight)
        _writeText("A~TEENAGERSNAKE~Z", 0, 0, TILE_SIZE, 'white')
        let startText = 'PRESS SPACE'
        _writeText(startText, __gameWidth / 2 - startText.length / 2 * TILE_SIZE, __gameHeight / 2, TILE_SIZE, 'white')

        _writeText('  ↑', 0, __gameHeight - TILE_SIZE * 3, TILE_SIZE, 'white')
        _writeText('← ↓ →', 0, __gameHeight - TILE_SIZE, TILE_SIZE, 'white')
    }

    update() {
        super.update()
        if (_keyPressed(' ')) {
            __scenes['game'] = gameScene()
            __activeScene = __scenes['game']
        }
    }
}

class LoseScene extends Scene {
    constructor(entities) {
        super(entities)
        _playMusic('buildin')
    }

    draw() {
        super.draw()
        __mainContext.drawImage(__images['lossFrame'], 0, 0)
        __mainContext.globalAlpha = 0.2
        __mainContext.fillStyle = 'red'
        __mainContext.fillRect(0, 0, __gameWidth, __gameHeight)
        __mainContext.globalAlpha = 1
        let startText1 = 'PRESS SPACE'
        let startText2 = 'TO TRY AGAIN'
        _writeText(startText1, __gameWidth / 2 - startText1.length / 2 * TILE_SIZE, __gameHeight / 2, TILE_SIZE, 'white')
        _writeText(startText2, __gameWidth / 2 - startText2.length / 2 * TILE_SIZE, __gameHeight / 2 + TILE_SIZE, TILE_SIZE, 'white')
    }

    update() {
        super.update()
        if (_keyPressed(' ')) {
            playerScore = 0
            wallThickness = 0
            wallTimer = 5
            __scenes['game'] = gameScene()
            __activeScene = __scenes['game']
        }
    }
}

class Entity {
    constructor(image, x, y, z, scene) {
        this.picture = image
        this.scene = scene
        this.x = x
        this.y = y
        this.zIndex = z
        this.id = Math.floor(Math.random() * 100000)
        this.active = true
        this.onCreate()
    }

    image() {
        return this.picture
    }

    isActive() {
        return this.active
    }

    destroy() {
        this.active = false
        this.scene.entitiesToPop.push(this)
        this.onDestroy()
    }

    onCreate() {}
    update() {}
    onDestroy() {}
}

class Player extends Entity {
    constructor(scene) {
        super('wormhead', 0, 0, 4, scene)
    }

    onCreate() {
        this.x = Math.floor(Math.random() * (__gameWidth / TILE_SIZE)) * TILE_SIZE
        this.y = Math.floor(Math.random() * (__gameHeight / TILE_SIZE)) * TILE_SIZE
        this.targetX = this.x
        this.targetY = this.y

        switch (Math.floor(Math.random() * 2)) {
            case 0:
                if (this.y > __gameHeight / 2) {
                    this.dir = 'up'
                } else {
                    this.dir = 'down'
                }
                break
            case 1:
                if (this.x > __gameWidth / 2) {
                    this.dir = 'left'
                } else {
                    this.dir = 'right'
                }
                break
        }

        let reroll = false

        this.scene.entities.forEach(entity => {
            if (entity.isActive() && _colliding(this, entity)) {
                reroll = true
            }
        });

        if (reroll) {
            this.onCreate()
            return
        }

        this.spawnChild()
        this.spawnChild()
        this.spawnChild()
    }

    update() {
        if (_keyPressed('ArrowUp') && this.dir !== 'down') {
            this.dir = 'up'
        } else if (_keyPressed('ArrowDown') && this.dir !== 'up') {
            this.dir = 'down'
        } else if (_keyPressed('ArrowLeft') && this.dir !== 'right') {
            this.dir = 'left'
        } else if (_keyPressed('ArrowRight') && this.dir !== 'left') {
            this.dir = 'right'
        }

        if (this.x === this.targetX && this.y === this.targetY) {
            switch (this.dir) {
                case 'up':
                    this.targetY = this.y - TILE_SIZE
                    break
                case 'down':
                    this.targetY = this.y + TILE_SIZE
                    break
                case 'left':
                    this.targetX = this.x - TILE_SIZE
                    break
                case 'right':
                    this.targetX = this.x + TILE_SIZE
                    break
            }
        }

        if (this.x < this.targetX) {
            this.x += TILE_SIZE / (500 / __FPS)
            if (this.x >= this.targetX) {
                this.x = this.targetX
                this.giveChildDirection()
            }
        } else if (this.x > this.targetX) {
            this.x -= TILE_SIZE / (500 / __FPS)
            if (this.x <= this.targetX) {
                this.x = this.targetX
                this.giveChildDirection()
            }
        }

        if (this.y < this.targetY) {
            this.y += TILE_SIZE / (500 / __FPS)
            if (this.y >= this.targetY) {
                this.y = this.targetY
                this.giveChildDirection()
            }
        } else if (this.y > this.targetY) {
            this.y -= TILE_SIZE / (500 / __FPS)
            if (this.y <= this.targetY) {
                this.y = this.targetY
                this.giveChildDirection()
            }
        }

        this.checkCollision()
    }

    checkCollision() {
        this.scene.entities.forEach(entity => {
            if (this === entity || !entity.isActive()) { return }
            if (_colliding(this, entity)) {
                switch (entity.constructor.name) {
                    case 'Chicken':
                        entity.destroy()
                        this.spawnChild()
                        break
                    case 'Body':
                        if (entity.depth < 4) break
                    case 'Wall':
                        let deathScreen = document.createElement('canvas')
                        deathScreen.width = __mainViewport.width
                        deathScreen.height = __mainViewport.height
                        let deathCtx = deathScreen.getContext('2d')
                        deathCtx.drawImage(__mainViewport, 0, 0)
                        __images['lossFrame'] = deathScreen
                        __scenes['loss'] = loseScene()
                        __activeScene = __scenes['loss']
                        break
                }
            }
        });
    }

    spawnChild() {
        let parent = this
        let childDepth = 1
        while (parent.child !== undefined) {
            parent = parent.child
            childDepth += 1
        }
        parent.child = new Body(parent.x, parent.y, childDepth, parent.scene)
        this.scene.entities.push(parent.child)
    }

    giveChildDirection() {
        if (this.child !== undefined) {
            this.child.targetX = this.x
            this.child.targetY = this.y
        }
    }
}

class Body extends Entity {
    constructor(x, y, depth, scene) {
        super('wormbody', x, y, 3, scene)
        this.targetX = x
        this.targetY = y
        this.child = undefined
        this.depth = depth
    }

    update() {
        if (this.x < this.targetX) {
            this.x += TILE_SIZE / (500 / __FPS)
            if (this.x > this.targetX) {
                this.x = this.targetX
                this.giveChildDirection()
            }
        } else if (this.x > this.targetX) {
            this.x -= TILE_SIZE / (500 / __FPS)
            if (this.x < this.targetX) {
                this.x = this.targetX
                this.giveChildDirection()
            }
        }

        if (this.y < this.targetY) {
            this.y += TILE_SIZE / (500 / __FPS)
            if (this.y > this.targetY) {
                this.y = this.targetY
                this.giveChildDirection()
            }
        } else if (this.y > this.targetY) {
            this.y -= TILE_SIZE / (500 / __FPS)
            if (this.y < this.targetY) {
                this.y = this.targetY
                this.giveChildDirection()
            }
        }
    }

    giveChildDirection() {
        if (this.child !== undefined) {
            this.child.targetX = this.x
            this.child.targetY = this.y
        }
    }
}

class Chicken extends Entity {
    constructor(scene) {
        super('chicken', 0, 0, 2, scene)
    }

    onCreate() {
        this.x = Math.floor(Math.random() * (__gameWidth / TILE_SIZE)) * TILE_SIZE
        this.y = Math.floor(Math.random() * (__gameHeight / TILE_SIZE)) * TILE_SIZE

        let reroll = false

        this.scene.entities.forEach(entity => {
            if (entity.isActive() && _colliding(this, entity)) {
                reroll = true
            }
        });

        if (reroll) {
            this.onCreate()
        }
    }

    onDestroy() {
        playerScore += 100
        if (playerScore > hiScore) {
            hiScore = playerScore
        }
        this.active = false
        wallTimer -= 1
        if (wallTimer <= 0) {
            wallThickness += 1
            let walls = generateWalls()
            let wallEnts = []
            let collision = false
            walls.forEach(wall => {
                let wallEnt = new wall[0](...wall[1], this.scene)
                this.scene.entities.forEach(entity => {
                    if (entity.constructor.name === 'Player') {
                        if (_colliding(wallEnt, entity)) {
                            collision = true
                        }
                    }
                });
                wallEnts.push(wallEnt)
            });
            if (!collision) {
                this.scene.entities = this.scene.entities.concat(wallEnts)
                wallTimer = 5
            } else {
                wallThickness -= 1
            }
        }
        this.scene.entities.push(new Chicken(this.scene))
    }
}

class Scoreboard extends Entity {
    constructor(scene) {
        super('scoreboard', 0, 0, 100, scene)
    }
}

class Wall extends Entity {
    constructor(x, y, scene) {
        super('wall', x, y, 0, scene)
    }
}

function gameScene() {
    let entities = [
        [Scoreboard, []],
        [Player, []],
        [Chicken, []]
    ]

    let walls = generateWalls()
    entities = walls.concat(entities)
    return new GameScene(entities)
}

function generateWalls() {
    let walls = []
    for (let x = 0; x < __gameWidth / TILE_SIZE; x++) {
        walls.push([Wall, [x * TILE_SIZE, TILE_SIZE * (wallThickness + 3)]])
        walls.push([Wall, [x * TILE_SIZE, __gameHeight - (TILE_SIZE * (wallThickness + 1))]])
    }
    for (let y = 3; y < __gameHeight / TILE_SIZE; y++) {
        walls.push([Wall, [TILE_SIZE * wallThickness, y * TILE_SIZE]])
        walls.push([Wall, [__gameWidth - TILE_SIZE * (wallThickness + 1), y * TILE_SIZE]])
    }
    return walls
}

function introScene() {
    return new IntroScene([])
}

function loseScene() {
    return new LoseScene([])
}

const TILE_SIZE = 32
let playerScore = 0
let hiScore = 0
let wallTimer = 5
let wallThickness = 0

initKeys()
initScreen()
loadAllImages()
loadAllSounds()

__scenes['intro'] = introScene()
__activeScene = __scenes['intro']

main(0)