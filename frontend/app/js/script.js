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
function submitPatient() {
    var data = {};
    var errorMessage = '';
    if (form.name.value) data.name = form.name.value;
    if (form.email.value && !validateEmail(form.email)) {
        errorMessage += 'Email address is invalid.';
    }
    data.email = form.email.value;
    data.name = form.name.value;
    data.phoneProvider = 'att';

    if (form.phone.value) data.phoneNumber = form.phone.value;
    if (form.hash.value) data.hash = form.hash.value;
    if (form.surgery.value) data.surgeryType = form.surgery.value;
    // if (form.notes.value) data.notes = form.notes.value;
    fetch('/pts/' + localStorage.id + '/patients', {
        headers: {
            'x-access-token': localStorage.token,
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
    getPatients();
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
    else elt.style.display = 'none';
}

function toggleOpen(x) {
    var elt = document.getElementById(x);
    elt.classList.toggle('open');
}

function color(n) {
    if (isNaN(n)) {
        return ['bbbbbb', '../../img/flatIcon.png', 'flatIcon']
    }
    else if (n < 33.3) {
        return ['ce2310', '../../img/downIcon.png', 'downIcon'];
    }
    else if (n < 66.7) {
        return ['fab03c', '../../img/flatIcon.png', 'flatIcon'];
    }
    else {
        return ['1a924c', '../../img/upIcon.png', 'upIcon'];
    }
}

function loadPatients(patients) {
    setTimeout(function() {
        var psd = JSON.parse(patients);
        if (psd[0].progress.length !== 0) {
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
                var menu = document.createElement('div');
                var rec = document.createElement('div');
                var collapse = document.createElement('div');

                var sum = 0;
                var count = 0;
                for (var k = 0; k < psd[i].progress.length; k++) {
                    var value = psd[i].progress[k];
                    if (value != null) {
                        sum += +value[0];
                        count++;
                    }
                }
                var percent = (sum / count).toFixed(1);
                var indicator = color(percent);

                pic.src = '../../img/profile_pic.jpg';
                pic.setAttribute('id', 'profileImg');
                prog.src = indicator[1];
                prog.setAttribute('id', indicator[2]);
                recbx.setAttribute('class', 'recovery-box');
                p1.setAttribute('class', 'percent1');
                if (indicator[0] === 'bbbbbb') {
                    p1.innerHTML = "<span>N/A</span>";
                }
                else {
                    p1.innerHTML = "<span>" + percent + "%</span>";
                }
                p1.style.color = "#" + indicator[0];
                menu.setAttribute('class', 'arrow');
                menu.setAttribute("onclick", "displayCollapse('collapse" + i + "'); toggleOpen('nav-icon" + i + "')");
                menu.setAttribute('class', 'nav-icon');
                menu.setAttribute('id', 'nav-icon' + i);
                menu.innerHTML =
                    '<span></span>' +
                    '<span></span>' +
                    '<span></span>' +
                    '<span></span>';
                collapse.setAttribute('class', 'buttonCollapse');
                var collapseContent =
                    '<div class="collapse" id= "collapse' + i + '" style="display:none">' +
                    '<hr><div class="space"></div>';
                for (var j = 0; j < psd[i].progress.length; j++) {
                    var val = psd[i].progress[j];
                    if (val !== null) {
                        c = '#' + color(val[0])[0];
                        collapseContent +=
                            '<div class="collapse-inner">' +
                            '<div class="input-label">' + val[1] + '</div>' +
                            '<div class="input-percent1" style="color:' + c + '">';
                        if (c === '#bbbbbb') {
                            collapseContent += 'N/A</div>';
                        } else {
                            collapseContent += val[0] + '%</div>';
                        }
                        collapseContent += '<div class="graph-box"><img src="../../img/graph.png" id="graph"></div></div>';
                    }
                }
                collapseContent += '<div class="space"></div>' +
                    '<a href="/patient-status" class="inspect1" id= "inspect-btn' + i + '">Inspect Patient</a></div>';
                collapse.innerHTML = collapseContent;
                rec.setAttribute('class', 'recovery');
                if (indicator[0] !== 'bbbbbb') {
                    rec.innerHTML = "<span>Recovered</span>";
                }
                document.getElementById('loading').style.display = 'none';
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
                div.appendChild(menu);
                div.appendChild(collapse);
                document.getElementById('patients').appendChild(div);
            }
        }
        else {
            loadPatients(localStorage.patients);
        }
    }, 1000);
}

// change to status html
function loadStatus(patient) {
    var progress = +JSON.parse(localStorage.progress);
    if (progress !== "") {
        // fetch patient metrics here
        var div = document.createElement('div');
        var picbox = document.createElement('div');
        var pic = document.createElement('img');
        var prog = document.createElement('img');
        var inner = document.createElement('div');
        var name = document.createElement('div');
        var recbx = document.createElement('div');
        var p1 = document.createElement('div');
        var menu = document.createElement('div');
        var rec = document.createElement('div');
        var collapse = document.createElement('div');
        var percent = (progress * 100).toFixed(1);
        var indicator = color(percent);

        pic.src = '../../img/profile_pic.jpg';
        pic.setAttribute('id', 'profileImg');
        prog.src = indicator[1];
        prog.setAttribute('id', indicator[2]);
        recbx.setAttribute('class', 'recovery-box');
        p1.setAttribute('class', 'percent1');
        // Hard coded patient data
        p1.innerHTML = "<span>" + percent + "%</span>";
        p1.style.color = "#" + indicator[0];
        menu.setAttribute('class', 'arrow');
        menu.setAttribute("onclick", "displayCollapse('collapse" + i + "'); toggleOpen('" + i + "')");
        menu.setAttribute('id', 'nav-icon');
        menu.innerHTML =
            '<span></span>' +
            '<span></span>' +
            '<span></span>' +
            '<span></span>';
        collapse.setAttribute('class', 'buttonCollapse');
        collapse.innerHTML =
            '<div class="collapse" id= "collapse' + i + '" style="display:none">' +
            '<hr><div class="space"></div>' +
            '<div class="collapse-inner">' +
            '<div class="input-label">Shoulder</div>' +
            '<div class="input-percent1">' + percent + '</div>' +
            '<div class="graph-box"><img src="../../img/graph.png" id="graph"></div>' +
            '</div>' +
            '<div class="collapse-inner">' +
            '<div class="input-label">Neck - Side</div>' +
            '<div class="input-percent2">' + percent + '%</div>' +
            '<div class="graph-box"><img src="../../img/graph.png" id="graph"></div>' +
            '</div>' +
            '<div class="collapse-inner">' +
            '<div class="input-label">Neck - Front</div>' +
            '<div class="input-percent3">' + percent + '</div>' +
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
        div.appendChild(menu);
        div.appendChild(collapse);
        document.getElementById('patients').appendChild(div);
    }
    else {
        setTimeout(function() { loadStatus(patient) }, 100);
    }
}

function clear() {
    var list = document.getElementById('patients');
    list.innerHTML = '';
}

function updateProgress(patient, injury, name) {
    fetch('/romMetrics/' + injury + '/romMetricMeasures/?token=' + localStorage.token, {
        method: 'GET'
    }).then(function (res) {
        if (!res.ok) return submitError(res);
        res.json().then(function (data) {
            var pats = JSON.parse(localStorage.patients);
            var last = data[data.length - 1];
            pats[patient - 1].progress[injury] = [((last.degreeValue / last.nextGoal) * 100).toFixed(1), name];
            localStorage.patients = JSON.stringify(pats);
        });
    }).catch(submitError);
}

function loadProgress(patients) {
    var pats = JSON.parse(patients);
    for (var i = 1; i < pats.length + 1; i++) {
        (function(x) {
            pats[x - 1].progress = [];
            fetch('/findInjuries/' + x + '/?token=' + localStorage.token, {
                method: 'GET'
            }).then(function(res) {
                if (!res.ok) return submitError(res);
                res.json().then(function (data) {
                    var init = data[0].id || 0;
                    for (var j = init; j < data.length + init; j++) {
                        (function(y) { updateProgress(x, y, data[y - init].name) }(j))
                    }
                });
            }).catch(submitError);
        }(i))
    }
    localStorage.patients = JSON.stringify(pats);
}

// function loadProgress(patients) {
//     var injuries = JSON.parse(localStorage.injuries);
//     var pats = JSON.parse(patients);
//     if (injuries !== {}) {
//         for (var i = 1; i < pats.length + 1; i++) {
//             pats[i - 1].progress = [];
//                 (function(x) {
//                 var temp = [];
//                 for (var i = 0; i < injuries[x].length; i++) {
//
//                     fetch('/romMetrics/' + injuries[x][i] + '/romMetricMeasures/?token=' + localStorage.token, {
//                         method: 'GET'
//                     }).then(function (res) {
//                         if (!res.ok) return submitError(res);
//                         res.json().then(function (data) {
//                             var last = data[data.length - 1];
//                             pats[x - 1].progress.push(last.degreeValue / last.nextGoal);
//                         });
//                     }).catch(submitError);
//                 }
//             }(i))
//         }
//     }
//     else {
//         setTimeout(function() { loadProgress() }, 350);
//     }
// }

function loadPatient(id) {
    fetch('/romMetrics/' + id + '/romMetricMeasures/?token=' + localStorage.token, {
        method: 'GET'
    }).then(function(res) {
        if (!res.ok) return submitError(res);
        res.json().then(function (data) {
            var measure = data[data.length - 1] || 0;
            localStorage.progress = JSON.stringify(measure);
        });
    }).catch(submitError);
}

function loadStart() {
    clear();
    sortAlpha();
}

function loadStatus(patient) {
    clear();
    loadPatient(patient.id);
    loadStatus(patient);
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

localStorage.ctr1 = 0;
localStorage.ctr2 = 0;

function sortAlpha() {
    localStorage.ctr1++;
    var lst = JSON.parse(localStorage.patients);
    if (localStorage.ctr1 % 2 != 0) localStorage.display = JSON.stringify(lst.sort(compareAlpha));
    else localStorage.display = JSON.stringify(lst.sort(compareAlpha).reverse());
    load();}

function findAverage() {
    var psd = JSON.parse(localStorage.patients);
    for (var i = 0; i < psd.length; i++) {
        var sum = 0;
        var count = 0;
        for (var k = 0; k < psd[i].progress.length; k++) {
            var value = psd[i].progress[k];
            if (value != null) {
                sum += +value[0];
                count++;
            }
        }
        psd[i].average = (sum / count).toFixed(1);
    }
    localStorage.patients = JSON.stringify(psd);
}

function sortProg() {
    localStorage.ctr2++;
    findAverage();
    var lst = JSON.parse(localStorage.patients);
    if (localStorage.ctr2 % 2 != 0)
        localStorage.display = JSON.stringify(lst.sort(function (a, b) { return a.average - b.average }));
    else localStorage.display = JSON.stringify(lst.sort(function (a, b) { return b.average - a.average }));
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

if (window.innerWidth < 770) {
    w = 7 * window.innerWidth / 12;
    h = 2 * window.innerHeight / 5;
}

else {
    w = window.innerWidth / 3;
    h = window.innerHeight / 3;
}



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
    .attr("height", "95%")
    .append("svg:g")
    .attr("transform", "translate(20,-35)");
// create xAxis

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(5)
    .tickSize(0)
    .tickFormat(d3.time.format("%-m/%-d"))
    .tickPadding(4);


// create left yAxis
var yAxisLeft = d3.svg.axis()
    .scale(y)
    .ticks(5)
    .tickSize(0)
    .orient("left");

graph.append("svg:g")
    .attr("class", "x axis")
    .attr("transform", "translate(20," + h + ")")
    .call(xAxis);

graph.append("svg:g")
    .attr("transform", "translate(20,0)")
    .attr("class", "y axis")
    .call(yAxisLeft);

graph.append("svg:path").attr("d", line(degreeValue, dayMeasured))
    .attr("transform", "translate(20, 0)");
graph.append("svg:path").attr("d", line2(degreeValue, dayMeasured))
    .attr("transform", "translate(20,0)")
    .attr("class", "horizontalLine");
graph.append("svg:path").attr("d", line3(next_weeks_goal, next_weeks_goal_date))
    .attr("transform", "translate(20, 0)");

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
        .attr("r", (w / 25))
        .attr("transform", "translate(" + (w / 25 + 20) + "," + -(w / 100) + ")")
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
        .attr("r", (w / 25))
        .attr("transform", "translate(" + (w / 25 + 20) + "," + -(w / 100) + ")")
    ;
