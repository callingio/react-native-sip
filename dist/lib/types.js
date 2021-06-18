"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaDeviceListPropType = exports.callInfoListPropType = exports.callHistoryPropType = exports.sipPropType = exports.iceServersPropType = exports.extraHeadersPropType = void 0;
var PropTypes = __importStar(require("prop-types"));
exports.extraHeadersPropType = PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string));
exports.iceServersPropType = PropTypes.arrayOf(PropTypes.object);
exports.sipPropType = PropTypes.shape({
    status: PropTypes.string,
    errorType: PropTypes.string,
    errorMessage: PropTypes.string,
    addr: PropTypes.string,
    host: PropTypes.string,
    port: PropTypes.number,
    user: PropTypes.string,
    pathname: PropTypes.string,
    secure: PropTypes.bool,
    password: PropTypes.string,
    autoRegister: PropTypes.bool,
    autoAnswer: PropTypes.bool,
    sessionTimersExpires: PropTypes.number,
    extraHeaders: exports.extraHeadersPropType,
    iceServers: exports.iceServersPropType,
    debug: PropTypes.bool,
    debugNamespaces: PropTypes.string,
});
exports.callHistoryPropType = PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    _direction: PropTypes.string,
    _remoteName: PropTypes.string,
    _remoteUser: PropTypes.string,
    _startTime: PropTypes.string,
    _endTime: PropTypes.string,
    _endMode: PropTypes.string,
    _errorReason: PropTypes.string,
}));
exports.callInfoListPropType = PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    _direction: PropTypes.string,
    _remoteUri: PropTypes.string,
    _status: PropTypes.string,
    _isActive: PropTypes.bool,
    _mediaSessionStatus: PropTypes.string,
    _startTime: PropTypes.string,
    _endTime: PropTypes.string,
    _endMode: PropTypes.string,
    _errorReason: PropTypes.string,
}));
exports.mediaDeviceListPropType = PropTypes.arrayOf(PropTypes.shape({
    deviceId: PropTypes.string,
    kind: PropTypes.string,
    label: PropTypes.string
}));
//# sourceMappingURL=types.js.map