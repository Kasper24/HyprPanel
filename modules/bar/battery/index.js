const battery = await Service.import("battery");
import { closeAllMenus } from "../index.js";

const BatteryLabel = () => {
  const isVis = Variable(battery.available);

  const icon = battery
    .bind("percent")
    .as((p) => `battery-level-${Math.floor(p / 10) * 10}-symbolic`);

  battery.connect("changed", ({ available }) => {
    isVis.value = available;
  });

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return { hours, minutes };
  };

  const generateTooltip = (timeSeconds, isCharging, isCharged) => {
    if (isCharged) {
      return "Fully Charged!!!";
    }

    const { hours, minutes } = formatTime(timeSeconds);
    if (isCharging) {
      return `${hours} hours ${minutes} minutes until full`;
    } else {
      return `${hours} hours ${minutes} minutes left`;
    }
  };

  return {
    component: Widget.Box({
      class_name: "battery",
      visible: battery.bind("available"),
      tooltip_text: battery.bind("time_remaining").as((t) => t.toString()),
      children: [
        Widget.Icon({ icon }),
        Widget.Label({
          label: battery.bind("percent").as((p) => ` ${p}%`),
        }),
      ],
      setup: (self) => {
        self.hook(battery, () => {
          self.tooltip_text = generateTooltip(
            battery.time_remaining,
            battery.charging,
            battery.charged,
          );
        });
      },
    }),
    isVis,
    props: {
      on_primary_click: (_, event) => {
        const clickPos = event.get_root_coords();
        const coords = [clickPos[1], clickPos[2]];

        globalMousePos.value = coords;

        closeAllMenus();
        App.toggleWindow("energymenu");
      },
    },
  };
};

export { BatteryLabel };
