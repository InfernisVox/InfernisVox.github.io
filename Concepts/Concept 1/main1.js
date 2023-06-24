/*TODO:
	- Make filteroption dropown work
	- Make a variety sorting dropdown
	- Change gradient of circles based on filteroption
*/

let Wines = { winecolorboxes: null };
let circleArray = [];
let filteroption;

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
			filteroption = filter();

			winesByCountryAndVariety(winedata, winesByVariety, winevarietys);
			draw(winesByVariety, winevarietys, filteroption);
		})
		.catch(function (error) {
			console.log("fail " + error + " | " + error.stack);
		});
});

function winesByCountryAndVariety(winedata, winesByVariety, winevarietys) {
	// Iterate over all wines and calculate the average values for each variety for each country
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

				// Check if sweetness value needs to be updated
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

				// Check the count of herbal and fruity values
				if (fruitiness === "herbal") {
					herbalCount++;
				} else if (fruitiness === "fruity") {
					fruityCount++;
				}

				// Set the fruitiness value based on the count of herbal and fruity values
				if (fruityCount > herbalCount) {
					winesByVariety[country][variety].fruitiness = "fruity";
				} else {
					winesByVariety[country][variety].fruitiness = "herbal";
				}
			}
		}
	});

	// Calculate the average values for each variety for each country
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

	// Delete every winevariety that is produced by less than 5 countries
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

	// Rearrange the winevarietys array so that the winevariety with the highest count is at the beginning
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

	// Create new object parameters for each variety in each country with the count of wines
	for (var country in winesByVariety) {
		if (winesByVariety.hasOwnProperty(country)) {
			for (var variety in winesByVariety[country]) {
				if (winesByVariety[country].hasOwnProperty(variety)) {
					let count = 0;
					for (var i = 0; i < winedata.length; i++) {
						if (
							winedata[i].country === country &&
							winedata[i].variety === variety
						) {
							count++;
						}
					}
					winesByVariety[country][variety].production = count;
				}
			}
		}
	}

	console.log(winesByVariety);
}

function filter() {
	let headingcontainer;
	let heading = $("<h2></h2>");
	let description = $("<p></p>");
	let backdrop = $("<div></div>");
	let optionlist = ["Points.", "Price.", "Production."];
	let descriptiontext = "";
	let filterdropdown = new Dropdown(optionlist, filteroption);
	console.log(filterdropdown);
	$("body").append(filterdropdown.html);
	let lastMouseMovement = Date.now();
	filteroption = optionlist[0]; // Initialize filteroption with the first word from the optionlist
	let previousOption = ""; // Store the previous filter option

	filterdropdown.html.on("click", function () {
		filteroption = filterdropdown.getSelected();
		console.log(filteroption);

		// Update the description text
		descriptiontext = getDescriptionText(filteroption);
		description.html(descriptiontext);

		// Update the circles
		circleArray.forEach((circle) => {
			circle.updateSaturation(filteroption);
		});
	});

	$(window).mousemove(function () {
		lastMouseMovement = Date.now();
	});

	// Create a <div> element for the backdrop
	backdrop.css({
		position: "fixed",
		left: "0px",
		top: "0px",
		width: "100%",
		height: "307px",
		backgroundImage:
			"linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6))",
		zIndex: "1",
		backdropFilter: "blur(10px)",
		borderRadius: "10px 10px 0 0",
		boxShadow: "0px 10px 10px rgba(0, 0, 0, 0.8)",
	});

	$("body").append(backdrop);

	heading.css({
		position: "fixed",
		left: "135px",
		top: "0px",
		margin: "9px",
		transform: "translateY(50px)",
		fontSize: "50px",
		fontWeight: "bold",
		color: "white",
		zIndex: "2",
	});

	//heading.append(filterdropdown.html);
	$("body").append(heading);

	// Create a <p> element for the description
	description.css({
		position: "fixed",
		left: "60%",
		right: "5%",
		top: "0px",
		margin: "9px",
		transform: "translateY(57px)",
		fontSize: "17px",
		fontWeight: "thin",
		color: "white",
		zIndex: "2",
	});

	// Append the description to the body
	$("body").append(description);

	function updateFilterOption() {
		// Get a random word from the optionlist
		do {
			filteroption =
				optionlist[Math.floor(Math.random() * optionlist.length)];
		} while (filteroption === previousOption); // Check if it's the same as the previous option

		// Update the previous option
		previousOption = filteroption;

		// Animate the description change
		description.animate({ opacity: 0 }, 400, function () {
			// Update the description text
			descriptiontext = getDescriptionText(filteroption);
			description.html(descriptiontext).animate({ opacity: 1 }, 400);
		});

		// Update the circles
		circleArray.forEach((circle) => {
			circle.updateSaturation(filteroption);
		});

		// TODO #1
		filterdropdown.updateLabel(filteroption);
	}

	setInterval(function () {
		const timeSinceLastMouseMovement = Date.now() - lastMouseMovement;
		if (timeSinceLastMouseMovement > 8000) {
			updateFilterOption();
		}
	}, 3000);

	$(document).ready(function () {
		updateFilterOption();
	});

	// Set the initial heading text
	heading.html("Winevarietys in <br> the world by ");

	return filteroption;
}

// Function to get the description text based on the filteroption
function getDescriptionText(filteroption) {
	switch (filteroption) {
		case "Points.":
			return "This average represents the overall points earned by different wine varieties produced in each country. The wine's quality improves as the points increase. <br> The saturation level reflects the wine's rating, indicating its strength of appeal.";
		case "Price.":
			return "This average represents the typical price range of wine varieties produced in each country. The saturation level corresponds to the wine's price. <br> As the price increases, the color saturation becomes more pronounced, indicating a higher value.";
		case "Production.":
			return "This represents the total quantity of wine produced for each wine variety in every country. The color saturation is determined by the production<br>level of the wine. The more wine produced, the more intense the color saturation becomes, indicating higher production volume.";
		default:
			return "What in god's name were you doing to get this displayed?";
	}
}

// Function for drawing the entire visualization
function draw(winesByVariety, winevarietys, filteroption) {
	let elementPositions = [];
	let winecolorboxcolor = "white";
	Wines.winecolorboxes = {};

	$.each(winevarietys, function (index, value) {
		let append;
		let kml;
		$(winevarietys[value]).each(function (index, value) {});

		//get all the countries names
		let countries = Object.keys(winesByVariety);

		//now cycle through the countries
		for (let i = 0; i < countries.length; i++) {
			//if the country has the winevariety
			if (winesByVariety[countries[i]][value] !== undefined) {
				//get the color of the winevariety
				kml = winesByVariety[countries[i]][value].color;
			}
		}

		// change the color behinde the winevariety based on the color of the wine
		if (kml == "red") {
			winecolorboxcolor =
				"linear-gradient(to right, rgba(255, 0, 46, 0.3), rgba(255, 0, 46, 0.04))";
		} else if (kml == "white") {
			winecolorboxcolor =
				"linear-gradient(to right, rgba(255, 153, 0, 0.3), rgba(255, 153, 0, 0.04))";
		} else if (kml == "rose") {
			winecolorboxcolor =
				"linear-gradient(to right, rgba(233, 50, 122, 0.3), rgba(233, 50, 122, 0.04))";
		} else if (kml == "not classified") {
			winecolorboxcolor = "rgba(0, 0, 0, 0)";
		}

		// p element
		append = $("<p></p>");
		append.text(value);

		append.css({
			position: "relative",
			left: "130px",
			top: "240px",
			margin: "7px",
			transform: "translateY(65px)",
			fontSize: "14px",
			fontWeight: "bold",
			color: "rgba(255, 255, 255, 0.6)",
		});

		$("body").append(append);

		let position = append.offset();
		elementPositions.push({
			variety: value,
			left: position.left,
			top: position.top,
		});

		// create the color box
		let winecolorbox = $("<div class = 'label'></div>");

		winecolorbox.css({
			position: "absolute",
			left: "8%", // Set the left position of the box to match the text element
			top: position.top - 4 + "px", // Set the top position of the box to match the text element
			width: "91% ",
			height: "24.3px",
			backgroundImage: winecolorboxcolor,
			zIndex: "-1", // Set a negative z-index to position the box behind the text
		});

		Wines.winecolorboxes[value] = winecolorbox;

		$("body").append(winecolorbox);
	});

	// create a container element to hold the <p> elements
	let container = $("<div></div>");

	let count = 0;
	$.each(winesByVariety, function (index, value) {
		let append;

		// create the <p> element
		// change the font size to 10px
		let div = $("<div></div>");
		append = $("<p></p>");

		append.text(index);

		append.addClass("countryLabel");

		div.css({
			position: "absolute",
			left: count * 30.5 + "px",
			width: "22px",
			marginRight: "8.5px",
		});
		count++;

		// let the elements be alligned to the x of the circles underneath
		append.css({
			top: "0px",
			fontSize: "14px",
			fontWeight: "bold",
			color: "rgba(255, 255, 255, 0.6)",
			transform: "rotate(-90deg)",
			lineHeight: "22px",
			paddingLeft: "6px",
		});

		// append the <p> element to the container
		div.append(append);
		container.append(div);
	});

	// apply CSS properties to the container element
	// let the elements that are not on the screens be visible by scrolling to the x axis
	container.css({
		display: "flex",
		position: "fixed",
		height: "30px",
		top: "265px",
		right: "0px",
		left: "341px",
		textOrientation: "upright",
		whiteSpace: "nowrap",
		overflowX: "auto",
		overflowY: "hidden",
		zIndex: "2",
	});

	// append the container to the body
	$("body").append(container);

	for (let i = 0; i < Object.keys(winesByVariety).length; i++) {
		elementPositions.forEach((element) => {
			createCircleForWinevariety(
				element,
				i,
				winesByVariety,
				filteroption,
				Wines.winecolorboxes
			);
		});
	}

	// let the winecolorboxes only be visible when the mouse is over the circle
	$(".wine-circle").mouseenter(function () {
		let variety = $(this).data("variety");
		if (variety == undefined) {
			return;
		}
		let refHTML = Wines.winecolorboxes[variety];
		$(refHTML)
			.removeClass("label")
			.css("width", "0%") // Initial position offscreen to the left
			.animate({ width: "92%" }, 500); // Animation to move the element to 0% left (visible)
	});

	$(".wine-circle").mouseleave(function () {
		let variety = $(this).data("variety");
		if (variety == undefined) {
			return;
		}
		let refHTML = Wines.winecolorboxes[variety];
		$(refHTML)
			.addClass("label")
			.css("width", "91%") // Reset position to 0% left
			.animate({ width: "0%" }, 500); // Animation to move the element offscreen to the left
	});

	// create a div element at the bottom of the page that is absolute at the bottom
	let footer = $("<div></div>");

	footer.css({
		position: "absolute",
		bottom: "-53%",
		left: "0px",
		width: "100%",
		height: "10px",
		backgroundColor: "rgba(0, 0, 0, 0)",
	});

	$("body").append(footer);
	console.log(filteroption);
}

// Function for creating the circles for each winevariety
function createCircleForWinevariety(
	element,
	count,
	winesByVariety,
	filteroption
) {
	const circle = new CircleForWineVariety(
		element,
		count,
		winesByVariety,
		filteroption
	);
	circle.createCircle();
	circleArray.push(circle);
}

// Map function
function map(number, inMin, inMax, outMin, outMax) {
	return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
