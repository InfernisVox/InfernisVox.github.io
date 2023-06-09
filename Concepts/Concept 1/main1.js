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
			let winesByVariety = {};
			let winevarietys = [];
			let filteroption = filter(winesByVariety, winevarietys);

			winesByCountryAndVariety(winedata, winesByVariety, winevarietys);
			filter(winesByVariety, winevarietys, filteroption);
			draw(winesByVariety, winevarietys, filteroption);
		})
		.catch(function (error) {
			console.log("fail " + error);
		});
});

function winesByCountryAndVariety(winedata, winesByVariety, winevarietys) {
	// iterate over all wines and calculate the average values for each variety for each country
	winedata.forEach(function (wine) {
		let country = wine.country;
		let variety = wine.variety;
		let sweetness = wine.sweetness;
		let fruitiness = wine.fruitiness;
		let herbalCount = 0;
		let fruityCount = 0;

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
				let winePrice = wine.price;
				if (!Number.isInteger(wine.price)) {
					winePrice = 0;
				}
				winesByVariety[country][variety] = {
					points: wine.points,
					price: winePrice,
					sweetness: sweetness,
					fruitiness: fruitiness,
					count: 1,
					color: wine.color,
				};
			} else {
				winesByVariety[country][variety].points += wine.points;
				if (Number.isInteger(wine.price))
					winesByVariety[country][variety].price += parseInt(
						wine.price
					);

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
}

function filter(winesByVariety, winevarietys) {
	let heading = $("<h1></h1>");
	let optionlist = ["Points.", "Price.", "Production."];
	filteroption = optionlist[0]; // Initialize filteroption with the first word from the optionlist
	let previousOption = ""; // Store the previous filter option

	heading.css({
		position: "absolute",
		left: "135px",
		top: "0px",
		margin: "9px",
		transform: "translateY(40px)",
		fontSize: "50px",
		fontWeight: "bold",
		color: "white",
	});

	$("body").append(heading);

	// Create a <u> element for the filteroption
	let filterElement = $("<u></u>").appendTo(heading);

	// Function to update the filteroption with animation
	function updateFilterOption() {
		// Get a random word from the optionlist
		do {
			filteroption =
				optionlist[Math.floor(Math.random() * optionlist.length)];
		} while (filteroption === previousOption); // Check if it's the same as the previous option

		// Update the previous option
		previousOption = filteroption;

		// Animate the filteroption change
		filterElement.animate({ opacity: 0 }, 400, function () {
			// Update the filteroption text
			filterElement.text(filteroption).animate({ opacity: 1 }, 400);
		});
	}

	// Update the filteroption every few seconds (e.g., every 3 seconds)
	setInterval(updateFilterOption, 3000);

	// Set the initial heading text
	heading.html("Winevarietys in <br> the world by ").append(filterElement);

	return filteroption;
}

// Function for drawing the entire visualization
function draw(winesByVariety, winevarietys, filteroption) {
	let elementPositions = [];
	let winecolorboxcolor = "white";

	// change the fontfamily of the body
	$("body").css("font-family", "Arial, Helvetica, sans-serif");

	$.each(winevarietys, function (index, value) {
		let append;
		let kml;
		$(winevarietys[value]).each(function (index, value) {});

		if (winesByVariety["US"][value] !== undefined) {
			kml = winesByVariety["US"][value].color;
		}

		// change the color behinde the winevariety based on the color of the wine
		if (kml == "red") {
			winecolorboxcolor = "rgba(255, 0, 0, 0.2)";
		} else if (kml == "white") {
			winecolorboxcolor = "rgba(255, 255, 0, 0.2)";
		} else if (kml == "not classified") {
			winecolorboxcolor = "rgba(0, 0, 0, 0.2)";
		}

		// p element
		append = $("<p></p>");
		append.text(value);

		append.css({
			position: "relative",
			left: "130px",
			top: "230px",
			margin: "9px",
			transform: "translateY(65px)",
			fontSize: "12px",
			fontWeight: "bold",
			color: "white",
		});

		$("body").append(append);

		let position = append.offset();
		elementPositions.push({
			variety: value,
			left: position.left,
			top: position.top,
		});

		// create the color box
		let winecolorbox = $("<div></div>");
		winecolorbox.css({
			position: "absolute",
			left: position.left - 8 + "px", // Set the left position of the box to match the text element
			top: position.top - 4 + "px", // Set the top position of the box to match the text element
			width: "90%",
			height: "23.4px",
			backgroundColor: winecolorboxcolor,
			zIndex: "-1", // Set a negative z-index to position the box behind the text
		});

		$("body").append(winecolorbox);
	});

	// create a container element to hold the <p> elements
	let container = $("<div></div>");

	$.each(winesByVariety, function (index, value) {
		let append;

		// create the <p> element
		// change the font size to 10px

		append = $("<p></p>");
		append.text(index);

		// let the elements be alligned to the x of the circles underneath
		append.css({
			position: "aboslute",
			margin: "3px",
			left: "0px",
			top: "0px",
			fontSize: "12px",
			fontWeight: "bold",
			color: "white",
			transform: "rotate(-90deg)",
		});

		// append the <p> element to the container
		container.append(append);
	});

	// apply CSS properties to the container element
	// let the elements that are not on the screens be visible by scrolling to the x axis
	container.css({
		display: "flex",
		position: "absolute",
		height: "30px",
		top: "265px",
		right: "0px",
		left: "343px",
		textOrientation: "upright",
		whiteSpace: "nowrap",
		overflowX: "auto",
	});

	// append the container to the body
	$("body").append(container);

	for (let i = 0; i < Object.keys(winesByVariety).length; i++) {
		elementPositions.forEach((element) => {
			createCircleForWinevariety(
				element,
				i,
				winesByVariety,
				filteroption
			);
		});
	}
}

// Function for creating the circles for each winevariety
function createCircleForWinevariety(
	element,
	count,
	winesByVariety,
	filteroption
) {
	let circle = $("<div></div>");
	let circleSize;
	let saturation;
	let mappingoption;

	country = Object.keys(winesByVariety)[count];

	if (element.variety in winesByVariety[country]) {
		switch (filteroption) {
			case "Points.":
				console.log("points");
				mappingoption = winesByVariety[country][element.variety].points;
				break;
			case "Price.":
				console.log("price");
				mappingoption = winesByVariety[country][element.variety].points;
				break;
			case "Production.":
				//-----------------------------------------------------------------------CHANGE POINTS TO PRODUCTI0N LATER -----------------------------------------------------------------------

				mappingoption = winesByVariety[country][element.variety].points;
				break;
		}
		circleSize = map(Math.round(mappingoption), 80, 100, 0, 35);
		saturation = Math.round((circleSize / 100) * 255);
	}

	circle.data("country", country);

	circle.css({
		width: /*circleSize*/ 22 + "px",
		height: /*circleSize*/ 22 + "px",
		borderRadius: "50%",
		backgroundColor: "hsl(" + saturation + ", 100%, 50%)",
		position: "absolute",
		left: 350 + count * 30.5 + "px",
		top: 8.5 + element.top,
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
						width: 7 + /*circleSize*/ 22 + "px",
						height: 7 + /*circleSize*/ 22 + "px",
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
						width: /*circleSize*/ 22 + "px",
						height: /*circleSize*/ 22 + "px",
					},
					"fast"
				)
				.css("background-color", "hsl(" + saturation + ", 100%, 50%)");

			// Remove the black box from the DOM
			$("#black-box").remove();
		}
	);
}

// Map function
function map(number, inMin, inMax, outMin, outMax) {
	return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
