/// <reference types="node" />
import { VideoResolutionOptions } from "..";
import { EventEmitter } from 'events';
export interface AudioConfig {
    enabled: boolean;
    deviceIds: string[];
}
export interface VideoConfig {
    enabled: boolean;
    deviceIds: string[];
}
export interface MediaEngineConfig {
    audio: {
        in: AudioConfig;
        out: AudioConfig;
    };
    video: {
        in: VideoConfig;
        out: VideoConfig;
    };
}
export interface MediaDevice {
    deviceId: string;
    kind: string;
    label: string;
}
export interface InputStreamContext {
    id: string;
    hasVideo: boolean;
    stream: MediaStream;
    volume: number;
}
export interface OutputStreamContext {
    id: string;
    stream: MediaStream;
    volume: number;
}
export declare class MediaEngine {
    _config: MediaEngineConfig | null;
    _availableDevices: MediaDevice[];
    _outputVolume: number;
    _inputVolume: number;
    _ringVolume: number;
    _videoRes: VideoResolutionOptions;
    _inStreamContexts: InputStreamContext[];
    _outStreamContexts: OutputStreamContext[];
    _isPlaying: boolean;
    _supportedDeviceTypes: string[];
    _sessionType: string;
    _isSessionActive: boolean;
    _eventEmitter: EventEmitter;
    constructor(eventEmitter: EventEmitter);
    startSession: (media: string, playRingback?: boolean, tonePath?: string) => boolean;
    stopSession: (playBusytone?: boolean) => void;
    stopRingbackTone: () => void;
    startRingTone: (tonePath?: string) => void;
    stopRingTone: () => void;
    muteAudio: () => void;
    unMuteAudio: () => void;
    availableDevices: (deviceKind: 'audioinput' | 'audiooutput' | 'videoinput') => MediaDevice[];
    fetchAllDevices: () => MediaDevice[];
    openStreams: (reqId: string, audio: boolean, video: boolean) => Promise<MediaStream | null>;
    updateStream: (reqId: string, audio: boolean, video: boolean) => Promise<MediaStream | null>;
    closeStream: (reqId: string) => void;
    closeAll: () => void;
    startOrUpdateOutStreams: (reqId: string, mediaStream: MediaStream | null, track: MediaStreamTrack) => void;
    changeOutputVolume: (vol: number) => void;
    changeInputVolume: (vol: number) => void;
    changeOutStreamVolume: (reqId: string, value: number) => void;
    changeInStreamVolume: (reqId: string, vol: number) => void;
    getOutputVolume: () => number;
    getInputVolume: () => number;
    changeRingVolume: (vol: number) => void;
    getRingVolume: () => number;
    getOutStreamVolume: (reqId: string) => number;
    getInStreamVolume: (reqId: string) => number;
    hasDeviceExists: (deviceKind: string, deviceId: string | null) => boolean;
    changeAudioInput: (deviceId: string) => void;
    changeAudioOutput: (deviceId: string) => void;
    changeVideoInput: (deviceId: string) => void;
    amplifyAudioOn: (reqId: string, multiplier: number) => void;
    amplifyAudioOff: (reqId: string) => void;
    getConfiguredDevice: (deviceKind: string) => string;
    setVideoRes: (res: VideoResolutionOptions) => void;
    getVideoRes: () => VideoResolutionOptions;
    _changeDeviceConfig: (deviceKind: string, deviceId: string) => void;
    _flushDeviceConfig: (deviceKind: string, deviceId: string) => void;
    _prepareConfig(config: MediaEngineConfig | null): void;
    _enableAudioChannels: (isEnable: boolean) => void;
    _isAudioEnabled: () => boolean;
    _isVideoEnabled: () => boolean;
    _refreshDevices: () => void;
    _initDevices: () => void;
    _getMediaConstraints: (isAudio: boolean, isVideo: boolean) => MediaStreamConstraints;
}
