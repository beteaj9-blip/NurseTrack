import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform } from 'react-native';

let BleManagerClass: any = null;
let bleManagerInstance: any = null;
let isRealAvailable = false;
let BLEAdvertiser: any = null;
let bleAdvertiserEvents: NativeEventEmitter | null = null;
let isAdvertiserAvailable = false;

const ATTENDANCE_SERVICE_UUID = '0000a7d1-0000-1000-8000-00805f9b34fb';
const ATTENDANCE_COMPANY_ID = 0xffff;
const PAYLOAD_PREFIX = [0x4e, 0x54, 0x01]; // NT + payload version

try {
  // Dynamically require react-native-ble-plx to prevent immediate crashes in Expo Go
  const BlePlx = require('react-native-ble-plx');
  BleManagerClass = BlePlx.BleManager;
  if (BleManagerClass) {
    bleManagerInstance = new BleManagerClass();
    isRealAvailable = true;
    console.log('Real Bluetooth BLE Hardware Module Initialized.');
  }
} catch (error) {
  console.log('Real Bluetooth BLE hardware module not available. Falling back to High-Fidelity Simulation.');
  isRealAvailable = false;
}

try {
  BLEAdvertiser = require('react-native-ble-advertiser');
  if (BLEAdvertiser && NativeModules.BLEAdvertiser) {
    BLEAdvertiser.setCompanyId(ATTENDANCE_COMPANY_ID);
    bleAdvertiserEvents = new NativeEventEmitter(NativeModules.BLEAdvertiser);
    isAdvertiserAvailable = true;
  }
} catch (error) {
  console.log('BLE advertiser module not available. Real host broadcasting is disabled.');
  isAdvertiserAvailable = false;
}

type BluetoothStateListener = (poweredOn: boolean) => void;
const listeners = new Set<BluetoothStateListener>();
let simulatedPowerState = false;
let activeHostScheduleId: number | null = null;

// Native state listener subscription
let nativeStateSubscription: any = null;

if (isRealAvailable && bleManagerInstance) {
  try {
    nativeStateSubscription = bleManagerInstance.onStateChange((state: string) => {
      const isPoweredOn = state === 'PoweredOn';
      listeners.forEach((listener) => {
        try {
          listener(isPoweredOn);
        } catch (e) {
          console.error(e);
        }
      });
    }, true);
  } catch (error) {
    console.log('Failed to initialize native Bluetooth state listener. Switching to high-fidelity simulation.', error);
    isRealAvailable = false;
  }
}

const schedulePayload = (scheduleId: number) => {
  const normalizedId = Math.max(0, Math.trunc(scheduleId));
  return [
    ...PAYLOAD_PREFIX,
    normalizedId & 0xff,
    (normalizedId >> 8) & 0xff,
    (normalizedId >> 16) & 0xff,
    (normalizedId >> 24) & 0xff,
  ];
};

const normalizeByte = (value: number) => value < 0 ? value + 256 : value;

const payloadMatches = (received: unknown, expected: number[]) => {
  if (!Array.isArray(received) || received.length < expected.length) return false;
  return expected.every((value, index) => normalizeByte(Number(received[index])) === value);
};

const serviceMatches = (serviceUuids: unknown) => {
  if (!Array.isArray(serviceUuids)) return false;
  return serviceUuids.some((uuid) => String(uuid).toLowerCase() === ATTENDANCE_SERVICE_UUID);
};

export const BluetoothService = {
  /**
   * Request Bluetooth and Location permissions on Android.
   */
  async requestBluetoothPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        ]);
        return (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Error requesting Bluetooth permissions:', err);
      return false;
    }
  },

  /**
   * Returns true if real device BLE Bluetooth hardware manager was successfully initialized.
   */
  isRealBleAvailable(): boolean {
    return isRealAvailable;
  },

  isRealAttendanceSignalAvailable(): boolean {
    return isRealAvailable && isAdvertiserAvailable;
  },

  /**
   * Checks the current state of Bluetooth.
   * In Real BLE: Queries physical device status.
   * In Simulated BLE: Returns the active simulated status.
   */
  async checkBluetoothState(): Promise<boolean> {
    if (isRealAvailable && bleManagerInstance) {
      try {
        const state = await bleManagerInstance.state();
        return state === 'PoweredOn';
      } catch (error) {
        console.log('Error checking native Bluetooth state, falling back to simulated state.', error);
      }
    }
    return simulatedPowerState;
  },

  /**
   * Sets the simulated state (only applicable when running in simulation mode, e.g. Expo Go).
   */
  setSimulatedState(poweredOn: boolean) {
    if (simulatedPowerState !== poweredOn) {
      simulatedPowerState = poweredOn;
      // Notify listeners immediately
      listeners.forEach((listener) => {
        try {
          listener(poweredOn);
        } catch (e) {
          console.error(e);
        }
      });
    }
  },

  /**
   * Subscribes to Bluetooth power state changes (Real or Simulated).
   * Returns an unsubscribe function.
   */
  subscribeToState(listener: BluetoothStateListener): () => void {
    listeners.add(listener);
    
    // Call listener immediately with current state
    void this.checkBluetoothState().then((currentState) => {
      if (listeners.has(listener)) {
        listener(currentState);
      }
    });

    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Requests device Bluetooth settings or enables adapter on Android.
   */
  async requestEnableBluetooth(): Promise<void> {
    if (isRealAvailable && bleManagerInstance) {
      try {
        if (typeof bleManagerInstance.enable === 'function') {
          await bleManagerInstance.enable();
          return;
        }
      } catch (error) {
        console.log('Failed to automatically enable native Bluetooth adapter.', error);
      }
    }
  },

  async startAttendanceHostSignal(scheduleId: number): Promise<void> {
    if (!this.isRealAttendanceSignalAvailable() || !BLEAdvertiser) {
      throw new Error('Real BLE advertising is not available in this build.');
    }

    const poweredOn = await this.checkBluetoothState();
    if (!poweredOn) {
      throw new Error('Bluetooth is turned off.');
    }

    try {
      await BLEAdvertiser.stopBroadcast();
    } catch {
      // No active broadcast is fine; start below is the important operation.
    }

    BLEAdvertiser.setCompanyId(ATTENDANCE_COMPANY_ID);
    await BLEAdvertiser.broadcast(ATTENDANCE_SERVICE_UUID, schedulePayload(scheduleId), {
      advertiseMode: BLEAdvertiser.ADVERTISE_MODE_LOW_LATENCY,
      txPowerLevel: BLEAdvertiser.ADVERTISE_TX_POWER_HIGH,
      connectable: false,
      includeDeviceName: false,
      includeTxPowerLevel: false,
    });
    activeHostScheduleId = scheduleId;
  },

  async stopAttendanceHostSignal(): Promise<void> {
    activeHostScheduleId = null;
    if (!isAdvertiserAvailable || !BLEAdvertiser) return;
    try {
      await BLEAdvertiser.stopBroadcast();
    } catch (error) {
      console.log('Failed to stop BLE attendance broadcast.', error);
    }
  },

  async scanForAttendanceHostSignal(scheduleId: number, timeoutMs = 8000, simulatedSignalPresent?: boolean): Promise<boolean> {
    const poweredOn = await this.checkBluetoothState();
    if (!poweredOn) {
      throw new Error('Bluetooth is turned off.');
    }

    if (!this.isRealAttendanceSignalAvailable() || !BLEAdvertiser || !bleAdvertiserEvents) {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          resolve(!!simulatedSignalPresent);
        }, 1500);
      });
    }

    const expectedPayload = schedulePayload(scheduleId);

    return new Promise<boolean>((resolve, reject) => {
      let settled = false;
      let timeout: ReturnType<typeof setTimeout> | null = null;
      let subscription: { remove: () => void } | null = null;

      const cleanup = async () => {
        if (timeout) clearTimeout(timeout);
        subscription?.remove();
        try {
          await BLEAdvertiser.stopScan();
        } catch {
          // Stop failures should not mask the actual scan result.
        }
      };

      const finish = (found: boolean) => {
        if (settled) return;
        settled = true;
        void cleanup().finally(() => resolve(found));
      };

      subscription = bleAdvertiserEvents.addListener('onDeviceFound', (device: any) => {
        if (serviceMatches(device?.serviceUuids) && payloadMatches(device?.manufData, expectedPayload)) {
          finish(true);
        }
      });

      BLEAdvertiser.setCompanyId(ATTENDANCE_COMPANY_ID);
      BLEAdvertiser.scanByService(ATTENDANCE_SERVICE_UUID, {
        scanMode: BLEAdvertiser.SCAN_MODE_LOW_LATENCY,
        matchMode: BLEAdvertiser.MATCH_MODE_AGGRESSIVE,
        numberOfMatches: BLEAdvertiser.MATCH_NUM_MAX_ADVERTISEMENT,
      }).catch((error: unknown) => {
        if (settled) return;
        settled = true;
        void cleanup().finally(() => reject(error));
      });

      timeout = setTimeout(() => finish(false), timeoutMs);
    });
  },

  isHostingAttendanceSignal(scheduleId: number): boolean {
    return activeHostScheduleId === scheduleId;
  }
};
