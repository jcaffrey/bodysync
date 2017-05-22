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
        email: form.email.value,
        password: form.password.value
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
            window.location = '/patients'
        });
    }).catch(submitError);
}

function submitPatientLogin() {
    var data = {
        email: form.email.value,
        password: form.password.value
    };
    localStorage.email = data.email;
    fetch('/loginPatient', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(function(res) {
        if (!res.ok) return submitError(res);
        else return res.json().then(function(result) {
            localStorage.token = result.token;
            localStorage.id = JSON.parse(atob(result.token.split('.')[1])).id;
            console.log('logged in');
            getPatientView();
        });
    }).catch(submitError);
}

function logout() {
    localStorage.id = '';
    localStorage.token = '';
    localStorage.patients = '';
    localStorage.display = '';
    localStorage.graphData = '';
    localStorage.focusPatient = '';
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

function postMetric (id, degree, lastGoal) {
    var data = {
        startRange: degree,
        endRangeGoal: lastGoal,
        name: "name" + id
    };
    fetch('/injuries/' + id + '/romMetrics', {
        headers: {'x-access-token': localStorage.token,
            'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(data)
    }).then(function(res) {
        if (!res.ok) console.log(res);
        postMeasure(id, degree, lastGoal);
    }).catch(function (err) { console.log(err) });
}

function postMeasure (id, degree, lastGoal) {
    var d = new Date();
    var d1 = new Date();
    d1.setDate(d1.getDate() + 7);
    var data = {
        dayMeasured: d.toMysqlFormat(),
        dayOfNextGoal: d1.toMysqlFormat(),
        nextGoal: lastGoal,
        degreeValue: degree,
        name: "firstMeasure"
    };
    fetch('/romMetrics/' + id + '/romMetricMeasures', {
        headers: {'x-access-token': localStorage.token,
            'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(data)
    }).then(function(res) {
        if (!res.ok) console.log(res);
    }).catch(function (err) { console.log(err) });
}

// surgeryType, romStart, romEnd, notes in schema????
function submitPatient() {
    form.style.display = 'none';
    document.getElementById('loading').innerHTML = '<p>Loading</p><img src="../../img/loading.gif">';
    var data = {};
    var errorMessage = '';
    if (form.name.value) data.name = form.name.value;
    if (form.email.value && !validateEmail(form.email))
        errorMessage += 'Email address is invalid.';
    data.email = form.email.value;
    if (form.phone.value) data.phoneNumber = form.phone.value;
    if (form.hash.value) data.hash = form.hash.value;
    if (form.surgery.value) data.surgeryType = form.surgery.value;
    if (form.notes.value) data.ptNotes = form.notes.value;

    fetch('/pts/' + localStorage.id + '/patients', {
        headers: {
            'x-access-token': localStorage.token,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(function(res) {
        if (!res.ok) return submitError(res);
        else return res.json().then(function(result) {
            var injuries = document.getElementsByClassName('rom-name-input');
            var degrees = document.getElementsByClassName('degrees');
            for (var i = 0; i < injuries.length; i++) {
                (function(x) {
                    fetch('/patients/' + result.id + '/injuries', {
                        headers: {
                            'x-access-token': localStorage.token,
                            'Content-Type': 'application/json'
                        },
                        method: 'POST',
                        body: JSON.stringify({
                            name: injuries[x].value,
                            injuryFromSurgery: "true"
                        })
                    }).then(function (res1) {
                        if (!res1.ok) return submitError(res1);
                        else return res1.json().then(function (result1) {
                            postMetric(result1.id, degrees[2 * x].value, degrees[(2 * x) + 1].value);
                        })
                    }).catch(submitError);
                }(i))
            }
            setTimeout(function() {
                window.location = '/patients';
            }, 1000);
        });
    }).catch(submitError);
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
    window.location = '/patients';
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
function getPatientView (){
  fetch('/patients/' + localStorage.id + '/?token=' + localStorage.token
  ).then(function(res) {
      if (!res.ok) throw(res);
      res.json().then(function(info) {
          localStorage.isPatient = JSON.stringify(true);
          localStorage.patients = JSON.stringify([info]);
          window.location = '/patient-home';
      });
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
        var isPatient = JSON.parse(localStorage.isPatient);
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

                // include default pictures for users without uploaded pictures
                switch (psd[i].name) {
                    case 'Josh Seides':
                    case 'David Malan':
                    case 'Zamyla Chan':
                    case 'Sam Pelletier':
                        pic.src = '../../img/' + psd[i].name + '.jpg';
                        break;
                    default:
                        pic.src = '../../img/Josh Seides.jpg';
                }

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
                var collapseDiv = !isPatient ? '" style="display:none">' : ''
                var collapseContent =
                    '<div class="collapse" id= "collapse' + i + collapseDiv +
                    '<hr><div class="space"></div>';
                for (var j = 0; j < psd[i].progress.length; j++) {
                    var val = psd[i].progress[j];
                    if (val !== null) {
                        c = '#' + color(val[0])[0];
                        collapseContent +=
                            '<div class="collapse-inner">' +
                            '<div class="input-label">' + val[1] + '</div>' +
                            '<div class="input-percent" style="color:' + c + '">';
                        if (c === '#bbbbbb') {
                            collapseContent += 'N/A</div>';
                        } else {
                            collapseContent += val[0] + '%</div>';
                        }
                        collapseContent += '<div class="graph-box"><img src="../../img/graph.png" id="graph"></div></div>';
                    }
                }
                if (!isPatient) {
                  collapseContent += '<div class="space"></div><a href="/patient-status" class="inspect1" id= "inspect-btn' + i + '" onclick="focusPatient(' + psd[i].id + ')">Inspect Patient</a>';
                }
                else {
                  collapseContent += '<div class="space"></div><a href="/patient-status-patient" class="inspect1" id= "inspect-btn' + i + '" onclick="focusPatient(' + psd[i].id + ')">Inspect Patient</a>';
                }
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
                if (!isPatient) {
                  div.appendChild(menu);
                }
                div.appendChild(collapse);
                document.getElementById('patients').appendChild(div);
            }
        }
        else {
            loadPatients(localStorage.patients);
        }
    }, 1000);
}

function change(e) {
  e.style.display ="none";
}

function change1(e) {
  e.style.display="inline-block";
}

function change2(e) {
    e.style.background="#2e3192";
}

function change3(e) {
    e.style.background="#bbb";
}

function change4(e) {
    e.style.opacity="1";
}

function change5(e) {
    e.style.opacity="0.5";
}

function change6(e) {
    var pfp = JSON.parse(localStorage.focusPatient);
    var count = 0;
    for (var j = 1; j < pfp.progress.length; j++) {
        var val = pfp.progress[j];
        if (val !== null) {
            var ele = eval('(' + "iconGraph" + (count + 1) + ')');
            if (ele != e) {
                change(ele);
            count++;
            }
        }
    }
}

function chooseInjury (c) {
    var pfp = JSON.parse(localStorage.focusPatient);
    var val = pfp.progress[c];
    return(val[0]);
}

function loadFocusPatient () {
    var pfp = JSON.parse(localStorage.focusPatient);
    var isPatient = JSON.parse(localStorage.isPatient);
    var sum = 0;
    var count = 0;
    for (var k = 0; k < pfp.progress.length; k++) {
        var value = pfp.progress[k];
        if (value != null) {
            sum += +value[0];
            count++;
        }
    }
    var percent = (sum / count).toFixed(1);
    var indicator = color(percent);

    // html for pt-box
    var ptBox = document.createElement('div');
    // adding pic-box
    var source;
    switch (pfp.name) {
        case 'Josh Seides':
        case 'David Malan':
        case 'Zamyla Chan':
        case 'Sam Pelletier':
            source =  pfp.name;
            break;
        default:
            source = 'Josh Seides';
    }
    var ptBoxHTML ='<div class="pt-box"><div class="pic-box"><img id="profileImg" src="../../img/' + source + '.jpg'
        + '"></img><img id="upIcon" src=" ' + indicator[1] + '"></img></div>';
    // adding info-box
    ptBoxHTML += '<div class="info-box"><div class="name">' + pfp.name +
        '</div><div class="recovery-box"><div class="percent1">' + colorPercent(percent, indicator[0]) +
        '</div><div class="recovery"><span>RECOVERED</span></div></div></div></div>';
    ptBox.innerHTML = ptBoxHTML;

    // html for menu-box
    var menuBox = document.createElement('div');
    menuBox.setAttribute('class', 'menu-box');
    menuBox.setAttribute('id', 'menuBox');
    menuBox.style.display = 'inline-block';
    menuBox.style.display = 'none';

    // adding menu-top
    var menuBoxHTML = '<div class="menu-top"><div class="exit-sign"><button id="exitButton" onclick="change(menuBox); change4(bottomBox)">X</button></div></div>';

    // adding menu-options
    menuBoxHTML += '<div class="menu-options"><div class="option option0"><div class="menu-icon" id="iconOverview" style="display:inline-block";></div><span onclick="change1(iconOverview); change(bodyBox); change(menuBox); change1(overviewBox); change4(bottomBox); change6(iconOverview); change2(iconOverviewTrans);change(menuBox); change4(bottomBox)">Overview</span></div>';

    // getting injuries
    var menuInjuries = '';
    var count = 0;
    for (var j = 0; j < pfp.progress.length; j++) {
        var val = pfp.progress[j];
        if (val !== null) {
            menuInjuries += '<div class="option option' + (count + 1) + '" onclick="createGraph(' + val[3] + '); changePercent(' + val[3] + ')"><div class="menu-icon" id="iconGraph' + (count + 1) + '"></div><span onclick="change6(iconGraph' + (count + 1) + '); change1(iconGraph' + (count + 1) + '); change(iconOverview); change2(iconOverviewTrans); change(overviewBox); change1(bodyBox); change(menuBox); change4(bottomBox)">'+ val[1] +'</span></div>';
            count++;
        }
    }
    menuBoxHTML += menuInjuries + '</div>';
    menuBox.innerHTML = menuBoxHTML;

    // html for outer-info-box
    var outBox = document.createElement('div');

    // adding top-box
    var outBoxHTML = '<div class="outer-info-box"><div class="top-box"><button id="menuButton" onclick="change1(menuBox); change5(bottomBox)")>&#9776</button></div>';

    // adding bottom-box
      // getting injury list
      var collapseContent = '';
      var count = 0;
      for (var j = 0; j < pfp.progress.length; j++) {
          var val = pfp.progress[j];
          if (val !== null) {
              c = '#' + color(val[0])[0];
              collapseContent +=
                  '<div class="collapse-inner">' +
                  '<div class="input-label" id="input-label' + count + '">' + val[1] + '</div>' +
                  '<div class="input-percent" id="input-percent' + count + '" style="color:' + c + '">';
              if (c === '#bbbbbb') {
                  collapseContent += 'N/A</div>';
              } else {
                  collapseContent += val[0] + '%</div>';
              }
              collapseContent += '<div class="graph-box"><img src="../../img/graph.png" class="graph-symbol" id="graph-symbol' + (count + 1) + '" onclick="changePercent(' + val[3] + '); createGraph(' + val[3] + '); change(iconOverview); change(overviewBox); change1(bodyBox)"></div></div>';
              count++;
          }
      }
      outBoxHTML += '<div class="bottom-box" id="bottomBox" style="overflow-y:auto;"><div class="overview-box" id="overviewBox">'+ collapseContent;
      // getting exercise set
      outBoxHTML +='<div class="exercise-set"><span id="exerciseTitle">Exercise Sets</span>';

      if (pfp.sets.length > 0){
          for (var i = 0; i < pfp.sets.length; i++){
              var exSetId = pfp.sets[i][0].id;
              // adding exercise set name
              outBoxHTML += '<div class="exercise-description-label"><span id="exerciseText">' + pfp.sets[i][0].name + '</span></div><br>';
              // adding list of exercises
              for (var j = 0; j < pfp.exercises.length; j++){
                  if (pfp.exercises[j].exerciseSetId == exSetId){
                      // adding exercise name
                      outBoxHTML += '<span id="exerciseText">' + pfp.exercises[j].name + '</span>';
                      // adding exercise sets and seconds
                      outBoxHTML += '<div class="exercise-label" id="exercise-label">' + pfp.exercises[j].numSets + " sets, " + pfp.exercises[j].numRepsOrDuration + " Reps/Duration" + '</div><br>';
                  }
              }
          }
      }
      else {
          outBoxHTML += '<span id="exerciseText"> No Exercise Sets Currently Assigned </span>';
      }

      if (!isPatient){
          outBoxHTML += '<a href="/exercise-set" class="new-exercise-btn">Add New Exercise Set</a>' + '</div>';
      }

      // getting notes
      outBoxHTML += '<div class="notes"><span id="noteTitle">Notes</span><textarea class="note-input" type="notes" id="notes" name="notes" cols="25" rows="10" placeholder="Enter notes here..."></textarea></div></div>';

      // adding body-part-box
        // percentage-box

        outBoxHTML += '<div class="body-part-box" id="bodyBox"><div id="injuryTitle"></div><div class="percentage-box"><div class="percentage" style="color:' + c + '" id="singlePercent"></div><div class="recoveryText">recovered</div></div>';
        // graph
        outBoxHTML += '<div id="loading"><p>Loading</p><img src="../../img/loading.gif"></div><div class="graph-view" id="graph-container"><div class="svgh" id="graph"></div>';
        // legend
        outBoxHTML += '<div class="legend"><div class="weekly-legend"><div class="weekly-goal-legend">Weekly Goal</div><div class="legend-circle"></div></div><div class="final-goal-legend">Final Goal<div class="dashes">- - - - -</div></div></div></div></div></div>';

    // adding transition-box
    outBoxHTML += '<div class="transition-box"><div class="icon" id="iconOverviewTrans" style="background: rgb(46, 49, 146)"></div><div class="icon" id="iconGraphTrans"></div><div class="icon button-2"></div><div class="icon button-3"></div></div>';
    outBox.innerHTML = outBoxHTML;
    document.getElementById('loading').style.display = 'none';
    var container = document.getElementById('status').appendChild(ptBox);
    container.appendChild(menuBox);
    container.appendChild(outBox);
}

function renderExercisePage() {
    var pat = JSON.parse(localStorage.patients)[0];
    var bodyBox = document.createElement('div');
    var bodyBoxHTML = "";
    if (pat.sets.length > 0){
        for (var i = 0; i < pat.sets.length; i++){
            var exSetId = pat.sets[i][0].id;
            // adding exercise set name
            bodyBoxHTML += '<p class="headerGrey">' + pat.sets[i][0].name + '</p>';
            // adding list of exercises
            for (var j = 0; j < pat.exercises.length; j++){
                if (pat.exercises[j].exerciseSetId == exSetId){
                    // adding exercise name
                    bodyBoxHTML += '<div class="exercise"><div class="input-box-top"><div class="input-name">' + pat.exercises[j].name;
                    // adding exercise sets and seconds
                    bodyBoxHTML += '<div class="input-name metaData">' + pat.exercises[j].numSets + " sets, " + pat.exercises[j].numRepsOrDuration + " Reps/Duration" + '</div></div></div><br></div></div>'
                }
            }
        }
    }
    else {
        bodyBoxHTML += '<p class="headerGrey"> No Exercise Sets Currently Assigned </p>';
    }
    bodyBox.innerHTML = bodyBoxHTML;
    document.getElementById('loading').style.display = 'none';
    document.getElementById('exercisepg').appendChild(bodyBox);                
}

function changePercent(val) {
    var pfp = JSON.parse(localStorage.focusPatient);
    var injuryData = pfp.progress[val];
    document.getElementById('singlePercent').style.color = '#' + color(injuryData[0])[0];
    document.getElementById('singlePercent').innerHTML = injuryData[0] + '%';
    document.getElementById('injuryTitle').innerHTML = injuryData[1];
}

function colorPercent (percent, col){
    if (percent === 'bbbbbb') {
        return '<span>N/A</span>';
    }
    else {
        return '<font color = "#' + col + '"><span>' + percent + '%</span></font>';
    }
}

function clear() {
    var list = document.getElementById('patients');
    list.innerHTML = '';
}

function getMeasurements(injury) {
    fetch('/romMetrics/' + injury + '/romMetricMeasures/?token=' + localStorage.token, {
        method: 'GET'
    }).then(function (res) {
        if (!res.ok) return submitError(res);
        res.json().then(function (data) {
            var temp = [];
            var count = 0;
            for (var i = data.length - 1; i >= 0; i--) {
                if (count <= 3) {
                    temp[count] = {
                        date: data[i].dayMeasured,
                        measure: data[i].degreeValue
                    };
                    count++;
                }
            }
            temp.reverse();
            temp[count] = {
                date: data[data.length - 1].dayOfNextGoal,
                goal: data[data.length - 1].nextGoal
            };
            temp[count + 1] = data[data.length - 1].nextGoal;
            localStorage["graphData" + injury] = JSON.stringify(temp);
        });
    }).catch(console.log('error' + injury));
}

function getGraphData() {
    var id = JSON.parse(localStorage.focusPatient).id;
    fetch('/findInjuries/' + id + '/?token=' + localStorage.token, {
        method: 'GET'
    }).then(function(res) {
        if (!res.ok) return submitError(res);
        res.json().then(function (data) {
            var init = data[0].id || 0;
            for (var j = init; j < data.length + init; j++) {
                (function(y) { getMeasurements(y) }(j));
            }
        });
    }).catch(submitError);
}

function updateProgress(patient, injury, name) {
    fetch('/romMetrics/' + injury + '/romMetricMeasures/?token=' + localStorage.token, {
        method: 'GET'
    }).then(function (res) {
        if (!res.ok) return submitError(res);
        res.json().then(function (data) {
            var pats = JSON.parse(localStorage.patients);
            var last = data[data.length - 1];
            pats[patient].progress[injury] = [Math.min((((last.degreeValue / last.nextGoal) * 100).toFixed(1)), 100.0), name, last.degreeValue.toFixed(1), injury, last.nextGoal];
            localStorage.patients = JSON.stringify(pats);
        });
    }).catch(submitError);
}

function loadProgress(patients) {
    var pats = JSON.parse(patients);
    for (var i = 0; i < pats.length; i++) {
        (function(x) {
            pats[x].progress = [];
            pats[x].sets = [];
            fetch('/findInjuries/' + pats[x].id + '/?token=' + localStorage.token, {
                method: 'GET'
            }).then(function(res) {
                if (!res.ok) return submitError(res);
                res.json().then(function (data) {
                    var init = data[0].id || 0;
                    for (var j = init; j < data.length + init; j++) {
                        (function(y) { updateProgress(x, y, data[y - init].name) }(j));
                        (function(y) { loadExerciseSets(x, y) }(j));
                    }
                });
            }).catch(submitError);
        }(i))
    }
    localStorage.patients = JSON.stringify(pats);
}

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

function loadExerciseSets(patIndex, injuryId) {
    fetch('/injuries/' + injuryId + '/exerciseSets/?token=' + localStorage.token, {
        method: 'GET'
    }).then(function(res) {
        if (!res.ok) return submitError(res);
        res.json().then(function (data) {
            var patients = JSON.parse(localStorage.patients);
            patients[patIndex].sets.push(data);
            patients[patIndex].exercises = [];
            localStorage.patients = JSON.stringify(patients);
            for (var j = 0; j < data.length; j++) {
                loadSpecificExercises(patIndex, data[j].id);
            }
        });
    }).catch(submitError);
}

function loadSpecificExercises(patIndex, exSetId) {
    fetch('/exerciseSets/' + exSetId + '/exercises/?token=' + localStorage.token, {
        method: 'GET'
    }).then(function(res) {
        if (!res.ok) return submitError(res);
        res.json().then(function (data) {
            for (var j = 0; j < data.length; j++){
                var patients = JSON.parse(localStorage.patients);
                patients[patIndex].exercises.push(data[j]);
                localStorage.patients = JSON.stringify(patients);
            }
        });
    }).catch(submitError);
}


function loadStart() {
    fetch('/pts/' + localStorage.id + '/patients?token=' + localStorage.token
    ).then(function(res) {
        if (!res.ok) throw(res);
        res.json().then(function(pts) {
            localStorage.isPatient = JSON.stringify(false);
            localStorage.patients = JSON.stringify(pts);
            localStorage.display = JSON.stringify(pts);
            clear();
            loadProgress(localStorage.patients);
            loadPatients(localStorage.patients);
        });
    }).catch(submitError);
}

function loadPatientStart() {
    fetch('/patients/' + localStorage.id + '/?token=' + localStorage.token
    ).then(function(res) {
        if (!res.ok) throw(res);
        res.json().then(function(pts) {
            localStorage.isPatient = JSON.stringify(true);
            localStorage.patients = JSON.stringify([pts]);
            localStorage.display = JSON.stringify([pts]);
            clear();
            loadProgress(localStorage.patients);
            loadPatients(localStorage.patients);
        });
    }).catch(submitError);
}

function loadExerciseStart() {
    loadExerciseSets();
    renderExercisePage();
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
    load();
}

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
    if (localStorage.ctr2 % 2 != 1)
        localStorage.display = JSON.stringify(lst.sort(function (a, b) { return a.average - b.average }));
    else localStorage.display = JSON.stringify(lst.sort(function (a, b) { return b.average - a.average }));
    load();
}

function focusPatient (id) {
    var patients = JSON.parse(localStorage.patients);
    for (var i = 0; i < patients.length; i++) {
        if (patients[i].id == id) {
            localStorage.focusPatient = JSON.stringify(patients[i]);
        }
    }
}

// =============================================================
//  Add measure
// =============================================================

function loadAddMeasure () {
    var data = JSON.parse(localStorage.focusPatient);
    var div = document.createElement('div');
    var content = '';
    var count = 0;
    for (var i = 0; i < data.progress.length; i++) {
        if (data.progress[i] !== null) {
            content +=
                '<div class="inputs">' +
                '<div class="input-box input-header">' +
                '<div class="input-name"><span>' + data.progress[i][1] + '</span>' +
                '<div class="input-label"></div></div>' +
                '<div class="progress-icon"></div></div>' +
                '<div class="input-box input-bottom">' +
                '<div class="measure-container">' +
                '<div class="m-old">' +
                '<div class="num"><span>' + data.progress[i][2] + '</span></div>' +
                '<div class="m-label">PREVIOUS</div></div>' +
                '<div class="m-new">' +
                '<div class="num">' +
                '<input type="text" name="newMeasure" placeholder="NEW"></div>' +
                '<div class="m-label">NEW</div></div></div></div>' +
                '<div class="input-box action-box input-bottom submit" onclick="submitOne(' + data.progress[i][3] + ', ' + count + ', ' + data.progress[i][4] + ', ' + data.progress[i][2] + ')">SUBMIT</div></div><br><br>';
            count++;
        }
    }
    div.innerHTML = content;
    document.getElementById('fields').appendChild(div);
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

function submitMeasure (id, i, lastGoal, lastMeasure) {
    var d = new Date();
    var d1 = new Date();
    d1.setDate(d1.getDate() + 7);
    var data = {
        dayMeasured: d.toMysqlFormat(),
        dayOfNextGoal: d1.toMysqlFormat(),
        nextGoal: lastGoal,
        degreeValue: form[i].value || lastMeasure,
        name: 'name' + id
    };
    fetch('/romMetrics/' + id + '/romMetricMeasures', {
        headers: {'x-access-token': localStorage.token,
            'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(data)
    }).then(function(res) {
        if (!res.ok) throw new Error('There was an error sending this measure');
    }).catch(function (err) { console.log(err) });
}

function submitMeasures () {
    var data = JSON.parse(localStorage.focusPatient);
    var count = 0;
    for (var i = 0; i < data.progress.length; i++) {
        if (data.progress[i] !== null) {
            submitMeasure(data.progress[i][3], count, data.progress[i][4], data.progress[i][2]);
            count++;
        }
    }
    window.location = '/patients';
}

function submitOne (id, i, lastGoal, lastMeasure) {
    submitMeasure(id, i, lastGoal, lastMeasure);
    window.location = '/patients';
}

// =============================================================
// Exercise form functions
// =============================================================

function submitExercise() {
    var data = {};
    data.name = form.exerciseName.value;
    data.numRepsOrDuration = parseInt(document.getElementById('reps-num').innerHTML, 10);
    data.numSets = parseInt(document.getElementById('sets-num').innerHTML, 10);
    if (form.notes.value) data.ptNotes = form.notes.value;
    fetch('/exerciseSets/' + localStorage.id + '/exercises', {
        headers: {
            'x-access-token': localStorage.token,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(function(res) {
        if (!res.ok) console.log(res);
    }).catch(function (err) {console.log(err) });
}

// =============================================================
//  Progress Graph
// =============================================================
function createGraph(id) {
    document.getElementById('graph').innerHTML = '';
    document.getElementById('loading').style.display = 'inline';
    document.getElementById('graph-container').style.display = 'none';
    setTimeout(function () {
        var injuryInfo = JSON.parse(localStorage["graphData" + id]);
        var w, h;

        if (window.innerWidth < 600) {
            w = 7.5 * window.innerWidth / 11;
            h = 7 * window.innerWidth / 12;
        }
        else if (window.innerWidth >= 600 && window.innerWidth < 770) {
            w = 8.5 * window.innerWidth / 13;
            h = 4 * window.innerWidth / 7;
        }
        else if (window.innerWidth >= 700 && window.innerWidth < 1000) {
            w = 4 * window.innerWidth / 11;
            h = 6 * window.innerWidth / 15;
        }
        else {
            w = 2* window.innerWidth / 5;
            h = 2* window.innerWidth / 5;
        }

        var degreeValue = [];
        var dayMeasured = [];
        var points = [];

        function getDegDates() {
            for (var i = 0; i < (injuryInfo.length - 2); i++) {
                degreeValue.push(+(injuryInfo[i].measure));
                var year = +(injuryInfo[i].date).substring(0,4);
                var month = +(injuryInfo[i].date).substring(5,7) - 1;
                var day = +(injuryInfo[i].date).substring(8,10) - 1;
                dayMeasured.push((new Date(year, month, day)));
                points.push([+(injuryInfo[i].measure), (i + 1)]);
            }
        }
        getDegDates();

        var goal = +(injuryInfo[injuryInfo.length - 1]);

        var nextGoalId = injuryInfo.length - 2;

        var next_weeks_goal = +(injuryInfo[nextGoalId].goal);

        var year = +(injuryInfo[injuryInfo.length - 2].date.substring(0,4));
        var month = +(injuryInfo[injuryInfo.length - 2].date.substring(5,7)) - 1;
        var day = +(injuryInfo[injuryInfo.length - 2].date.substring(8,10)) - 1;
        var next_weeks_goal_date = new Date(year, month, day);

        var goal_point = [next_weeks_goal, (injuryInfo.length - 2)];

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

        document.getElementById('loading').style.display = 'none';
        document.getElementById('graph-container').style.display = 'inline';


// Add an SVG element with the desired dimensions and margin.
        var graph = d3.select("#graph").append("svg")
            .attr("width", "100%")
            .attr("height", "95%")
            .append("svg:g")
            .attr("transform", "translate(20,-35)");
// create xAxis

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(0)
            .tickFormat(d3.time.format("%-m/%-d"))
            .tickPadding(4)
            .ticks(d3.time.days, 7)
            .ticks(5);

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
            .attr("r", 9)
            .attr("transform", "translate(18,0)")
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
            .attr("r", 9)
            .attr("transform", "translate(18,0)")
        ;
    }, 1000);
}
