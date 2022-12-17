import { List, Icon, ActionPanel, Action, Detail } from "@raycast/api";
import { Device, DeviceType, audioDevices } from "./audioDevices";
import React from "react";

type State = {
  selectedInputDevice: Device;
  selectedOutputDevice: Device;
  allInputDevices: Device[];
  allOutputDevices: Device[];
};

export default function Command() {
  const [state, setState] = React.useState<State | undefined | string>();

  const { selectedDevice, allDevices, selectDevice } = audioDevices();

  React.useEffect(() => {
    (async () => {
      try {
        const res = await Promise.all([
          selectedDevice("input"),
          selectedDevice("output"),
          allDevices("input"),
          allDevices("output"),
        ]);
        setState({
          selectedInputDevice: res[0],
          selectedOutputDevice: res[1],
          allInputDevices: res[2].sort((a, b) => a.name.localeCompare(b.name)),
          allOutputDevices: res[3].sort((a, b) => a.name.localeCompare(b.name)),
        });
      } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
          setState(
            [
              "# Select Audio Device",
              "`/opt/homebrew/bin/SwitchAudioSource` is not installed!",
              "",
              "You need to install [switchaudio-osx](https://github.com/deweller/switchaudio-osx) to use this extension:",
              "",
              "```sh",
              "brew install switchaudio-osx",
              "```",
            ].join("\n")
          );
        } else {
          throw error;
        }
      }
    })();
  }, []);

  if (state === undefined) {
    return <List></List>;
  } else if (typeof state === "string") {
    return <Detail markdown={state} />;
  } else {
    const onSelect = (device: Device, type: DeviceType) => {
      const key = type === "input" ? "selectedInputDevice" : "selectedOutputDevice";
      setState({ ...state, [key]: device });
      selectDevice(device, type);
    };

    return (
      <List>
        <List.Section title="Outputs">
          {state.allOutputDevices.map((d) => {
            return (
              <List.Item
                actions={
                  <ActionPanel>
                    <Action title="Select Audio Output Device" onAction={() => onSelect(d, "output")} />
                  </ActionPanel>
                }
                icon={Icon.SpeakerOn}
                title={d.name}
                key={`out${d.id}`}
                accessories={[{ icon: d.id === state.selectedOutputDevice.id ? Icon.Check : undefined }]}
              />
            );
          })}
        </List.Section>
        <List.Section title="Inputs">
          {state.allInputDevices.map((d) => {
            return (
              <List.Item
                actions={
                  <ActionPanel>
                    <Action title="Select Audio Input Device" onAction={() => onSelect(d, "input")} />
                  </ActionPanel>
                }
                icon={Icon.Microphone}
                title={d.name}
                key={`in${d.id}`}
                accessories={[{ icon: d.id === state.selectedInputDevice.id ? Icon.Check : undefined }]}
              />
            );
          })}
        </List.Section>
      </List>
    );
  }
}
