var success = document.getElementById('success');
var form = document.forms[0];

// =============================================================
// Form submit functions
// =============================================================

function submitOnEnterKey(submitFunction, targetForm) {
    targetForm = targetForm || form;
    var runOnKeydown = function(e) { if (e.keyCode === 13) submitFunction() };
    var children = targetForm.childNodes;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.id && child.id === 'js-admin-info')
            submitOnEnterKey(submitFunction, child);
        var type = child.getAttribute('type');
        if (type === 'text' || type === 'email' || type === 'password' ||
            type === 'number' || type === 'phone')
            child.onkeydown = runOnKeydown;
    }
}

function submitLogin() {
    var data = {
        email: form.email2.value,
        password: form.password2.value
    };
    localStorage.email = data.email;
    fetch('/login', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(function(res) {
        if (!res.ok) return submitError(res);
        else return res.json().then(function(result) {
            localStorage.token = result.token;
            localStorage.id = JSON.parse(atob(result.token.split('.')[1])).id;
            getPatients();
        });
    }).catch(submitError);
}

function logout() {
    localStorage.id = '';
    localStorage.token = '';
    localStorage.patients = '';
    localStorage.display = '';
    localStorage.graphData = '';
    window.location = '/';
}

function headers() {
    return {
        'x-access-token': localStorage.token,
        'Content-Type': 'application/json'
    };
}

function submitForm() {
    var data = {};
    var errorMessage = '';
    if (form.fullName.value) data.name = form.fullName.value;
    // data.hash = form.password.value;
    if (form.password.value == form.confirmPassword.value) data.hash = form.password.value;
    if (form.email.value && !validateEmail(form.email)) {
        errorMessage += 'Email address is invalid.';
    }
    data.email = form.email.value;

    fetch('/pts', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(submitSuccess)
        .catch(submitError)
}

// surgeryType, romStart, romEnd, notes in schema????
function submitPatient(id) {
    var data = {};
    var errorMessage = '';
    if (form.name.value) data.name = form.name.value;
    if (form.email.value && !validateEmail(form.email)) {
        errorMessage += 'Email address is invalid.';
    }
    data.email = form.email.value;

    if (form.phone.value) data.phoneNumber = form.phone.value;
    if (form.rom1.value) data.hash = form.rom1.value;
    if (form.rom2.value) data.surgeryType = form.rom2.value;
    // if (form.notes.value) data.notes = form.notes.value;
    fetch('/pts/' + id + '/patients', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(submitSuccess)
        .catch(submitError)
}

function getGraphData(id) {
    fetch('/romMetrics/' + id, {
        headers: { 'Content-Type': 'application/json', 'x-access-token': localStorage.token },
        method: 'GET'
    }).then(function(res) {
        if (!res.ok) return submitError(res);
        res.json().then(function (data) {localStorage.graphData = data});
    })
        .catch(submitError);
}

// =============================================================
// Form validation functions
// =============================================================

function error(target) {
    target.style.border = '3px solid #F00';
}

function clearError(target) {
    if (target === 'message')
        return document.getElementById('js-error-message').style.visibility = 'hidden';
    target.style.border = '1px solid #888';
}

// validates and returns the sanitized string
function validatePhone(target, isRequired) {
    var phone = target.value;
    if (!phone && !isRequired) return '';
    var sanitized = '';
    for (var i = 0; i < phone.length; i++) {
        if (!isNaN(phone[i]) && phone[i] !== ' ')
            sanitized += phone[i];
    }
    if (sanitized.length !== 10) {
        error(target);
        return '';
    }
    return sanitized;
}

// returns true iff valid
function validateEmail(target, isRequired) {
    var email = target.value;
    if (!email && !isRequired) return true;
    // http://emailregex.com/
    var isValid = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
    if (!isValid) error(target);
    return isValid;
}

// add field if 'Other' provider
function validateProvider(isRequired) {
    var target = form.phoneProvider;
    if (target.value === 'other') {
        if (form['other-provider'].style.display === 'none') {
            form['other-provider'].style.display = 'inline-block';
            return false;
        }
        else {
            if (!form['other-provider'].value) {
                error(form['other-provider']);
                return false;
            } else return true;
        }
    }
    else {
        form['other-provider'].style.display = 'none';
        if (form.phoneProvider.value === 'null' && isRequired) {
            error(form.phoneProvider);
            return false;
        }
        return true;
    }
}

function validateUrl(target, isRequired) {
    if (!target.value && !isRequired) return true;
    var isValid = /^.+\.[a-zA-Z]{2,}/.test(target.value);
    if (!isValid) error(target);
    return isValid;
}

function clearForm() {
    form.reset();
    clearError('message');
    var divs = document.getElementsByClassName('hidden');
    for (var i = 0; i < divs.length; i++)
        divs[i].style.display = '';
}

// =============================================================
// Form submit callbacks
// =============================================================

function submitSuccess(res) {
    if (!res.ok) return submitError(res);
    p.innerHTML = 'Success!';
    //clearForm();
}

function submitError(res, message) {
    if (res.status >= 400 && res.status < 500)
        return res.text().then(function(message) {displayError(message)});
    if (message)
        return displayError(message);
    return displayError('There was a problem submitting your form. Please try again later.');
}

function displayError(message) {
    var errorDiv = document.getElementById('js-error-message');
    errorDiv.innerHTML = message;
    errorDiv.style.visibility = 'visible';
}

// =============================================================
//  Patients
// =============================================================

// JORDAN: login -> /patients -> request

function getPatients() {
    fetch('/pts/' + localStorage.id + '/patients?token=' + localStorage.token
    ).then(function(res) {
        if (!res.ok) throw(res);
        res.json().then(function(pts) {
            // var patients = JSON.parse(localStorage.patients);
            localStorage.patients = JSON.stringify(pts);
            localStorage.display = JSON.stringify(pts);
        });
        window.location = '/patients1';
    }).catch(submitError);
}

function displayCollapse(x) {
    var elt = document.getElementById(x);
    if (elt.style.display === 'none') elt.style.display = 'block';
    else elt.style.display = 'none'
}

function loadPatients(pts, progress) {
    var psd = JSON.parse(pts);
    // fetch patient metrics here
    for (var i = 0; i < psd.length; i++) {
        var div = document.createElement('div');
        var picbox = document.createElement('div');
        var pic = document.createElement('img');
        var prog = document.createElement('img');
        var inner = document.createElement('div');
        var name = document.createElement('div');
        var recbx = document.createElement('div');
        var p1 = document.createElement('div');
        var rec = document.createElement('div');
        var arrow = document.createElement('div');
        var collapse = document.createElement('div');

        pic.src = '../../img/profile_pic.jpg';
        pic.setAttribute('id', 'profileImg');
        prog.src = '../../img/upIcon.png';
        prog.setAttribute('id', 'upIcon');
        recbx.setAttribute('class', 'recovery-box');
        p1.setAttribute('class', 'percent1');
        // Hard coded patient data
        p1.innerHTML = "<span>70%</span>";
        arrow.setAttribute('class', 'arrow');
        arrow.setAttribute("onclick", "displayCollapse('collapse" + i + "')");
        arrow.appendChild(document.createTextNode('▼'));
        collapse.setAttribute('class', 'buttonCollapse');
        collapse.innerHTML =
            '<div class="collapse" id= "collapse' + i + '" style="display:none">' +
                '<hr><div class="space"></div>' +
                '<div class="collapse-inner">' +
                    '<div class="input-label">Shoulder</div>' +
                    '<div class="input-percent1">70%</div>' +
                    '<div class="graph-box"><img src="../../img/graph.png" id="graph"></div>' +
                '</div>' +
                '<div class="collapse-inner">' +
                    '<div class="input-label">Neck - Side</div>' +
                    '<div class="input-percent2">50%</div>' +
                    '<div class="graph-box"><img src="../../img/graph.png" id="graph"></div>' +
                '</div>' +
                '<div class="collapse-inner">' +
                    '<div class="input-label">Neck - Front</div>' +
                    '<div class="input-percent3">30%</div>' +
                    '<div class="graph-box"><img src="../../img/graph.png" id="graph"></div>' +
                '</div>' +
                '<div class="space"></div>' +
                '<a href="/patient-status" class="inspect1" id= "inspect-btn' + i + '">Inspect Patient</a>' +
            '</div>' +
            '</div>';
        rec.setAttribute('class', 'recovery');
        rec.innerHTML = "<span>Recovered</span>";
        recbx.appendChild(p1);
        recbx.appendChild(rec);
        div.setAttribute('class', 'pt-box');
        picbox.setAttribute('class', 'pic-box');
        inner.setAttribute('class', 'info-box');
        name.setAttribute('class', 'name');
        picbox.appendChild(pic);
        picbox.appendChild(prog);
        name.appendChild(document.createTextNode(psd[i].name));
        inner.appendChild(name);
        inner.appendChild(recbx);
        div.appendChild(picbox);
        div.appendChild(inner);
        div.appendChild(arrow);
        div.appendChild(collapse);
        document.getElementById('patients').appendChild(div);
    }
}

function clear() {
    var list = document.getElementById('patients');
    list.innerHTML = '';
}

function loadProgress(patients) {
    var progress = [];
    var pats = JSON.parse(patients);
    for (var i = 0; i < pats.length; i++) {
        (function(x) {
            fetch('/romMetrics/' + i + '/romMetricMeasures/?token=' + localStorage.token, {
                method: 'GET'
            }).then(function(res) {
                if (!res.ok) return submitError(res);
                console.log("Step " + x + ": " + progress);
                res.json().then(function (data) {
                    var measure = data[data.length - 1] || 0;
                    progress[x] = (measure.degreeValue / measure.nextGoal);
                });
            }).catch(submitError);
        }(i))
    }
    return progress;
}

function loadStart() {
    clear();
    var progress = loadProgress(localStorage.patients);
    loadPatients(localStorage.patients, progress);
}

function load() {
    clear();
    loadPatients(localStorage.display);
}

function search(query, array) {
    var temp = [];
    var arr = JSON.parse(array);
    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i].name.toUpperCase().includes(query.toUpperCase()))
            temp.push(arr[i]);
    }
    localStorage.display = JSON.stringify(temp);
    load();
}

function pSearch() {
    search(form.patientSearch.value, localStorage.patients);
}

function compareAlpha(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}

var ctr1 = 0;
var ctr2 = 0;

function sortAlpha() {
    ctr1++;
    var lst = JSON.parse(localStorage.display);
    if (ctr1 % 2 != 0) localStorage.display = JSON.stringify(lst.sort(compareAlpha));
    else localStorage.display = JSON.stringify(lst.sort(compareAlpha).reverse());
    load();
}

function sortProg() {
    ctr2++;
    var lst = JSON.parse(localStorage.display);
    if (ctr % 2 != 0)
        localStorage.display = JSON.stringify(lst.sort(function (a, b) { return a.progress - b.progress }));
    else localStorage.display = (lst.sort(function (a, b) { return b.progress - a.progress }));
    load();
}

// =============================================================
//  Add measure
// =============================================================

function getInjuries(id) {
    for (injury in document.getElementsByClassName('inputs')) {
        console.log(id);
    }
}

// JS date to MySQL function from:
// http://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

function submitMeasure(id, i) {
    var d = new Date();
    var data = {
        dayMeasured: d.toMysqlFormat()
    };
    if (form[i].value) data.degreeValue = form[i].value;
    fetch('/romMetrics/' + id + '/romMetricMeasures', {
        headers: {'x-access-token': localStorage.token,
            'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(data)
    }).then(function(res) {
        if (!res.ok) throw new Error('There was an error sending this measure');
    }).catch(function (err) { console.log(err) });
}

// =============================================================
//  Progress Graph
// =============================================================
var w, h;

var degreeValue = [32, 35, 40, 45];

var dayMeasured = [(new Date(2017, 3, 1)), (new Date(2017, 3, 8)), (new Date(2017, 3, 15)), (new Date(2017, 3, 22))];

var goal = 60;

var next_weeks_goal = 50;

var next_weeks_goal_date = (new Date(2017, 3, 29));

var points = [[32, 1], [35, 2], [40, 3], [45, 4]];

var goal_point = [50, 4];

var min_y = d3.min(degreeValue) - 20;

var max_y = goal + 10;

var min_x = new Date(dayMeasured[0].getTime() - (60*60*24*7*1000));

var max_x = next_weeks_goal_date;

var start_end = [min_x, max_x];

if (window.innerWidth > 1000) {
    w = 450;
    h = 455;
}

else if (window.innerWidth > 770 && window.innerWidth < 1000) {
    w = 300;
    h = 300;
}

else if (window.innerWidth > 400 && window.innerWidth < 770) {
    w = 275;
    h = 250;
}

else if (window.innerWidth < 400 && window.innerHeight > 600){
    w = 230;
    h = 230;
}

else {
    w = 180;
    h = 200;
}

var x = d3.time.scale().domain([min_x, max_x]).range([0, w]);
var y = d3.scale.linear().domain([min_y, max_y]).range([h, 50]);

var line = d3.svg.line()
    .x(function (d, i) {
        return x(dayMeasured[i]) ;
    })
    .y(function (d, i) {
        return y(degreeValue[i]);
    });

var line2 = d3.svg.line()
    .x(function (d, i) {
        return x(start_end[i]);
    })
    .y(function () {
        return y(goal);
    } );

var line3 = d3.svg.line()
    .x(function (d, i) {
        return x(next_weeks_goal_date[i]);
    })
    .y(function (d, i) {
        return y(next_weeks_goal[i]);
    });



// Add an SVG element with the desired dimensions and margin.
var graph = d3.select("#graph").append("svg")
    .attr("width", "100%")
    .attr("height", "110%")
    .append("svg:g")
    .attr("transform", "translate(20,-35)");
// create xAxis

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(5)
    .tickSize(0)
    .tickFormat(d3.time.format("%-m.%-d"))
    .tickPadding(4);


// create left yAxis
var yAxisLeft = d3.svg.axis()
    .scale(y)
    .ticks(5)
    .tickSize(0)
    .orient("left");

if (window.innerWidth > 1000) {
    // Add the x-axis.
    graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(20,453)")
        .call(xAxis);

    graph.append("svg:g")
        .attr("transform", "translate(20,0)")
        .attr("class", "y axis")
        .call(yAxisLeft);

    graph.append("svg:path").attr("d", line(degreeValue, dayMeasured))
        .attr("transform", "translate(20,10)");
    graph.append("svg:path").attr("d", line2(degreeValue, dayMeasured))
        .attr("transform", "translate(20,0)")
        .attr("class", "horizontalLine");
    graph.append("svg:path").attr("d", line3(next_weeks_goal, next_weeks_goal_date))
        .attr("transform", "translate(20,10)");


    graph.append("rect")
        .attr("class", "outerRect")
        .attr("x", 230)
        .attr("y", 95)
        .attr("width", 65)
        .attr("height", 50);

    graph.append("circle")
        .attr("class", "circleRight")
        .attr("cx", 299)
        .attr("cy", 120)
        .attr("r", 25);

    graph.append("circle")
        .attr("class", "circleLeft")
        .attr("cx", 227)
        .attr("cy", 120)
        .attr("r", 25);

    graph.append("rect")
        .attr("class", "goalRect")
        .attr("x", 228)
        .attr("y", 96.5)
        .attr("width", 70)
        .attr("height", 47);

    graph.append("text")
        .attr("x", 264)
        .attr("y", 129)
        .attr('text-anchor', 'middle')
        .attr("class", "goal")
        .text("Goal")
        .style("font-size", "30px");

    graph.selectAll(".point")
        .data(points)
        .enter().append("circle")
        .attr("class", "circles")
        .attr("cx", function (d, i) {
            return x(dayMeasured[i]);
        })
        .attr("cy", function (d, i) {
            return y(degreeValue[i]);
        })
        .attr("r", 15)
        .attr("transform", "translate(20,10)")
    ;

    graph.selectAll(".point")
        .data(goal_point)
        .enter().append("circle")
        .attr("class", "goal-point")
        .attr("cx", function (d, i) {
            return x(next_weeks_goal_date);
        })
        .attr("cy", function (d, i) {
            return y(next_weeks_goal);
        })
        .attr("r", 35)
        .attr("transform", "translate(20,10)")
    ;

}

else if (window.innerWidth > 770 && window.innerWidth < 1000) {
    // Add the x-axis.
    graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(20,200)")
        .call(xAxis);

    graph.append("svg:g")
        .attr("transform", "translate(20,0)")
        .attr("class", "y axis")
        .call(yAxisLeft);

    graph.append("svg:path").attr("d", line(degreeValue, dayMeasured))
        .attr("transform", "translate(20,0)");
    graph.append("svg:path").attr("d", line2(degreeValue, dayMeasured))
        .attr("transform", "translate(20,0)")
        .attr("class", "horizontalLine");
    graph.append("svg:path").attr("d", line3(next_weeks_goal, next_weeks_goal_date))
        .attr("transform", "translate(20,0)");


    graph.append("rect")
        .attr("class", "outerRect")
        .attr("x", 110)
        .attr("y", 65)
        .attr("width", 55)
        .attr("height", 30);

    graph.append("circle")
        .attr("class", "circleRight")
        .attr("cx", 168)
        .attr("cy", 80)
        .attr("r", 15);

    graph.append("circle")
        .attr("class", "circleLeft")
        .attr("cx", 107)
        .attr("cy", 80)
        .attr("r", 15);

    graph.append("rect")
        .attr("class", "goalRect")
        .attr("x", 108)
        .attr("y", 66.5)
        .attr("width", 62)
        .attr("height", 27);

    graph.append("text")
        .attr("y",  85)
        .attr("x", 138)
        .attr('text-anchor', 'middle')
        .attr("class", "goal")
        .text("Goal");


    graph.selectAll(".point")
        .data(points)
        .enter().append("circle")
        .attr("class", "circles")
        .attr("cx", function (d, i) {
            return x(dayMeasured[i]);
        })
        .attr("cy", function (d, i) {
            return y(degreeValue[i]);
        })
        .attr("r", 8)
        .attr("transform", "translate(20,0)")
    ;

    graph.selectAll(".point")
        .data(goal_point)
        .enter().append("circle")
        .attr("class", "goal-point")
        .attr("cx", function (d, i) {
            return x(next_weeks_goal_date);
        })
        .attr("cy", function (d, i) {
            return y(next_weeks_goal);
        })
        .attr("r", 15)
        .attr("transform", "translate(20,0)")
    ;
}

else if (window.innerWidth > 400 && window.innerWidth < 770) {
    // Add the x-axis.
    graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(20,249)")
        .call(xAxis);

    graph.append("svg:g")
        .attr("transform", "translate(20,0)")
        .attr("class", "y axis")
        .call(yAxisLeft);

    graph.append("svg:path").attr("d", line(degreeValue, dayMeasured))
        .attr("transform", "translate(20,0)");
    graph.append("svg:path").attr("d", line2(degreeValue, dayMeasured))
        .attr("transform", "translate(20,0)")
        .attr("class", "horizontalLine");
    graph.append("svg:path").attr("d", line3(next_weeks_goal, next_weeks_goal_date))
        .attr("transform", "translate(20,0)");


    graph.append("rect")
        .attr("class", "outerRect")
        .attr("x", 135)
        .attr("y", 67)
        .attr("width", 55)
        .attr("height", 30);

    graph.append("circle")
        .attr("class", "circleRight")
        .attr("cx", 193)
        .attr("cy", 82)
        .attr("r", 15);

    graph.append("circle")
        .attr("class", "circleLeft")
        .attr("cx", 132)
        .attr("cy", 82)
        .attr("r", 15);

    graph.append("rect")
        .attr("class", "goalRect")
        .attr("x", 133)
        .attr("y", 68.5)
        .attr("width", 62)
        .attr("height", 27);

    graph.append("text")
        .attr("x", 163)
        .attr("y",  87)
        .attr('text-anchor', 'middle')
        .attr("class", "goal")
        .text("Goal");


    graph.selectAll(".point")
        .data(points)
        .enter().append("circle")
        .attr("class", "circles")
        .attr("cx", function (d, i) {
            return x(dayMeasured[i]);
        })
        .attr("cy", function (d, i) {
            return y(degreeValue[i]);
        })
        .attr("r", 8)
        .attr("transform", "translate(20,0)")
    ;

    graph.selectAll(".point")
        .data(goal_point)
        .enter().append("circle")
        .attr("class", "goal-point")
        .attr("cx", function (d, i) {
            return x(next_weeks_goal_date);
        })
        .attr("cy", function (d, i) {
            return y(next_weeks_goal);
        })
        .attr("r", 15)
        .attr("transform", "translate(20,0)")
    ;

}
else if (window.innerWidth < 400 && window.innerHeight > 600) {
    // Add the x-axis.
    graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(20,228)")
        .call(xAxis);

    graph.append("svg:g")
        .attr("transform", "translate(20,0)")
        .attr("class", "y axis")
        .call(yAxisLeft);

    graph.append("svg:path").attr("d", line(degreeValue, dayMeasured))
        .attr("transform", "translate(20,0)");
    graph.append("svg:path").attr("d", line2(degreeValue, dayMeasured))
        .attr("transform", "translate(20,0)")
        .attr("class", "horizontalLine");
    graph.append("svg:path").attr("d", line3(next_weeks_goal, next_weeks_goal_date))
        .attr("transform", "translate(20,0)");

    graph.append("rect")
        .attr("class", "outerRect")
        .attr("x", 110)
        .attr("y", 64)
        .attr("width", 55)
        .attr("height", 30);

    graph.append("circle")
        .attr("class", "circleRight")
        .attr("cx", 168)
        .attr("cy", 79)
        .attr("r", 15);

    graph.append("circle")
        .attr("class", "circleLeft")
        .attr("cx", 107)
        .attr("cy", 79)
        .attr("r", 15);

    graph.append("rect")
        .attr("class", "goalRect")
        .attr("x", 108)
        .attr("y", 65.5)
        .attr("width", 62)
        .attr("height", 27);

    graph.append("text")
        .attr("x", 138)
        .attr("y",  85)
        .attr('text-anchor', 'middle')
        .attr("class", "goal")
        .text("Goal");

    graph.selectAll(".point")
        .data(points)
        .enter().append("circle")
        .attr("class", "circles")
        .attr("cx", function (d, i) {
            return x(dayMeasured[i]);
        })
        .attr("cy", function (d, i) {
            return y(degreeValue[i]);
        })
        .attr("r", 8)
        .attr("transform", "translate(20,0)")
    ;

    graph.selectAll(".point")
        .data(goal_point)
        .enter().append("circle")
        .attr("class", "goal-point")
        .attr("cx", function (d, i) {
            return x(next_weeks_goal_date);
        })
        .attr("cy", function (d, i) {
            return y(next_weeks_goal);
        })
        .attr("r", 15)
        .attr("transform", "translate(20,0)")
    ;
}

else {
    // Add the x-axis.
    graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(25,200)")
        .call(xAxis);

    graph.append("svg:g")
        .attr("transform", "translate(25,0)")
        .attr("class", "y axis")
        .call(yAxisLeft);

    graph.append("svg:path").attr("d", line(degreeValue, dayMeasured))
        .attr("transform", "translate(25,0)");
    graph.append("svg:path").attr("d", line2(degreeValue, dayMeasured))
        .attr("transform", "translate(25,0)")
        .attr("class", "horizontalLine");
    graph.append("svg:path").attr("d", line3(next_weeks_goal, next_weeks_goal_date))
        .attr("transform", "translate(25,0)");


    graph.append("rect")
        .attr("class", "outerRect")
        .attr("x", 90)
        .attr("y", 62)
        .attr("width", 55)
        .attr("height", 30);

    graph.append("circle")
        .attr("class", "circleRight")
        .attr("cx", 148)
        .attr("cy", 77)
        .attr("r", 15);

    graph.append("circle")
        .attr("class", "circleLeft")
        .attr("cx", 87)
        .attr("cy", 77)
        .attr("r", 15);

    graph.append("rect")
        .attr("class", "goalRect")
        .attr("x", 88)
        .attr("y", 63.5)
        .attr("width", 62)
        .attr("height", 27);

    graph.append("text")
        .attr("x", 118)
        .attr("y",  83)
        .attr('text-anchor', 'middle')
        .attr("class", "goal")
        .text("Goal");


    graph.selectAll(".point")
        .data(points)
        .enter().append("circle")
        .attr("class", "circles")
        .attr("cx", function (d, i) {
            return x(dayMeasured[i]);
        })
        .attr("cy", function (d, i) {
            return y(degreeValue[i]);
        })
        .attr("r", 8)
        .attr("transform", "translate(25,0)")
    ;

    graph.selectAll(".point")
        .data(goal_point)
        .enter().append("circle")
        .attr("class", "goal-point")
        .attr("cx", function (d, i) {
            return x(next_weeks_goal_date);
        })
        .attr("cy", function (d, i) {
            return y(next_weeks_goal);
        })
        .attr("r", 15)
        .attr("transform", "translate(25,0)")
    ;
}
