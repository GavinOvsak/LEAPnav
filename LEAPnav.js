var LEAPnav = {
  Left: 'left',
  Right: 'right',
  Up: 'up',
  Select: 'select',
  Keyboard: 'keyboard',
  Gesture: 'gesture',
  Void: 'void',
  enabled: {
    left: true,
    right: true,
    up: true,
    select: true,
    keyboard: true,
    gesture: false
  },
  left_function: function(){},
  right_function: function(){},
  up_function: function(){},
  select_function: function(){}
};

LEAPnav.enable = function(item) {
  if (LEAPnav.enabled[item] != null) {
    LEAPnav.enabled[item] = true;
  }
};

LEAPnav.disable = function(item) {
  if (LEAPnav.enabled[item] != null) {
    LEAPnav.enabled[item] = false;
  }
};

LEAPnav.onLeft = function(func){
  if (Object.prototype.toString.call(func) == '[object Function]') {
    LEAPnav.left_function = func;
  }
};
  
LEAPnav.onRight = function(func){
  if (Object.prototype.toString.call(func) == '[object Function]') {
    LEAPnav.right_function = func;
  }
};

LEAPnav.onUp = function(func){
  if (Object.prototype.toString.call(func) == '[object Function]') {
    LEAPnav.up_function = func;
  }
};

LEAPnav.onSelect = function(func){
  if (Object.prototype.toString.call(func) == '[object Function]') {
    LEAPnav.select_function = func;
  }
};

(function() {
  if (!Date.now) {  
    Date.now = function() {  
      return +(new Date);  
    };  
  }

  var frame;
  var center = [0, 150, 0];
  var center_size = 70;
  var activation_distance = 150;
  var handState = 'void';
  var left = [-1,0,0];
  var right = [1,0,0];
  var up = [0,1,0];
  var left_angle = 0.3*Math.PI;
  var right_angle = 0.3*Math.PI;
  var up_angle = 0.4*Math.PI;
  var circle_start_time = 0;
  var elapsed_time = 0;
  var trigger_time = 2000;
  var wait_time = 500;
  var selected = false;
  var normal = '#000000';
  var lost = '#666666';
  var found = '#1144cc';
  var activated = '#5bb75b';
  var device_connected = false;

  var trigger_event = LEAPnav.Void;
  var event_time = 0;

  document.addEventListener('keydown', function(event) {
    if(LEAPnav.enabled[LEAPnav.Keyboard]) {
      if(event.keyCode == 37 && LEAPnav.enabled[LEAPnav.Left]) {
        trigger_event = LEAPnav.Left;
        event_time = Date.now();
        LEAPnav.left_function();
      } else if(event.keyCode == 39 && LEAPnav.enabled[LEAPnav.Right]) {
        trigger_event = LEAPnav.Right;
        event_time = Date.now();
        LEAPnav.right_function();
      } else if(event.keyCode == 38 && LEAPnav.enabled[LEAPnav.Up]) {
        trigger_event = LEAPnav.Up;
        event_time = Date.now();
        LEAPnav.up_function();
      } else if(event.keyCode == 13 && LEAPnav.enabled[LEAPnav.Select]) {
        trigger_event = LEAPnav.Select;
        event_time = Date.now();
        LEAPnav.select_function();
      }
    }
  });

  $(document).ready(function() {
  $("#leap-nav").click(function(e){
    var x = e.pageX-$("#leap-nav").offset().left;
    var y = e.pageY-$("#leap-nav").offset().top;

    /*
    c.rect(width/2 - 60, height/2 + 35, 65, 20);
        c.rect(width/2 + 12, height/2 + 35, 40, 20);
        width/2 + 35, height/2 - 70, 30, 30);
    */

    if (x > width/2 - 60 && x < width/2 + 5 && y > height/2 + 35 && y < height/2 + 55) {
      LEAPnav.enabled[LEAPnav.Keyboard] = !LEAPnav.enabled[LEAPnav.Keyboard];
    }

    if (x > width/2 + 12 && x < width/2 + 52 && y > height/2 + 35 && y < height/2 + 55) {
      if (!device_connected) {
        LEAPnav.enabled[LEAPnav.Gesture] = false;
        alert('No LEAP motion detected. Plug in a LEAP now and wave your hand over it. See https://www.leapmotion.com/');
      } else {
        LEAPnav.enabled[LEAPnav.Gesture] = !LEAPnav.enabled[LEAPnav.Gesture];
      }
    }

    if (x > width/2 + 35 && x < width/2 + 65 && y > height/2 - 70 && y < height/2 - 40) {
      window.open("http://www.workbygavin.com/projects.html#12");
    }
    //alert('x: ' + x+ ' y: ' + y);
  });

  var canvas = document.getElementById( 'leap-nav' );
  var c =  canvas.getContext( '2d' );

  var width = canvas.width;
  var height = canvas.height;

  var controller = new Leap.Controller({enableGestures: true});

  controller.on('connect', function(data) {
    console.log('Successfully connected.');
  });

  controller.on( 'deviceConnected' , function() {
//    console.log('Connected');
    device_connected = true;
    LEAPnav.enabled[LEAPnav.Gesture] = true;
  });

  controller.on( 'deviceDisconnected' , function() {
//    console.log('Disconnected');
//    device_connected = false;
//    LEAPnav.enabled[LEAPnav.Gesture] = false;
  });

  var vector = function(a, b) {
  return [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
  }

  var dot = function(a, b) {
  return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  }

  var length = function(a) {
  return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);
  }

  var distance = function(a, b) {
  return length(vector(a,b));
  }

  var angle = function(a, b) {
  return Math.acos(dot(a,b)/(length(a)*length(b)));
  }

  controller.on('animationFrame', function(data) {
    if (!device_connected && data.valid) {
      device_connected = data.valid;
      LEAPnav.enabled[LEAPnav.Gesture] = device_connected;
    }
    frame = data;
    var iBox = frame.interactionBox;

    c.clearRect( 0 , 0 , width , height );
    if ((frame.hands.length == 0 || !LEAPnav.enabled[LEAPnav.Gesture] || handState != LEAPnav.Void) && trigger_event == LEAPnav.Void) {
      c.beginPath();
      c.fillStyle = normal;
      c.strokeStyle = normal;
      c.lineWidth = 5;
      c.arc( width/2 , height/2 , 15 , 0 , Math.PI*2); 
      c.closePath();
      c.fill();
      c.stroke();

      //Left Arrow
      if(LEAPnav.enabled[LEAPnav.Left]) {
        c.beginPath();
        c.moveTo(width/2 - 30, height/2 - 10);
        c.lineTo(width/2 - 45, height/2 - 10);
        c.lineTo(width/2 - 45, height/2 - 15);
        c.lineTo(width/2 - 60, height/2);
        c.lineTo(width/2 - 45, height/2 + 15);
        c.lineTo(width/2 - 45, height/2 + 10);
        c.lineTo(width/2 - 30, height/2 + 10);
        c.closePath();
        c.fill();
        c.stroke();
      }

      //Right Arrow
      if(LEAPnav.enabled[LEAPnav.Right]) {
        c.beginPath();
        c.moveTo(width/2 + 30, height/2 - 10);
        c.lineTo(width/2 + 45, height/2 - 10);
        c.lineTo(width/2 + 45, height/2 - 15);
        c.lineTo(width/2 + 60, height/2);
        c.lineTo(width/2 + 45, height/2 + 15);
        c.lineTo(width/2 + 45, height/2 + 10);
        c.lineTo(width/2 + 30, height/2 + 10);
        c.closePath();
        c.fill();
        c.stroke();
      }

      //Up Arrow
      if(LEAPnav.enabled[LEAPnav.Up]) {
        c.beginPath();
        c.moveTo(width/2 - 10, height/2 - 30);
        c.lineTo(width/2 - 10, height/2 - 45);
        c.lineTo(width/2 - 15, height/2 - 45);
        c.lineTo(width/2, height/2 - 60);
        c.lineTo(width/2 + 15, height/2 - 45);
        c.lineTo(width/2 + 10, height/2 - 45);
        c.lineTo(width/2 + 10, height/2 - 30);
        c.closePath();
        c.fill();
        c.stroke();
      }

      if (LEAPnav.enabled[LEAPnav.Keyboard]) {
        c.beginPath();
        c.fillStyle = activated;
        c.lineWidth = 2;
        c.rect(width/2 - 60, height/2 + 35, 65, 20);
        c.closePath();
        c.fill();
      }

      c.beginPath();
      c.font = "10pt Arial";
      c.fillStyle = normal;
      c.fillText('Keyboard', width/2 - 55, height/2 + 50);
      c.fill();

      if (LEAPnav.enabled[LEAPnav.Gesture]) {
        c.beginPath();
        c.fillStyle = activated;
        c.lineWidth = 2;
        c.rect(width/2 + 12, height/2 + 35, 40, 20);
        c.closePath();
        c.fill();
      }

      c.beginPath();
      c.font = "10pt Arial";
      c.fillStyle = normal;
      c.fillText('LEAP', width/2 + 15, height/2 + 50);
      c.fill();

      c.beginPath();
      c.font = "10pt Arial";
      c.fillStyle = normal;
      //c.rect(width/2 + 35, height/2 - 70, 30, 30);
      c.fillText('i', width/2 + 45, height/2 - 50);
      c.closePath();
      c.fill();
    }
    if (trigger_event != LEAPnav.Void && Date.now() - event_time > 500) {
        trigger_event = LEAPnav.Void;
    }
    if (trigger_event != LEAPnav.Void) {
      switch(trigger_event) {
        case LEAPnav.Left:
          if(LEAPnav.enabled[LEAPnav.Left]) {
            c.beginPath();
            c.strokeStyle = normal;
            c.lineWidth = 5;
            c.fillStyle = activated;
            c.moveTo(width/2 - 30, height/2 - 10);
            c.lineTo(width/2 - 45, height/2 - 10);
            c.lineTo(width/2 - 45, height/2 - 15);
            c.lineTo(width/2 - 60, height/2);
            c.lineTo(width/2 - 45, height/2 + 15);
            c.lineTo(width/2 - 45, height/2 + 10);
            c.lineTo(width/2 - 30, height/2 + 10);
            c.closePath();
            c.stroke();
            c.fill();
          }
          break;
        case LEAPnav.Right:
          if(LEAPnav.enabled[LEAPnav.Right]) {
            c.beginPath();
            c.strokeStyle = normal;
            c.lineWidth = 5;
            c.fillStyle = activated;
            c.moveTo(width/2 + 30, height/2 - 10);
            c.lineTo(width/2 + 45, height/2 - 10);
            c.lineTo(width/2 + 45, height/2 - 15);
            c.lineTo(width/2 + 60, height/2);
            c.lineTo(width/2 + 45, height/2 + 15);
            c.lineTo(width/2 + 45, height/2 + 10);
            c.lineTo(width/2 + 30, height/2 + 10);
            c.closePath();
            c.stroke();
            c.fill();
          }
          break;
        case LEAPnav.Up:
          if(LEAPnav.enabled[LEAPnav.Up]) {
            c.beginPath();
            c.strokeStyle = normal;
            c.lineWidth = 5;
            c.fillStyle = activated;
            c.moveTo(width/2 - 10, height/2 - 30);
            c.lineTo(width/2 - 10, height/2 - 45);
            c.lineTo(width/2 - 15, height/2 - 45);
            c.lineTo(width/2, height/2 - 60);
            c.lineTo(width/2 + 15, height/2 - 45);
            c.lineTo(width/2 + 10, height/2 - 45);
            c.lineTo(width/2 + 10, height/2 - 30);
            c.closePath();
            c.stroke();
            c.fill();
          }
          break;
        case LEAPnav.Select:
          if(LEAPnav.enabled[LEAPnav.Select]) {
            c.beginPath();
            c.strokeStyle = normal;
            c.lineWidth = 5;
            c.fillStyle = activated;
            c.arc( width/2 , height/2, 18 , 0 , Math.PI*2, false); 
            c.closePath();
            c.stroke();
            c.fill();
          }
          break;
      }
    } else if (frame.hands.length > 0 && LEAPnav.enabled[LEAPnav.Gesture]) {
      handPos = frame.hands[0].palmPosition;

      if (handState != 'center' && distance(handPos, center) < center_size) {
        handState = 'center';
        circle_start_time = Date.now();
      }

      switch (handState) {
        case LEAPnav.Void:
          c.beginPath();
          c.strokeStyle = lost;
          c.lineWidth = 5;
          c.arc( width/2 , height/2 , (distance(center,handPos)-center_size)*width/(3*iBox.size[0]) + 15 , 0 , Math.PI*2); 
          c.closePath();
          c.stroke();
          break;
        case LEAPnav.Left:
          if (angle(vector(center,handPos),left) > left_angle) {
            handState = LEAPnav.Void;
          } else if(LEAPnav.enabled[LEAPnav.Left]) {
            progress = (distance(center,handPos) - center_size) / (activation_distance - center_size);
            if (progress < 0.5) {
              c.beginPath();
              c.fillStyle = found;
              c.moveTo(width/2 - 30, height/2 - 10);
              c.lineTo(width/2 - 30 - progress*15 / 0.5, height/2 - 10);
              c.lineTo(width/2 - 30 - progress*15 / 0.5, height/2 + 10);
              c.lineTo(width/2 - 30, height/2 + 10);
              c.closePath();
              c.fill();
            } else if(progress < 1) {
              c.beginPath();
              c.fillStyle = found;
              c.moveTo(width/2 - 30, height/2 - 10);
              c.lineTo(width/2 - 45, height/2 - 10);
              c.lineTo(width/2 - 45, height/2 - 15);
              c.lineTo(width/2 - 45 - 15 * (progress - 0.5) / 0.5, height/2 - 15 + 15 * (progress - 0.5) / 0.5);
              c.lineTo(width/2 - 45 - 15 * (progress - 0.5) / 0.5, height/2 + 15 - 15 * (progress - 0.5) / 0.5);
              c.lineTo(width/2 - 45, height/2 + 15);
              c.lineTo(width/2 - 45, height/2 + 10);
              c.lineTo(width/2 - 30, height/2 + 10);
              c.closePath();
              c.fill();
            }
          }
          break;
        case LEAPnav.Right:
          if (angle(vector(center,handPos),right) > right_angle) {
            handState = LEAPnav.Void;
          } else if(LEAPnav.enabled[LEAPnav.Right]) {
            progress = (distance(center,handPos) - center_size) / (activation_distance - center_size);

            if (progress < 0.5) {
              c.beginPath();
              c.fillStyle = found;
              c.moveTo(width/2 + 30, height/2 - 10);
              c.lineTo(width/2 + 30 + progress*15 / 0.5, height/2 - 10);
              c.lineTo(width/2 + 30 + progress*15 / 0.5, height/2 + 10);
              c.lineTo(width/2 + 30, height/2 + 10);
              c.closePath();
              c.fill();
            } else if(progress < 1) {
              c.beginPath();
              c.fillStyle = found;
              c.moveTo(width/2 + 30, height/2 - 10);
              c.lineTo(width/2 + 45, height/2 - 10);
              c.lineTo(width/2 + 45, height/2 - 15);
              c.lineTo(width/2 + 45 + 15 * (progress - 0.5) / 0.5, height/2 - 15 + 15 * (progress - 0.5) / 0.5);
              c.lineTo(width/2 + 45 + 15 * (progress - 0.5) / 0.5, height/2 + 15 - 15 * (progress - 0.5) / 0.5);
              c.lineTo(width/2 + 45, height/2 + 15);
              c.lineTo(width/2 + 45, height/2 + 10);
              c.lineTo(width/2 + 30, height/2 + 10);
              c.closePath();
              c.fill();
            }
          }
          break;
        case LEAPnav.Up:
          if (angle(vector(center,handPos),up) > up_angle) {
            handState = LEAPnav.Void;
          } else if(LEAPnav.enabled[LEAPnav.Up]) {
            progress = (distance(center,handPos) - center_size) / (activation_distance - center_size);

            if (progress < 0.5) {
              c.beginPath();
              c.fillStyle = found;
              c.moveTo(width/2 - 10, height/2 - 30);
              c.lineTo(width/2 - 10, height/2 - 30 - progress*15 / 0.5);
              c.lineTo(width/2 + 10, height/2 - 30 - progress*15 / 0.5);
              c.lineTo(width/2 + 10, height/2 - 30);
              c.closePath();
              c.fill();
            } else if(progress < 1) {
              c.beginPath();
              c.fillStyle = found;
              c.moveTo(width/2 - 10, height/2 - 30);
              c.lineTo(width/2 - 10, height/2 - 45);
              c.lineTo(width/2 - 15, height/2 - 45);

              c.lineTo(width/2 - 15 + 15 * (progress - 0.5) / 0.5, height/2 - 45 - 15 * (progress - 0.5) / 0.5);
              c.lineTo(width/2 + 15 - 15 * (progress - 0.5) / 0.5, height/2 - 45 - 15 * (progress - 0.5) / 0.5);

              c.lineTo(width/2 + 15, height/2 - 45);
              c.lineTo(width/2 + 10, height/2 - 45);
              c.lineTo(width/2 + 10, height/2 - 30);
              c.closePath();
              c.fill();
            }
          }
          break;
        case 'center':
          if (distance(handPos, center) > center_size) {
            if (angle(vector(center,handPos),left) < left_angle && LEAPnav.enabled[LEAPnav.Left]) {
              handState = LEAPnav.Left;
            } else if (angle(vector(center,handPos),right) < right_angle && LEAPnav.enabled[LEAPnav.Right]) {
              handState = LEAPnav.Right;
            } else if (angle(vector(center,handPos),up) < up_angle && LEAPnav.enabled[LEAPnav.Up]) {
              handState = LEAPnav.Up;
            } else {
              handState = LEAPnav.Void;         
            }
            selected = false;
          } else {
            elapsed_time = Date.now() - circle_start_time;

            c.beginPath();
            c.fillStyle = found;
            c.arc( width/2 , height/2, 15 , 0 , Math.PI*2, false); 
            c.closePath();
            c.fill();

            if (LEAPnav.enabled[LEAPnav.Select]) {
              if (elapsed_time > wait_time && elapsed_time < trigger_time + wait_time) {
                c.beginPath();
                c.fillStyle = activated;
                c.arc( width/2 , height/2, 15 , 0 , Math.PI*2*(elapsed_time - wait_time)/trigger_time, false); 
                c.lineTo(width/2 , height/2);
                c.closePath();
                c.fill();
              }
              
              if (elapsed_time > trigger_time + wait_time && !selected) {
                trigger_event = LEAPnav.Select;
                event_time = Date.now();
                LEAPnav.select_function();
                selected = true;
              }
            }
          }
          break;
      }

      if (distance(handPos, center) > activation_distance && 
          (handState === LEAPnav.Left || handState === LEAPnav.Right || handState === LEAPnav.Up)) {
        trigger_event = handState;
        event_time = Date.now();
        switch(handState) {
          case LEAPnav.Left:
            LEAPnav.left_function();
            break;
          case LEAPnav.Right:
            LEAPnav.right_function();
            break;
          case LEAPnav.Up:
            LEAPnav.up_function();
            break;
        }
        handState = LEAPnav.Void;
      }
    }
  });

  controller.connect();
  });
})()
