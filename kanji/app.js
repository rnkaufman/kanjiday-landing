! function() {
    "use strict";
    angular.module("kanjidayApp", [])
}(),
function() {
    "use strict";

    function kanjiFactory($http) {
        var factory = {};
        factory.loading = !1;
        var url = "/kanji/vocab.json";
        return factory.get = function() {
            return factory.loading = !0, factory.promise = $http({
                url: url,
                method: "GET"
            }), factory.promise.then(function(response) {
                factory.loading = !1, factory.data = response.data
            }), factory.promise
        }, factory
    }
    angular.module("kanjidayApp").factory("kanjiFactory", kanjiFactory), kanjiFactory.$inject = ["$http"]
}(),
function() {
    "use strict";

    function mainController(kanjiFactory, $scope) {
        function setIndex(length) {
            var index = 0,
                firstTimeUse = void 0 === lastChangeDate,
                newDay = todayDate != lastChangeDate;
            return firstTimeUse || newDay ? (index = Math.floor(Math.random() * length), localStorage.lastChangeDate = (new Date).getDate(), localStorage.lastKanjiIndex = index, index) : index = localStorage.lastKanjiIndex
        }

        function applyColors() {
            var colorChanged = localStorage.colorChanged;
            "changed" == colorChanged ? (vm.bodyBackground = localStorage.savedHex, vm.wrapperBackground = localStorage.savedFrameColor, vm.border = "6px solid " + localStorage.savedFrameColor) : (vm.bodyBackground = "lightpink", vm.wrapperBackground = "white", vm.border = "6px solid white")
        }

        function applyDisplay() {
            var kunyomiChanged = localStorage.kunyomiChanged,
                meaningChanged = localStorage.meaningChanged;
            switch (kunyomiChanged) {
                case "changed":
                    vm.kunyomiDisplay = localStorage.kunyomiDisplay;
                    break;
                default:
                    localStorage.kunyomiDisplay = "block", vm.kunyomiDisplay = "block"
            }
            switch (meaningChanged) {
                case "changed":
                    vm.meaningDisplay = localStorage.meaningDisplay;
                    break;
                default:
                    localStorage.meaningDisplay = "block", vm.meaningDisplay = "block"
            }
        }
        var vm = this;
        vm.kanjiFactory = kanjiFactory;
        var lastChangeDate = localStorage.lastChangeDate,
            todayDate = (new Date).getDate(),
            length = 0;
        kanjiFactory.get().then(function(response) {
            vm.kanjiList = response.data.kanji, length = response.data.kanji.length;
            var kanjiIndex = setIndex(length);
            vm.kanji = response.data.kanji[kanjiIndex];
            var kanjiLength = response.data.kanji[kanjiIndex].character.length;
            vm.charLength = {
                isOneChar: 1 == kanjiLength,
                isTwoChar: 2 == kanjiLength,
                isThreeChar: 3 == kanjiLength,
                isFourChar: 4 == kanjiLength
            }
        }), applyColors(), applyDisplay(), vm.updateColors = function() {
            applyColors(), $scope.$apply()
        }, vm.updateDisplay = function() {
            applyDisplay()
        }
    }
    angular.module("kanjidayApp").controller("mainController", mainController), mainController.$inject = ["kanjiFactory", "$scope"]
}(),
function() {
    "use strict";

    function colorPick() {
        function link(scope, element, attrs, settingsMenuCtrl) {
            function updateFramingColor(rgb) {
                var weightedL = calculateLightness(rgb),
                    rD = calculateDarkness(rgb.r),
                    gD = calculateDarkness(rgb.g),
                    bD = calculateDarkness(rgb.b),
                    rgbDarker = "rgb(" + rD + "," + gD + "," + bD + ")",
                    whiteTransp = "rgba(255,255,255,0.95)";
                weightedL > .82 ? (lightColor = !1, localStorage.savedFrameColor = rgbDarker) : (lightColor = !0, localStorage.savedFrameColor = whiteTransp)
            }

            function calculateLightness(rgb) {
                var L = .2126 * rgb.r + .7152 * rgb.g + .0722 * rgb.b,
                    weightedL = L / 255;
                return weightedL
            }

            function calculateDarkness(e) {
                var darkenPercent = 40,
                    D = Math.round(e * (100 - darkenPercent) / 100);
                return D
            }
            var lightColor;
            $(".picker").colpick({
                flat: !0,
                layout: "hex",
                submit: 0,
                onChange: function(hsb, hex, rgb, el, bySetColor) {
                    localStorage.savedHex = "#" + hex, localStorage.colorChanged = "changed", updateFramingColor(rgb), settingsMenuCtrl.updateColors()
                }
            })
        }
        var directive = {
            scope: !0,
            require: "^settingsMenu",
            templateUrl: "/kanji/app/directives/colorpick.view.html",
            link: link
        };
        return directive
    }
    angular.module("kanjidayApp").directive("colorPick", colorPick), colorPick.$inject = []
}(),
function() {
    "use strict";

    function footerInfo() {
        function link(scope, element, attrs) {
            var isToggled = !1;
            scope.toggleFooter = function() {
                isToggled ? (isToggled = !1, $(".mainView").css("margin-bottom", "0"), $(".info-icon").css("margin-bottom", "0"), $("footer").removeClass("show-footer"), $("footer").empty()) : (isToggled = !0, $(".mainView").css("margin-bottom", "9rem"), $(".info-icon").css("margin-bottom", "9rem"), $("footer").addClass("show-footer"), $("footer").append('<h2>Kanjiday</h2><div><p>Kanjiday replaces your new tab with a new Kanji card. One new card every day. The selection is of regular/daily life words.</p><p>Thanks for using Kanjiday!</p> <a href="mailto:contact@kanjiday.com">contact@kanjiday.com</a></div><a class="twitter-link" href="https://www.twitter.com/kanjiday_app" target="_blank"><img src="img/twitter.png"></a>'))
            }
        }
        var directive = {
            scope: !0,
            templateUrl: "/kanji/app/directives/footerInfo.view.html",
            link: link
        };
        return directive
    }
    angular.module("kanjidayApp").directive("footerInfo", footerInfo), footerInfo.$inject = []
}(),
function() {
    "use strict";

    function nextKanji() {
        function link(scope, element, attrs) {
            scope.setNewKanji = function(kanjiList) {
                var newIndex = Math.floor(Math.random() * kanjiList.length);
                localStorage.lastChangeDate = (new Date).getDate(), localStorage.lastKanjiIndex = newIndex;
                var kanjiLength = kanjiList[newIndex].character.length;
                scope.charLength.isOneChar = 1 == kanjiLength, scope.charLength.isTwoChar = 2 == kanjiLength, scope.charLength.isThreeChar = 3 == kanjiLength, scope.charLength.isFourChar = 4 == kanjiLength, $("#character").fadeOut(0, function() {
                    $("#character").text(kanjiList[newIndex].character).fadeIn(300)
                }), "block" == localStorage.kunyomiDisplay && $("#kunyomi").fadeOut(0, function() {
                    $("#kunyomi").text(kanjiList[newIndex].kunyomi).fadeIn(300)
                }), "block" == localStorage.meaningDisplay && $("#meaning").fadeOut(0, function() {
                    $("#meaning").text(kanjiList[newIndex].meanings[0]).fadeIn(300)
                })
            }
        }
        var directive = {
            scope: {
                list: "=",
                charLength: "="
            },
            templateUrl: "/kanji/app/directives/nextKanji.view.html",
            link: link
        };
        return directive
    }
    angular.module("kanjidayApp").directive("nextKanji", nextKanji), nextKanji.$inject = []
}(),
function() {
    "use strict";

    function revealKunyomi() {
        function link(element) {
                    $("#kunyomi").text(kanjiList[localStorage.lastKanjiIndex].kunyomi).fadeIn(300)
                }
            }
        }
        var directive = {
            scope: {
                list: "=",
                charLength: "="
            },
            templateUrl: "/kanji/app/directives/revealKunyomi.view.html",
            link: link
        };
        return directive
    }
}(),
function() {
    "use strict";

    function notification() {
        function link(scope, element, attrs) {
            localStorage.toggleNewsSeen ? scope.toggleNewsSeen = localStorage.toggleNewsSeen : (localStorage.toggleNewsSeen = "0", scope.toggleNewsSeen = localStorage.toggleNewsSeen), scope.toggleNewsUneen = function() {
                localStorage.toggleNewsSeen = "1", scope.toggleNewsSeen = localStorage.toggleNewsSeen
            }
        }
        var directive = {
            scope: {
                textColor: "=",
                buttonColor: "="
            },
            templateUrl: "/kanji/app/directives/notification.view.html",
            link: link
        };
        return directive
    }
    angular.module("kanjidayApp").directive("notification", notification), notification.$inject = []
}(),
function() {
    "use strict";

    function onboarding() {
        function link(scope, element, attrs) {
            localStorage.nextKanjiSeen ? scope.nextKanjiSeen = localStorage.nextKanjiSeen : (localStorage.nextKanjiSeen = "0", scope.nextKanjiSeen = localStorage.nextKanjiSeen), scope.nextKanjiUnsee = function() {
                localStorage.nextKanjiSeen = "1", scope.nextKanjiSeen = localStorage.nextKanjiSeen
            }
        }
        var directive = {
            scope: {
                textColor: "=",
                buttonColor: "="
            },
            templateUrl: "/kanji/app/directives/onboarding.view.html",
            link: link
        };
        return directive
    }
    angular.module("kanjidayApp").directive("onboarding", onboarding), onboarding.$inject = []
}(),
function() {
    "use strict";

    function settingsMenu(kanjiFactory) {
        function link(scope, element, attrs) {
            function hidePicker() {
                $("#picker-wrapper").removeClass("show-picker"), $(".picker").css("display", "none"), pickerIsToggled = !1
            }
            var menuIsToggled = !1;
            scope.kanjiFactory = kanjiFactory, scope.toggleSettingsMenu = function() {
                menuIsToggled ? ($("#settings-menu").css("display", "none"), menuIsToggled = !1, hidePicker(), $("#list-wrapper").removeClass("show-list")) : ($("#kanji-info").css("display", "block"), $("#settings-menu").css("display", "block"), menuIsToggled = !0)
            };
            var pickerIsToggled = !1;
            scope.toggleColorPicker = function() {
                pickerIsToggled ? hidePicker() : ($(".picker").css("display", "flex"), $("#picker-wrapper").addClass("show-picker"), $("#list-wrapper").removeClass("show-list"), $("#kanji-info").css("display", "none"), pickerIsToggled = !0)
            };
            var listIsToggled = !1;
            scope.toggleList = function() {
                listIsToggled ? ($("#list-wrapper").removeClass("show-list"), listIsToggled = !1) : ($("#list-wrapper").addClass("show-list"), $("#kanji-info").css("display", "none"), hidePicker(), listIsToggled = !0)
            }, scope.showKanjiInfo = function() {
                $("#kanji-info").css("display", "block"), hidePicker()
            }
        }
        var directive = {
            link: link,
            templateUrl: "/kanji/app/directives/settingsMenu.view.html",
            scope: {
                updateColors: "=",
                updateDisplay: "="
            },
            controller: function($scope) {
                var vm = this;
                vm.updateColors = $scope.updateColors, vm.updateDisplay = $scope.updateDisplay
            }
        };
        return directive
    }
    angular.module("kanjidayApp").directive("settingsMenu", settingsMenu), settingsMenu.$inject = ["kanjiFactory"]
}(),
function() {
    "use strict";

    function toggleElt($timeout) {
        function link(scope, element, attrs, settingsMenuCtrl) {
            "block" == localStorage[scope.className + "Display"] && (scope.checked = !0), scope.toggle = function() {
                "block" == localStorage[scope.className + "Display"] ? (localStorage[scope.className + "Changed"] = "changed", localStorage[scope.className + "Display"] = "none", scope.checked = !1, settingsMenuCtrl.updateDisplay()) : "none" == localStorage[scope.className + "Display"] && (localStorage[scope.className + "Display"] = "block", scope.checked = !0, settingsMenuCtrl.updateDisplay())
            }
        }
        var directive = {
            link: link,
            require: "^settingsMenu",
            templateUrl: "/kanji/app/directives/toggleElt.view.html",
            scope: {
                className: "@"
            }
        };
        return directive
    }
    angular.module("kanjidayApp").directive("toggleElt", toggleElt), toggleElt.$inject = ["$timeout"]
}();
