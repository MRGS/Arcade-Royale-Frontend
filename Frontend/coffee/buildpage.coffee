###
Arcade Royale Launcher
Hello hello. 2014.
MIT License.
###

settings = {}
keys = {}

# We use the more verbose ajax() syntax so that we can specify that it
# not run asynchronously
$.ajax({
    url: '../settings.json'
    async: false,
    dataType: "json",
}).success( (data) ->
    settings.basedirectory = data.basedirectory
    settings.directories = data.directories
    settings.leftColour = hexToHsl(data.leftColour)
    settings.rightColour = hexToHsl(data.rightColour)
    settings.args = []
    keys = data.keys
).fail( (error) ->
    console.log "Error parsing settings file!"
    console.log error
)

# Parse named keys to keycodes.
# I'm sure there's a better way to iterate through these
# but WHATEVER, DAD
for k, v of keys
    if typeof(v) is "object"
        for k2, v2 of v
            if keyNameToCode[v2] isnt undefined
                keys[k][k2] = keyNameToCode[v2]
            else
                console.log "Unknown key: '"+v2+"'"
    else
        if keyNameToCode[v] isnt undefined
            keys[k] = keyNameToCode[v]
        else
            console.log "Unknown key: '"+v+"'"

keys.anyLeft = (v.left for k, v of keys when v.left isnt undefined)
keys.anyRight = (v.right for k, v of keys when v.right isnt undefined)
keys.anyA = (v.a for k, v of keys when v.a isnt undefined)
keys.anyB = (v.b for k, v of keys when v.b isnt undefined)

# Document ready stuff.
$ ->
    for dir, i in settings.directories
        # We use the more verbose ajax() syntax so that we can specify that it
        # not run asynchronously
        $.ajax({
            url: settings.basedirectory + dir + '/arcadedata.json'
            async: false,
            dataType: "json",
            success: (data) ->
                settings.args.push(data.args)
                $("#mainContainer ol").append(
                    """
                    <li id="slide#{ i }">
                        <h2><span>#{ data.title }</span></h2>
                        <div class="slidecontent">
                            <h1>#{ data.description }</h1>
                            <h1>#{ data.description_fr }</h1>
                        </div>
                    </li>
                    """)
        }).fail (error) ->
            console.log "Error parsing metadata for game '" + dir + "':"
            console.log error

    # Generate the styles for each slide...
    style = for i in [0..settings.directories.length]
        t = i / settings.directories.length
        col = hslLerp(settings.leftColour, settings.rightColour, t)
        """
        #slide#{ i } h2 { background-color: hsl(#{ col.h }, #{ col.s }%, #{ col.l }%) }
        #slide#{ i } div { background-color: hsl(#{ col.h }, #{ col.s }%, #{ col.l }%) }
        """

    # ...And stick 'em in our document
    $("head").append( "<style>" + style.join("\n") + "</style>" )


    # Now set up dat accordion.
    la = $("#mainContainer").liteAccordion({
        "easing":"easeOutCubic",
        "containerWidth": $(window).width(),
        "containerHeight": $(window).height(),
        "headerWidth":80,
        "slideSpeed":400}).data('liteAccordion')


    # Handle keypresses
    $(document).keydown (e) ->
        if e.which is keys.home
            la.play(0)
            la.stop()
        else if e.which in keys.anyLeft
            la.prev()
        else if e.which in keys.anyRight
            la.next()
        else if (e.which in keys.anyB) or (e.which in keys.anyA)
            if la.current() != 0
                integrator.callBack(settings.directories[la.current()-1], settings.args[la.current()-1])


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

hexToHsl = (hex) ->
    c = hexToRgb(hex)
    rgbToHsl(c.r, c.g, c.b)

hslLerp = (from, to, t) ->
    col = {}
    col.h = from.h * (1-t) + to.h * t
    col.s = from.s * (1-t) + to.s * t
    col.l = from.l * (1-t) + to.l * t
    return col

# From http://jsfiddle.net/vWx8V/
keyNameToCode = {
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

