$(document).ready(function () {
	calendar = $('#calendar');
	var err          = $(".err");
	var eventTeamMap = {};
	var firstLoad    = true;
	calendar.fullCalendar({
		allDaySlot: false,
		defaultView: 'agendaDay',
		defaultDate: startDate,
		editable: false,
		eventAfterAllRender: function () {
			calendar.fullCalendar('clientEvents').forEach(function (curEvent) {
				if (curEvent.after) {
					$("." + curEvent._id + " .fc-content .fc-title").after("<div class='cur-event-select'>" + curEvent.after + "</div>");
					$("." + curEvent.className[0] + " .fc-content").after("<div class='event-remove' data-event='" + curEvent._id + "'><span class='glyphicon glyphicon-remove'></span></div>");
				}
			});
		},
		eventBackgroundColor: "#920505",
		eventBorderColor: "transparent",
		eventSources: finalChoices,
		eventClick: function (calEvent, jsEvent) {
			var team     = $("select[name='team'] option:checked");
			var teamName = team.text();
			if ((calEvent.status !== "full" || (calEvent.status === "full" && calEvent.originalSelection === true)) &&
			jsEvent.target.className !== "glyphicon glyphicon-remove") {
				// If the currently selected time slot is not full,
				// OR if it is full but it was originally selected by this team when the page loaded
				var eventSource = calEvent.source;

				// Add the currently selected team to the current slot's selected teams
				if (!calEvent.selectedTeam) {
					calEvent.selectedTeam = [team.text()];
				}
				else {
					if (calEvent.selectedTeam.indexOf(team.text()) === -1) {
						// If the current slot already has some selected teams, make sure this team isn't already there
						calEvent.selectedTeam.push(team.text());
					}
				}

				// Reset styling of this slot
				calEvent = resetSlotStyles(calEvent);

				// Find the other event that this team previously selected, and reset it
				eventSource.events.forEach(function (curEvent) {
					if (curEvent.selectedTeam) {
						if (((curEvent.selectedTeam.indexOf(teamName) !== -1) && (curEvent._id !== calEvent._id)) || (curEvent.modified === true)){
							// The current event was previously selected by this team,
							// AND it is not the same as the currently selected slot
							curEvent.selectedTeam.splice(curEvent.selectedTeam.indexOf(teamName), 1);
							curEvent = resetSlotStyles(curEvent);
							curEvent.selectedTeam.sort();
						}
					}
				});
			}
			else if (jsEvent.target.className === "glyphicon glyphicon-remove") {
				// Only remove this team from this slot if the currently selected team exists on the slot at all
				if (calEvent.selectedTeam.indexOf(teamName) !== -1) {
					// Get a new list of teams that belong to this time slot, minus the current team
					calEvent.selectedTeam.splice(calEvent.selectedTeam.indexOf(teamName), 1);
					// Reset the slot and get a new slot back
					calEvent = resetSlotStyles(calEvent);
					calEvent.selectedTeam.sort();
					calEvent.selected = true;
					calEvent.modified = true;
					if      (teamMap.indexOf(teamName) === 0) {
						calEvent.selected1       = true;
					}
					else if (teamMap.indexOf(teamName) === 1) {
						calEvent.selected2       = true;
					}
					else if (teamMap.indexOf(teamName) === 2) {
						calEvent.selected3       = true;
					}
				}
			}
			calendar.fullCalendar('renderEvent', calEvent);
		},
		eventOverlap: false,
		header: {
			left: '',
			center: '',
			right: ''
		},
		height: "auto",
		minTime: '7:00',
		maxTime: '17:00',
		slotDuration: '00:10:00',
		slotEventOverlap: false,
		timezone: 'America/New York'
	});
});

/**
 * Handles form submission and appends necessary datum
 * @returns {boolean}
 */
function eventHandler () {
	var eventSources   = calendar.fullCalendar('getEventSources');
	var form           = $("form[onsubmit='eventHandler()']");
	var seen           = [];
	var selectedTeam   = $("select[name='team'] option:checked");
	console.log(eventSources);
	var stringEventSo  = JSON.stringify(eventSources, function (key, val) {
		if (val != null && typeof val == "object") {
			if (seen.indexOf(val) >= 0) {
				return;
			}
			seen.push(val);
		}
		return val;
	});
	form.append("<input type='hidden' name='selectedTeamNum' value='" + selectedTeam.attr("counter") + "' />");
	form.append("<input type='hidden' name='selectedTeamName' value='" + selectedTeam.text() + "' />");
	form.append("<input type='hidden' name='clientEvents' value='" + stringEventSo + "' />");
	return true;
}

/**
 * Resets the after property of *event*
 * The eventAfterAllRender callback function on the current calendar.io event is responsible for actually changing
 * the property in the frontend. This simply resets the property based off of all teams that belong to this event.
 * @param event: A valid calendar.io event
 * @returns event: A valid calendar.io event once the `after` property has been adjusted
 */
function resetSlotStyles (event) {
	// Resets the selection status of this event, these values get set later if need be
	delete event.modified;
	delete event.selected;
	delete event.selected1;
	delete event.selected2;
	delete event.selected3;

	if (event.selectedTeam) {
		if (event.selectedTeam.length === 0) {
			// No teams selected this slot
			event.after           = null;
			event.backgroundColor = "#920505";
		}
		else if (event.selectedTeam.length === 1) {
			// One team selected this slot
			event.after    = "Current Selection: " + event.selectedTeam[0];
			event.selected = true;

			// Adjust the background color and selection status of the current event,
			// based on the team that is currently selecting this slot.
			// teamMap is determined from the teams currently registered for this competition and belonging to this school
			
			if      (teamMap.indexOf(event.selectedTeam[0]) === 0) {
				event.backgroundColor = "#168F16";
				event.selected1       = true;
			}
			else if (teamMap.indexOf(event.selectedTeam[0]) === 1) {
				event.backgroundColor = "#106B6B";
				event.selected2       = true;
			}
			else if (teamMap.indexOf(event.selectedTeam[0]) === 2) {
				event.backgroundColor = "#AA6C39";
				event.selected3       = true;
			}
		}
		else if (event.selectedTeam.length === 2) {
			// Two teams selected this slot
			// Find out which teams selected this slot

			event.after           = "Current Selection: " + event.selectedTeam[0] + " & " + event.selectedTeam[1];
			event.backgroundColor = "#567714";
			event.selected        = true;

			// Determine selection status of the first team
			if      (teamMap.indexOf(event.selectedTeam[0]) === 0) {
				event.selected1       = true;
			}
			else if (teamMap.indexOf(event.selectedTeam[0]) === 1) {
				event.selected2       = true;
			}
			else if (teamMap.indexOf(event.selectedTeam[0]) === 2) {
				event.selected3       = true;
			}

			// Determine selection status of the second team
			if      (teamMap.indexOf(event.selectedTeam[1]) === 0) {
				event.selected1       = true;
			}
			else if (teamMap.indexOf(event.selectedTeam[1]) === 1) {
				event.selected2       = true;
			}
			else if (teamMap.indexOf(event.selectedTeam[1]) === 2) {
				event.selected3       = true;
			}
		}
		else if (event.selectedTeam.length === 3) {
			// Three teams selected this slot
			event.after           = "Current Selection: " + event.selectedTeam[0] + ", " +
				event.selectedTeam[1] + ", and " +
				event.selectedTeam[2];
			event.backgroundColor = "#882D60";
			event.selected        = true;
			event.selected1       = true;
			event.selected2       = true;
			event.selected3       = true;
		}
	}
	return event;
}

/**
 * Prompts the user to reset their time slots. If the user confirms it, a form is generated with the appropriate information
 * and submitted to the server in order to reset all the time slots.
 * @returns {boolean}
 */
function resetSelections () {
	if (confirm("This will reset all of your currently selected events. Are you sure you want to do this?") === true) {
		$('<form method="post"><input type="hidden" name="action" value="slot_reset"></form>').appendTo('body').submit();
	}
	else {
		return false;
	}
}
