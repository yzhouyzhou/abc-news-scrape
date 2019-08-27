let isNewNote = true;

$(document).on("click", "#delete-comment", function () {
    var thisNote = $(this).attr("data-id");
    console.log("thisNote", thisNote);
    $.ajax({
        method: "DELETE",
        url: "note/" + thisNote,
        data: {
            noteid: thisNote
        }
    }).then(function (data) {
        location.reload();
    })
    location.reload();
})

$(document).on("click", "#add-comment", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    console.log("thisId", thisId);
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            $('#myModal').modal("show");

            // If there's a note in the article
            if (data.note) {
                // Place the title of the note in the title input
                $("#titleinput").val(data.note.title);
                // Place the body of the note in the body textarea
                $("#bodyinput").val(data.note.body);
                var btnUpdate = $("#savenote");
                btnUpdate.attr("data-id", data.note._id);
                isNewNote = false;
                console.log("thisId for update note", data.note._id);
            }
            else {
                isNewNote = true;
                var btnNew = $("#savenote");
                btnNew.attr("data-id", data._id);
                console.log("thisId for create new", data._id);
            }

        });
});

$(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    console.log("savenote", thisId);

    if (isNewNote) {
        // Run a POST request to create a new note, using what's entered in the inputs
        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from title input
                title: $("#titleinput").val(),
                // Value taken from note textarea
                body: $("#bodyinput").val()
            }
        })
            // With that done
            .then(function (data) {
                // Log the response
                console.log(data);
                location.reload();
            });
    }
    else {
        // Run a PUT request to update the note, using what's entered in the inputs
        $.ajax({
            method: "PUT",
            url: "/note/" + thisId,
            data: {
                // Value taken from title input
                title: $("#titleinput").val(),
                // Value taken from note textarea
                body: $("#bodyinput").val()
            }
        })
            // With that done
            .then(function (data) {
                // Log the response
                console.log(data);
                location.reload();
            });
    }
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
    location.reload();
});


var handleScrape = () => {
    $.get("/scrape").then(function (data) {
        location.reload();
    });
}
var handleClear = () => {
    $.get("/clear").then(function (data) {
        location.reload();
    });
    location.reload();
}
$("#scrape").on("click", handleScrape);
$("#clear").on("click", handleClear);