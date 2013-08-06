basedirectory = "../Games/"
directories = [
    "poopdogs",
    "megagame",
    "cool hero 8",
    "ohiforgotmyhat",
    "dontmesswithhexes",
    "afoolandhisbrunch",
    "EAT",
    "hihello"
]

hslLerp = (from, to, t) ->
    col = {}
    col.h = from.h * (1-t) + to.h * t
    col.s = from.s * (1-t) + to.s * t
    col.l = from.l * (1-t) + to.l * t
    return col

fromcol = {
    h: 314,
    s: 42.86,
    l: 44.8
}

tocol = {
    h: 202,
    s: 74.57
    l: 64.61
}

$ ->
    for dir, i in directories
        # We use the more verbose ajax() syntax so that we can specify that it
        # not run asynchronously
        $.ajax({
            url: basedirectory + dir + '/data.json'
            async: false,
            dataType: "json",
            success: (data) ->
                $("#mainContainer ol").append(
                    """
                    <li id="slide#{ i }">
                        <h2><span>#{ data.title }</span></h2>
                        <div class="slidecontent">
                            <p>#{ data.description }</p>
                        </div>
                    </li>
                    """)
        }).fail (error) ->
            console.log "Error parsing metadata for game '" + dir + "':"
            console.log error

    style = for i in [0..directories.length]
        t = i / directories.length
        col = hslLerp(fromcol, tocol, t)
        "#slide#{ i } h2 { background-color: hsl(#{ col.h }, #{ col.s }%, #{ col.l }%) }
         #slide#{ i } div { background-color: hsl(#{ col.h }, #{ col.s }%, #{ col.l }%) }"

    $("body").append( "<style>" + style.join("\n") + "</style>" )


    #Now set up the accordion!

    $("#mainContainer").liteAccordion({
        "easing":"easeOutCubic",
        "containerWidth": $(window).width(),
        "containerHeight": $(window).height(),
        "headerWidth":80,
        "slideSpeed":400})

    # $(document).keydown (e) ->
    #     console.log e.which
