/* -------------------------
   Elements
------------------------- */

const calendar =
	document.getElementById("calendar");

const monthTitle =
	document.getElementById("month");

const previousButton =
	document.getElementById("previous");

const nextButton =
	document.getElementById("next");

const todayButton =
	document.getElementById("today");

const availabilityOptions =
	document.getElementById("availability-options");

const selectedTime =
	document.getElementById("selected-time");

const calendarContainer =
	document.querySelector(".calendar-container");

const convertImageButton =
	document.getElementById("convert-image");

const imagePreview =
	document.getElementById("image-preview");

const calendarImage =
	document.getElementById("calendar-image");

const returnEditorButton =
	document.getElementById("return-editor");

const optionButtons =
	availabilityOptions.querySelectorAll("button");



/* -------------------------
   State
------------------------- */

let currentDate =
	new Date();

let selectedDate =
	null;

let monthNavigationLocked =
	false;


/*
 * Each date can contain:
 *
 * state:
 * morning, evening, unavailable
 *
 * timeType:
 * until, after, ""
 *
 * time:
 * HH:MM
 */

const availability = {};



/* -------------------------
   Helpers
------------------------- */

function getDateKey(date) {

	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

}


function getDateData(dateKey) {

	return availability[dateKey] || {
		state: "",
		timeType: "",
		time: ""
	};

}


function isTimedState(state) {

	return (
		state === "morning" ||
		state === "evening"
	);

}


function createButton(text, className = "") {

	const button =
		document.createElement("button");

	button.type =
		"button";

	button.textContent =
		text;


	if (className) {

		button.classList.add(
			className
		);

	}


	return button;

}



/* -------------------------
   Render Calendar
------------------------- */

function renderCalendar() {

	/*
	 * Remove the existing date cells.
	 * Weekday headings remain untouched.
	 */

	calendar
		.querySelectorAll(".day")
		.forEach(day => day.remove());


	const year =
		currentDate.getFullYear();

	const month =
		currentDate.getMonth();


	/*
	 * Month heading.
	 */

	const monthName =
		currentDate.toLocaleString(
			"default",
			{
				month: "long"
			}
		);

	monthTitle.textContent =
		`${monthName} ${year}`;


	/*
	 * Find how far the first date
	 * is from Monday.
	 *
	 * Monday = 0
	 * Sunday = 6
	 */

	const firstDay =
		(
			new Date(
				year,
				month,
				1
			).getDay() + 6
		) % 7;


	const daysInMonth =
		new Date(
			year,
			month + 1,
			0
		).getDate();


	/*
	 * Work out whether the calendar
	 * needs 4, 5, or 6 rows.
	 */

	const weeks =
		Math.ceil(
			(firstDay + daysInMonth) / 7
		);

	const totalCells =
		weeks * 7;


	/*
	 * Start on the Monday before,
	 * or on, the first of the month.
	 */

	const startDate =
		new Date(
			year,
			month,
			1 - firstDay
		);


	/*
	 * Render every visible date,
	 * including adjacent months.
	 */

	for (
		let i = 0;
		i < totalCells;
		i++
	) {

		const date =
			new Date(startDate);

		date.setDate(
			startDate.getDate() + i
		);

		renderDateCell(date);

	}


	/*
	 * Update controls.
	 */

	availabilityOptions.classList.toggle(
		"visible",
		selectedDate !== null
	);

	calendarContainer.classList.toggle(
		"date-selected",
		selectedDate !== null
	);

	updateAvailabilityOptions();

	renderSelectedTime();

}



/* -------------------------
   Render Date Cell
------------------------- */

function renderDateCell(date) {

	const dateKey =
		getDateKey(date);

	const dateData =
		getDateData(dateKey);


	const cell =
		document.createElement("div");

	cell.classList.add(
		"day"
	);

	cell.dataset.dateKey =
		dateKey;


	/*
	 * Selected date.
	 */

	if (selectedDate === dateKey) {

		cell.classList.add(
			"selected"
		);

	}


	/*
	 * Availability state.
	 */

	if (dateData.state) {

		cell.classList.add(
			dateData.state
		);

	}


	/*
	 * Date number.
	 */

	const dateNumber =
		document.createElement("div");

	dateNumber.classList.add(
		"date"
	);

	dateNumber.textContent =
		date.getDate();

	cell.appendChild(
		dateNumber
	);


	/*
	 * Optional time information.
	 */

	renderCellTime(
		cell,
		dateData
	);


	/*
	 * Select date.
	 */

	cell.addEventListener(
		"click",
		() => selectDate(dateKey)
	);


	calendar.appendChild(
		cell
	);

}



/* -------------------------
   Select Date
------------------------- */

function selectDate(dateKey) {

	/*
	 * Remove an unfinished Until/After
	 * selection from the previous date.
	 */

	clearIncompleteTime(
		selectedDate
	);


	selectedDate =
		dateKey;

	renderCalendar();

}



/* -------------------------
   Availability Options
------------------------- */

function updateAvailabilityOptions() {

	const selectedState =
		selectedDate
			? availability[selectedDate]?.state
			: null;


	optionButtons.forEach(button => {

		button.classList.toggle(
			"selected",
			button.dataset.state ===
				selectedState
		);

	});

}


optionButtons.forEach(button => {

	button.addEventListener(
		"click",
		() => {

			if (!selectedDate) {

				return;

			}


			const state =
				button.dataset.state;


			/*
			 * × clears the date entirely
			 * and closes the editor.
			 */

			if (state === "clear") {

				delete availability[
					selectedDate
				];

				selectedDate =
					null;

				renderCalendar();

				return;

			}


			/*
			 * Preserve time information
			 * when switching AM ↔ PM.
			 */

			const existingData =
				availability[selectedDate];

			const timedState =
				isTimedState(state);


			availability[selectedDate] = {

				state,

				timeType:
					timedState
						? existingData?.timeType || ""
						: "",

				time:
					timedState
						? existingData?.time || ""
						: ""

			};


			renderCalendar();

		}
	);

});



/* -------------------------
   Clear Incomplete Time
------------------------- */

function clearIncompleteTime(dateKey) {

	if (!dateKey) {

		return;

	}


	const dateData =
		availability[dateKey];


	/*
	 * Until/After without an entered
	 * time should not be saved.
	 */

	if (
		dateData?.timeType &&
		!dateData.time
	) {

		dateData.timeType =
			"";

		dateData.time =
			"";

	}

}



/* -------------------------
   Render Cell Time
------------------------- */

function renderCellTime(
	cell,
	dateData
) {

	if (
		!isTimedState(dateData.state) ||
		!dateData.timeType
	) {

		return;

	}


	const timeDisplay =
		document.createElement("div");

	timeDisplay.classList.add(
		"time-container"
	);


	/*
	 * Until / After label.
	 */

	const timeLabel =
		document.createElement("span");

	timeLabel.textContent =
		dateData.timeType === "until"
			? "Until"
			: "After";

	timeDisplay.appendChild(
		timeLabel
	);


	/*
	 * Entered time.
	 */

	if (dateData.time) {

		const timeText =
			document.createElement("span");

		timeText.textContent =
			dateData.time;

		timeDisplay.appendChild(
			timeText
		);

	}


	cell.appendChild(
		timeDisplay
	);

}



/* -------------------------
   Update Selected Cell
------------------------- */

function updateSelectedCell() {

	if (!selectedDate) {

		return;

	}


	const cell =
		calendar.querySelector(
			`.day[data-date-key="${selectedDate}"]`
		);


	if (!cell) {

		return;

	}


	const dateData =
		availability[selectedDate];


	/*
	 * Availability colour.
	 */

	cell.classList.remove(
		"morning",
		"evening",
		"unavailable"
	);


	if (dateData?.state) {

		cell.classList.add(
			dateData.state
		);

	}


	/*
	 * Replace the time display.
	 */

	cell
		.querySelector(".time-container")
		?.remove();


	if (dateData) {

		renderCellTime(
			cell,
			dateData
		);

	}

}



/* -------------------------
   Selected Time Controls
------------------------- */

function renderSelectedTime() {

	selectedTime.innerHTML =
		"";


	selectedTime.classList.toggle(
		"visible",
		selectedDate !== null
	);


	if (!selectedDate) {

		return;

	}


	const dateData =
		availability[selectedDate];


	/*
	 * Only AM and PM have
	 * Until / After controls.
	 */

	if (
		dateData &&
		isTimedState(dateData.state)
	) {

		renderTimeControls(
			dateData
		);

	}


	/*
	 * Save button always appears
	 * while a date is selected.
	 */

	const saveButton =
		createButton(
			"Save",
			"save-selection"
		);


	saveButton.addEventListener(
		"click",
		saveSelectedDate
	);


	selectedTime.appendChild(
		saveButton
	);

}



/* -------------------------
   Time Controls
------------------------- */

function renderTimeControls(dateData) {

	const timeType =
		document.createElement("div");

	timeType.classList.add(
		"time-type"
	);


	const untilButton =
		createButton("Until");

	const afterButton =
		createButton("After");


	const separator =
		document.createElement("span");

	separator.textContent =
		"/";


	const timeInput =
		document.createElement("input");

	timeInput.type =
		"time";

	timeInput.step =
		900;

	timeInput.classList.add(
		"time-input"
	);

	timeInput.value =
		dateData.time || "";


	/*
	 * Update button styling and
	 * input enabled state.
	 */

	function updateTimeControls() {

		untilButton.classList.toggle(
			"active",
			dateData.timeType === "until"
		);

		afterButton.classList.toggle(
			"active",
			dateData.timeType === "after"
		);

		timeInput.disabled =
			!dateData.timeType;

	}


	/*
	 * Toggle Until / After.
	 */

	function toggleTimeType(type) {

		dateData.timeType =
			dateData.timeType === type
				? ""
				: type;

		updateTimeControls();

		updateSelectedCell();

	}


	untilButton.addEventListener(
		"click",
		() => toggleTimeType("until")
	);


	afterButton.addEventListener(
		"click",
		() => toggleTimeType("after")
	);


	/*
	 * Save selected time immediately.
	 */

	timeInput.addEventListener(
		"change",
		event => {

			dateData.time =
				event.target.value;

			updateSelectedCell();

		}
	);


	timeType.append(
		untilButton,
		separator,
		afterButton,
		timeInput
	);


	selectedTime.appendChild(
		timeType
	);


	updateTimeControls();

}



/* -------------------------
   Save Selected Date
------------------------- */

function saveSelectedDate() {

	clearIncompleteTime(
		selectedDate
	);

	selectedDate =
		null;

	renderCalendar();

}



/* -------------------------
   Month Navigation
------------------------- */

function changeMonth(amount) {

	/*
	 * Prevent rapid taps from
	 * skipping several months.
	 */

	if (monthNavigationLocked) {

		return;

	}


	monthNavigationLocked =
		true;


	/*
	 * Set the date to 1 first so
	 * shorter months cannot cause
	 * navigation to skip a month.
	 */

	currentDate.setDate(1);

	currentDate.setMonth(
		currentDate.getMonth() + amount
	);

	selectedDate =
		null;

	renderCalendar();


	/*
	 * Allow another month change
	 * after a short delay.
	 */

	setTimeout(
		() => {

			monthNavigationLocked =
				false;

		},
		200
	);

}


previousButton.addEventListener(
	"click",
	() => changeMonth(-1)
);


nextButton.addEventListener(
	"click",
	() => changeMonth(1)
);


todayButton.addEventListener(
	"click",
	() => {

		currentDate =
			new Date();

		selectedDate =
			null;

		renderCalendar();

	}
);



/* -------------------------
   Convert Calendar to Image
------------------------- */

convertImageButton.addEventListener(
	"click",
	async () => {

		calendarContainer.classList.add(
			"exporting"
		);


		/*
		 * Wait for the browser to apply
		 * the export-only CSS.
		 */

		await new Promise(resolve => {

			requestAnimationFrame(() => {

				requestAnimationFrame(
					resolve
				);

			});

		});


		try {

			const canvas =
				await html2canvas(
					calendarContainer,
					{
						scale: 2,
						backgroundColor: null
					}
				);


			calendarImage.src =
				canvas.toDataURL(
					"image/png"
				);


			imagePreview.classList.add(
				"visible"
			);

			calendarContainer.classList.add(
				"previewing"
			);

		}

		finally {

			/*
			 * Always restore export mode,
			 * even if image generation fails.
			 */

			calendarContainer.classList.remove(
				"exporting"
			);

		}

	}
);



/* -------------------------
   Return to Editor
------------------------- */

returnEditorButton.addEventListener(
	"click",
	() => {

		calendarContainer.classList.remove(
			"previewing"
		);

		imagePreview.classList.remove(
			"visible"
		);

		calendarImage.src =
			"";

	}
);



/* -------------------------
   Initial Render
------------------------- */

renderCalendar();