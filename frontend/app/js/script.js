var success = document.getElementById('success');
var form = document.forms[0];

// =============================================================
// Form submit functions
// =============================================================

function submitOnEnterKey(submitFunction, targetForm) {
    targetForm = targetForm || form;
    var runOnKeydown = function(e) { if (e.keyCode === 13) submitFunction(); }
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
    }).then(console.log('Success!'))
        .catch(console.log('Error!'))
    // }).then(submitSuccess)
    //     .catch(submitError)
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
    }).then(console.log('Success!'))
        .catch(console.log('Error!'))
}

function submitMeasure() {
    var data = {};
    var errorMessage = '';
    if (form.newMeasure.value) data.degreeValue = form.newMeasure.value;
    // ********************************
    //  is this the right route?
    // ********************************
    fetch('/romMetrics/' + localStorage.id + '/romMetricMeasures', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(console.log('Success!'))
        .catch(console.log('Error!'))
}

// TODO: form validation
function submitLogin() {
    var data = {
        email: form.email.value,
        password: form.password.value
    };

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

// login -> /patients -> request

function getPatients() {
    fetch('/pts/' + localStorage.id + '/patients?token=' +localStorage.token
    ).then(function(res) {
        if (!res.ok) throw(res);
        res.json().then(function(pts) {
            // var patients = JSON.parse(localStorage.patients);
            localStorage.patients = JSON.stringify(pts);
            localStorage.display = JSON.stringify(pts);
        });
        window.location = '/patients';
    })
    .catch(submitError);
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
// Patient page (in progress)
// =============================================================

function toggleDisplay() {
    var x = document.getElementById('toggle-box');
    if (x.style.display === 'none') {
        x.style.display = 'block';
    } else {
        x.style.display = 'none';
    }
    // var y = document.getElementById('patient-box');
    // if (y.style.border-radius-bottom-left == $formRadius) {
    //     y.style.border-radius-bottom-left = 0%
    //     y.style.border-radius-bottom-right = 0%
    // } else {
    //     y.style.border-radius-bottom-left = $formRadius;
    //     y.style.border-radius-bottom-right = $formRadius;
    // }
}

// function fetchPatients() {
//     if(!localStorage.token) window.location = '/';
//     fetch('/pt/getpatients', {method: 'GET'})
//     .then(function(res) {
//         if (!res.ok) return console.log('Admin error');
//         res.json().then(function(patients) { populatePatientsPage(patients) })
//     }).catch(console.log('Error!'));
// }

// function populatePatientsPage(patients) {
//     var patientDiv = document.getElementById('js-patients');
//     patients.forEach(function(u) {
//         var div = document.createElement('div');
//         div.setAttribute('class', 'patient');
        
//         var name = document.createElement('div');
//         name.setAttribute('class', 'patient-name');
//         name.innerHTML = u.name.type;
//         div.appendChild(name);
        
//         // var admin = document.createElement('div');
//         // admin.setAttribute('class', 'patient-button button button-inline');
//         // div.appendChild(admin);
        
//         // var del = document.createElement('div');
//         // del.setAttribute('class', 'patient-button button button-inline warning');
//         // del.innerHTML = 'Delete';
//         // del.setAttribute('onclick', 'deletePatient("' + u._id + '", this)');
//         // div.appendChild(del);
        
//         patientDiv.appendChild(div);
//     });
// }


// =============================================================
// Collapse patients
// =============================================================
var Collapse = {
    init: function (element) {
        if (!element) return false;
        if (element.indexOf('.') != -1) {
            var getName = element;
            var getElement = document.querySelector(getName);
        } else if (element.indexOf('#') != -1) {
            var getName = element.replace(/\#/g, '');
            var getElement = document.getElementById(getName);
        }
        if (!getElement.hasAttribute('data-height')) {
            getElement.style.display = 'block';
            getElement.dataset.height = getElement.offsetHeight + 'px';
            getElement.style.height = '0';
        }
        return getElement;
    },
    expand: function (element) {
        var getContent = Collapse.init(element);
        setTimeout(function () {
            getContent.style.height = getContent.dataset.height;
        }, 20)
    },
    collapse: function (element) {
        var getContent = Collapse.init(element);
        getContent.style.height = '0';
    }
}

var getButton = document.getElementsByClassName('buttonCollapse');

for (i = 0; i < getButton.length; i++) {
    (function(buttons) {
        buttons.addEventListener('click', function () {
            var self = this;
            var getTarget = self.getAttribute('data-target');
            self.classList.toggle('is-active');
            self.classList.contains('is-active') ? Collapse.expand(getTarget) : Collapse.collapse(getTarget)
        });
    })(getButton[i])
}

// =============================================================
// Search, sort patients
// =============================================================

function loadPatients(pts) {
    var psd = JSON.parse(pts);
    // fetch patient metrics here
    for (var i = 0; i < psd.length; i++) {
        var div = document.createElement('div');
        var picbox = document.createElement('div');
        var pic = document.createElement('img');
        var prog = document.createElement('img');
        pic.src = '../../img/profile_pic.jpg';
        pic.setAttribute('id', 'profileImg');
        prog.src = '../../img/upIcon.png';
        prog.setAttribute('id', 'upIcon');
        var inner = document.createElement('div');
        var name = document.createElement('div');
        var recbx = document.createElement('div');
        recbx.setAttribute('class', 'recovery-box');
        var p1 = document.createElement('div');
        p1.setAttribute('class', 'percent1');
        // Hard coded
        p1.innerHTML = "<span>70%</span>";
        var rec = document.createElement('div');
        var collapse = document.createElement('div');
        collapse.setAttribute('class', 'buttonCollapse');
        collapse.innerHTML = '<div class="arrow">▼</div>' +
            '<div class="collapse" id="collapse">' +
                '<hr><div class="space"></div>' +
                '<div class="collapse-inner">' +
                    '<div class="input-label">Shoulder</div>' +
                    '<div class="input-percent1">70%</div>' +
                    '<div class="graph-box"><img src="../../img/graph.png" id="graph"></div>' +
                '</div><div class="collapse-inner"><div class="input-label">Neck - Side</div><div class="input-percent2">50%</div><div class="graph-box"><img src="../../img/graph.png" id="graph"></div></div><div class="collapse-inner"><div class="input-label">Neck - Front</div><div class="input-percent3">30%</div><div class="graph-box"><img src="../../img/graph.png" id="graph"></div></div><div class="space"></div><div class="inspect1">Inspect Patient</div></div></div>';
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
        div.appendChild(collapse);
        document.getElementById('patients').appendChild(div);
    }
}

function clear() {
    var list = document.getElementById('patients');
    for (var i = 0; i < document.getElementsByClassName('pt-box').length; i++) {
        list.removeChild(list.childNodes[i]);
    }
}

function load() {
    clear();
    loadPatients(localStorage.display);
}

// TODO: search on key strokes
function search(query, array) {
    var temp = [];
    var arr = JSON.parse(array);
    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i].name.toUpperCase().includes(query.toUpperCase())) {
            temp.push(arr[i]);
        }
    }
    localStorage.display = JSON.stringify(temp);
    load();
}

function pSearch() {
    search(form.patientSearch.value, localStorage.patients);
}

// compareFunctions
function compareAlpha(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}
function compareAlphaRev(a, b) {
    if (a.name > b.name) return -1;
    if (a.name < b.name) return 1;
    return 0;
}

function alphaAscending(lst) {
    return lst.sort(compareAlpha)
}

function alphaDescending(lst) {
    return lst.sort(compareAlphaRev)
}

function progAscending(lst) {
    return lst.sort(function (a, b) { return a.progress - b.progress })
}

function progDescending() {
    return patients.sort(function (a, b) { return b.progress - a.progress })
}


// =============================================================
// Progress Graph
// =============================================================
    var m = [50, 20, 0, 0]; // margins
    var w = 300 - m[1] - m[3]; // width
    var h = 250 - m[0] - m[2]; // height

    var degreeValue = [32, 35, 40, 45];

    var dayMeasured = [1, 2, 3, 4];

    //var dayMeasured = [2017-04-02, 2017-04-09, 2017-04-016, 2017-04-23, 2017-04-30, 	2017-5-07,  2017-05-14, 2017-05-21];

    var goal = 50;

    var next_weeks_goal = 50;

    var next_weeks_goal_date = 5;

    var points = [[32, 1], [35, 2], [40, 3], [45, 4]];

    var goal_point = [50, 4];

    // X scale will fit all values from data[] within pixels 0-w
    var x = d3.scale.linear().domain([0, 6]).range([0, w]);
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    var y = d3.scale.linear().domain([20, 60]).range([(h + 10), 0]);


    var line = d3.svg.line()
        .x(function (d, i) {
            return x(dayMeasured[i]);
        })
        .y(function (d, i) {
            return y(degreeValue[i]);
        });

    var line2 = d3.svg.line()
        .x(function (d, i) {
            return x(dayMeasured[i]);
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
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(15,0)");
    // create xAxis

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(5)
        .tickSize(-h);

    // Add the x-axis.
    graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(15,230)")
        .call(xAxis);

    // create left yAxis
    var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");

    graph.append("svg:g")
        .attr("transform", "translate(20,0)")
        .attr("class", "y axis")
        .call(yAxisLeft);

    graph.append("svg:path").attr("d", line(degreeValue, dayMeasured));
    graph.append("svg:path").attr("d", line2(degreeValue, dayMeasured))
        .attr("class", "horizontalLine");
    graph.append("svg:path").attr("d", line3(next_weeks_goal, next_weeks_goal_date));



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
        .attr("r", 8);

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
    .attr("r", 10);