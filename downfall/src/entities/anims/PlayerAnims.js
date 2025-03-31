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
        key: 'throw',
        frames: anims.generateFrameNumbers('player-throw', { start: 0, end: 7 }), 
        frameRate: 14, 
        repeat: 0,
    });

    anims.create({
        key: 'slide',
        frames: anims.generateFrameNumbers('player-slide-sheet', { start: 0, end: 2 }),
        frameRate: 20,
        repeat: 0,
    })

}