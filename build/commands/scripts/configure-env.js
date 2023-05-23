"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.description = void 0;
var utils_1 = require("../../utils");
exports.description = 'Update native files to match current env';
exports.run = function (toolbox) { return __awaiter(void 0, void 0, void 0, function () {
    var filesystem, parameters, print, patching, env, version, buildNumber, envNameSpinner, expoSpinner, packageJson, _a, _b, sdkVersion, spinner, exploPlist, infoPlist, androidManifest, appBuildGradle, envSpinner;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                filesystem = toolbox.filesystem, parameters = toolbox.parameters, print = toolbox.print, patching = toolbox.patching;
                return [4 /*yield*/, utils_1.promptBlankParam(toolbox, parameters.first, "What's the env (staging/production)")];
            case 1:
                env = _c.sent();
                return [4 /*yield*/, utils_1.promptBlankParam(toolbox, parameters.first, "What's the version")];
            case 2:
                version = _c.sent();
                return [4 /*yield*/, utils_1.promptBlankParam(toolbox, parameters.first, "What's the build number")
                    // Get env informations (stage and version)
                ];
            case 3:
                buildNumber = _c.sent();
                envNameSpinner = print.spin('Getting env informations... 🧑‍🍳');
                if (!version.match(/^\d.\d.\d/)) {
                    // 1.0.0-example
                    envNameSpinner.fail('Env is not matching example-v1.0.0 or 1.0.0-example');
                    return [2 /*return*/];
                }
                envNameSpinner.succeed('Env: ' + env + ', Version: ' + version + ', Build number: ' + buildNumber);
                expoSpinner = print.spin('Getting Expo SDK version... 🧑‍🍳');
                _b = (_a = JSON).parse;
                return [4 /*yield*/, filesystem.readAsync('package.json')];
            case 4:
                packageJson = _b.apply(_a, [_c.sent()]);
                sdkVersion = packageJson.dependencies.expo;
                if (!sdkVersion) {
                    expoSpinner.fail("Can't get Expo SDK version from package.json");
                    return [2 /*return*/];
                }
                sdkVersion = sdkVersion.replace('^', '');
                expoSpinner.succeed('Expo SDK version is ' + sdkVersion);
                spinner = print.spin('Checking native projects... 🧑‍🍳');
                return [4 /*yield*/, filesystem.findAsync('ios', {
                        matching: '**/Supporting/Expo.plist',
                    })];
            case 5:
                exploPlist = (_c.sent())[0];
                return [4 /*yield*/, filesystem.findAsync('ios', {
                        matching: '**/Info.plist',
                    })];
            case 6:
                infoPlist = (_c.sent())[0];
                androidManifest = 'android/app/src/main/AndroidManifest.xml';
                appBuildGradle = 'android/app/build.gradle';
                if (!filesystem.exists(exploPlist) ||
                    !filesystem.exists(androidManifest) ||
                    !filesystem.exists(infoPlist) ||
                    !filesystem.exists(appBuildGradle)) {
                    spinner.fail('Native projects are not valids (Expo.plist, AndroidManifest.xml, Info.plist or app/build.gradle are missing)');
                    return [2 /*return*/];
                }
                spinner.succeed('Native projects are valids 🧖‍♂️');
                envSpinner = print.spin('Updating env... 🙈');
                return [4 /*yield*/, patching.patch('app.config.js', {
                        insert: "const env = '" + env + "'",
                        replace: /.*const env.*/gm,
                    })];
            case 7:
                _c.sent();
                envSpinner.succeed('Env set to ' + env + ' 👍');
                // Patch native files
                spinner.start('Patching files...');
                // const releaseChannel = version + '-' + env
                // await patching.patch(exploPlist, {
                //   insert: releaseChannel,
                //   replace: 'release-channel-to-update',
                // })
                return [4 /*yield*/, patching.patch(exploPlist, {
                        insert: sdkVersion,
                        replace: 'sdk-version-to-update',
                    })];
            case 8:
                // const releaseChannel = version + '-' + env
                // await patching.patch(exploPlist, {
                //   insert: releaseChannel,
                //   replace: 'release-channel-to-update',
                // })
                _c.sent();
                return [4 /*yield*/, patching.patch(infoPlist, {
                        insert: version,
                        replace: '$(MARKETING_VERSION)',
                    })];
            case 9:
                _c.sent();
                return [4 /*yield*/, patching.patch(infoPlist, {
                        insert: buildNumber,
                        replace: '$(CURRENT_PROJECT_VERSION)',
                    })
                    // await patching.patch(androidManifest, {
                    //   insert: releaseChannel,
                    //   replace: 'release-channel-to-update',
                    // })
                ];
            case 10:
                _c.sent();
                // await patching.patch(androidManifest, {
                //   insert: releaseChannel,
                //   replace: 'release-channel-to-update',
                // })
                return [4 /*yield*/, patching.patch(androidManifest, {
                        insert: sdkVersion,
                        replace: 'sdk-version-to-update',
                    })];
            case 11:
                // await patching.patch(androidManifest, {
                //   insert: releaseChannel,
                //   replace: 'release-channel-to-update',
                // })
                _c.sent();
                return [4 /*yield*/, patching.patch(appBuildGradle, {
                        insert: 'versionName "' + version + '"',
                        replace: 'versionName "1.0"',
                    })];
            case 12:
                _c.sent();
                return [4 /*yield*/, patching.patch(appBuildGradle, {
                        insert: 'versionCode ' + buildNumber,
                        replace: 'versionCode 1',
                    })
                    // Remove Flipper & enable Hermes
                ];
            case 13:
                _c.sent();
                // Remove Flipper & enable Hermes
                return [4 /*yield*/, patching.patch('ios/Podfile', {
                        delete: /.*(use_flipper|flipper_post_install).*/gm,
                    })];
            case 14:
                // Remove Flipper & enable Hermes
                _c.sent();
                return [4 /*yield*/, patching.patch(appBuildGradle, {
                        replace: 'enableHermes: false,',
                        insert: 'enableHermes: true,',
                    })];
            case 15:
                _c.sent();
                spinner.succeed('Native files patched, parfait 💥');
                return [4 /*yield*/, utils_1.runPrettier(toolbox, [
                        'app.config.js',
                    ])];
            case 16:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJlLWVudi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9zY3JpcHRzL2NvbmZpZ3VyZS1lbnYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EscUNBQTJEO0FBRTlDLFFBQUEsV0FBVyxHQUFHLDBDQUEwQyxDQUFBO0FBRXhELFFBQUEsR0FBRyxHQUFHLFVBQU8sT0FBdUI7Ozs7O2dCQUN2QyxVQUFVLEdBQWtDLE9BQU8sV0FBekMsRUFBRSxVQUFVLEdBQXNCLE9BQU8sV0FBN0IsRUFBRSxLQUFLLEdBQWUsT0FBTyxNQUF0QixFQUFFLFFBQVEsR0FBSyxPQUFPLFNBQVosQ0FBWTtnQkFJL0MscUJBQU0sd0JBQWdCLENBQ2hDLE9BQU8sRUFDUCxVQUFVLENBQUMsS0FBSyxFQUNoQixxQ0FBcUMsQ0FDdEMsRUFBQTs7Z0JBSkssR0FBRyxHQUFHLFNBSVg7Z0JBRWUscUJBQU0sd0JBQWdCLENBQ3BDLE9BQU8sRUFDUCxVQUFVLENBQUMsS0FBSyxFQUNoQixvQkFBb0IsQ0FDckIsRUFBQTs7Z0JBSkssT0FBTyxHQUFHLFNBSWY7Z0JBRW1CLHFCQUFNLHdCQUFnQixDQUN4QyxPQUFPLEVBQ1AsVUFBVSxDQUFDLEtBQUssRUFDaEIseUJBQXlCLENBQzFCO29CQUVELDJDQUEyQztrQkFGMUM7O2dCQUpLLFdBQVcsR0FBRyxTQUluQjtnQkFHSyxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO2dCQUN0RSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDL0IsZ0JBQWdCO29CQUNoQixjQUFjLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxDQUFDLENBQUE7b0JBQzFFLHNCQUFNO2lCQUNQO2dCQUNELGNBQWMsQ0FBQyxPQUFPLENBQ3BCLE9BQU8sR0FBRyxHQUFH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