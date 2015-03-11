$(document).ready(function(){
 var otherPlayer = [];
 var socket;
 var count = 0;
    



var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

   game.load.image('sky',  'img/sky.png');
    
    game.load.image('ground',  'img/platform.png');
    game.load.image('star',  'img/star.png');
    game.load.spritesheet('kakashi',  'img/k_sheet_2.png', 36, 50);





}

var player;
var platforms;
var cursors;

var stars;
var shurikens;
var score = 0;
var scoreText;
var spaceKey;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;
    shurikens = game.add.group();
    //  We will enable physics for any star that is created in this group
    shurikens.enableBody = true;
    // The player and its settings
    var px,py;
    px=ran(0,500);
    py=ran(0,300);
    player=playerCreate(px,py,true);

    //  We need to enable physics on the player    
    game.physics.arcade.enable(shurikens);

    //  Player physics properties. Give the little guy a slight bounce.
   

    //  Our two animations, walking left and right.

    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(throwShuriken); 
    //  Finally some stars to collect

    

    //  Here we'll create 12 of them evenly spaced apart
    
    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    
}
function throwShuriken(){
             var shuriken = shurikens.create(player.x, player.y, 'star');
            //  Let gravity do its thing

            var mouseAngle = Math.atan2(player.y-game.input.y,player.x-game.input.x);

            shuriken.body.gravity.y = 300;
                shuriken.body.velocity.x = 1000*Math.cos(mouseAngle+Math.PI);
                shuriken.body.velocity.y = 1000*Math.sin(mouseAngle+Math.PI);
                }

function update() {
    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
      
           player.animations.play('stance');    

    }
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }

}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}
function init(){
        socket = io();
        socket.on('init',function(data1){            
            socket.emit('c_connect',"client connected to server");
        });
        socket.on('createP',createOtherP);

    }
//helper functions

function ran(l,u){
    return Math.floor(Math.random()*u)+l;
}

function playerCreate(px,py,em){
 
 var player;
    player = game.add.sprite(px, py, 'kakashi');
    var data={"px":px,
               "py":py};
    if(em){
        socket.emit("newPlayer",data);
    }    
    game.physics.arcade.enable(player);

    player.animations.add('left', [0, 1], 12,true);
    player.animations.add('right', [2,3], 12, true);
    player.animations.add('jump1', [8,9,10,11], 12, true);
    player.animations.add('stance', [5,6,7], 12, true);
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    return player;

}
function createOtherP(data){

    otherPlayer[count] = playerCreate(data.px,data.py,false);
    
    count+=1;

}
init();
});