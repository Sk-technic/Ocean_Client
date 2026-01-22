import * as mediasoupClient from "mediasoup-client";

let device: mediasoupClient.types.Device | null = null;

export const getDevice = async () => {
  if (!device) {
    device = new mediasoupClient.Device();
  }
  return device;
};
