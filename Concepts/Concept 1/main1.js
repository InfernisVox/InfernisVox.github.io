$(document).ready(function () {
	var promise = new Promise(function (resolve, reject) {
		$.getJSON("../../datasets/sortedwines.json", function (data) {
			resolve(data);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			reject(errorThrown);
		});
	});

	promise
		.then(function (winedata) {
			console.log(winedata);
			winesByCountryAndVariety(winedata);
		})
		.catch(function (error) {
			console.log("fail " + error);
		});
});

function winesByCountryAndVariety(winedata) {
	var winesByVariety = {};
	var winevarietys = [];

	// iterate over all wines and calculate the average values for each variety for each country
	winedata.forEach(function (wine) {
		var country = wine.country;
		var variety = wine.variety;
		var sweetness = wine.sweetness;
		var fruitiness = wine.fruitiness;
		var herbalCount = 0;
		var fruityCount = 0;

		if (!winevarietys.includes(variety)) {
			var varietyCount = 0;
			for (var i = 0; i < winedata.length; i++) {
				if (winedata[i].variety === variety) {
					varietyCount++;
					if (varietyCount >= 1) {
						winevarietys.push(variety);
						break;
					}
				}
			}
		}

		if (country !== "" && variety !== "") {
			if (!winesByVariety[country]) {
				winesByVariety[country] = {};
			}
			if (!winesByVariety[country][variety]) {
				winesByVariety[country][variety] = {
					points: wine.points,
					price: wine.price,
					sweetness: sweetness,
					fruitiness: fruitiness,
					count: 1,
				};
			} else {
				winesByVariety[country][variety].points += wine.points;
				winesByVariety[country][variety].price += wine.price;
				winesByVariety[country][variety].rating += wine.rating;
				winesByVariety[country][variety].count++;

				// check if sweetness value needs to be updated
				if (sweetness === "dry") {
					winesByVariety[country][variety].dryCount++;
				} else if (sweetness === "sweet") {
					winesByVariety[country][variety].sweetCount++;
				}
				if (
					winesByVariety[country][variety].dryCount >
					winesByVariety[country][variety].sweetCount
				) {
					winesByVariety[country][variety].sweetness = "dry";
				} else {
					winesByVariety[country][variety].sweetness = "sweet";
				}

				// check the count of herbal and fruity values
				if (fruitiness === "herbal") {
					herbalCount++;
				} else if (fruitiness === "fruity") {
					fruityCount++;
				}

				// set the fruitiness value based on the count of herbal and fruity values
				if (fruityCount > herbalCount) {
					winesByVariety[country][variety].fruitiness = "fruity";
				} else {
					winesByVariety[country][variety].fruitiness = "herbal";
				}
			}
		}
	});

	// calculate the average values for each variety for each country
	for (var country in winesByVariety) {
		if (winesByVariety.hasOwnProperty(country)) {
			for (var variety in winesByVariety[country]) {
				if (winesByVariety[country].hasOwnProperty(variety)) {
					winesByVariety[country][variety].points /=
						winesByVariety[country][variety].count;
					winesByVariety[country][variety].price /=
						winesByVariety[country][variety].count;
					winesByVariety[country][variety].rating /=
						winesByVariety[country][variety].count;
				}
			}
		}
	}

	console.log(winesByVariety);

	let elementPositions = [];

	// delete every winevariety that is produced by less than 5 countries
	for (let i = 0; i < winevarietys.length; i++) {
		let count = 0;
		for (let j = 0; j < Object.keys(winesByVariety).length; j++) {
			if (
				winevarietys[i] in
				winesByVariety[Object.keys(winesByVariety)[j]]
			) {
				count++;
			}
		}
		if (count < 5) {
			winevarietys.splice(i, 1);
			i--;
		}
	}

	// rearrange the winevarietys array so that the winevariety with the highest count is at the beginning
	winevarietys.sort(function (a, b) {
		let countA = 0;
		let countB = 0;
		for (let i = 0; i < Object.keys(winesByVariety).length; i++) {
			if (a in winesByVariety[Object.keys(winesByVariety)[i]]) {
				countA++;
			}
			if (b in winesByVariety[Object.keys(winesByVariety)[i]]) {
				countB++;
			}
		}
		return countB - countA;
	});

	$.each(winevarietys, function (index, value) {
		let append;
		$(winevarietys[value]).each(function (index, value) {});

		// p emement
		append = $("<p></p>");
		append.text(value);

		// move down on the y axis by 40px
		append.css({
			position: "relative",
			left: "0px",
			top: "0px",
			transform: "translateY(60px)",
			fontSize: "12px",
		});

		$("body").append(append);

		let position = append.offset();
		elementPositions.push({
			variety: value,
			left: position.left,
			top: position.top,
		});
	});

	// create a container element to hold the <p> elements
	let container = $("<div></div>");

	$.each(winesByVariety, function (index, value) {
		let append;

		// create the <p> element
		// change the font size to 10px

		append = $("<p></p>");
		append.text(index);

		// append.css("position", "absolute");
		append.css({
			position: "relative",
			margin: "5px",
			left: "0px",
			top: "0px",
			fontSize: "12px",
		});

		// append the <p> element to the container
		container.append(append);
	});

	// apply CSS properties to the container element
	// let the elements that are not on the screens be visible by scrolling to the x axis
	container.css({
		display: "flex",
		transform: " ",
		position: "absolute",
		top: "30px",
		right: "10px",
		left: "170px",
		textOrientation: "upright",
		whiteSpace: "nowrap",
		overflowX: "auto",
	});

	// append the container to the body
	$("body").append(container);

	for (let i = 0; i < Object.keys(winesByVariety).length; i++) {
		elementPositions.forEach((element) => {
			createCircleForWinevariety(element, i, winesByVariety);
		});
	}
}

function createCircleForWinevariety(element, count, winesByVariety) {
	let circle = $("<div></div>");
	let circleSize;
	let saturation;

	country = Object.keys(winesByVariety)[count];
	if (element.variety in winesByVariety[country]) {
		circleSize = map(
			Math.round(winesByVariety[country][element.variety].points),
			80,
			100,
			5,
			35
		);
		saturation = Math.round((circleSize / 100) * 255);
	}

	circle.data("country", country);

	circle.css({
		width: /*circleSize*/ 25 + "px",
		height: /*circleSize*/ 25 + "px",
		borderRadius: "0px",
		backgroundColor: "hsl(" + saturation + ", 100%, 50%)",
		position: "absolute",
		left: 186 + count * 33.5 + "px",
		top: element.top,
		transform: "translate(-50%, -50%)",
	});

	// Add the class 'wine-circle' to the circle
	circle.addClass("wine-circle");

	$("body").append(circle);

	circle.hover(
		function () {
			// Animate the circle size and change the background color on mouseenter
			$(this)
				.animate(
					{
						width: 5 + /*circleSize*/ 25 + "px",
						height: 5 + /*circleSize*/ 25 + "px",
					},
					"fast"
				)
				.css("background-color", "hsl(" + saturation + ", 100%, 20%)");

			// Get the position of the hovered circle
			let circlePosition = $(this).position();

			// Create the black box and add it to the DOM
			let blackBox = $("<div></div>");
			blackBox.attr("id", "black-box");
			blackBox.css({
				position: "absolute",
				left: circlePosition.left - 180 + "px", // Update the left position based on the circle's position with 20px offset
				top: circlePosition.top + "px",
				width: "150px",
				height: "auto",
				backgroundColor: "black",
				color: "white",
				padding: "10px",
				borderRadius: "5px",
				zIndex: 10,
			});

			blackBox.text(
				"Country: " +
					$(this).data("country") +
					"\n" +
					"Variety: " +
					element.variety +
					"\n" +
					"Points: " +
					Math.round(
						winesByVariety[$(this).data("country")][element.variety]
							.points
					) +
					" / 100" +
					"\n" +
					"Price: " +
					Math.round(
						winesByVariety[$(this).data("country")][element.variety]
							.price
					) +
					"€"
			);
			$("body").append(blackBox);
		},
		function () {
			// Animate the circle size back to its original size and restore the original background color on mouseleave
			$(this)
				.animate(
					{
						width: /*circleSize*/ 25 + "px",
						height: /*circleSize*/ 25 + "px",
					},
					"fast"
				)
				.css("background-color", "hsl(" + saturation + ", 100%, 50%)");

			// Remove the black box from the DOM
			$("#black-box").remove();
		}
	);
}

function map(number, inMin, inMax, outMin, outMax) {
	return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
