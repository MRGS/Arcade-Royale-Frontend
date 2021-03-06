###
Arcade Royale Launcher
Hello hello. 2014.
MIT License.
###

# From http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
hexToRgb = (hex) ->
    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return null if not result?
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    }

# From http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
rgbToHsl = (r, g, b) ->
    r /= 255
    g /= 255
    b /= 255
    max = Math.max(r, g, b)
    min = Math.min(r, g, b)
    l = (max + min) / 2

    if max is min
        h = s = 0 # achromatic
    else
        d = max - min
        s = if l > 0.5 then d / (2 - max - min) else d / (max + min)
        switch(max)
            when r then h = (g - b) / d + (if g < b then 6 else 0)
            when g then h = (b - r) / d + 2
            when b then h = (r - g) / d + 4
        h /= 6
    return { h: h * 360, s: s * 100, l: l * 100 }

exports.hexToHsl = (hex) ->
    c = hexToRgb(hex)
    rgbToHsl(c.r, c.g, c.b)

exports.hslLerp = (from, to, t) ->
    col = {}
    col.h = from.h * (1-t) + to.h * t
    col.s = from.s * (1-t) + to.s * t
    col.l = from.l * (1-t) + to.l * t
    return col

# From http://jsfiddle.net/vWx8V/
exports.keyNameToCode = {
    "Backspace":8,"Tab":9,"Enter":13,"Shift":16,"Ctrl":17,"Alt":18,"Pause/Break":19,"Caps Lock":20,"Esc":27,
    "Space":32,"Page Up":33,"Page Down":34,"End":35,"Home":36,"Left":37,"Up":38,"Right":39,"Down":40,
    "Insert":45,"Delete":46,"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"A":65,
    "B":66,"C":67,"D":68,"E":69,"F":70,"G":71,"H":72,"I":73,"J":74,"K":75,"L":76,"M":77,"N":78,"O":79,
    "P":80,"Q":81,"R":82,"S":83,"T":84,"U":85,"V":86,"W":87,"X":88,"Y":89,"Z":90,"Windows":91,
    "Right Click":93,"Numpad 0":96,"Numpad 1":97,"Numpad 2":98,"Numpad 3":99,"Numpad 4":100,"Numpad 5":101,
    "Numpad 6":102,"Numpad 7":103,"Numpad 8":104,"Numpad 9":105,"Numpad *":106,"Numpad +":107,"Numpad -":109,
    "Numpad .":110,"Numpad /":111,"F1":112,"F2":113,"F3":114,"F4":115,"F5":116,"F6":117,"F7":118,"F8":119,
    "F9":120,"F10":121,"F11":122,"F12":123,"Num Lock":144,"Scroll Lock":145,"My Computer":182,
    "My Calculator":183,";":186,"=":187,",":188,"-":189,".":190,"/":191,"`":192,"[":219,"\\":220,"]":221,
    "'":222
}

