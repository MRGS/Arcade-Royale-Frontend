basedirectory = "../Games/"
directories = [
    "poopdogs",
    "megagame",
    "cool hero 8",
    # "oh i forgot my hat",
    # "don't mess with hexes"
]

$ ->
    for dir in directories
        # We use the more verbose ajax() syntax so that we can specify that it
        # not run asynchronously
        $.ajax({
            url: basedirectory + dir + '/data.json'
            async: false,
            dataType: "json",
            success: (data) ->
                $("#mainContainer ol").append(
                    """
                    <li>
                        <h2><span>#{ data.title }</span></h2>
                        <div class="slidecontent">
                            <p>#{ data.description }</p>
                        </div>
                    </li>
                    """)
        }).fail (error) ->
            console.log "Error parsing metadata for game '" + dir + "':"
            console.log error

    #Now set up the accordion!

    $("#mainContainer").liteAccordion({
        "easing":"easeOutCubic",
        "containerWidth": $(window).width(),
        "containerHeight": $(window).height(),
        "headerWidth":80,
        "slideSpeed":400})

    # $(document).keydown (e) ->
    #     console.log e.which
