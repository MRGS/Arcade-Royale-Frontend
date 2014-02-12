###
Arcade Royale Launcher
Hello hello. 2014.
MIT License.
###

helpers = require "./js/helpers"

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
    settings.leftColour = helpers.hexToHsl(data.leftColour)
    settings.rightColour = helpers.hexToHsl(data.rightColour)
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
                console.log("ok!")