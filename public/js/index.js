// Get references to page elements
let $exampleText = $("#example-text");
let $exampleDescription = $("#example-description");
// let $submitBtn = $("#submit");
let $exampleList = $("#example-list");

// The API object contains methods for each kind of request we'll make
let API = {
  saveExample: function (example) {
    return $.ajax({
      headers: {
        "Content-Type": "application/json"
      },
      type: "POST",
      url: "api/games",
      data: JSON.stringify(example)
    });
  },
  getExamples: function () {
    return $.ajax({
      url: "api/games",
      type: "GET"
    });
  },
  deleteExample: function (id) {
    return $.ajax({
      url: "api/games/delete" + id,
      type: "DELETE"
    });
  }
};

// refreshExamples gets new examples from the db and repopulates the list
let refreshExamples = function () {
  API.getExamples().then(function (data) {
    let $examples = data.map(function (example) {
      let $a = $("<a>")
        .text(example.text)
        .attr("href", "/example/" + example.id);

      let $li = $("<li>")
        .attr({
          class: "list-group-item",
          "data-id": example.id
        })
        .append($a);

      let $button = $("<button>")
        .addClass("btn btn-danger float-right delete")
        .text("ｘ");

      $li.append($button);

      return $li;
    });

    $exampleList.empty();
    $exampleList.append($examples);
  });
};

// handleFormSubmit is called whenever we submit a new example
// Save the new example to the db and refresh the list
let handleFormSubmit = function (event) {
  event.preventDefault();

  let example = {
    text: $exampleText.val().trim(),
    description: $exampleDescription.val().trim()
  };

  if (!(example.text && example.description)) {
    alert("You must enter an example text and description!");
    return;
  }

  API.saveExample(example).then(function () {
    refreshExamples();
  });

  $exampleText.val("");
  $exampleDescription.val("");
};

// handleDeleteBtnClick is called when an example's delete button is clicked
// Remove the example from the db and refresh the list
let handleDeleteBtnClick = function () {
  let idToDelete = $(this)
    .parent()
    .attr("data-id");

  API.deleteExample(idToDelete).then(function () {
    refreshExamples();
  });
};

// Add event listeners to the submit and delete buttons
// $submitBtn.on("click", handleFormSubmit);
$exampleList.on("click", ".delete", handleDeleteBtnClick);

//when the search button is clicked, it calls the post route that then calls the igdb api.
$(document).ready(function () {
  $(".save-user-data").on("click", function (cb) {
    var avatar = "./images/default-avatar.png";;
    var backgroundimage = "./images/default-background.png";
    var accentcolor = $("#inputColor").val().trim()
    if($("#inputAvatar").val().trim()===""){
      avatar = $("#inputAvatar").attr("placeholder");
    }
    else{
      avatar = $("#inputAvatar").val().trim();
    }
    if($("#inputBackground").val().trim()===""){
      backgroundimage = $("#inputBackground").attr("placeholder");
    }
    else{
      backgroundimage = $("#inputBackground").val().trim();
    }
    $.post("/api/update_user", {
      avatar: avatar,
      backgroundimage: backgroundimage,
      accentcolor: $("#inputColor").val().trim()
    }).then(function (results) {
      $("body").css("background-image", "url('"+backgroundimage+"')");
      $('.accentColor').attr('style', 'background-color:' +accentcolor+' !important');
      $('#userAvatar').attr('src',avatar);      
    })
  });


  $("#searchButton").on("click", function (cb) {
    event.preventDefault();

    let gameToSearch = $("#searchText").val();
    $.ajax({
        method: "POST",
        url: "/api/search/" + gameToSearch
      })
      .then(function (results) {
        // console.log("This is the result: " + results.length);
        $("#searchModalInsertion").empty();
        $("#addLibrary").attr("onclick", "").unbind("click");
        for (let i = 0; i < results.length; i++) {
          $("#searchModalInsertion").append("<h2>" + results[i].name + "</h2>");
          $("#searchModalInsertion").append("<p>" + results[i].summary + "</p>");
          $("#searchModalInsertion").append("<button type='button' class='btn btn-outline-success my-2 my-sm-0 addLibrary' data-gameID=" + results[i].id + ">Add to Library</button>");
        }
        // jQuery.noConflict();
        $("#searchModal").modal("toggle")
        $(".addLibrary").on("click", function (cb) {
          event.preventDefault();
          // console.log("Hello");
          // console.log($(this).attr("data-gameID"));
          getTitle($(this).attr("data-gameID"));
        });
      })
  });
});

function getTitle(theTitle) {
  $.ajax({
      method: "POST",
      url: "/api/searchTitle/" + theTitle
    })
    .then(function (results) {
      window.location.href = "/library";
    });
}