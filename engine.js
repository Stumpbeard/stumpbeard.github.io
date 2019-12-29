// -----------------
// CORE FUNCTIONS
// -----------------

function initKeys() {
    document.addEventListener('keydown', (event) => {
        const keyPressed = event.key
        __keyStatus[keyPressed] = true
    })

    document.addEventListener('keyup', (event) => {
        const keyPressed = event.key
        __keyStatus[keyPressed] = false
    })
}

function initScreen() {
    __mainViewport.height = __gameHeight * __gameScale
    __mainViewport.width = __gameWidth * __gameScale
    __mainViewport.id = "viewport"
    __mainContext.imageSmoothingEnabled = false
    __container.append(__mainViewport)
}

function loadAllImages() {
    const numImages = document.images.length
    for (let x = 0; x < numImages; x += 1) {
        const image = document.images[x]
        __images[image.name] = image
    }
}

function loadAllSounds() {
    const sounds = document.querySelectorAll('audio')
    for (let x = 0; x < sounds.length; x++) {
        const sound = sounds[x]
        console.log(sound)
        __sounds[sound.id] = sound
    }
}

function main(timestamp) {
    window.requestAnimationFrame(main)
    let delta = timestamp - __time
    __interval = __interval - delta
    __time = timestamp

    if (__interval < 0) {
        __interval = (1000 / __FPS) - (__interval * -1)
        _update()
        clear()
        _render()
    }
}

function clear() {
    __mainContext.clearRect(0, 0, __mainViewport.width, __mainViewport.height)
    __mainContext.fillStyle = 'white'
    __mainContext.fillRect(0, 0, __mainViewport.width, __mainViewport.height)
}

// -------------------
// HELPER FUNCTIONS
// -------------------

function _colliding(ent1, ent2) {
    const image1 = __images[ent1.image()]
    const x1 = ent1.x
    const x1Prime = ent1.x + image1.width
    const y1 = ent1.y
    const y1Prime = ent1.y + image1.height

    const image2 = __images[ent2.image()]
    const x2 = ent2.x
    const x2Prime = ent2.x + image2.width
    const y2 = ent2.y
    const y2Prime = ent2.y + image2.height

    if ((x1 <= x2 && x2 < x1Prime) || (x1 < x2Prime && x2Prime <= x1Prime) || (x1 >= x2 && x1Prime <= x2Prime) || (x1 <= x2 && x1Prime >= x2Prime)) {
        if ((y1 <= y2 && y2 < y1Prime) || (y1 < y2Prime && y2Prime <= y1Prime) || (y1 >= y2 && y1Prime <= y2Prime) || (y1 <= y2 && y1Prime >= y2Prime)) {
            return true
        }
    }

    if (x1)
        return false
}

function _keyPressed(key) {
    if (__keyStatus.hasOwnProperty(key)) {
        return __keyStatus[key]
    } else {
        return false
    }
}

function _draw(entity) {
    let image = __images[entity.image()]
    __mainContext.drawImage(image, entity.x, entity.y)
}

function _writeText(text, x, y, size = 8, color = 'black') {
    __mainContext.font = `${size}px "Pixel"`
    __mainContext.textBaseline = 'top'
    __mainContext.fillStyle = color
    __mainContext.fillText(text, x, y)
}

function _viewWidth() {
    return __mainViewport.width
}

function _viewHeight() {
    return __mainViewport.height
}

function _playSound(sound) {
    __sounds[sound].play()
}

function _playMusic(music) {
    if (__currentSong) {
        __currentSong.pause()
        __currentSong.currentTime = 0
    }
    __currentSong = __sounds[music]
    __currentSong.play()
}