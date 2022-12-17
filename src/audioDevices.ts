import { execa } from "execa";

export type DeviceType = "input" | "output";
export type Device = { name: string; type: DeviceType; id: string; uid: string };

type JSONType = unknown;

export const audioDevices = (bin = "/opt/homebrew/bin/SwitchAudioSource") => {
  const runCommand = async (params: string[], type: DeviceType) =>
    await execa(bin, [...params, "-t", type, "-f", "json"]);

  const runJsonCommand = async (params: string[], type: DeviceType): Promise<JSONType[]> => {
    const { stdout } = await runCommand(params, type);
    return stdout.split("\n").map((l) => JSON.parse(l));
  };

  return {
    selectedDevice: async (type: DeviceType): Promise<Device> => (await runJsonCommand(["-c"], type))[0] as Device,
    allDevices: async (type: DeviceType): Promise<Device[]> => (await runJsonCommand(["-a"], type)) as Device[],
    selectDevice: async (device: Device, type: DeviceType): Promise<void> => {
      await runCommand(["-i", `${device.id}`], type);
    },
  };
};
