var ctx; // canvas context
var canvas;
var scribe_contents = '';
var stop_scrolling = false;
var last_action_line = false;
var x = 0;
var y = 0;
var touchdevice = 'ontouchstart' in window;

function init_scribe(d) {
  if ( ! item_changeable(items_json[d].c, items_json[d].sc) ) {
    return;
  }

  d = clone_item(d);
  $('#item_configuration_' + d).hide();

  canvas = document.createElement('canvas');
  canvas.setAttribute('d', d);

  canvas.width  = 470; //window.innerWidth;
  canvas.height = 250; //window.innerHeight - 150;

  show_canvas(canvas);
  
  ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.rect(0, 0, 470, 50);
  ctx.fillStyle = '#000000';
  ctx.fill();

  ctx.beginPath();
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'darkblue';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (touchdevice) {
    document.addEventListener('touchmove', preventScrollingHandler, false);
    canvas.addEventListener("touchstart", draw_start, false); // A finger is down
    canvas.addEventListener("touchmove", draw_move, false); // The finger is moving
    canvas.addEventListener("touchcancel", draw_stop, false); // External interruption
  } else {
    canvas.addEventListener("mousedown", draw_start, false);
    canvas.addEventListener("mouseup", draw_stop, false);
  }
}

function draw_start(event) {
  canvas.addEventListener("mousemove", draw_move, false);
  stop_scrolling = true;
  if (touchdevice) {
    x = event.touches[0].pageX;
    y = event.touches[0].pageY;
  } else {
    x = event.x;
    y = event.y;
  }

  ctx.moveTo(x, y);
  ctx.lineTo(x, y-1);
  ctx.lineTo(x+1, y+1);
  ctx.lineTo(x-1, y+1);
  ctx.lineTo(x, y);
  ctx.stroke();
  scribe_contents += 'M ' + x + ',' + y + ' ' + 'L ' + (x) + ',' + (y-1) + ' ' + 'L ' + (x+1) + ',' + (y+1) + ' ' + 'L ' + (x-1) + ',' + (y+1) + ' ' + 'L ' + (x) + ',' + (y) + ' ';
  last_action_line = false;
  last_x = x;
  last_y = y;
}

function draw_move(event) {
  if (touchdevice) {
    x = event.touches[0].pageX;
    y = event.touches[0].pageY;
  } else {
    x = event.x;
    y = event.y;
  }
  if (Math.abs(last_x - x) > 3 || Math.abs(last_y - y) > 3) {
    ctx.lineTo(x, y);
    ctx.stroke();
    if (last_action_line == true) {
      scribe_contents += x + ',' + y + ' ';
    } else {
      scribe_contents += 'L ' + x + ',' + y + ' ';
    }
    last_action_line = true;
    last_x = x;
    last_y = y;
  }
}

function draw_stop(event) {
  canvas.removeEventListener("mousemove", draw_move, false);
}

function preventScrollingHandler(event) {
  if ( stop_scrolling ) {
   event.preventDefault(); // Flags this event as handled. Prevents the UA from handling it at window level
  }
}

function show_canvas(canvas) {
  d = canvas.getAttribute('d');
  $('#item_configuration_' + d).hide();
  scribe_contents = '';
  if (settings.mobile) {
    $('#orderform').hide();
    $('#functions').hide();
    $('#functions_footer').hide();
    $('h2').hide();
    scroll_to('canvas', 25);
  }
  $('#draw_controls').show();
  $('#draw_controls').prepend(canvas);
}

function hide_canvas() {
  stop_scrolling = false;
  d = canvas.getAttribute('d');
  if (settings.mobile) {
    $('#orderform').show();
    $('#functions').show();
    $('#functions_footer').show();
    $('h2').show();
    scroll_to('#item_' + d, 25);
  }
  $(canvas).remove();
  $('#draw_controls').hide();
}

function submit_drawing() {
  hide_canvas();
  d = canvas.getAttribute('d');
  set_json(d,'scribe',scribe_contents);
}
