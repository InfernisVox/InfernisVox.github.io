let winedata;

$(document).ready(function () {
	console.log("e");
	$.getJSON("../../datasets/sortedwines.json", function (data) {
		winedata = data;
	}).fail(function (jqXHR, textStatus, errorThrown) {
		alert("fail " + errorThrown);
	});
});
