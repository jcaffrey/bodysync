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

function submitMeasure(id) {
    var data = {};
    var errorMessage = '';
    if (form.newMeasure.value) data.degreeValue = form.newMeasure.value;
    // ********************************
    //  is this the right route?
    // ********************************
    fetch('/romMetrics/' + id + '/romMetricMeasures', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(console.log('Success!'))
        .catch(console.log('Error!'))
}

// TODO
function submitLogin() {
}

function submitCouponForm() {
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
// Patient fetching (in progress)
// =============================================================

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
// Collapse patients, search, sort
// =============================================================

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
};

function pSearch() {
    search(form.patientSearch.value, patients);
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

function alphaAscending() {
    return patients.sort(compareAlpha)
}

function alphaDescending() {
    return patients.sort(compareAlphaRev)
}

function progAscending() {
    return patients.sort((a, b) => a.progress - b.progress)
}

function progDescending() {
    return patients.sort((a, b) => b.progress - a.progress)
}