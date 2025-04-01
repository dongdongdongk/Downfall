export default anims => {

    anims.create({
        key: 'idle',
        frames: anims.generateFrameNumbers('idle', { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1,
    })

    anims.create({
        key: 'run',
        frames: anims.generateFrameNumbers('run', { start: 0, end: 8 }), 
        frameRate: 10, 
        repeat: -1,
    });

    anims.create({
        key: 'jump',
        frames: anims.generateFrameNumbers('jump', { start: 0, end: 2 }), 
        frameRate: 5, 
        repeat: 1,
    });


    anims.create({
        key: 'fall',
        frames: anims.generateFrameNumbers('fall', { start: 0, end: 2 }), 
        frameRate: 5, 
        repeat: 0,
    });

    anims.create({
        key: 'slide',
        frames: anims.generateFrameNumbers('player-slide-sheet', { start: 0, end: 2 }),
        frameRate: 20,
        repeat: 0,
    })

    anims.create({
        key: 'guard',
        frames: anims.generateFrameNumbers('guard', { start: 1, end: 1 }),
        frameRate: 2,
        repeat: -1,
    })

    anims.create({
        key: 'guardSuccess',
        frames: anims.generateFrameNumbers('guard', { start: 3, end: 5 }),
        frameRate: 15,
        repeat: 0,
    })

    anims.create({
        key: 'guardSuccess2',
        frames: anims.generateFrameNumbers('attack', { start: 2, end: 3 }),
        frameRate: 15,
        repeat: 0,
    })

}