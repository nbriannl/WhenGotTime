/*
 Dummy Data
 https://nusmods.com/timetable/2016-2017/sem1?CS1231[SEC]=1&CS1231[TUT]=14&CS1010[SEC]=33&CS1010[TUT]=C08&PC1221[TUT]=T1&PC1221[LEC]=SL1&PC1221[LAB]=A1&MA1521[LEC]=SL1&MA1521[TUT]=T02&LSM1301[LEC]=SL2
 https://nusmods.com/timetable/2016-2017/sem1?CS1010[SEC]=32&CS1010[TUT]=T21&MA1521[LEC]=SL1&MA1521[TUT]=T03&GET1006[SEC]=12&MA1101R[TUT]=T13&MA1101R[LEC]=SL1&MA1101R[LAB]=B06&CS1231[SEC]=1&CS1231[TUT]=5
 https://nusmods.com/timetable/2016-2017/sem1?CS1231[TUT]=14&CS1231[SEC]=2&MA1521[LEC]=SL1&MA1521[TUT]=T02&LSM1301[LEC]=SL2&CS1101S[LEC]=1&CS1101S[REC]=3&CS1101S[TUT]=5&GES1010[LEC]=1&GES1010[TUT]=E5
 https://nusmods.com/timetable/2016-2017/sem1?CS1231[SEC]=1&CS1231[TUT]=14&CS1010[SEC]=33&CS1010[TUT]=C08&MA1521[LEC]=SL1&MA1521[TUT]=T06&LSM1301[LEC]=SL2&MA1101R[LAB]=B05&MA1101R[TUT]=T06&MA1101R[LEC]=SL2 
 https://nusmods.com/timetable/2016-2017/sem1?CS1231[SEC]=1&CS1231[TUT]=14&CS1010[SEC]=33&CS1010[TUT]=C08&MA1521[LEC]=SL1&MA1521[TUT]=T06&LSM1301[LEC]=SL1&MA1101R[TUT]=T11&MA1101R[LEC]=SL2&MA1101R[LAB]=B06
 https://nusmods.com/timetable/2016-2017/sem1?CS2105[LEC]=1&CS2105[TUT]=2&CS3235[LEC]=1&CS3235[TUT]=3&CS2101[SEC]=6&CS2103T[TUT]=T6&CS4236[LEC]=1

 http://modsn.us/XEGC0
 http://modsn.us/34Yuh
 http://modsn.us/j1boN
 http://modsn.us/0iJ7C
 http://modsn.us/L3ujR
 http://modsn.us/hwwlZ
 */

//timeslot array
var days = 6; //Monday to Saturday
var half_hours = 48;
var timeslots_arr_odd = new Array(days);
var timeslots_arr_even = new Array(days);

for (i = 0; i < days; i++) {
    timeslots_arr_odd[i] = new Array(half_hours);
    timeslots_arr_even[i] = new Array(half_hours);
    for (j = 0; j < half_hours; j++) {
        timeslots_arr_odd[i][j] = [true];
        timeslots_arr_even[i][j] = [true];
    }
}

var table_row;
var link_index = 0;
var links_list = [];
var active_tab = 1;

$(document).ready(function () {
    $('#add-entry').on('submit', function (e) {
        e.preventDefault();
        var link = $('#url').val();
        if (link.indexOf('nusmods.com') >= 0 || link.indexOf('modsn.us') >= 0) {
            var data = {
                url: link,
                format: 'json'
            };
            $.ajax({
                dataType: 'jsonp',
                url: 'http://api.longurl.cpwc.me/v2/expand',
                data: data,
                success: function (response) {
                    $('#links_list').append(response['long-url'] + '<br>');
                    try {
                        parseLink(response['long-url']);
                    }
                    catch (err) {
                        invalidLink();
                        $('#add-entry')[0].reset();//resets form
                        return; //exits function
                    }
                    displayOnTable();
                    checkLinkTable();
                    validLink();
                    $('#add-entry')[0].reset(); //resets form
                }
            });
        } else if (link === "") {
            return;
        } else {
            invalidLink();
            $('#add-entry')[0].reset(); //resets form
        }
    });

    $('ul.tabs').each(function () {
        // For each set of tabs, we want to keep track of
        // which tab is active and its associated content
        var $active, $content, $links = $(this).find('a');

        // If the location.hash matches one of the links, use that as the active tab.
        // If no match is found, use the first link as the initial active tab.
        $active = $($links.filter('[href="' + location.hash + '"]')[0] || $links[0]);
        $active.addClass('active');

        $content = $($active[0].hash);
        active_tab = $active.attr("href");

        // Hide the remaining content
        $links.not($active).each(function () {
            $(this.hash).hide();
        });

        // Bind the click event handler
        $(this).on('click', 'a', function (e) {
            // Make the old tab inactive.
            $active.removeClass('active');
            $content.hide();

            // Update the variables with the new link and content
            $active = $(this);
            $content = $(this.hash);

            // Make the tab active.
            $active.addClass('active');
            $content.show();
            active_tab = $active.attr("href");

            // Prevent the anchor's default click action
            e.preventDefault();
        });
    });

    //hover over cell to show mods
    $('.cell').mouseenter(function (e) {
        var cell_row = $(this).parent().index(); //get position of cell
        var cell_col = $(this).index() + 15;

        if (hasClass(cell_row, cell_col, active_tab)) {
            var num_mods;
            if (active_tab === "#odd") {
                num_mods = timeslots_arr_odd[cell_row][cell_col].length;
            } else {
                num_mods = timeslots_arr_even[cell_row][cell_col].length;
            }
            for (i = 1; i < num_mods; i++) { //add mods to hovermods div
                var mod;
                if (active_tab === "#odd") {
                    mod = timeslots_arr_odd[cell_row][cell_col][i];
                } else {
                    mod = timeslots_arr_even[cell_row][cell_col][i];
                }
                //format and present mod in the div by appending to it
                mod = mod.split('[');
                var mod_code = mod[0];
                var lesson_type = mod[1].replace(/]/gi, "");
                lesson_type = getClassType(lesson_type);
                $('#hovermods').append("<p>" + i + ". " + mod_code + " " + lesson_type + "</p>");
            }
            $(this).mousemove(function (e) {
                $('#hovermods').show();
                //allows hovermods div to follow the mouse
                //extra displacement prevents the mouse from entering the div
                $('#hovermods').css('top', e.clientY + 8).css('left', e.clientX + 8);
            });
        }
    }).mouseout(function () {
        $('#hovermods').hide();
        $('#hovermods').text("Ongoing Lessons"); //reset hovermods div
    });

    //toggles the table of links by clicking the view links button
    $('#viewlinks').click(function () {
        if ($(this).val() === "View/Remove Links") {
            $(this).val('Hide Links');
            $("#linktable").toggle();
            checkLinkTable();
        } else {
            $(this).val('View/Remove Links');
            $("#linktable").toggle();
        }
    });

    //removes links by clicking the remove button
    $('#linktable').on('click', 'input[type="button"]', function () {
        var index = $(this).closest('tr').attr('id');
        removeLink(links_list, index);
        $(this).closest('tr').remove();
        $('#linktable').find('tr').each(function (i) {
            $(this).find('td').eq(2).text(i + ".");
        });
        checkLinkTable();
    });
    $('#linktable').on('change', 'input[type="checkbox"]', function () {
        var index = $(this).closest('tr').attr("id");
        if ($(this).prop("checked") === false) { //if the checkbox is unchecked
            removeLink(links_list, index);
        } else {
            fillTimeslot(links_list[index][0], links_list[index][1], links_list[index][2], true);
            displayOnTable();
        }
    });

    //changes the cursor to a fat pointer when hovering over day and time
    $('.day, .time').css('cursor', 'pointer');

    $('.day, .time').tooltip({
        container: 'body'
    });

    //block out individual cells
    $('.cell').click(function () {
        $(this).toggleClass('cblocked');
    });

    //blocks out one column by time (vertical)
    $('.time').click(function () {
        $(this).toggleClass('strikethrough');
        var position = $(this).index();
        $(this).parent().parent().next().children().each(function () {
            $(this).children().eq(position * 2 - 1).toggleClass('vblocked');
            $(this).children().eq(position * 2).toggleClass('vblocked');
        });
    });

    //blocks out one row by day (horizontal)
    $('.day').click(function () {
        $(this).toggleClass('strikethrough');
        $(this).nextAll().toggleClass('hblocked');
    })
});

//alerts the user that the link was not valid
function invalidLink() {
    $('#feedback-text').text("Invalid link!");
    $('#feedback').css('background-color', 'pink').fadeOut(50).fadeIn(100).css('text-align', 'center');
}

function validLink() {
    $('#feedback-text').text("Link successfully added!");
    $('#feedback').css('background-color', '#ADFF2F').fadeOut(50).fadeIn(100).css('text-align', 'center');
}

function removeLink(links_list, index) {
    unfillTimeslots(links_list[index][0], links_list[index][1], links_list[index][2]);
    removeFromTable();
}

function checkLinkTable() {
    var count = $("#body").children().length;
    if (count > 0) {
        $("#no-link").text("");
        $("#no-link").nextAll().show();
    } else {
        $("#no-link").text("No links to show!");
        $("#no-link").nextAll().hide();
    }
}

function unfillTimeslots(year, sem, mods) {
    var class_num;
    var mod_code;
    var start_time;
    var end_time;
    var mod_timetable;
    var day;
    var current_mod;
    var class_type;
    var mod_display;
    var array1, array2;
    var index;

    for (i = 0; i < mods.length; i++) {
        current_mod = mods[i];
        current_mod = current_mod.split('=');
        class_num = current_mod[1];
        mod_display = current_mod[0];
        current_mod = current_mod[0].split('[');
        mod_code = current_mod[0];
        class_type = current_mod[1].replace(/]/gi, "");
        class_type = getClassType(class_type);

        //ajax call to get json data from nusmods api
        $.ajax({
            async: false, //disable asynchronous so that ajax will run in loop
            url: "http://api.nusmods.com/" + year + "/" + sem + "/modules/" + mod_code + ".json"
        }).done(function (data) {
            var mod_timetable = data.Timetable; //contains array of objects
            var current_class;

            //loop through objects, find all the class numbers
            for (j = 0; j < mod_timetable.length; j++) {
                if (mod_timetable[j].LessonType === class_type && mod_timetable[j].ClassNo === class_num) {
                    //get start and end time
                    start_time = (Math.floor(mod_timetable[j].StartTime / 100)) * 2;
                    end_time = (Math.floor(mod_timetable[j].EndTime / 100)) * 2;
                    if (mod_timetable[j].StartTime % 100 !== 0) {
                        start_time++;
                    }
                    if (mod_timetable[j].EndTime % 100 !== 0) {
                        end_time++;
                    }
                    day = mod_timetable[j].DayText;
                    day = dayToNum(day); //convert text day to numerical
                    //change array accordingly
                    for (k = start_time; k < end_time; k++) {
                        deleteFromArray(timeslots_arr_odd[day][k], timeslots_arr_even[day][k], mod_display);
                    }
                }
            }
        });
    }
}

function deleteFromArray(arr1, arr2, mod_display) {
    index1 = arr1.indexOf(mod_display);
    index2 = arr2.indexOf(mod_display);

    if (index1 > -1) {
        arr1.splice(index1, 1);
        if (arr1.length === 1) {
            arr1[0] = true;
        }
    }
    if (index2 > -1) {
        arr2.splice(index2, 1);
        if (arr2.length === 1) {
            arr2[0] = true;
        }
    }
}

//we only need the second half of the link
function parseLink(link) {
    var link_num = link_index + 1;
    table_row = $('<tr>');
    table_row.attr('id', link_index);
    link_index++;
    table_row.append($('<td>').html('<input type="button" class="btn btn-xs" value="Remove"></input>'));
    table_row.append($('<td>').html('<input type="checkbox" checked= "checked"/>'));
    table_row.append($('<td>').text($("#linktable tbody tr:last").index() + 2 + "."));

    link = link.split('timetable/');
    link = link[1];
    link = link.split('/');
    var year = link[0];
    link = link[1].split('?');
    var sem = link[0];
    sem = sem.replace(/sem/gi, ""); //formats "sem2" to 2
    var mods = link[1].split('&');

    var innerArray = [];
    innerArray.push(year);
    innerArray.push(sem);
    innerArray.push(mods);
    links_list.push(innerArray);

    fillTimeslot(year, sem, mods, false);
}

//display the link on the table
function displayOnTable() {
    var row;
    var col;
    $('#timetable').find('td').each(function (index) {
        col = index % 32 + 16; //need a displacemen of 8 since 24 cols in array
        row = Math.floor(index / 32); //16 cols in a row depicted in table
        if (timeslots_arr_odd[row][col][0] === false) {
            $(this).addClass('unavailable');
        }
    });
    $('#even-timetable').find('td').each(function (index) {
        col = index % 32 + 16; //need a displacemen of 8 since 24 cols in array
        row = Math.floor(index / 32); //16 cols in a row depicted in table
        if (timeslots_arr_even[row][col][0] === false) {
            $(this).addClass('unavailable');
        }
    });
}

//remove the link from the table
function removeFromTable() {
    var row;
    var col;
    $('#timetable').find('td').each(function (index) {
        col = index % 32 + 16; //need a displacemen of 8 since 24 cols in array
        row = Math.floor(index / 32); //16 cols in a row depicted in table
        if (timeslots_arr_odd[row][col][0] === true) {
            $(this).removeClass('unavailable');
        }
    });
    $('#even-timetable').find('td').each(function (index) {
        col = index % 32 + 16; //need a displacemen of 8 since 24 cols in array
        row = Math.floor(index / 32); //16 cols in a row depicted in table
        if (timeslots_arr_even[row][col][0] === true) {
            $(this).removeClass('unavailable');
        }
    });
}

//modifies array to indicate availability
//does an ajax call to retrieve json object
//an example url is
//http://api.nusmods.com/2015-2016/2/modules/GES1010.json
//this can be broken up into url/year/sem/modules/modulecode
//GET1006[SEC]=10
//10 is the lesson number
//data.Timetable returns an array of objects
function fillTimeslot(year, sem, mods, checkbox) {
    var class_num;
    var mod_code;
    var start_time;
    var end_time;
    var day;
    var current_mod;
    var class_type;
    var mod_display;
    var temp_mod;
    var week;
    var weird;

    for (i = 0; i < mods.length; i++) {
        current_mod = mods[i];
        current_mod = current_mod.split('=');
        class_num = current_mod[1];
        mod_display = current_mod[0];
        current_mod = current_mod[0].split('[');
        mod_code = current_mod[0];

        class_type = current_mod[1].replace(/]/gi, "");
        class_type = getClassType(class_type);

        //ajax call to get json data from nusmods api
        $.ajax({
            async: false, //disable asynchronous so that ajax will run in loop
            url: "http://api.nusmods.com/" + year + "/" + sem + "/modules/" + mod_code + ".json"
        }).done(function (data) {
            var mod_timetable = data.Timetable; //contains array of objects
            var current_class;
            //loop through objects, find all the class numbers
            //console.log(mod_timetable[0]);
            for (j = 0; j < mod_timetable.length; j++) {
                //console.log(current_class);
                if (mod_timetable[j].LessonType === class_type && mod_timetable[j].ClassNo === class_num) {
                    //get start and end time
                    week = mod_timetable[j].WeekText;
                    start_time = (Math.floor(mod_timetable[j].StartTime / 100)) * 2;
                    end_time = (Math.floor(mod_timetable[j].EndTime / 100)) * 2;
                    if (mod_timetable[j].StartTime % 100 !== 0) {
                        start_time++;
                    }
                    if (mod_timetable[j].EndTime % 100 !== 0) {
                        end_time++;
                    }
                    day = mod_timetable[j].DayText;
                    day = dayToNum(day); //convert text day to numerical

                    //change array accordingly
                    for (k = start_time; k < end_time; k++) {
                        placeInArray(week, timeslots_arr_odd, timeslots_arr_even, day, k, mod_display);
                    }
                }
            }
        });
        if (checkbox === false) {
            if (temp_mod !== mod_code) {
                table_row.append($('<td>').text(mod_code));
            }
            temp_mod = mod_code;
        }
    }
    if (checkbox === false) {
        $("#linktable").append(table_row);
    }
}

//updates the respective array's values
// arr1 is oddweek array, arr2 is even week array, k is time/col
function placeInArray(week, arr1, arr2, day, k, mod_display) {
    if (week === "Odd Week") {
        arr1[day][k].push(mod_display);
        arr1[day][k][0] = false;
    } else if (week === "Even Week") {
        arr2[day][k].push(mod_display);
        arr2[day][k][0] = false;
    } else { //push to both odd and even weeks
        arr1[day][k].push(mod_display);
        arr1[day][k][0] = false;
        arr2[day][k].push(mod_display);
        arr2[day][k][0] = false;
    }
}

//converts day to its corresponding numerical value
function dayToNum(day) {
    if (day === "Monday") {
        return 0;
    } else if (day === "Tuesday") {
        return 1;
    } else if (day === "Wednesday") {
        return 2;
    } else if (day === "Thursday") {
        return 3;
    } else if (day === "Friday") {
        return 4;
    } else if (day === "Saturday") {
        return 5;
    }
}

//converts abbrevated string to long string used in the API's JSON
function getClassType(lesson) {
    if (lesson === "LEC") {
        return "Lecture";
    } else if (lesson === "LAB") {
        return "Laboratory";
    } else if (lesson === "SEC") {
        return "Sectional Teaching";
    } else if (lesson === "TUT") {
        return "Tutorial";
    } else if (lesson === "REC") {
        return "Recitation";
    }
}

//checks if classes are happening at a particular timeslot
//0 for even, 1 for odd
function hasClass(row, col, week) {
    if (week === 0) {
        return timeslots_arr_even[row][col][0] === false;
    } else {
        return timeslots_arr_odd[row][col][0] === false;
    }
}