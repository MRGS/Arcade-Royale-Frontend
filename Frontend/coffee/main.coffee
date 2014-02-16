###
Arcade Royale Launcher
Hello hello. 2014.
MIT License.
###

fs = require 'fs'
cproc = require 'child_process'
helpers = require './helpers'

$ = window.$

settings = JSON.parse(fs.readFileSync('../settings.json'))
settings.leftColour = helpers.hexToHsl(settings.leftColour)
settings.rightColour = helpers.hexToHsl(settings.rightColour)

keys = settings.keys
# Parse named keys to keycodes.
# I'm sure there's a better way to iterate through these
# but WHATEVER, DAD
for k, v of keys
    if typeof(v) is "object"
        for k2, v2 of v
            if helpers.keyNameToCode[v2] isnt undefined
                keys[k][k2] = helpers.keyNameToCode[v2]
            else
                console.log "Unknown key: '"+v2+"'"
    else
        if helpers.keyNameToCode[v] isnt undefined
            keys[k] = helpers.keyNameToCode[v]
        else
            console.log "Unknown key: '"+v+"'"

keys.anyLeft = (v.left for k, v of keys when v.left isnt undefined)
keys.anyRight = (v.right for k, v of keys when v.right isnt undefined)
keys.anyA = (v.a for k, v of keys when v.a isnt undefined)
keys.anyB = (v.b for k, v of keys when v.b isnt undefined)


games = []
filenames = fs.readdirSync(settings.baseDirectory)

for file in filenames
    path = settings.baseDirectory + file
    if fs.statSync(path).isDirectory()
        if fs.existsSync(path + '/arcadedata.json')
            game = JSON.parse(fs.readFileSync(path + '/arcadedata.json'))
            for ext in ['png', 'gif', 'jpg']
                if fs.existsSync(path + '/screenshot.' + ext)
                    game.screenshot = path + '/screenshot.' + ext
                    break
            games.push game
        else
            console.log("Warning: no arcade data file found at " + path)

# Alpha sort.
games.sort (a, b) ->
    if (a.title > b.title)
      return 1
    if (a.title < b.title)
      return -1
    return 0

# On document ready.
$ ->
    for game, i in games
        $("#mainContainer ol").append(
            """
            <li id="slide#{ i }">
                <h2><span>#{ game.title }</span></h2>
                <div class="slidecontent">
                    <h2 class="desc-en">#{ game.description }</h2>
                    <h2 class="desc-fr">#{ game.description_fr }</h2>
                </div>
            </li>
            """
        )

        if game.screenshot isnt undefined
            $("#slide#{ i } .slidecontent").append(
                """
                <img src="#{ game.screenshot }" class="screenshot">
                """
            )

    # Generate the styles for each slide...
    style = for i in [0..games.length]
        t = i / games.length
        col = helpers.hslLerp(settings.leftColour, settings.rightColour, t)
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
        "slideSpeed":400}
    ).data('liteAccordion')


    # Handle keypresses
    $(window).keydown (e) ->
        if e.which is keys.home
            la.play(0)
            la.stop()
        else if e.which in keys.anyLeft
            la.prev()
        else if e.which in keys.anyRight
            la.next()
        else if (e.which in keys.anyB) or (e.which in keys.anyA)
            if la.current() != 0
                console.log("ok!")
                # cproc.execFile()
