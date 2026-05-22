import { Alert } from 'react-native';

let BleManagerClass: any = null;
let bleManagerInstance: any = null;
let isRealAvailable = false;

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

type BluetoothStateListener = (poweredOn: boolean) => void;
const listeners = new Set<BluetoothStateListener>();
let simulatedPowerState = false;

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

export const BluetoothService = {
  /**
   * Returns true if real device BLE Bluetooth hardware manager was successfully initialized.
   */
  isRealBleAvailable(): boolean {
    return isRealAvailable;
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
  }
};
