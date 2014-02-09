var hexToHsl, hexToRgb, hslLerp, integrator, k, k2, keyNameToCode, keys, rgbToHsl, settings, v, v2,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

integrator = {
  what: 'use callBack() on this object to call the C++ side'
};

keyNameToCode = {
  "Backspace": 8,
  "Tab": 9,
  "Enter": 13,
  "Shift": 16,
  "Ctrl": 17,
  "Alt": 18,
  "Pause/Break": 19,
  "Caps Lock": 20,
  "Esc": 27,
  "Space": 32,
  "Page Up": 33,
  "Page Down": 34,
  "End": 35,
  "Home": 36,
  "Left": 37,
  "Up": 38,
  "Right": 39,
  "Down": 40,
  "Insert": 45,
  "Delete": 46,
  "0": 48,
  "1": 49,
  "2": 50,
  "3": 51,
  "4": 52,
  "5": 53,
  "6": 54,
  "7": 55,
  "8": 56,
  "9": 57,
  "A": 65,
  "B": 66,
  "C": 67,
  "D": 68,
  "E": 69,
  "F": 70,
  "G": 71,
  "H": 72,
  "I": 73,
  "J": 74,
  "K": 75,
  "L": 76,
  "M": 77,
  "N": 78,
  "O": 79,
  "P": 80,
  "Q": 81,
  "R": 82,
  "S": 83,
  "T": 84,
  "U": 85,
  "V": 86,
  "W": 87,
  "X": 88,
  "Y": 89,
  "Z": 90,
  "Windows": 91,
  "Right Click": 93,
  "Numpad 0": 96,
  "Numpad 1": 97,
  "Numpad 2": 98,
  "Numpad 3": 99,
  "Numpad 4": 100,
  "Numpad 5": 101,
  "Numpad 6": 102,
  "Numpad 7": 103,
  "Numpad 8": 104,
  "Numpad 9": 105,
  "Numpad *": 106,
  "Numpad +": 107,
  "Numpad -": 109,
  "Numpad .": 110,
  "Numpad /": 111,
  "F1": 112,
  "F2": 113,
  "F3": 114,
  "F4": 115,
  "F5": 116,
  "F6": 117,
  "F7": 118,
  "F8": 119,
  "F9": 120,
  "F10": 121,
  "F11": 122,
  "F12": 123,
  "Num Lock": 144,
  "Scroll Lock": 145,
  "My Computer": 182,
  "My Calculator": 183,
  ";": 186,
  "=": 187,
  ",": 188,
  "-": 189,
  ".": 190,
  "/": 191,
  "`": 192,
  "[": 219,
  "\\": 220,
  "]": 221,
  "'": 222
};

hexToRgb = function(hex) {
  var result;
  result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result == null) {
    return null;
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
};

rgbToHsl = function(r, g, b) {
  var d, h, l, max, min, s;
  r /= 255;
  g /= 255;
  b /= 255;
  max = Math.max(r, g, b);
  min = Math.min(r, g, b);
  l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  };
};

hexToHsl = function(hex) {
  var c;
  c = hexToRgb(hex);
  return rgbToHsl(c.r, c.g, c.b);
};

hslLerp = function(from, to, t) {
  var col;
  col = {};
  col.h = from.h * (1 - t) + to.h * t;
  col.s = from.s * (1 - t) + to.s * t;
  col.l = from.l * (1 - t) + to.l * t;
  return col;
};

settings = {};

keys = {};

$.ajax({
  url: '../settings.json',
  async: false,
  dataType: "json"
}).success(function(data) {
  settings.basedirectory = data.basedirectory;
  settings.directories = data.directories;
  settings.leftColour = hexToHsl(data.leftColour);
  settings.rightColour = hexToHsl(data.rightColour);
  settings.args = [];
  return keys = data.keys;
}).fail(function(error) {
  console.log("Error parsing settings file!");
  return console.log(error);
});

for (k in keys) {
  v = keys[k];
  if (typeof v === "object") {
    for (k2 in v) {
      v2 = v[k2];
      if (keyNameToCode[v2] !== void 0) {
        keys[k][k2] = keyNameToCode[v2];
      } else {
        console.log("Unknown key: '" + v2 + "'");
      }
    }
  } else {
    if (keyNameToCode[v] !== void 0) {
      keys[k] = keyNameToCode[v];
    } else {
      console.log("Unknown key: '" + v + "'");
    }
  }
}

keys.anyLeft = (function() {
  var _results;
  _results = [];
  for (k in keys) {
    v = keys[k];
    if (v.left !== void 0) {
      _results.push(v.left);
    }
  }
  return _results;
})();

keys.anyRight = (function() {
  var _results;
  _results = [];
  for (k in keys) {
    v = keys[k];
    if (v.right !== void 0) {
      _results.push(v.right);
    }
  }
  return _results;
})();

keys.anyA = (function() {
  var _results;
  _results = [];
  for (k in keys) {
    v = keys[k];
    if (v.a !== void 0) {
      _results.push(v.a);
    }
  }
  return _results;
})();

keys.anyB = (function() {
  var _results;
  _results = [];
  for (k in keys) {
    v = keys[k];
    if (v.b !== void 0) {
      _results.push(v.b);
    }
  }
  return _results;
})();

$(function() {
  var col, dir, i, la, style, t, _i, _len, _ref;
  _ref = settings.directories;
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    dir = _ref[i];
    $.ajax({
      url: settings.basedirectory + dir + '/arcadedata.json',
      async: false,
      dataType: "json",
      success: function(data) {
        settings.args.push(data.args);
        return $("#mainContainer ol").append("                    <li id=\"slide" + i + "\">\n                        <h2><span>" + data.title + "</span></h2>\n                        <div class=\"slidecontent\">\n                            <h1>" + data.description + "</h1>\n                            <h1>" + data.description_fr + "</h1>\n<img src=\"" + (settings.basedirectory + dir + '/screenshot.png') + "\" class=\"screenshot\"></img>\n<h1>" + data.author + "</h1>\n                        </div>\n                    </li>");
      }
    }).fail(function(error) {
      console.log("Error parsing metadata for game '" + dir + "':");
      return console.log(error);
    });
  }
  style = (function() {
    var _j, _ref1, _results;
    _results = [];
    for (i = _j = 0, _ref1 = settings.directories.length; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
      t = i / settings.directories.length;
      col = hslLerp(settings.leftColour, settings.rightColour, t);
      _results.push("#slide" + i + " h2 { background-color: hsl(" + col.h + ", " + col.s + "%, " + col.l + "%) }\n#slide" + i + " div { background-color: hsl(" + col.h + ", " + col.s + "%, " + col.l + "%) }");
    }
    return _results;
  })();
  $("head").append("<style>" + style.join("\n") + "</style>");
  la = $("#mainContainer").liteAccordion({
    "easing": "easeOutCubic",
    "containerWidth": $(window).width(),
    "containerHeight": $(window).height(),
    "headerWidth": 80,
    "slideSpeed": 400
  }).data('liteAccordion');
  return $(document).keydown(function(e) {
    var _ref1, _ref2, _ref3, _ref4;
    if (e.which === keys.home) {
      la.play(0);
      return la.stop();
    } else if (_ref1 = e.which, __indexOf.call(keys.anyLeft, _ref1) >= 0) {
      return la.prev();
    } else if (_ref2 = e.which, __indexOf.call(keys.anyRight, _ref2) >= 0) {
      return la.next();
    } else if ((_ref3 = e.which, __indexOf.call(keys.anyB, _ref3) >= 0) || (_ref4 = e.which, __indexOf.call(keys.anyA, _ref4) >= 0)) {
      if (la.current() !== 0) {
        return integrator.callBack(settings.directories[la.current() - 1], settings.args[la.current() - 1]);
      }
    }
  });
});