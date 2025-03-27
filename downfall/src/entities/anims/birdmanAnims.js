export default anims => {
    anims.create({
        key: 'birdman-idle',
        frames: anims.generateFrameNumbers('birdman', { start: 0, end: 12 }),
        frameRate: 10,
        repeat: -1,
    })

    anims.create({
        key: 'birdman-hurt',
        frames: anims.generateFrameNumbers('birdman', { start: 25, end: 27 }),
        frameRate: 10,
        repeat: 0,
    })


    anims.create({
        key: 'birdman-die',
        frames: anims.generateFrameNumbers('birdman', { start: 1, end: 1 }),
        frameRate: 10,
        repeat: 0,
    })
}