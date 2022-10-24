kaboom({
  global: true,
  fullscreen: true,
  scale: 1,
  debug: true,
  clearColor: [0,0,0,1],
})

loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('suprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', "nqQ79eI.png")

loadSprite('blue-block', "fVscIbn.png")
loadSprite('blue-brick', "3e5YRQd.png")
loadSprite('blue-steel', "gqVoI2b.png")
loadSprite('blue-evil-shroom', "SvV4ueD.png")
loadSprite('blue-suprise', "RMqCc1G.png")


scene("game", ({level, score}) => {
  layers(['bg', 'obj', 'ui'], "obj")

  const maps = [
    [
      "                                                  ",
      "                                                  ",
      "                                                  ",
      "                                                  ",
      "                                                  ",
      "                                                  ",
      "         %    =*=%=                               ",
      "                                                  ",
      "                                -+                ",
      "                   ^        ^   ()                ",
      "==================================   ============="
    ],
    [  
    "&                                                 & ",
    "&                                                 & ",
    "&                                                 & ",
    "&                                                 & ",
    "&                                                 & ",
    "&                                                 & ",
    "&         @@@@@@@@@@*               x             & ",
    "&                                  xx             & ",
    "&                                 xxx x         -+& ",
    "&                   z        z   xxxx x         ()& ",
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"]

  ]

  const levelConfig = {
    width:20,
    height:20,
    '=': [sprite('block'), solid()],
    '$': [sprite('coin'), 'coin'],
    '%': [sprite('suprise'), solid(), 'coin-suprise'],
    '*': [sprite('suprise'), solid(), 'mushroom-suprise'],
    '}': [sprite('unboxed'), solid()],
    '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
    ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
    '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
    '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
    '^': [sprite('evil-shroom'), solid(), 'dangerous'],
    '#': [sprite('mushroom'), solid(),body(), 'mushroom'],

    '!': [sprite('blue-block'), solid(), scale(0.5)],
    '&': [sprite('blue-brick'), solid(), scale(0.5)],
    'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
    '@': [sprite('blue-suprise'), solid(), scale(0.5), 'coin-suprise'],
    'x': [sprite('blue-steel'), solid(), scale(0.5)],
  }

  const gameLevel = addLevel(maps[level], levelConfig)

  const MOVE_SPEED = 120;
  const ENEMY_SPEED = 20;
  const JUMP_FORCE = 360;
  let CURRENT_JUMP_FORCE = JUMP_FORCE;
  const BIG_JUMP_FORCE = 550;
  const FALL_DEATH = 400;
  let isJumping = false;

  const scoreLabel = add([
    text(score),
    pos(300,6),
    layer('ui'),
    {
      value: score,
    }
  ])

  add([text('level '+ parseInt(level+1)), pos(4,6)])

  function big() {
    let timer = 0
    let isBig = false
    return {
      update(){
        if (isBig){
          timer -= dt()
          if (timer <=0) {
            this.smallify()
          }
        }
      },
      isBig(){
        return isBig
      },
      smallify() {
        CURRENT_JUMP_FORCE = JUMP_FORCE
        this.scale = vec2(1)
        timer = 0
        isBig = false
      },
      biggify(time) {
        CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
        this.scale = vec2(2)
        timer = time
        isBig = true
      }
    }
  }

  const player = add([
    sprite("mario"), solid(),
    pos( 30, 0),
    body(),
    big(),
    origin('bot')
  ])

  action('mushroom', (m) => {
    m.move(30,0)
  })
  action('dangerous', (d) => {
    d.move(-ENEMY_SPEED,0)
  })
  player.on("headbump", (obj) =>{
    if(obj.is('coin-suprise')) {
      gameLevel.spawn('$', obj.gridPos.sub(0,1))
      gameLevel.spawn('}', obj.gridPos.sub(0,0))
      destroy(obj)
    } else if(obj.is('mushroom-suprise')) {
      gameLevel.spawn('#', obj.gridPos.sub(0,1))
      gameLevel.spawn('}', obj.gridPos.sub(0,0))
      destroy(obj)
    }
  })

  player.collides('mushroom', (m) => {
    destroy(m)
    player.biggify(6)
  })
  player.collides('dangerous', (d) => {
    if (isJumping) {
      destroy(d)
    } else {
      go('lose', {score: scoreLabel.value })
    }
  })

  player.collides('coin', (c) => {
    destroy(c)
    scoreLabel.value++
    scoreLabel.text = scoreLabel.value
  })
  
  player.collides('pipe', (p) => {
    keyPress('down', () => {
      go('game', {
        level: (level+1) % maps.length,
        score: scoreLabel.value
      })
    })
  })
  
 
  keyDown('left', () => {
    player.move(-MOVE_SPEED,0)
  })
  keyDown('right', () => {
    player.move(MOVE_SPEED,0)
  })
  player.action(() => {
    if(player.grounded()) {
      isJumping = false
    }
    camPos(player.pos)
    if (player.pos.y >= FALL_DEATH){
      go('lose', { score: scoreLabel.value })
    }
    
  })
  keyDown('space', () => {
    if (player.grounded()) {
      isJumping = true
      player.jump(CURRENT_JUMP_FORCE)
    }
  })
})

scene('lose', ({score}) => {
  add([text(score, 32), origin('center'), pos(width()/2, height()/2)])
})

start("game", {level: 0, score: 0})