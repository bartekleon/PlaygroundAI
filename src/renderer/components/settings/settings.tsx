import * as React from "react";
import Box from "@mui/material/Box";
import { StableDiffusionSettings } from "./stableDiffusionSettings";
import { CustomTabs } from "./components/customTabs";
import { CustomTabPanel } from "./components/customTabPanel";
import { AudioGenSettings } from "./audioGenSettings";

export const Settings = () => {
  const [value, setValue] = React.useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <CustomTabs value={value} setValue={setValue} tabs={["Image generation", "Audio generation", "Item Three"]}/>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <StableDiffusionSettings />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        <AudioGenSettings />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel>
    </Box>
  );
};
