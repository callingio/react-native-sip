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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaEngine = void 0;
var react_native_webrtc_1 = require("react-native-webrtc");
var react_native_incall_manager_1 = __importDefault(require("react-native-incall-manager"));
var __1 = require("..");
var MediaEngine = (function () {
    function MediaEngine(eventEmitter) {
        var _this = this;
        this.startSession = function (media, playRingback, tonePath) {
            if (playRingback === void 0) { playRingback = false; }
            if (tonePath === void 0) { tonePath = ''; }
            if (_this._isSessionActive) {
                var ringbackTone = '';
                if (playRingback === true) {
                    ringbackTone = tonePath === '' ? '_DEFAULT_' : tonePath;
                }
                react_native_incall_manager_1.default.start({ media: media, auto: true, ringback: ringbackTone });
                _this._sessionType = media;
                _this._isSessionActive = true;
            }
            return true;
        };
        this.stopSession = function (playBusytone) {
            if (playBusytone === void 0) { playBusytone = false; }
            if (_this._isSessionActive) {
                var busyTone = '';
                if (playBusytone === true) {
                    busyTone = '_DEFAULT_';
                }
                react_native_incall_manager_1.default.stop({ busyTone: busyTone });
                _this._sessionType = 'none';
                _this._isSessionActive = false;
            }
        };
        this.stopRingbackTone = function () {
            react_native_incall_manager_1.default.stopRingback();
        };
        this.startRingTone = function (tonePath) {
            if (tonePath === void 0) { tonePath = ''; }
            var ringTone = tonePath === '' ? '_DEFAULT_' : tonePath;
            react_native_incall_manager_1.default.startRingtone(ringTone);
        };
        this.stopRingTone = function () {
            react_native_incall_manager_1.default.stopRingtone();
        };
        this.muteAudio = function () {
            _this._enableAudioChannels(false);
        };
        this.unMuteAudio = function () {
            _this._enableAudioChannels(true);
        };
        this.availableDevices = function (deviceKind) {
            var result = [];
            _this._availableDevices.forEach(function (device) {
                if (device.kind === deviceKind) {
                    result.push(device);
                }
            });
            return result;
        };
        this.fetchAllDevices = function () {
            return _this._availableDevices;
        };
        this.openStreams = function (reqId, audio, video) { return __awaiter(_this, void 0, void 0, function () {
            var opts;
            var _this = this;
            return __generator(this, function (_a) {
                opts = this._getMediaConstraints(audio, video);
                console.log(opts);
                return [2, react_native_webrtc_1.mediaDevices.getUserMedia(opts).then(function (mediaStream) {
                        var newStream = new MediaStream();
                        mediaStream.getTracks().forEach(function (track) {
                            console.log(track);
                            newStream.addTrack(track);
                        });
                        _this._inStreamContexts.push({
                            id: reqId,
                            hasVideo: video,
                            stream: newStream,
                            volume: _this._inputVolume
                        });
                        return Promise.resolve(newStream);
                    }).catch(function (err) {
                        console.log(err);
                        return Promise.resolve(null);
                    })];
            });
        }); };
        this.updateStream = function (reqId, audio, video) {
            var index = _this._inStreamContexts.findIndex(function (ctxt) { return ctxt.id === reqId; });
            if (index !== -1) {
                var streamContext = _this._inStreamContexts[index];
                var appStream_1 = streamContext.stream;
                streamContext.hasVideo = video;
                if (audio) {
                    appStream_1.getAudioTracks().forEach(function (track) {
                        track.enabled = false;
                        track.stop();
                        appStream_1.removeTrack(track);
                    });
                }
                if (video) {
                    appStream_1.getVideoTracks().forEach(function (track) {
                        track.enabled = false;
                        track.stop();
                        appStream_1.removeTrack(track);
                    });
                }
                var opts = _this._getMediaConstraints(audio, video);
                return react_native_webrtc_1.mediaDevices.getUserMedia(opts).then(function (mediaStream) {
                    mediaStream.getVideoTracks().forEach(function (track) {
                        appStream_1.addTrack(track);
                    });
                    return Promise.resolve(appStream_1);
                });
            }
            return Promise.resolve(null);
        };
        this.closeStream = function (reqId) {
            var index = _this._inStreamContexts.findIndex(function (item) { return item.id === reqId; });
            if (index !== -1) {
                var streamContext = _this._inStreamContexts[index];
                var mediaStream_1 = streamContext.stream;
                mediaStream_1.getTracks().forEach(function (track) {
                    track.enabled = false;
                    track.stop();
                    mediaStream_1.removeTrack(track);
                });
                _this._inStreamContexts.splice(index, 1);
            }
            var outIndex = _this._outStreamContexts.findIndex(function (item) { return item.id === reqId; });
            if (outIndex !== -1) {
                _this._outStreamContexts.splice(outIndex, 1);
            }
        };
        this.closeAll = function () {
            _this._inStreamContexts.forEach(function (streamContext) {
                streamContext.stream.getTracks().forEach(function (track) {
                    track.enabled = false;
                    track.stop();
                });
            });
            _this._inStreamContexts = [];
            _this._outStreamContexts = [];
            _this._isPlaying = false;
        };
        this.startOrUpdateOutStreams = function (reqId, mediaStream, track) {
            if (!_this._isPlaying) {
                _this._isPlaying = true;
            }
            var outContext = _this._outStreamContexts.find(function (item) { return item.id === reqId; });
            if (mediaStream) {
                var trackExists = mediaStream.getTracks().find(function (t) { return t.id === track.id; });
                if (trackExists) {
                    mediaStream.removeTrack(trackExists);
                }
                mediaStream.addTrack(track);
                if (outContext === undefined) {
                    if (track.kind === 'audio') {
                        _this._outStreamContexts.push({
                            id: reqId,
                            stream: mediaStream,
                            volume: _this._outputVolume,
                        });
                    }
                }
            }
        };
        this.changeOutputVolume = function (vol) {
            if (vol > 1) {
                vol = 1;
            }
            _this._outputVolume = vol;
        };
        this.changeInputVolume = function (vol) {
            if (vol > 1) {
                vol = 1;
            }
            else if (vol < 0) {
                vol = 0;
            }
            _this._inputVolume = vol;
        };
        this.changeOutStreamVolume = function (reqId, value) {
            if (value > 1) {
                value = 1;
            }
            var streamCtxt = _this._outStreamContexts.find(function (item) { return item.id === reqId; });
            if (streamCtxt !== undefined) {
                streamCtxt.volume = value;
            }
        };
        this.changeInStreamVolume = function (reqId, vol) {
            if (vol > 1) {
                vol = 1;
            }
        };
        this.getOutputVolume = function () {
            return _this._outputVolume;
        };
        this.getInputVolume = function () {
            return _this._inputVolume;
        };
        this.changeRingVolume = function (vol) {
            _this._ringVolume = vol;
        };
        this.getRingVolume = function () {
            return _this._ringVolume;
        };
        this.getOutStreamVolume = function (reqId) {
            var ctxt = _this._outStreamContexts.find(function (item) { return item.id === reqId; });
            if (ctxt !== undefined) {
                return ctxt.volume;
            }
            return 0.8;
        };
        this.getInStreamVolume = function (reqId) {
            var streamContext = _this._inStreamContexts.find(function (item) { return item.id === reqId; });
            if (streamContext !== undefined) {
                streamContext.volume;
            }
            return -1;
        };
        this.hasDeviceExists = function (deviceKind, deviceId) {
            var isValid = _this._supportedDeviceTypes.includes(deviceKind);
            if (!isValid) {
                throw Error("UnSupported Device Kind");
            }
            if (deviceId) {
                var index = _this._availableDevices.findIndex(function (item) {
                    return item.kind === deviceKind && item.deviceId === deviceId;
                });
                if (index !== -1) {
                    return true;
                }
                return false;
            }
            else {
                var index = _this._availableDevices.findIndex(function (item) {
                    return item.kind === deviceKind;
                });
                if (index !== -1) {
                    return true;
                }
                return false;
            }
        };
        this.changeAudioInput = function (deviceId) {
            if (!_this.hasDeviceExists('audioinput', deviceId)) {
                throw Error("audioinput device with id " + deviceId + " not found");
            }
            _this._changeDeviceConfig('audioinput', deviceId);
            _this._inStreamContexts.forEach(function (ctxt) {
                var reqId = ctxt.id;
                var opts = _this._getMediaConstraints(true, false);
                react_native_webrtc_1.mediaDevices.getUserMedia(opts).then(function (mediaStream) {
                }).then(function () {
                    _this._eventEmitter.emit('audio.input.update', { 'reqId': reqId, 'stream': ctxt.stream });
                });
            });
        };
        this.changeAudioOutput = function (deviceId) {
            if (!_this.hasDeviceExists('audiooutput', deviceId)) {
                throw Error("audiooutput device with id " + deviceId + " not found");
            }
            _this._changeDeviceConfig('audiooutput', deviceId);
        };
        this.changeVideoInput = function (deviceId) {
            if (!_this.hasDeviceExists('videoinput', deviceId)) {
                throw Error("videoinput device with id " + deviceId + " not found");
            }
            _this._changeDeviceConfig('videoinput', deviceId);
            _this._inStreamContexts.forEach(function (ctxt) {
                var reqId = ctxt.id;
                var opts = _this._getMediaConstraints(false, true);
                react_native_webrtc_1.mediaDevices.getUserMedia(opts).then(function (mediaStream) {
                    ctxt.stream = mediaStream;
                }).then(function () {
                    _this._eventEmitter.emit('video.input.update', { 'reqId': reqId, 'stream': ctxt.stream });
                });
            });
        };
        this.amplifyAudioOn = function (reqId, multiplier) {
            if (multiplier <= 1) {
                return;
            }
        };
        this.amplifyAudioOff = function (reqId) {
            var outCtxt = _this._outStreamContexts.find(function (item) { return item.id === reqId; });
            if (outCtxt !== undefined) {
            }
        };
        this.getConfiguredDevice = function (deviceKind) {
            var deviceId = 'default';
            var devices = _this._availableDevices.filter(function (item) { return item.kind === deviceKind; });
            if (devices.length > 0) {
                if (devices.length === 1) {
                    return devices[0].deviceId;
                }
            }
            else {
                return 'none';
            }
            switch (deviceKind) {
                case 'audioinput':
                    if (_this._config.audio.in.deviceIds.length > 0) {
                        deviceId = _this._config.audio.in.deviceIds[0];
                    }
                    break;
                case 'audiooutput':
                    if (_this._config.audio.out.deviceIds.length > 0) {
                        deviceId = _this._config.audio.out.deviceIds[0];
                    }
                    break;
                case 'videoinput':
                    if (_this._config.video.in.deviceIds.length > 0) {
                        deviceId = _this._config.video.in.deviceIds[0];
                    }
                    break;
            }
            return deviceId;
        };
        this.setVideoRes = function (res) {
            _this._videoRes = res;
        };
        this.getVideoRes = function () {
            return _this._videoRes;
        };
        this._changeDeviceConfig = function (deviceKind, deviceId) {
            switch (deviceKind) {
                case 'audioinput':
                    _this._config.audio.in.deviceIds[0] = deviceId;
                    break;
                case 'audiooutput':
                    _this._config.audio.out.deviceIds[0] = deviceId;
                    break;
                case 'videoinput':
                    _this._config.video.in.deviceIds[0] = deviceId;
                    break;
            }
        };
        this._flushDeviceConfig = function (deviceKind, deviceId) {
            switch (deviceKind) {
                case 'audioinput':
                    if (_this._config.audio.in.deviceIds.length > 0 &&
                        _this._config.audio.in.deviceIds[0] === deviceId) {
                        _this._config.audio.in.deviceIds = [];
                    }
                    break;
                case 'audiooutput':
                    if (_this._config.audio.out.deviceIds.length > 0 &&
                        _this._config.audio.out.deviceIds[0] === deviceId) {
                        _this._config.audio.out.deviceIds = [];
                    }
                    break;
                case 'videoinput':
                    if (_this._config.video.in.deviceIds.length > 0 &&
                        _this._config.video.in.deviceIds[0] === deviceId) {
                        _this._config.video.in.deviceIds = [];
                    }
                    break;
            }
        };
        this._enableAudioChannels = function (isEnable) {
            if (!_this._isAudioEnabled()) {
                throw Error("Audio device is not enabled");
            }
            var options = {
                audio: true,
                video: false,
            };
            react_native_webrtc_1.mediaDevices.getUserMedia(options).then(function (mediaStream) {
            }).catch(function (err) {
                throw Error("Mute Audio");
            });
        };
        this._isAudioEnabled = function () {
            return _this._config.audio.in.enabled;
        };
        this._isVideoEnabled = function () {
            return _this._config.video.in.enabled;
        };
        this._refreshDevices = function () {
            var channels = ['audioinput', 'audiooutput', 'videoinput'];
            var deviceList = [];
            console.log("Before enumerate devices");
            react_native_webrtc_1.mediaDevices.enumerateDevices()
                .then(function (devices) {
                devices.forEach(function (deviceInfo) {
                    console.log(deviceInfo);
                    var isSupported = channels.includes(deviceInfo.kind);
                    if (isSupported) {
                        deviceList.push(deviceInfo);
                    }
                });
                var oldList = _this._availableDevices;
                _this._availableDevices = [];
                deviceList.forEach(function (device) {
                    var index = oldList.findIndex(function (item) {
                        return (item.deviceId === device.deviceId && item.kind === device.kind);
                    });
                    if (index < 0) {
                    }
                    else {
                        oldList.splice(index, 1);
                    }
                    var label = device.label;
                    var defStr = 'default -';
                    var commStr = 'communications -';
                    if (device.label.toLowerCase().startsWith(defStr)) {
                        label = device.label.substring(defStr.length);
                        label = label.trim();
                    }
                    else if (device.label.toLowerCase().startsWith(commStr)) {
                        label = device.label.substring(commStr.length);
                        label = label.trim();
                    }
                    var exists = _this._availableDevices.find(function (item) {
                        return item.label.toLowerCase() === label.toLowerCase() && item.kind === device.kind;
                    });
                    if (exists === undefined) {
                        _this._availableDevices.push({
                            deviceId: device.deviceId,
                            kind: device.kind,
                            label: label
                        });
                    }
                });
                oldList.forEach(function (item) {
                    _this._flushDeviceConfig(item.kind, item.deviceId);
                });
                _this._eventEmitter.emit('media.device.update', {});
            })
                .then(function () {
                channels.forEach(function (chnl) {
                    var _a, _b, _c;
                    var devices = _this._availableDevices.filter(function (item) { return item.kind === chnl; });
                    var defaultExists = devices.find(function (item) { return item.deviceId === 'default'; });
                    if (devices.length > 0) {
                        switch (chnl) {
                            case 'audioinput':
                                if (((_a = _this._config) === null || _a === void 0 ? void 0 : _a.audio.in.deviceIds.length) === 0 && defaultExists === undefined) {
                                    _this._config.audio.in.deviceIds[0] = devices[0].deviceId;
                                }
                                break;
                            case 'audiooutput':
                                if (((_b = _this._config) === null || _b === void 0 ? void 0 : _b.audio.out.deviceIds.length) === 0 && defaultExists === undefined) {
                                    _this._config.audio.out.deviceIds[0] = devices[0].deviceId;
                                }
                                break;
                            case 'videoinput':
                                if (((_c = _this._config) === null || _c === void 0 ? void 0 : _c.video.in.deviceIds.length) === 0 && defaultExists === undefined) {
                                    _this._config.video.in.deviceIds[0] = devices[0].deviceId;
                                }
                                break;
                        }
                    }
                });
            })
                .catch(function (err) {
                console.log("Enumerate devices error");
                console.log(err);
            });
        };
        this._initDevices = function () {
            _this._refreshDevices();
            react_native_webrtc_1.mediaDevices.ondevicechange = function (event) {
                _this._refreshDevices();
            };
        };
        this._getMediaConstraints = function (isAudio, isVideo) {
            var constraints = {
                audio: isAudio,
            };
            if (isAudio &&
                _this._config.audio.in.deviceIds.length > 0) {
                constraints.audio = {
                    deviceId: _this._config.audio.in.deviceIds,
                };
            }
            if (isVideo) {
                var width = 1280;
                var height = 720;
                if (_this._videoRes === __1.VIDEO_RES_QVGA) {
                    width = 320;
                    height = 240;
                }
                else if (_this._videoRes === __1.VIDEO_RES_VGA) {
                    width = 640;
                    height = 480;
                }
                else if (_this._videoRes === __1.VIDEO_RES_720P) {
                    width = 1280;
                    height = 720;
                }
                else if (_this._videoRes === __1.VIDEO_RES_1080P) {
                    width = 1920;
                    height = 1080;
                }
                if (_this._config.video.in.deviceIds.length > 0) {
                    constraints.video = {
                        deviceId: _this._config.video.in.deviceIds,
                        width: width,
                        height: height
                    };
                }
                else {
                    constraints.video = {
                        width: width,
                        height: height,
                    };
                }
            }
            return constraints;
        };
        this._isPlaying = false;
        this._availableDevices = [];
        this._inStreamContexts = [];
        this._outStreamContexts = [];
        this._supportedDeviceTypes = ['audioinput', 'audiooutput', 'videoinput'];
        this._outputVolume = 0.8;
        this._inputVolume = 1;
        this._ringVolume = 0.8;
        this._videoRes = __1.VIDEO_RES_VGA;
        this._sessionType = 'none';
        this._isSessionActive = false;
        this._eventEmitter = eventEmitter;
        this._prepareConfig(null);
        this._initDevices();
    }
    MediaEngine.prototype._prepareConfig = function (config) {
        if (!config) {
            this._config = {
                audio: {
                    in: {
                        enabled: true,
                        deviceIds: [],
                    },
                    out: {
                        enabled: true,
                        deviceIds: ['default'],
                    },
                },
                video: {
                    in: {
                        enabled: true,
                        deviceIds: [],
                    },
                    out: {
                        enabled: false,
                        deviceIds: [],
                    },
                },
            };
        }
        else {
            var deviceId = null;
            if (config.audio.in.enabled) {
                if (config.audio.in.deviceIds.length > 0) {
                    deviceId = config.audio.in.deviceIds[0];
                }
                if (!this.hasDeviceExists('audioinput', deviceId)) {
                    throw Error("Audio input is enabled but device is not available");
                }
            }
            if (config.audio.out.enabled) {
                if (config.audio.out.deviceIds.length > 0) {
                    deviceId = config.audio.out.deviceIds[0];
                }
                if (!this.hasDeviceExists('audiooutput', deviceId)) {
                    throw Error("Audio output is enabled but device is not available");
                }
            }
            if (config.video.in.enabled) {
                if (config.video.in.deviceIds.length > 0) {
                    deviceId = config.video.in.deviceIds[0];
                }
                if (!this.hasDeviceExists('videoinput', deviceId)) {
                    throw Error("Video input is enabled but device is not available");
                }
            }
            Object.assign(this._config, config);
        }
    };
    return MediaEngine;
}());
exports.MediaEngine = MediaEngine;
//# sourceMappingURL=mediaengine.js.map