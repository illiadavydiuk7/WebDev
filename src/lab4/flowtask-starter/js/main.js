/* FlowTask — landing page behaviour */

document.addEventListener('DOMContentLoaded', function () {

  /* Header navigation */

  document.querySelectorAll('.nav-item').forEach(function (item) {
    item.addEventListener('click', function (event) {
      var section = document.getElementById(item.getAttribute('data-target'));
      if (section) {
        event.preventDefault();
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* Sign-up flow */

  function startSignup() {
    var trial = document.getElementById('trial');
    if (trial) {
      trial.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = 'index.html#trial';
    }
  }

  var headerCta = document.getElementById('header-cta');
  if (headerCta) {
    headerCta.addEventListener('click', startSignup);
  }

  var heroCta = document.getElementById('hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', startSignup);
  }

  /* Trial form */

  var trialForm = document.getElementById('trial-form');
  if (trialForm) {
    trialForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = trialForm.querySelector('input[name="email"]');

      if (!email.value) {
        email.style.boxShadow = '0 0 0 2px #fca5a5';
        return;
      }

      trialForm.innerHTML = '<p role="status">Thanks — check your inbox, the workspace is being created.</p>';
    });
  }

  /* FAQ accordion */

  document.querySelectorAll('.faq__q').forEach(function (question) {
    question.addEventListener('click', function () {
      var answer = document.getElementById(question.getAttribute('aria-controls'));
      var isOpen = question.getAttribute('aria-expanded') === 'true';
      question.setAttribute('aria-expanded', String(!isOpen));
      question.parentElement.classList.toggle('is-open', !isOpen);
      answer.hidden = isOpen;
    });
  });

});
