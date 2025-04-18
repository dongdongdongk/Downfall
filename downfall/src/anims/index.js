import { Scale } from "phaser"

export default anims => {

    anims.create({
        key: 'blood3',
        frames: anims.generateFrameNumbers('blood', { start: 28, end: 31 }),
        frameRate: 10,
        repeat: 0,
    })


    anims.create({
        key: 'blood2',
        frames: anims.generateFrameNumbers('blood', { start: 69, end: 76 }),
        frameRate: 15,
        repeat: 0,
    })


    anims.create({
        key: 'blood',
        frames: anims.generateFrameNumbers('blood', { start: 111, end: 119 }),
        frameRate: 15,
        repeat: 0,
    })

    // anims.create({
    //     key: 'block',
    //     frames: anims.generateFrameNumbers('block', { start: 28, end: 41 }),
    //     frameRate: 40,
    //     repeat: 0,
    // })

    anims.create({
        key: 'block',
        frames: anims.generateFrameNumbers('block', { start: 0, end: 23 }),
        frameRate: 40,
        Scale: 0.1,
        repeat: 0,
    })
}