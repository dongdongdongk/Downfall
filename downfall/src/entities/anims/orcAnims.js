export default anims => {
    anims.create({
        key: 'orc-idle',
        frames: anims.generateFrameNumbers('orc-idle', { start: 0, end: 4 }),
        frameRate: 4,
        repeat: -1,
    })

    anims.create({
        key: 'orc-walk',
        frames: anims.generateFrameNumbers('orc-walk', { start: 0, end: 6 }),
        frameRate: 10,
        repeat: 0,
    })

    anims.create({
        key: 'orc-run',
        frames: anims.generateFrameNumbers('orc-run', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0,
    })


    anims.create({
        key: 'orc-hurt',
        frames: anims.generateFrameNumbers('birdman', { start: 25, end: 27 }),
        frameRate: 10,
        repeat: 0,
    })


    anims.create({
        key: 'orc-die',
        frames: anims.generateFrameNumbers('birdman', { start: 1, end: 1 }),
        frameRate: 10,
        repeat: 0,
    })

    anims.create({
        key: 'orc-attack',
        frames: anims.generateFrameNumbers('orc-attack', { start: 0, end: 3}),
        frameRate: 8,
        repeat: 0,
    })
}