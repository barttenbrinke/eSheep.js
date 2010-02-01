var ESheep = Class.extend({

  id:         null,
  number:     0,
  facingLeft: false,
  falling:    false,
  positionX:  0,
  positionY:  0,
  animationCurrent:    '',
  animationDuration:   0,
  animationSpeed:      1,
  animationFrame:      0,
  animationX:          0,
  animationY:          0,
  visual:              null,
  dragging:           false,
  
  init: function(x,y, left) {
    if (x) {
      this.positionX = x;
    } else {
      this.positionX = (Math.floor(Math.random()*ESheep.screenX) / 40) * 40;
    }
    
    if (y) {
      this.positionY = y;
    } else {
      this.positionY = (Math.floor(Math.random()*ESheep.screenY) / 40) * 40;
    }
    
    if (left) {
      this.facingLeft = left;
    } else {
      this.facingLeft = Math.round(Math.random()) ? true : false ;
    }
    
    this.number = ESheep.characters.length;
    var id_string = 'sheep_' + this.number;
    this.id = '#' + id_string;
    
    var sheepDiv = jQuery('<div id="'+id_string+'" class="sheep" number="'+this.number+'"/>');
    jQuery(document.body).append(sheepDiv);
    
    // Bootstrap DOM
    this.visual = $(this.id); // Cache DOM Object
    this.visual.fadeOut("fast");
    this.visual.bind("dblclick", function() { ESheep.findTroughDom(this).destroy(); });
    this.visual.draggable({
      stop: function(event, ui) {
        var sheep = ESheep.findTroughDom(ui.helper[0]);
        sheep.setPosition(ui.position.left, ui.position.top);
      }
    });

    // Show sheep
    this.appear();
  },
  
  
  /**
   * Destroy this sheep
   */
  destroy: function() {
    this.visual.hide("explode", 1000);
    this.visual.remove();
    ESheep.characters[this.number] = null;
  },
  
  /**
   * Appear
   */
  appear: function() {
    this.updatePosition();
    ESheep.playSound(1);
    this.visual.fadeIn("slow");
    this.sleepAnimation();
  },
  
  /**
   * Animate this sheep
   */
  animate: function() {
    this.animationDuration -= 1;
    this.animationFrame +=1;

    this.updatePosition();
    this.colisionDetection();
    this.updateImage();
    
    if (this.animationDuration <= 0) {
      this.nextAnimation();
    }
    
  },
  
  /**
   * Display the correct image
   */
  updateImage: function () {
    var image_string = 'images/';

    var animationPt = Math.floor(this.animationFrame / this.animationSpeed);
    var base_frame = animationPt % this.animationFrames; 
    
    if (this.facingLeft) {
      image_string += this.animationCurrent + '_' + base_frame + '_LEFT.png';
    } else {
      image_string += this.animationCurrent + '_' + base_frame + '_RIGHT.png';
    }
    
    this.visual.css('background-image', 'url(' + image_string + ')');
  },
  

  /**
   * Display the correct image
   */
  colisionDetection: function() {
    if (this.positionX >= ESheep.screenX || this.positionX <= 0) {
      this.turn();
    }
    
    // Check if higher numberd sheeps are coliding with me
    for (var i=this.number; i<ESheep.characters.length; i++) {
      var sheep = ESheep.characters[i];
      if (sheep && this.overlap(sheep)) {
        sheep.turn();
        this.turn();
      }
    }    
  },
  
  /**
   * Check if two sheep overlap
   */
  overlap: function(other_item) {
    return this.visual.overlaps(other_item.visual);
  },
  
  /**
   * Turn this puppy around
   */
  turn: function() {
    this.facingLeft = !this.facingLeft;
    this.animationX = -1*this.animationX;
  },
  
  /**
   * Set the position of the sheep
   */
  setPosition: function(x, y) {
    this.positionX = x;
    this.positionY = y;
  },

  /**
   * Update the sheeps position for animation
   */
  updatePosition: function () {
    this.positionX += this.animationX;
    this.positionY += this.animationY;      
    this.visual.css('left', this.positionX);
    this.visual.css('top', this.positionY);
  },
  
  /**
   * Select what to do next
   */
  nextAnimation: function() {
    this.walkAnimation();
  },
  
  /**
   * Sleep
   */
  sleepAnimation: function() {
    this.animationCurrent    = 'SLEEP';
    this.animationDuration   = 40;
    this.animationFrames     = 3;
    this.animationSpeed      = 6;
    this.animationFrame      = 0;
    this.animationX          = 0;
    this.animationY          = 0;
  },

  /**
   * Walk 
   */
  walkAnimation: function() {
    this.animationCurrent    = 'WALK';
    this.animationDuration   = 30;
    this.animationSpeed      = 1;
    this.animationFrames     = 2;
    this.animationFrame      = 0;
    this.animationX          = 10;
    this.animationY          = 0;
    
    if (this.facingLeft) {
      this.animationX          = -10;      
    }
    
  },
  

  /**
   * Wait
   */
  waitAnimation: function() {
    this.animationCurrent    = 'WAIT';
    this.animationDuration   = 10;
    this.animationSpeed      = 1;
    this.animationFrames     = 0;
    this.animationFrame      = 0;
    this.animationX          = 0;
    this.animationY          = 0;
  },
  
});

/**
 * Spawn a sheep
 */
ESheep.spawn = function() {
  ESheep.characters.push(new ESheep);

  if (!ESheep.animating) {
    ESheep.animating = true;
    setTimeout('ESheep.animate();', 250);
  }
}

/**
 * Animate all characters
 */
ESheep.animate = function() {
  for (var i=0; i<ESheep.characters.length; i++) {
    if (ESheep.characters[i]) {
      ESheep.characters[i].animate();
    }
  }
  setTimeout('ESheep.animate();', 250);
}

/**
 * Globals
 */
ESheep.characters = [];
ESheep.animating = false;
ESheep.screenX = 800;
ESheep.screenY = 600;

/**
 * Find a character by passing its Dom object
 */
ESheep.findTroughDom = function(dom_this) {
  var string_id = '#' + dom_this.id;

  for (var i=0; i<ESheep.characters.length; i++) {
    if (ESheep.characters[i] && ESheep.characters[i].id == string_id) {
      return ESheep.characters[i];
    }
  }
}

ESheep.playSound = function(number) {
  return;
  jQuery(document.body).append( jQuery('<div id="sound" style="display:none"/>') );
  
  $('#sound').append('<object type="audio/x-wav" data="sounds/BEH.wav" hidden="true"></object>');
}


