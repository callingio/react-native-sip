import { mediaDevices } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager'
import {
  VIDEO_RES_QVGA,
  VIDEO_RES_VGA,
  VIDEO_RES_720P,
  VIDEO_RES_1080P,
  VideoResolutionOptions,
} from "..";

import { EventEmitter } from 'events';
// import * as FILES from '../sounds.json';

/*
const TONES = new Map([
[ 'ringback', { audio: new Audio(FILES['ringback']) } ],
[ 'ringing', { audio: new Audio(FILES['ringing']) } ],
[ 'answered', { audio: new Audio(FILES['answered']) } ],
[ 'rejected', { audio: new Audio(FILES['rejected']) } ],
[ 'ended', { audio: new Audio(FILES['rejected']) } ],
]);
 */

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
    in: AudioConfig,
    out: AudioConfig
  };
  video: {
    in: VideoConfig,
    out: VideoConfig
  };
  /*
  screenShare: {
    cursor: string,
    logicalSurface: boolean,
    screenAudio: false
  };
   */
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
export class MediaEngine {
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
  _sessionType: string;  // audio or video
  _isSessionActive: boolean;
  _eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this._isPlaying = false;
    this._availableDevices = [];
    this._inStreamContexts = [];
    this._outStreamContexts = [];
    this._supportedDeviceTypes = ['audioinput', 'audiooutput', 'videoinput'];
    this._outputVolume = 0.8;  // default 80%
    this._inputVolume = 1; // 100 %
    this._ringVolume = 0.8;
    this._videoRes = VIDEO_RES_VGA;
    this._sessionType = 'none';
    this._isSessionActive = false;
    this._eventEmitter = eventEmitter;
    this._prepareConfig(null);
    this._initDevices();
  }
  startSession = (media: string, playRingback: boolean=false, tonePath: string=''): boolean => {
    if (this._isSessionActive) {
      let ringbackTone = '';
      if (playRingback === true) {
        ringbackTone = tonePath === '' ? '_DEFAULT_' : tonePath;
      }
      InCallManager.start({media: media, auto: true, ringback: ringbackTone});
      this._sessionType = media;
      this._isSessionActive = true;
    }
    return true;
  }
  // tone - busy tone
  stopSession = (playBusytone: boolean=false) => {
    if (this._isSessionActive) {
      let busyTone = '';
      if (playBusytone === true) {
        busyTone = '_DEFAULT_';
      }
      InCallManager.stop({busyTone});
      this._sessionType = 'none';
      this._isSessionActive = false;
    }
  }
  stopRingbackTone = (): void => {
    InCallManager.stopRingback();
  };
  startRingTone = (tonePath: string=''): void => {
    const ringTone = tonePath === '' ? '_DEFAULT_' : tonePath;
    InCallManager.startRingtone(ringTone)
  };
  stopRingTone = (): void => {
    InCallManager.stopRingtone();
  };
  muteAudio = (): void => {
    this._enableAudioChannels(false);
  };
  unMuteAudio = (): void => {
    this._enableAudioChannels(true);
  };

  // Fetch available devices for a given 'device kind'
  availableDevices = (deviceKind: 'audioinput' | 'audiooutput' | 'videoinput'): MediaDevice[] => {
    const result: MediaDevice[] = [];
    this._availableDevices.forEach((device) => {
      if (device.kind === deviceKind) {
        result.push(device);
      }
    });
    return result;
  };

  fetchAllDevices = (): MediaDevice[] => {
    return this._availableDevices;
  };

  // Open
  openStreams = async (reqId: string,
                       audio: boolean,
                       video: boolean): Promise<MediaStream | null> => {
    // tslint:disable-next-line:no-console
    // console.log(this._availableDevices);
    const opts = this._getMediaConstraints(audio, video);
    console.log(opts);
    // todo: failure scenarios like user cancel the permissions
    return mediaDevices.getUserMedia(opts).then((mediaStream) => {
      const newStream = new MediaStream();
      mediaStream.getTracks().forEach((track) => {
        console.log(track);
        newStream.addTrack(track);
      });
      this._inStreamContexts.push({
        id: reqId,
        hasVideo: video,
        stream: newStream,
        volume: this._inputVolume
      });
      return Promise.resolve(newStream);
    }).catch((err) => {
      console.log(err);
      return Promise.resolve(null);
    });
  };
  // update stream with audio/video
  // use case: adding video
  updateStream = (reqId: string,
                  audio: boolean,
                  video: boolean): Promise<MediaStream | null> => {
    const index = this._inStreamContexts.findIndex((ctxt) => ctxt.id === reqId);
    if (index !== -1) {
      const streamContext = this._inStreamContexts[index];
      const appStream = streamContext.stream;
      streamContext.hasVideo = video;
      if (audio) {
        appStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
          appStream.removeTrack(track);
        });
      }
      if (video) {
        appStream.getVideoTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
          appStream.removeTrack(track);
        });
      }
      const opts = this._getMediaConstraints(audio, video);
      return mediaDevices.getUserMedia(opts).then((mediaStream) => {
        // currently update is used for video
        mediaStream.getVideoTracks().forEach((track) => {
          appStream.addTrack(track);
        });
        return Promise.resolve(appStream);
      });
    }
    return Promise.resolve(null);
  };
  closeStream = (reqId: string): void => {
    const index = this._inStreamContexts.findIndex((item) => item.id === reqId);
    if (index !== -1) {
      const streamContext = this._inStreamContexts[index];
      const mediaStream = streamContext.stream;
      mediaStream.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
        mediaStream.removeTrack(track);
      });
      this._inStreamContexts.splice(index, 1);

    }
    // out stream context
    const outIndex = this._outStreamContexts.findIndex(
      (item) => item.id === reqId);
    if (outIndex !== -1) {
      this._outStreamContexts.splice(outIndex, 1);
    }
  };
  closeAll = () => {
    // close all opened streams
    this._inStreamContexts.forEach((streamContext) => {
      streamContext.stream.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
    });
    this._inStreamContexts = [];
    this._outStreamContexts = [];
    this._isPlaying = false;
  };
  startOrUpdateOutStreams = (reqId: string,
                             mediaStream: MediaStream | null,
                             track: MediaStreamTrack): void => {
    if (!this._isPlaying) {
      this._isPlaying = true;
    }
    const outContext = this._outStreamContexts.find((item) => item.id === reqId);
    // if valid add the track
    if (mediaStream) {
      const trackExists = mediaStream.getTracks().find((t) => t.id === track.id);
      if (trackExists) {
        mediaStream.removeTrack(trackExists);
      }
      mediaStream.addTrack(track);
      // new context
      if (outContext === undefined) {
        if (track.kind === 'audio') {
          this._outStreamContexts.push({
            id: reqId,
            stream: mediaStream,
            volume: this._outputVolume,
          });
        }
      }
    }
  };
  // change output volume
  // used only for initial volume
  changeOutputVolume = (vol: number): void => {
    if (vol > 1) {
      vol = 1;
    }
    this._outputVolume = vol;
  };
  changeInputVolume = (vol: number): void => {
    if (vol > 1) {
      vol = 1;
    } else if (vol < 0) {
      vol = 0;
    }
    this._inputVolume = vol;
  }
  changeOutStreamVolume = (reqId: string, value: number): void => {
    if (value > 1) {
      value = 1;
    }
    const streamCtxt = this._outStreamContexts.find(
      (item) => item.id === reqId);
    if (streamCtxt !== undefined) {
      streamCtxt.volume = value;
    }
  };
  // change input volume
  changeInStreamVolume = (reqId: string, vol: number): void => {
    if (vol>1) {
      vol = 1;
    }
  };
  getOutputVolume = (): number => {
    return this._outputVolume;
  };
  getInputVolume = (): number => {
    return this._inputVolume;
  };
  changeRingVolume = (vol: number): void => {
    this._ringVolume = vol;
  };
  getRingVolume = (): number => {
    return this._ringVolume;
  };
  getOutStreamVolume = (reqId: string): number => {
    const ctxt = this._outStreamContexts.find((item) => item.id === reqId);
    if (ctxt !== undefined) {
      return ctxt.volume;
    }
    return 0.8;
  };
  getInStreamVolume = (reqId: string): number => {
    const streamContext = this._inStreamContexts.find(
      (item) => item.id === reqId);
    if (streamContext !== undefined) {
        streamContext.volume;
    }
    return -1;
  };
  hasDeviceExists = (deviceKind: string, deviceId: string | null): boolean => {
    const isValid = this._supportedDeviceTypes.includes(deviceKind);
    if (!isValid) {
      throw Error("UnSupported Device Kind");
    }
    if (deviceId) {
      const index = this._availableDevices.findIndex((item) =>
        item.kind === deviceKind && item.deviceId === deviceId);
      if (index !== -1) {
        return true;
      }
      return false;
    } else {
      // device exists for the device kind
      const index = this._availableDevices.findIndex((item) =>
        item.kind === deviceKind );
      if (index !== -1) {
        return true;
      }
      return false;
    }
  };
  changeAudioInput = (deviceId: string): void => {
    // check device
    if (!this.hasDeviceExists('audioinput', deviceId)) {
      throw Error(`audioinput device with id ${deviceId} not found`);
    }
    this._changeDeviceConfig('audioinput', deviceId);
    this._inStreamContexts.forEach((ctxt) => {
      const reqId = ctxt.id;
      const opts = this._getMediaConstraints(true, false);
      mediaDevices.getUserMedia(opts).then((mediaStream) => {
          // log
      }).then(() => {
        this._eventEmitter.emit('audio.input.update', {'reqId': reqId, 'stream': ctxt.stream});
      });
    });
  };
  // NOT TESTED: Chrome always play audio through default output device
  changeAudioOutput = (deviceId: string): void => {
    if (!this.hasDeviceExists('audiooutput', deviceId)) {
      throw Error(`audiooutput device with id ${deviceId} not found`);
    }
    this._changeDeviceConfig('audiooutput', deviceId);
  };
  changeVideoInput = (deviceId: string): void => {
    if (!this.hasDeviceExists('videoinput', deviceId)) {
      throw Error(`videoinput device with id ${deviceId} not found`);
    }
    this._changeDeviceConfig('videoinput', deviceId);
    this._inStreamContexts.forEach((ctxt) => {
      const reqId = ctxt.id;
      const opts = this._getMediaConstraints(false, true);
      mediaDevices.getUserMedia(opts).then((mediaStream) => {
        ctxt.stream=mediaStream;
      }).then(() => {
        this._eventEmitter.emit('video.input.update', {'reqId': reqId, 'stream': ctxt.stream});
      });
    });
  };
  // used to amplify audio above 100%
  amplifyAudioOn = (reqId: string, multiplier:number): void => {
    // multiplier should be greater than 1
    if (multiplier <= 1) {
      return;
    }
  };
  // stop amplification
  amplifyAudioOff = (reqId: string): void => {
    const outCtxt = this._outStreamContexts.find(
      (item) => item.id === reqId);
    if (outCtxt !== undefined) {
        // log
    }
  };

  getConfiguredDevice = (deviceKind: string): string => {
    let deviceId = 'default';
    const devices = this._availableDevices.filter((item) => item.kind === deviceKind);
    if (devices.length > 0) {
      if (devices.length === 1) {
        return devices[0].deviceId;
      }
    } else {
      return 'none';
    }
    switch (deviceKind) {
      case 'audioinput':
        if (this._config!.audio.in.deviceIds.length > 0) {
          deviceId = this._config!.audio.in.deviceIds[0];
        }
        break;
      case 'audiooutput':
        if (this._config!.audio.out.deviceIds.length > 0) {
          deviceId = this._config!.audio.out.deviceIds[0];
        }
        break;
      case 'videoinput':
        if (this._config!.video.in.deviceIds.length > 0) {
          deviceId = this._config!.video.in.deviceIds[0];
        }
        break;
    }
    return deviceId;
  };
  // params : 'QVGA' | 'VGA' | '720P' | '1080P'
  setVideoRes = (res: VideoResolutionOptions): void => {
    this._videoRes = res;
  };
  getVideoRes = (): VideoResolutionOptions => {
    return this._videoRes;
  }
  _changeDeviceConfig = (deviceKind: string, deviceId: string): void => {
    // TO DO change out & in device
    switch (deviceKind) {
      case 'audioinput':
        // @ts-ignore
        this._config.audio.in.deviceIds[0] = deviceId;
        break;
      case 'audiooutput':
        // @ts-ignore
        this._config.audio.out.deviceIds[0] = deviceId;
        break;
      case 'videoinput':
        // @ts-ignore
        this._config.video.in.deviceIds[0] = deviceId;
        break;
    }
  };
  _flushDeviceConfig = (deviceKind:string, deviceId:string): void => {
    switch (deviceKind) {
      case 'audioinput':
        if (this._config!.audio.in.deviceIds.length > 0 &&
            this._config!.audio.in.deviceIds[0] === deviceId) {
          this._config!.audio.in.deviceIds = [];
        }
        break;
      case 'audiooutput':
        if (this._config!.audio.out.deviceIds.length > 0 &&
          this._config!.audio.out.deviceIds[0] === deviceId) {
          this._config!.audio.out.deviceIds = [];
        }
        break;
      case 'videoinput':
        if (this._config!.video.in.deviceIds.length > 0 &&
          this._config!.video.in.deviceIds[0] === deviceId) {
          this._config!.video.in.deviceIds = [];
        }
        break;
    }
  };
  // todo: multiple devices per channel
  _prepareConfig(config: MediaEngineConfig | null) {
    if (!config) {
      // Default config
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
    } else {
      let deviceId: string | null = null;
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
        if(!this.hasDeviceExists('audiooutput', deviceId)) {
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
  }
  // NOTE: Only input device is muted.
  _enableAudioChannels = (isEnable: boolean): void => {
    if (!this._isAudioEnabled()) {
      // Audio not enabled
      throw Error(`Audio device is not enabled`);
    }
    const options = {
      audio: true,
      video: false,
    };
    mediaDevices.getUserMedia(options).then((mediaStream) => {
        // log
    }).catch((err) => {
      throw Error(`Mute Audio`);
    });
  };

  // TODO: check the all configured devices exists or not
  _isAudioEnabled = (): boolean => {
    // @ts-ignore
    return this._config.audio.in.enabled;
  };
  _isVideoEnabled = (): boolean => {
    // @ts-ignore
    return this._config.video.in.enabled;
  };
  _refreshDevices = (): void => {
    const channels = [ 'audioinput', 'audiooutput', 'videoinput' ];
    const deviceList: MediaDeviceInfo[] = [];
    console.log("Before enumerate devices");
    mediaDevices.enumerateDevices()
      .then((devices) => {
        devices.forEach((deviceInfo) => {
          console.log(deviceInfo);
          const isSupported = channels.includes(deviceInfo.kind);
          if (isSupported) {
            deviceList.push(deviceInfo);
          }
        });
        const oldList = this._availableDevices;
        this._availableDevices = [];
        deviceList.forEach((device) => {
          const index = oldList.findIndex((item) =>
            (item.deviceId === device.deviceId && item.kind === device.kind));
          if (index < 0) {
            // new device found
          } else {
            oldList.splice(index, 1);
          }
          let label = device.label;
          const defStr = 'default -';
          const commStr = 'communications -';
          if (device.label.toLowerCase().startsWith(defStr)) {
            label = device.label.substring(defStr.length);
            label = label.trim();
          } else if (device.label.toLowerCase().startsWith(commStr)) {
            label = device.label.substring(commStr.length);
            label = label.trim()
          }
          const exists = this._availableDevices.find((item) =>
            item.label.toLowerCase() === label.toLowerCase() && item.kind === device.kind);
          if (exists === undefined) {
            this._availableDevices.push({
              deviceId: device.deviceId,
              kind: device.kind,
              label
            });
          }
        });
        oldList.forEach((item) => {
          this._flushDeviceConfig(item.kind, item.deviceId);
        });
        this._eventEmitter.emit('media.device.update', {});
      })
      .then(() => {
        channels.forEach((chnl) => {
          const devices = this._availableDevices.filter((item) => item.kind === chnl);
          const defaultExists = devices.find((item) => item.deviceId === 'default');
          if (devices.length > 0) {
            switch (chnl) {
              case 'audioinput':
                if (this._config?.audio.in.deviceIds.length === 0 && defaultExists === undefined) {
                  this._config.audio.in.deviceIds[0] = devices[0].deviceId;
                }
                break;
              case 'audiooutput':
                if (this._config?.audio.out.deviceIds.length === 0 && defaultExists === undefined) {
                  this._config.audio.out.deviceIds[0] = devices[0].deviceId;
                }
                break;
              case 'videoinput':
                if (this._config?.video.in.deviceIds.length === 0 && defaultExists === undefined) {
                  this._config.video.in.deviceIds[0] = devices[0].deviceId;
                }
                break;
            }
          }
        });
      })
      .catch((err) => {
        // log error
        // tslint:disable-next-line:no-console
        console.log(`Enumerate devices error`);
        console.log(err);
      })
  };
  _initDevices = (): void => {
    this._refreshDevices();
    mediaDevices.ondevicechange = (event) => {
      this._refreshDevices();
    };
  };
  _getMediaConstraints = (isAudio: boolean, isVideo: boolean): MediaStreamConstraints => {
    const constraints: MediaStreamConstraints = {
      audio: isAudio,
    };
    // if configured use the configured device
    if (isAudio &&
      // @ts-ignore
      this._config.audio.in.deviceIds.length > 0) {
      constraints.audio = {
        // @ts-ignore
        deviceId: this._config.audio.in.deviceIds,
      };
    }
    if (isVideo) {
      let width = 1280;
      let height = 720;
      if (this._videoRes === VIDEO_RES_QVGA) {
        width = 320;
        height = 240;
      } else if (this._videoRes === VIDEO_RES_VGA) {
        width = 640;
        height = 480;
      } else if (this._videoRes === VIDEO_RES_720P) {
        width = 1280;
        height = 720;
      } else if (this._videoRes === VIDEO_RES_1080P) {
        width = 1920;
        height = 1080;
      }
      // @ts-ignore
      if (this._config.video.in.deviceIds.length > 0) {
        constraints.video = {
          // @ts-ignore
          deviceId: this._config.video.in.deviceIds,
          width,
          height
        };
      } else {
        constraints.video = {
          width,
          height,
        }
      }
    }
    return constraints;
  };
}
