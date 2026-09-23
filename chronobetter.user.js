// ==UserScript==
// @name         ChronoGestor - Temps restant
// @namespace    three
// @version      11
// @description  Calcul automatique du temps de travail depuis ChronoGestor
// @match        http://55.70.208.15:81/salaries/*
// @grant        GM_info
// @updateURL    https://raw.githubusercontent.com/ThreeWasTaken/Chronobetter/master/chronobetter.user.js
// @downloadURL  https://raw.githubusercontent.com/ThreeWasTaken/Chronobetter/master/chronobetter.user.js
// ==/UserScript==

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================

  // Objectif journalier : 7h48
  var TARGET_MINUTES = 7 * 60 + 48;

  // Pause minimale obligatoire
  var MINIMUM_LUNCH_BREAK = 30;

  // Avant 15h55, partir implique des actions supplémentaires
  var EARLIEST_SIMPLE_DEPARTURE = 15 * 60 + 55;

  var LATEST_DEPARTURE = 18 * 60 + 30;

  // Skin de la petite fenêtre
  var SKIN_IMAGE_URL =
    'https://i.imgur.com/KKhyeG8.jpeg';

  // Fond de la zone centrale ChronoGestor
  var PAGE_BACKGROUND_URL =
    'https://i.imgur.com/KWFA4Zf.jpeg';

  // Couleur derrière la navbar gauche
  var NAV_BACKGROUND =
    '#0376F5';

  // ============================================================
  // PETIT TRAJET BOULOT → MAISON
  // ============================================================

  var WORK_IMAGE_URL =
    'https://i.imgur.com/SXTzY0d.png';

  var WALKER_IMAGE_URL =
    'https://i.imgur.com/PGMuPPQ.png';

  var HOME_IMAGE_URL =
    'https://i.imgur.com/5TRCDi6.png';

  // ============================================================
  // FOND GÉNÉRAL CHRONOGESTOR
  // ============================================================

  var SKIN_STORAGE_KEY =
    'three-chronogestor-skin-enabled';

  function isSkinEnabled() {
    return localStorage.getItem(
      SKIN_STORAGE_KEY
    ) !== 'false';
  }

  function setSkinEnabled(enabled) {
    localStorage.setItem(
      SKIN_STORAGE_KEY,
      enabled ? 'true' : 'false'
    );
  }

  function applyChronoGestorBackground() {

    if (window.name !== 'droite') {
      return;
    }

    var style =
      document.createElement('style');

    style.id =
      'three-chronogestor-background';

    style.textContent = `
            body {
                background-image:
                    url("${PAGE_BACKGROUND_URL}") !important;

                background-size:
                    cover !important;

                background-position:
                    center center !important;

                background-repeat:
                    no-repeat !important;

                background-attachment:
                    fixed !important;
            }
        `;

    document.head.appendChild(style);

    style.disabled = !isSkinEnabled();
  }

  function createSkinSwitch() {

    // Le switch n'existe que dans la page principale
    if (window.self !== window.top) {
      return;
    }

    var container =
      document.createElement('label');

    container.id =
      'three-skin-switch';

    container.title =
      'Activer / désactiver le thème';

    var checkbox =
      document.createElement('input');

    checkbox.type =
      'checkbox';

    checkbox.checked =
      isSkinEnabled();

    var slider =
      document.createElement('span');

    slider.className =
      'three-skin-switch-slider';

    container.appendChild(
      checkbox
    );

    container.appendChild(
      slider
    );

    document.body.appendChild(
      container
    );

    checkbox.addEventListener(
      'change',
      function() {

        var enabled =
          checkbox.checked;

        setSkinEnabled(
          enabled
        );

        var navbarStyle =
          document.getElementById(
            'three-navbar-background'
          );

        if (navbarStyle) {
          navbarStyle.disabled = !enabled;
        }

        /*
         * Le grand fond est dans frameContenu,
         * donc on récupère son document.
         */
        var frame =
          document.getElementById(
            'frameContenu'
          );

        if (
          frame &&
          frame.contentDocument
        ) {

          var backgroundStyle =
            frame.contentDocument
            .getElementById(
              'three-chronogestor-background'
            );

          if (backgroundStyle) {
            backgroundStyle.disabled = !enabled;
          }
        }
      }
    );

    var style =
      document.createElement('style');

    style.textContent = `

            #three-skin-switch {

                position: fixed;

                top: 8px;
                right: 10px;

                width: 38px;
                height: 20px;

                z-index: 2147483647;

                cursor: pointer;

                opacity: .80;

                transition:
                    opacity .15s;
            }

            #three-skin-switch:hover {
                opacity: 1;
            }


            #three-skin-switch input {
                display: none;
            }


            .three-skin-switch-slider {

                position: absolute;

                inset: 0;

                border-radius: 20px;

                background:
                    rgba(80,80,80,.75);

                box-shadow:
                    0 1px 4px
                    rgba(0,0,0,.35);

                transition:
                    .2s;
            }


            .three-skin-switch-slider::before {

                content: "";

                position: absolute;

                width: 16px;
                height: 16px;

                left: 2px;
                top: 2px;

                border-radius: 50%;

                background: white;

                transition:
                    .2s;
            }


            #three-skin-switch
            input:checked +
            .three-skin-switch-slider {

                background:
                    #0376F5;
            }


            #three-skin-switch
            input:checked +
            .three-skin-switch-slider::before {

                transform:
                    translateX(18px);
            }

        `;

    document.head.appendChild(
      style
    );
  }

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      createSkinSwitch
    );

  } else {

    createSkinSwitch();
  }

  function applyNavbarBackground() {

    if (window.self !== window.top) {
      return;
    }

    var style =
      document.createElement('style');

    style.id =
      'three-navbar-background';

    style.textContent = `
            body {
                background-color:
                    ${NAV_BACKGROUND} !important;
            }
        `;

    document.head.appendChild(style);

    style.disabled = !isSkinEnabled();
  }

  applyChronoGestorBackground();
  applyNavbarBackground();

  // ============================================================
  // OUTILS
  // ============================================================

  function pad(value) {
    return value < 10 ?
      '0' + value :
      '' + value;
  }

  function parseTime(value) {

    if (
      !value ||
      value.indexOf(':') === -1
    ) {
      return 0;
    }

    var parts =
      value.split(':');

    return (
      parseInt(parts[0], 10) * 60 +
      parseInt(parts[1], 10)
    );
  }

  function formatClock(minutes) {

    minutes =
      Math.round(minutes);

    var hours =
      Math.floor(minutes / 60);

    var mins =
      minutes % 60;

    return (
      pad(hours) +
      ':' +
      pad(mins)
    );
  }

  function formatDuration(minutes) {

    minutes =
      Math.max(
        0,
        Math.round(minutes)
      );

    var hours =
      Math.floor(minutes / 60);

    var mins =
      minutes % 60;

    return (
      hours +
      'h' +
      pad(mins)
    );
  }

  function parseDebitCredit(value) {

  if (!value) {
    return null;
  }

  value =
    value
      .replace(/\s+/g, '')
      .trim();

  var match =
    value.match(
      /^(-)?(\d+)h(\d+)m$/
    );

  if (!match) {
    return null;
  }

  var minutes =
    parseInt(match[2], 10) * 60 +
    parseInt(match[3], 10);

  if (match[1] === '-') {
    minutes = -minutes;
  }

  return minutes;
}


  function readPreviousDayBalance() {

    var chronoDocument;

    try {

      chronoDocument =
        window.top.frames["droite"].document;

    } catch (e) {

      return null;
    }


    /*
     * Trouve précisément le TR dont
     * la première cellule est
     * "Débit Crédit Cumulé".
     */
    var rows =
      chronoDocument.querySelectorAll('tr');

    var balanceRow =
      null;

    for (
      var i = 0;
      i < rows.length;
      i++
    ) {

      var cells =
        rows[i].children;

      if (!cells.length) {
        continue;
      }

      var label =
        cells[0]
          .textContent
          .replace(/\s+/g, ' ')
          .trim();

      if (
        label ===
        'Débit Crédit Cumulé'
      ) {

        balanceRow =
          rows[i];

        break;
      }
    }


    if (!balanceRow) {
      return null;
    }


    /*
     * Colonnes :
     *
     * 0 = libellé
     * 1 = lundi
     * 2 = mardi
     * 3 = mercredi
     * 4 = jeudi
     * 5 = vendredi
     * 6 = samedi
     * 7 = dimanche
     *
     * getDay() :
     * 1 = lundi
     * 2 = mardi
     * 3 = mercredi...
     */
    var day =
      new Date().getDay();


    /*
     * Dimanche JS = 0,
     * mais colonne ChronoGestor = 7.
     */
    var currentColumn =
      day === 0 ?
      7 :
      day;


    /*
     * On veut LE JOUR PRÉCÉDENT.
     *
     * Aujourd'hui mercredi (3)
     * => mardi = cellule 2.
     */
    var previousColumn =
      currentColumn - 1;


    /*
     * Lundi nécessitera la semaine
     * précédente.
     */
    if (previousColumn < 1) {
      return null;
    }


    var cells =
      balanceRow.children;


    if (!cells[previousColumn]) {
      return null;
    }


    var rawValue =
      cells[previousColumn]
        .textContent
        .trim();


    var minutes =
      parseDebitCredit(
        rawValue
      );


    if (minutes === null) {
      return null;
    }


    return {
      minutes: minutes,
      rawValue: rawValue
    };
  }

  function getTodayKey() {

    var now =
      new Date();

    return (
      pad(now.getDate()) +
      '_' +
      pad(now.getMonth() + 1) +
      '_' +
      now.getFullYear()
    );
  }

  function getTodayDisplay() {

    var now =
      new Date();

    return (
      pad(now.getDate()) +
      '/' +
      pad(now.getMonth() + 1) +
      '/' +
      now.getFullYear()
    );
  }

  // ============================================================
  // LECTURE DES POINTAGES
  // ============================================================

  function readPunches() {

    var key =
      getTodayKey();

    var inputs =
      document.querySelectorAll(
        'input[name^="' +
        key +
        '_"]'
      );

    if (!inputs.length) {
      return null;
    }

    var punches = [];

    for (
      var i = 0; i < inputs.length; i++
    ) {

      var name =
        inputs[i]
        .getAttribute('name');

      var value =
        inputs[i].value;

      if (
        !value ||
        !/^\d{1,2}:\d{2}$/.test(value)
      ) {
        continue;
      }

      var index =
        parseInt(
          name.substring(
            (key + '_').length
          ),
          10
        );

      if (isNaN(index)) {
        continue;
      }

      punches.push({
        index: index,
        value: value,
        minutes: parseTime(value)
      });
    }

    punches.sort(
      function(a, b) {
        return a.index - b.index;
      }
    );

    return punches;
  }

  // ============================================================
  // INTERPRÉTATION DES POINTAGES
  // ============================================================

  function analysePunches(punches) {

    if (
      !punches ||
      !punches.length
    ) {
      return null;
    }

    var completedMinutes = 0;

    /*
     * Copie des pointages pour pouvoir corriger
     * la reprise sans modifier les valeurs
     * réellement présentes dans ChronoGestor.
     */
    var effectivePunches =
      punches.map(
        function(punch) {
          return {
            index: punch.index,
            value: punch.value,
            minutes: punch.minutes
          };
        }
      );

    /*
     * La première pause correspond à :
     *
     *   [0] entrée matin
     *   [1] sortie déjeuner
     *   [2] reprise déjeuner
     *
     * Si cette pause fait moins de 30 minutes,
     * ChronoGestor la corrigera ensuite à 30 min.
     *
     * On applique donc immédiatement la même
     * correction dans le widget.
     */
    if (effectivePunches.length >= 3) {

      var lunchExit =
        effectivePunches[1].minutes;

      var lunchResume =
        effectivePunches[2].minutes;

      var lunchDuration =
        lunchResume -
        lunchExit;

      if (
        lunchDuration >= 0 &&
        lunchDuration < MINIMUM_LUNCH_BREAK
      ) {

        var correctedResume =
          lunchExit +
          MINIMUM_LUNCH_BREAK;

        effectivePunches[2].minutes =
          correctedResume;

        effectivePunches[2].value =
          formatClock(
            correctedResume
          );
      }
    }

    // Paires entrée / sortie
    for (
      var i = 0; i + 1 < effectivePunches.length; i += 2
    ) {

      var start =
        effectivePunches[i].minutes;

      var end =
        effectivePunches[i + 1].minutes;

      if (end >= start) {
        completedMinutes +=
          end - start;
      }
    }

    // Nombre impair = période actuellement ouverte
    var currentStart = null;

    if (
      effectivePunches.length % 2 === 1
    ) {

      currentStart =
        effectivePunches[
          effectivePunches.length - 1
        ].value;
    }

    // Un seul pointage = pause de midi pas encore prise
    var lunchNotTakenYet =
      effectivePunches.length === 1;

    return {
      completedMinutes: completedMinutes,

      currentStart: currentStart,

      lunchNotTakenYet: lunchNotTakenYet
    };
  }

  // ============================================================
  // ATTENDRE LE TABLEAU
  // ============================================================

  var attempts = 0;

  var detectionInterval =
    setInterval(
      function() {

        attempts++;

        var punches =
          readPunches();

        if (
          punches &&
          punches.length
        ) {

          clearInterval(
            detectionInterval
          );

          initialiseWidget(
            punches
          );

          return;
        }

        if (attempts >= 30) {
          clearInterval(
            detectionInterval
          );
        }

      },
      500
    );

  // ============================================================
  // WIDGET
  // ============================================================

  function initialiseWidget(initialPunches) {

    if (
      document.getElementById(
        'three-worktime-widget'
      )
    ) {
      return;
    }

    var analysis =
      analysePunches(
        initialPunches
      );

    if (!analysis) {
      return;
    }

    var initialMorning =
      formatClock(
        analysis.completedMinutes
      );

    var initialResume =
      analysis.currentStart || '';

    var minimumLunchBreak =
      analysis.lunchNotTakenYet ?
      MINIMUM_LUNCH_BREAK :
      0;

    // ========================================================
    // CSS
    // ========================================================

    var style =
      document.createElement('style');

    style.textContent = `

            /* ==================================================
             * FENÊTRE
             * ================================================== */

            #three-worktime-widget {

                position: fixed;

                top: 80px;
                right: 30px;

                width: 310px;

                z-index: 2147483647;

                background-color: #fff;

                background-position: center;
                background-size: cover;
                background-repeat: no-repeat;

                color: #18222b;

                border:
                    1px solid
                    rgba(40,70,90,.65);

                border-radius: 8px;

                box-shadow:
                    0 5px 20px
                    rgba(0,0,0,.30);

                font-family:
                    Arial,
                    sans-serif;

                font-size: 14px;

                overflow: hidden;
            }


            /* ==================================================
             * HEADER
             * ================================================== */

            #three-worktime-header {

                padding: 9px 12px;

                background:
                    rgba(
                        0,
                        100,
                        195,
                        .92
                    );

                color: white;

                cursor: move;

                display: flex;

                justify-content:
                    space-between;

                align-items: center;

                user-select: none;

                text-shadow:
                    0 1px 2px
                    rgba(0,0,0,.35);
            }


			#three-worktime-close,
			#three-update {
				border: 0;
				background: transparent;
				color: white;
				font-size: 20px;
				cursor: pointer;
			}


            /* ==================================================
             * CORPS
             * ================================================== */

            #three-worktime-body {

                padding: 14px;

                background: transparent;
            }


            /* ==================================================
             * CARTOUCHES
             * ================================================== */

            #three-auto-info {

                margin-bottom: 12px;

                padding: 6px 8px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .88
                    );

                border-radius: 4px;

                color: #45535f;

                font-size: 10px;

                text-align: center;

                box-shadow:
                    0 1px 3px
                    rgba(0,0,0,.10);
            }


            #three-lunch-info {

                margin-top: -5px;
                margin-bottom: 12px;

                padding: 6px 8px;

                background:
                    rgba(
                        255,
                        243,
                        205,
                        .94
                    );

                color: #805d00;

                border-radius: 4px;

                font-size: 10px;

                text-align: center;

                box-shadow:
                    0 1px 3px
                    rgba(0,0,0,.10);
            }


            /* ==================================================
             * LISIBILITÉ
             * ================================================== */

            .three-worktime-field label,
            .three-result-label,
            #three-countdown-target,
            #three-status,
            #three-slider-labels {

                color: #34495e;

                text-shadow:
                    0 1px 2px
                        rgba(255,255,255,.98),
                    0 0 4px
                        rgba(255,255,255,.90);
            }


            #three-departure-line > span:first-child {

                font-weight: 600;

                text-shadow:
                    0 1px 2px white,
                    0 0 4px white;
            }


            /* ==================================================
             * CHAMPS
             * ================================================== */

            .three-worktime-row {

                display: flex;

                gap: 10px;

                margin-bottom: 14px;
            }


            .three-worktime-field {
                flex: 1;
            }


            .three-worktime-field label {

                display: block;

                margin-bottom: 4px;

                font-size: 11px;

                font-weight: 500;
            }


            .three-worktime-field input {

                width: 100%;

                box-sizing: border-box;

                padding: 6px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .92
                    );

                border:
                    1px solid
                    rgba(
                        70,
                        90,
                        110,
                        .65
                    );

                border-radius: 3px;

                color: #111;
            }


            /* ==================================================
             * DÉPART
             * ================================================== */

            #three-departure-line {

                display: flex;

                justify-content:
                    space-between;

                align-items: center;

                margin-bottom: 5px;
            }


            #three-departure-time {

                font-size: 25px;

                font-weight: bold;

                color: #111;

                text-shadow:
                    0 1px 2px
                        rgba(255,255,255,.98),
                    0 0 6px
                        rgba(255,255,255,.80);
            }


            /* ==================================================
             * SLIDER
             * ================================================== */

            #three-slider-zone {

                position: relative;

                padding-top: 32px;
            }


            #three-goal-marker {

                position: absolute;

                top: 0;

                transform:
                    translateX(-50%);

                color: #0875d1;

                font-size: 11px;

                font-weight: bold;

                white-space: nowrap;

                text-align: center;

                pointer-events: none;

                z-index: 3;

                text-shadow:
                    0 1px 2px white,
                    0 0 4px white;
            }


            #three-goal-marker::after {

                content: "▼";

                display: block;

                font-size: 12px;
            }


            #three-legal-marker {

                position: absolute;

                bottom: 15px;

                width: 2px;
                height: 18px;

                background: #d00000;

                transform:
                    translateX(-1px);

                z-index: 2;

                pointer-events: none;
            }


            #three-balance-marker {

              position: absolute;

              bottom: 15px;

              width: 2px;
              height: 18px;

              background: #159447;

              transform:
                translateX(-1px);

              z-index: 2;
            }


            #three-balance-marker::before {
              content: attr(data-time);

              position: absolute;

              top: 19px;
              left: 50%;

              transform: translateX(-50%);

              color: #159447;

              font-size: 9px;
              font-weight: bold;
              white-space: nowrap;

              text-shadow:
                0 1px 2px white,
                0 0 4px white;
            }


            #three-balance-marker.three-balance-debit {

              background: #d46b00;
            }


            #three-balance-marker.three-balance-debit::before {

              color: #d46b00;
            }

            #three-legal-marker::before {

                content: "15:55";

                position: absolute;

                bottom: 19px;
                left: 50%;

                transform:
                    translateX(-50%);

                color: #d00000;

                font-size: 9px;

                font-weight: bold;

                white-space: nowrap;

                text-shadow:
                    0 1px 2px white,
                    0 0 4px white;
            }


            #three-departure-slider {

                width: 100%;

                margin: 0;
            }

            #three-latest-marker {
              position: absolute;

              bottom: 15px;

              width: 2px;
              height: 18px;

              background: #d00000;

              transform: translateX(-1px);

              z-index: 2;

              pointer-events: none;
            }

            #three-latest-marker::before {
              content: "18:30";

              position: absolute;

              bottom: 19px;
              left: 50%;

              transform: translateX(-50%);

              color: #d00000;

              font-size: 9px;
              font-weight: bold;
              white-space: nowrap;

              text-shadow:
                0 1px 2px white,
                0 0 4px white;
            }

            #three-slider-labels {

                display: flex;

                justify-content:
                    space-between;

                font-size: 10px;
            }


            /* ==================================================
             * BOUTONS
             * ================================================== */

            #three-buttons {

                display: flex;

                gap: 5px;

                margin-top: 12px;
            }


            #three-buttons button {

                flex: 1;

                padding: 6px;

                cursor: pointer;

                background:
                    rgba(
                        245,
                        245,
                        245,
                        .90
                    );

                border:
                    1px solid
                    rgba(
                        70,
                        90,
                        110,
                        .65
                    );

                border-radius: 4px;

                color: #111;
            }


            #three-buttons button:hover {

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .98
                    );
            }


            /* ==================================================
             * RÉSULTATS
             * ================================================== */

            #three-results {

                display: flex;

                justify-content:
                    space-between;

                align-items:
                    flex-end;

                border-top:
                    1px solid
                    rgba(
                        50,
                        80,
                        100,
                        .30
                    );

                margin-top: 14px;

                padding-top: 12px;
            }


            #three-period-result {
                min-width: 90px;
            }


            #three-total-result {
                margin-left: auto;
            }


            .three-result-label {

                font-size: 10px;

                text-transform: uppercase;

                font-weight: 500;
            }


            #three-afternoon {

                font-size: 17px;

                font-weight: bold;

                color: #111;

                text-shadow:
                    0 1px 2px
                        rgba(255,255,255,.98),
                    0 0 6px
                        rgba(255,255,255,.80);
            }


            #three-total {

                font-size: 25px;

                font-weight: bold;

                text-align: right;

                color: #111;

                text-shadow:
                    0 1px 2px
                        rgba(255,255,255,.98),
                    0 0 6px
                        rgba(255,255,255,.80);
            }


            /* ==================================================
             * COMPTE À REBOURS
             * ================================================== */

            #three-countdown-zone {

                border-top:
                    1px solid
                    rgba(
                        50,
                        80,
                        100,
                        .30
                    );

                margin-top: 12px;

                padding-top: 10px;

                text-align: center;
            }


            #three-countdown-header {

                position: relative;

                display: flex;

                align-items: center;

                justify-content: center;

                min-height: 20px;
            }


            #three-countdown-toggle {

                position: absolute;

                right: 0;
                top: -3px;

                min-width: 26px;

                padding: 1px 5px;

                border:
                    1px solid
                    rgba(
                        70,
                        90,
                        110,
                        .30
                    );

                border-radius: 4px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .60
                    );

                font-size: 11px;

                line-height: 18px;

                cursor: pointer;

                color: #34495e;
            }


            #three-countdown-toggle:hover {

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .92
                    );
            }


            #three-countdown {

                margin-top: 3px;

                font-family: monospace;

                font-size: 30px;

                font-weight: bold;

                letter-spacing: 1px;

                color: #111;

                text-shadow:
                    0 1px 2px
                        rgba(255,255,255,.98),
                    0 0 6px
                        rgba(255,255,255,.85);
            }


            #three-countdown-target {

                margin-top: 2px;

                font-size: 10px;

                font-weight: 500;
            }


            #three-countdown.hidden,
            #three-countdown-target.hidden {

                visibility: hidden;
            }


            /* ==================================================
             * STATUT
             * ================================================== */

            #three-status {

                margin-top: 10px;

                color: #34495e;

                font-size: 12px;

                font-weight: 500;

                text-align: center;

                text-shadow:
                    0 1px 2px white,
                    0 0 5px white;
            }


            /* ==================================================
             * EN ATTENTE D'UNE REPRISE
             * ================================================== */

            #three-no-resume {

                padding: 10px;

                background:
                    rgba(
                        255,
                        243,
                        205,
                        .94
                    );

                border-radius: 4px;

                color: #805d00;

                font-size: 12px;

                text-align: center;

                box-shadow:
                    0 1px 3px
                    rgba(0,0,0,.10);
            }


            /* ==================================================
             * TRAJET BOULOT → MAISON
             * ================================================== */

            #three-journey {

                position: relative;

                height: 67px;

                margin-top: 7px;

                border-top:
                    1px solid
                    rgba(50,80,100,.22);

                overflow: hidden;
            }


            #three-journey-work {

                position: absolute;

                left: -4px;
                bottom: 0;

                width: 67px;
                height: 62px;

                object-fit: contain;

                z-index: 2;

                pointer-events: none;
            }


            #three-journey-home {

                position: absolute;

                right: -3px;
                bottom: 0;

                width: 63px;
                height: 62px;

                object-fit: contain;

                z-index: 2;

                pointer-events: none;
            }


            #three-journey-track {

                position: absolute;

                left: 49px;
                right: 49px;

                bottom: 11px;

                height: 3px;

                border-radius: 99px;

                background:
                    rgba(40,65,80,.28);

                z-index: 1;
            }


            #three-journey-progress {

                width: 0%;
                height: 100%;

                border-radius: inherit;

                background:
                    rgba(20,110,200,.72);

                transition:
                    width .6s linear;
            }


            #three-journey-walker {

                position: absolute;

                left: 49px;
                bottom: 5px;

                width: 31px;
                height: 46px;

                object-fit: contain;

                transform:
                    translateX(-50%);

                z-index: 4;

                pointer-events: none;

                transition:
                    left .6s linear;

                filter:
                    drop-shadow(
                        0 1px 1px
                        rgba(0,0,0,.22)
                    );
            }

        `;

    document.head.appendChild(
      style
    );

    // ========================================================
    // HTML
    // ========================================================

    var widget =
      document.createElement(
        'div'
      );

    widget.id =
      'three-worktime-widget';

    widget.innerHTML = `

			<div id="three-worktime-header">

			<strong>
				⏱ Chronobetter
				<span id="three-version">
					v${GM_info.script.version}
				</span>
			</strong>

				<div>
					<button
						id="three-update"
						title="Mettre à jour Chronobetter"
					>
						↻
					</button>

					<button
						id="three-worktime-close"
						title="Fermer"
					>
						×
					</button>
				</div>

			</div>


            <div id="three-worktime-body">


                <div id="three-auto-info">

                    Pointages du
                    ${getTodayDisplay()}
                    chargés automatiquement

                </div>


                <div
                    id="three-lunch-info"
                    style="${
                        minimumLunchBreak
                            ? ''
                            : 'display:none'
                    }"
                >

                    Départ optimiste incluant
                    30 min de pause minimale

                </div>


                <div
                    class="three-worktime-row"
                >

                    <div
                        class="three-worktime-field"
                    >

                        <label>
                            Déjà fait
                        </label>

                        <input
                            id="three-morning"
                            type="time"
                            value="${initialMorning}"
                        >

                    </div>


                    <div
                        class="three-worktime-field"
                    >

                        <label>
                            Reprise
                        </label>

                        <input
                            id="three-resume"
                            type="time"
                            value="${initialResume}"
                        >

                    </div>

                </div>


                <div id="three-calculation">


                    <div
                        id="three-departure-line"
                    >

                        <span>
                            Départ
                        </span>

                        <span
                            id="three-departure-time"
                        >
                            --:--
                        </span>

                    </div>


                    <div
                        id="three-slider-zone"
                    >


                        <div
                            id="three-goal-marker"
                        >

                            7h48 ·

                            <span
                                id="three-goal-time"
                            >
                                --:--
                            </span>

                        </div>


                        <div
                            id="three-legal-marker"
                            title="15h55 — départ avant cette heure : actions supplémentaires"
                        ></div>

                        <div id="three-latest-marker"></div>

                        <div
                          id="three-balance-marker"
                        ></div>

                        <input
                            id="three-departure-slider"
                            type="range"
                            min="840"
                            max="1140"
                            step="1"
                            value="1074"
                        >


                        <div
                            id="three-slider-labels"
                        >

                            <span>
                                14:00
                            </span>

                            <span>
                                19:00
                            </span>

                        </div>


                    </div>


                    <div id="three-buttons">

                        <button
                            id="three-minus"
                        >
                            − 1 min
                        </button>

                        <button
                            id="three-goal-button"
                        >
                            7h48
                        </button>

                        <button
                            id="three-plus"
                        >
                            + 1 min
                        </button>

                    </div>


                    <div id="three-results">


                        <div id="three-period-result">

                            <div
                                class="three-result-label"
                            >
                                Après reprise
                            </div>

                            <div
                                id="three-afternoon"
                            >
                                --:--
                            </div>

                        </div>


                        <div id="three-total-result">

                            <div
                                class="three-result-label"
                                style="text-align:right"
                            >
                                Total prévu
                            </div>

                            <div
                                id="three-total"
                            >
                                --:--
                            </div>

                        </div>


                    </div>


                    <div
                        id="three-countdown-zone"
                    >


                        <div
                            id="three-countdown-header"
                        >

                            <div
                                class="three-result-label"
                                id="three-countdown-label"
                            >
                                Temps restant
                            </div>


                            <button
                                id="three-countdown-toggle"
                                type="button"
                                title="Masquer le compte à rebours"
                            >
                                👁
                            </button>

                        </div>


                        <div
                            id="three-countdown"
                        >
                            --:--:--
                        </div>


                        <div
                            id="three-countdown-target"
                        ></div>


                    </div>


                    <div
                        id="three-status"
                    ></div>


                </div>


                <div
                    id="three-no-resume"
                    style="display:none"
                >

                    En attente du prochain
                    pointage d'entrée.

                </div>


                <div
                    id="three-journey"
                >

                    <div
                        id="three-journey-track"
                    >
                        <div
                            id="three-journey-progress"
                        ></div>
                    </div>


                    <img
                        id="three-journey-work"
                        src="${WORK_IMAGE_URL}"
                        alt=""
                    >


                    <img
                        id="three-journey-walker"
                        src="${WALKER_IMAGE_URL}"
                        alt=""
                    >


                    <img
                        id="three-journey-home"
                        src="${HOME_IMAGE_URL}"
                        alt=""
                    >

                </div>


            </div>
        `;

    document.body.appendChild(
      widget
    );

	document
	  .getElementById('three-update')
	  .addEventListener(
		'click',
		function() {
		  window.open(
			'https://github.com/ThreeWasTaken/Chronobetter/raw/refs/heads/master/chronobetter.user.js',
			'_blank'
		  );
		}
	  );

    // ========================================================
    // SKIN
    // ========================================================

    if (SKIN_IMAGE_URL) {

      widget.style.backgroundImage =
        'url("' +
        SKIN_IMAGE_URL +
        '")';
    }

    // ========================================================
    // RÉFÉRENCES DOM
    // ========================================================

    var morning =
      document.getElementById(
        'three-morning'
      );

    var resume =
      document.getElementById(
        'three-resume'
      );

    var slider =
      document.getElementById(
        'three-departure-slider'
      );

    var departureTime =
      document.getElementById(
        'three-departure-time'
      );

    var periodResult =
      document.getElementById(
        'three-period-result'
      );

    var afternoonDisplay =
      document.getElementById(
        'three-afternoon'
      );

    var totalDisplay =
      document.getElementById(
        'three-total'
      );

    var status =
      document.getElementById(
        'three-status'
      );

    var marker =
      document.getElementById(
        'three-goal-marker'
      );

    var goalTime =
      document.getElementById(
        'three-goal-time'
      );

    var legalMarker =
      document.getElementById(
        'three-legal-marker'
      );

    var latestMarker =
      document.getElementById(
        'three-latest-marker'
      );

    var balanceMarker =
      document.getElementById(
        'three-balance-marker'
      );

    var countdown =
      document.getElementById(
        'three-countdown'
      );

    var countdownLabel =
      document.getElementById(
        'three-countdown-label'
      );

    var countdownTarget =
      document.getElementById(
        'three-countdown-target'
      );

    var countdownToggle =
      document.getElementById(
        'three-countdown-toggle'
      );

    var calculation =
      document.getElementById(
        'three-calculation'
      );

    var noResume =
      document.getElementById(
        'three-no-resume'
      );

    // Trajet

    var journey =
      document.getElementById(
        'three-journey'
      );

    var journeyWalker =
      document.getElementById(
        'three-journey-walker'
      );

    var journeyProgress =
      document.getElementById(
        'three-journey-progress'
      );

    // ========================================================
    // TRAIT ROUGE 15H55
    // ========================================================

    function updateLegalMarker() {

      var min =
        parseInt(slider.min, 10);

      var max =
        parseInt(slider.max, 10);

      function positionMarker(marker, minutes) {

        var ratio =
          (minutes - min) /
          (max - min);

        ratio =
          Math.max(
            0,
            Math.min(1, ratio)
          );

        marker.style.left =
          'calc(10px + (100% - 20px) * ' +
          ratio +
          ')';
      }

      positionMarker(
        legalMarker,
        EARLIEST_SIMPLE_DEPARTURE
      );

      positionMarker(
        latestMarker,
        LATEST_DEPARTURE
      );
    }

    function updateBalanceMarker() {

      var balance =
        readPreviousDayBalance();

      var goal =
        getGoalDeparture();


      if (
        !balance ||
        goal === null ||
        balance.minutes === 0
      ) {

        balanceMarker.style.display =
          'none';

        return;
      }


      /*
       * Départ qui permettrait théoriquement
       * de consommer TOUT le débit/crédit.
       *
       * Crédit positif => plus tôt.
       * Débit négatif => plus tard.
       */
      var theoreticalDeparture =
        goal -
        balance.minutes;


      /*
       * Mais on respecte les limites :
       *
       * pas avant 15h55
       * pas après 18h30
       */
      var balanceDeparture =
        Math.max(
          EARLIEST_SIMPLE_DEPARTURE,
          Math.min(
            LATEST_DEPARTURE,
            theoreticalDeparture
          )
        );


      /*
       * Quantité de crédit/débit réellement
       * utilisable aujourd'hui.
       */
      var usableBalance =
        goal -
        balanceDeparture;


      var remainingBalance =
        balance.minutes -
        usableBalance;


      /*
       * Position sur le slider.
       */
      var min =
        parseInt(
          slider.min,
          10
        );

      var max =
        parseInt(
          slider.max,
          10
        );


      var percent =
        (
          (
            balanceDeparture -
            min
          ) /
          (
            max -
            min
          )
        ) *
        100;


      percent =
        Math.max(
          0,
          Math.min(
            100,
            percent
          )
        );


      balanceMarker.style.display =
        'block';

      balanceMarker.style.left =
        'calc(10px + (100% - 20px) * ' +
        (percent / 100) +
        ')';


      /*
       * Débit = orange
       * Crédit = vert
       */
      balanceMarker.classList.toggle(
        'three-balance-debit',
        balance.minutes < 0
      );


      var balanceDuration =
        formatDuration(
          Math.abs(
            balance.minutes
          )
        );


      var prefix =
        balance.minutes < 0 ?
        'Débit -' :
        'Crédit +';


      /*
       * Texte principal.
       */
      var label =
        prefix +
        balanceDuration +
        ' · ' +
        formatClock(
          balanceDeparture
        );


      /*
       * Si tout le solde n'est PAS
       * utilisable aujourd'hui,
       * on l'indique dans le tooltip.
       */
      var limited =
        Math.abs(
          remainingBalance
        ) > 0.01;


      balanceMarker.setAttribute(
        'data-label',
        label
      );

      balanceMarker.setAttribute(
        'data-time',
        formatClock(balanceDeparture)
      );

      if (limited) {

        var usableDuration =
          formatDuration(
            Math.abs(
              usableBalance
            )
          );

        balanceMarker.title =
          (
            balance.minutes < 0 ?
            'Débit cumulé : -' :
            'Crédit cumulé : +'
          ) +
          balanceDuration +
          '\n' +
          (
            balance.minutes < 0 ?
            'Rattrapable aujourd’hui : -' :
            'Utilisable aujourd’hui : +'
          ) +
          usableDuration +
          '\n' +
          'Limite de départ : ' +
          formatClock(
            balanceDeparture
          );

      } else {

        balanceMarker.title =
          (
            balance.minutes < 0 ?
            'Débit cumulé de la veille : -' :
            'Crédit cumulé de la veille : +'
          ) +
          balanceDuration +
          '\n' +
          'Départ théorique : ' +
          formatClock(
            balanceDeparture
          );
      }
    }

    // ========================================================
    // OBJECTIF 7H48
    // ========================================================

    function getGoalDeparture() {

      if (!resume.value) {
        return null;
      }

      return (
        parseTime(
          resume.value
        ) +
        TARGET_MINUTES -
        parseTime(
          morning.value
        ) +
        minimumLunchBreak
      );
    }

    // ========================================================
    // CALCUL PRINCIPAL
    // ========================================================

    function update() {

      if (!resume.value) {

        calculation.style.display =
          'none';

        noResume.style.display =
          'block';

        return;
      }

      calculation.style.display =
        'block';

      noResume.style.display =
        'none';

      var completedMinutes =
        parseTime(
          morning.value
        );

      var resumeMinutes =
        parseTime(
          resume.value
        );

      var departureMinutes =
        parseInt(
          slider.value,
          10
        );

      var currentPeriod =
        departureMinutes -
        resumeMinutes -
        minimumLunchBreak;

      var total =
        completedMinutes +
        currentPeriod;

      var goal =
        getGoalDeparture();

      departureTime.textContent =
        formatClock(
          departureMinutes
        );

      /*
       * Avant la pause, "période actuelle"
       * serait identique au total puisque
       * aucune période n'est encore terminée.
       *
       * On masque donc cette valeur redondante.
       */
      if (minimumLunchBreak > 0) {

        periodResult.style.display =
          'none';

      } else {

        periodResult.style.display =
          'block';

        afternoonDisplay.textContent =
          formatDuration(
            currentPeriod
          );
      }

      totalDisplay.textContent =
        formatDuration(
          total
        );

      goalTime.textContent =
        formatClock(
          goal
        );

      // ----------------------------------------------------
      // REPÈRE BLEU 7H48
      // ----------------------------------------------------

      var min =
        parseInt(
          slider.min,
          10
        );

      var max =
        parseInt(
          slider.max,
          10
        );

      var percent =
        (
          (
            goal -
            min
          ) /
          (
            max -
            min
          )
        ) *
        100;

      percent =
        Math.max(
          0,
          Math.min(
            100,
            percent
          )
        );

      marker.style.left =
        'calc(10px + (100% - 20px) * ' +
        (percent / 100) +
        ')';

      // ----------------------------------------------------
      // DIFFÉRENCE OBJECTIF
      // ----------------------------------------------------

      var difference =
        total -
        TARGET_MINUTES;

      if (difference === 0) {

        status.textContent =
          minimumLunchBreak ?
          'Objectif 7h48 avec 30 min de pause minimale.' :
          'Objectif atteint exactement.';

      } else if (difference < 0) {

        status.textContent =
          'Il manque ' +
          formatDuration(
            -difference
          );

      } else {

        status.textContent =
          '+' +
          formatDuration(
            difference
          ) +
          ' au-delà de l’objectif';
      }

      updateCountdown();
      updateBalanceMarker();
    }

    // ========================================================
    // COMPTE À REBOURS
    // ========================================================

    function updateCountdown() {

      if (!resume.value) {
        return;
      }

      var now =
        new Date();

      var departureMinutes =
        parseInt(
          slider.value,
          10
        );

      var departureHour =
        Math.floor(
          departureMinutes /
          60
        );

      var departureMinute =
        departureMinutes %
        60;

      var departure =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          departureHour,
          departureMinute,
          0,
          0
        );

      var difference =
        departure.getTime() -
        now.getTime();

      countdownTarget.textContent =
        'départ prévu à ' +
        formatClock(
          departureMinutes
        );

      // Avant le départ
      if (difference > 0) {

        var seconds =
          Math.ceil(
            difference /
            1000
          );

        var hours =
          Math.floor(
            seconds /
            3600
          );

        seconds %=
          3600;

        var minutes =
          Math.floor(
            seconds /
            60
          );

        seconds %=
          60;

        countdownLabel.textContent =
          'Temps restant';

        countdown.textContent =
          pad(hours) +
          ':' +
          pad(minutes) +
          ':' +
          pad(seconds);

        return;
      }

      // Après le départ
      var overtimeSeconds =
        Math.floor(
          Math.abs(
            difference
          ) /
          1000
        );

      var overtimeHours =
        Math.floor(
          overtimeSeconds /
          3600
        );

      overtimeSeconds %=
        3600;

      var overtimeMinutes =
        Math.floor(
          overtimeSeconds /
          60
        );

      overtimeSeconds %=
        60;

      countdownLabel.textContent =
        'Temps en plus';

      countdown.textContent =
        '+' +
        pad(
          overtimeHours
        ) +
        ':' +
        pad(
          overtimeMinutes
        ) +
        ':' +
        pad(
          overtimeSeconds
        );
    }

    // ========================================================
    // PROGRESSION BOULOT → MAISON
    // ========================================================

    function updateJourney() {

      var punches =
        readPunches();

      var liveAnalysis =
        analysePunches(
          punches
        );

      if (!liveAnalysis) {
        return;
      }

      /*
       * Temps réellement travaillé :
       * périodes terminées...
       */
      var workedMinutes =
        liveAnalysis.completedMinutes;

      /*
       * ...plus la période actuellement
       * ouverte s'il y en a une.
       *
       * Pendant une pause currentStart vaut
       * null : le personnage ne bouge donc pas.
       */
      if (liveAnalysis.currentStart) {

        var now =
          new Date();

        var nowMinutes =
          now.getHours() * 60 +
          now.getMinutes() +
          now.getSeconds() / 60;

        var currentStartMinutes =
          parseTime(
            liveAnalysis.currentStart
          );

        workedMinutes +=
          Math.max(
            0,
            nowMinutes -
            currentStartMinutes
          );
      }

      var selectedDeparture =
        parseInt(
          slider.value,
          10
        );

      var plannedWork =
        parseTime(morning.value) +
        (
          selectedDeparture -
          parseTime(resume.value) -
          minimumLunchBreak
        );

      var ratio =
        plannedWork > 0 ?
        workedMinutes / plannedWork :
        0;

      ratio =
        Math.max(
          0,
          Math.min(
            1,
            ratio
          )
        );

      /*
       * Position du personnage entre
       * les deux bâtiments.
       */
      var start =
        49;

      var end =
        journey.clientWidth -
        49;

      var position =
        start +
        (
          end -
          start
        ) *
        ratio;

      journeyWalker.style.left =
        position +
        'px';

      journeyProgress.style.width =
        (ratio * 100) +
        '%';

      /*
       * Tooltip de toute la zone.
       */
      journey.title =
        Math.round(
          ratio * 100
        ) +
        ' % du chemin parcouru';
    }

    // ========================================================
    // POSITION INITIALE = OBJECTIF
    // ========================================================

    if (resume.value) {

      var initialGoal =
        getGoalDeparture();

      if (
        initialGoal >=
        parseInt(
          slider.min,
          10
        ) &&
        initialGoal <=
        parseInt(
          slider.max,
          10
        )
      ) {

        slider.value =
          initialGoal;
      }
    }

    // ========================================================
    // INPUTS
    // ========================================================

    morning.oninput =
      update;

    resume.oninput =
      update;

    slider.oninput =
      function() {
        update();
        updateJourney();
      };

    // ========================================================
    // -1 MIN
    // ========================================================

    document
      .getElementById(
        'three-minus'
      )
      .onclick =
      function() {

        slider.value =
          Math.max(
            parseInt(
              slider.min,
              10
            ),
            parseInt(
              slider.value,
              10
            ) - 1
          );

        update();
      };

    // ========================================================
    // +1 MIN
    // ========================================================

    document
      .getElementById(
        'three-plus'
      )
      .onclick =
      function() {

        slider.value =
          Math.min(
            parseInt(
              slider.max,
              10
            ),
            parseInt(
              slider.value,
              10
            ) + 1
          );

        update();
      };

    // ========================================================
    // BOUTON 7H48
    // ========================================================

    document
      .getElementById(
        'three-goal-button'
      )
      .onclick =
      function() {

        var goal =
          getGoalDeparture();

        if (goal === null) {
          return;
        }

        slider.value =
          Math.max(
            parseInt(
              slider.min,
              10
            ),
            Math.min(
              parseInt(
                slider.max,
                10
              ),
              goal
            )
          );

        update();
      };

    // ========================================================
    // TOGGLE COMPTE À REBOURS
    // ========================================================

    var countdownVisible =
      true;

    countdownToggle.onclick =
      function() {

        countdownVisible = !countdownVisible;

        countdown.classList.toggle(
          'hidden',
          !countdownVisible
        );

        countdownTarget.classList.toggle(
          'hidden',
          !countdownVisible
        );

        countdownToggle.textContent =
          countdownVisible ?
          '👁' :
          '◌';

        countdownToggle.title =
          countdownVisible ?
          'Masquer le compte à rebours' :
          'Afficher le compte à rebours';
      };

    // ========================================================
    // MISE À JOUR TEMPS RÉEL
    // ========================================================

    var countdownInterval =
      setInterval(
        function() {

          updateCountdown();

          updateJourney();

        },
        1000
      );

    // ========================================================
    // FERMETURE
    // ========================================================

    document
      .getElementById(
        'three-worktime-close'
      )
      .onclick =
      function() {

        clearInterval(
          countdownInterval
        );

        widget
          .parentNode
          .removeChild(
            widget
          );
      };

    // ========================================================
    // DÉPLACEMENT DE LA FENÊTRE
    // ========================================================

    var header =
      document.getElementById(
        'three-worktime-header'
      );

    var dragging =
      false;

    var offsetX =
      0;

    var offsetY =
      0;

    header.onmousedown =
      function(event) {

        if (
          event.target.id ===
          'three-worktime-close'
        ) {
          return;
        }

        dragging =
          true;

        var rect =
          widget
          .getBoundingClientRect();

        offsetX =
          event.clientX -
          rect.left;

        offsetY =
          event.clientY -
          rect.top;

        // Fix anti-téléportation
        widget.style.left =
          rect.left +
          'px';

        widget.style.top =
          rect.top +
          'px';

        widget.style.right =
          'auto';

        event.preventDefault();
      };

    document.addEventListener(
      'mousemove',
      function(event) {

        if (!dragging) {
          return;
        }

        var left =
          event.clientX -
          offsetX;

        var top =
          event.clientY -
          offsetY;

        left =
          Math.max(
            0,
            Math.min(
              window.innerWidth -
              widget.offsetWidth,
              left
            )
          );

        top =
          Math.max(
            0,
            Math.min(
              window.innerHeight -
              widget.offsetHeight,
              top
            )
          );

        widget.style.left =
          left +
          'px';

        widget.style.top =
          top +
          'px';
      }
    );

    document.addEventListener(
      'mouseup',
      function() {

        dragging =
          false;
      }
    );

    // ========================================================
    // INITIALISATION
    // ========================================================

    updateLegalMarker();

    update();

    updateJourney();
  }

})();
