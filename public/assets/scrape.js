
$(document).on("click", "#delete-comment", function () {
    var thisNote = $(this).attr("data-id");
    console.log("thisNote", thisNote);
    // $.remove("/note/:thisNote").then(function (data) {
    //     location.reload();
    // });
    $.ajax({
        method: "DELETE",
        url: "note",
        data: {
            _id: thisNote
          }     
    }).then(function(data){
        location.reload();
    })
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
           var btn=$("#savenote");
           btn.attr("data-id", data._id);
           console.log("thisId 2", data._id);

            // If there's a note in the article
            if (data.note) {
                // Place the title of the note in the title input
                $("#titleinput").val(data.note.title);
                // Place the body of the note in the body textarea
                $("#bodyinput").val(data.note.body);
                $("#notes").append("<h4>" + data.note.title + "</br>" + data.note.body + "</h4>");
            }
        });

});



$(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    console.log("savenote" , thisId);    
  
    // Run a POST request to change the note, using what's entered in the inputs
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
        // Empty the notes section
        // $("#notes").empty();
        location.reload();
       
        
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
    
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
}
$("#scrape").on("click", handleScrape);
$("#clear").on("click", handleClear);