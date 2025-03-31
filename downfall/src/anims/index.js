export default anims => {

    anims.create({
        key: 'blood',
        frames: anims.generateFrameNumbers('blood', { start: 28, end: 31 }),
        frameRate: 10,
        repeat: 0,
    })

    anims.create({
        key: 'block',
        frames: anims.generateFrameNumbers('block', { start: 28, end: 41 }),
        frameRate: 25,
        repeat: 0,
    })

}