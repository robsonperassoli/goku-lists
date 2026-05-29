import * as Network from "expo-network";

export type NetworkState = Network.NetworkState;

export function isNetworkOnline(state: NetworkState): boolean {
  return Boolean(state.isConnected) && state.isInternetReachable !== false;
}

export async function isOnline(): Promise<boolean> {
  const state = await Network.getNetworkStateAsync();
  return isNetworkOnline(state);
}

export function addNetworkStateListener(onReconnect: () => void) {
  let wasOnline = true;

  void Network.getNetworkStateAsync().then((state) => {
    wasOnline = isNetworkOnline(state);
  });

  return Network.addNetworkStateListener((state) => {
    const online = isNetworkOnline(state);
    if (online && !wasOnline) {
      onReconnect();
    }
    wasOnline = online;
  });
}
