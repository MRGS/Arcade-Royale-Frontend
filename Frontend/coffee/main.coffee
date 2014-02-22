###
Arcade Royale Launcher
Hello hello. 2014.
MIT License.
###

fs = require 'fs'
cproc = require 'child_process'
helpers = require './helpers'

$ = window.$

lastKeypress = 0

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
            if helpers.keyNameToCode[v2]?
                keys[k][k2] = helpers.keyNameToCode[v2]
            else
                console.log "Launcher: unknown key: '"+v2+"'"
    else
        if helpers.keyNameToCode[v]?
            keys[k] = helpers.keyNameToCode[v]
        else
            console.log "Launcher: unknown key: '"+v+"'"

keys.anyLeft = (v.left for k, v of keys when v.left?)
keys.anyRight = (v.right for k, v of keys when v.right?)
keys.anyA = (v.a for k, v of keys when v.a?)
keys.anyB = (v.b for k, v of keys when v.b?)


games = []
filenames = fs.readdirSync(settings.baseDirectory)

for file in filenames
    path = settings.baseDirectory + file
    if fs.statSync(path).isDirectory()
        if fs.existsSync(path + '/arcadedata.json')
            game = JSON.parse(fs.readFileSync(path + '/arcadedata.json'))

            # let's check/find our executable.
            if game.exec_name isnt undefined
                if fs.existsSync(path + '/' + game.exec_name)
                    game.exec_name = path + '/' + game.exec_name
                else
                    console.log("Launcher: executable name not found at " + path + '/' + game.exec_name)
            else
                exes = fs.readdirSync(path).filter((elem) -> elem.indexOf('.exe', elem.length - '.exe'.length) isnt -1)
                if exes.length is 1
                    game.exec_name = path + '/' + exes[0]
                else
                    console.log("Launcher: can't find a candidate exe in " + path)

            # now let's find a screenshot.
            for ext in ['png', 'gif', 'jpg']
                if fs.existsSync(path + '/screenshot.' + ext)
                    game.screenshot = path + '/screenshot.' + ext
                    break

            games.push game
        else
            console.log("Launcher: no arcade data file found at " + path)

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

        elem = $("#slide#{ i } .slidecontent")

        if game.screenshot?
            elem.append(
                """
                <img src="#{ game.screenshot }" class="screenshot">
                """
            )

        if game.players?
            pstr = game.players
            for i in [0...pstr.length]
                c = pstr.charAt(i)
                switch
                    when !isNaN(parseFloat(c)) and isFinite(c)
                        for j in [1..parseInt(c)]
                            className = if parseInt(c) is 4 and ((j-1) % 2) == 1 then "player-shift" else "player"
                            elem.append("<div class=\"#{ className }\"></div>")
                    when c is 'v'
                        elem.append('<div class="player-text">vs.</div>')
                    when c is '-'
                        elem.append('<div class="player-text">-</div>')
                    when c is ' '
                        elem.append('<div class="player-text"> </div>')
                    when c is '?'
                        elem.append('<div class="player-text">?</div>')
                    else
                        console.log('Launcher: unrecognized characters in player definition for ' + game.title + ": '" + c + "'")

        celem = elem
        parseControls = (o) ->
            celem.append('<div class="controls">Hi</div>')
            celem = celem.find(".controls")
            for k, v of o
                switch k
                    when 'container'
                        parseControls(v)
                    when 'label'
                        celem.append("<div class=\"controls-label\">#{ v }</div>")
                    when 'controls'
                        if Array.isArray(v)
                            for button in v
                                celem.append("<div class=\"controls-button-#{ button.toLowerCase() }\"></div>")
                        else
                            celem.append("<div class=\"controls-button-#{ v.toLowerCase() }\"></div>")
                    when 'description'
                        celem.append("<div class=\"controls-desc-en\">#{ v }</div>")
                    when 'description_fr'
                        celem.append("<div class=\"controls-desc-fr\">#{ v }</div>")
                    else
                        console.log('Launcher: unrecognized control identifier for ' + game.title + ": '" + k "'")

        if game.controls?
            if Array.isArray(game.controls)
                for o in game.controls
                    parseControls(o)
            else if $.isPlainObject(game.controls)
                    parseControls(game.controls)
            else
                console.log("Launcher: can't parse controls")



        if game.url?
            elem.qrcode({
                height: 180
                width: 180
                color: '#fff'
                text: game.url
            })

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
        "easing":"easeOutCubic"
        "containerWidth": $(window).width()
        "containerHeight": $(window).height()
        "headerWidth": 80
        "slideSpeed": 400
        # "onTriggerSlide": (e) ->
        # "onSlideAnimComplete": ->
    }).data('liteAccordion')

    # Handle keypresses
    $(window).keydown (e) ->
        lastKeypress = process.uptime()
        la.stop()
        if e.which is keys.home
            la.goto(0)
        else if e.which in keys.anyLeft
            la.prev()
        else if e.which in keys.anyRight
            la.next()
        else if (e.which in keys.anyB) or (e.which in keys.anyA)
            ind = la.current()
            if ind isnt 0
                if games[ind - 1].exec_name?
                    cproc.execFile(games[ind - 1].exec_name)

    la.goto(5)

    # setInterval( ->
    #     now = process.uptime()
    #     if now > lastKeypress + 15
    #         la.play() # yeah, this call'll fire every second. got a problem, bub?
    # , 1000)
